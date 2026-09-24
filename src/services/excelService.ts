import * as XLSX from 'xlsx';
import { Obra, Transaction, InventoryItem, Partner } from '../types';
import { CATEGORY_METADATA } from '../data/mockInitialData';

export function exportFullFinancialWorkbook(
  transactions: Transaction[],
  obras: Obra[],
  partners: Partner[],
  inventory?: InventoryItem[]
) {
  const wb = XLSX.utils.book_new();

  // 1. Calculations
  const totalIngresos = transactions
    .filter((t) => t.type === 'ingreso')
    .reduce((acc, t) => acc + t.amount, 0);

  const totalEgresos = transactions
    .filter((t) => t.type === 'egreso')
    .reduce((acc, t) => acc + t.amount, 0);

  const utilidadNeta = totalIngresos - totalEgresos;

  // 2. Sheet: Resumen General
  const resumenData = [
    ['CONSTRUQ ERP - REPORTE EJECUTIVO FINANCIERO Y CONTABLE (MANO DE OBRA)'],
    ['Fecha de Emisión:', new Date().toLocaleDateString('es-AR')],
    ['Moneda:', 'ARS ($)'],
    ['Modalidad Operativa:', 'Prestación Especializada de Mano de Obra en Construcción'],
    [],
    ['INDICADORES CLAVE DE RENDIMIENTO (KPIs)'],
    ['Ingresos Totales Brutos Certificados:', totalIngresos],
    ['Egresos Operativos Totales (Jornales, Nómina, Impuestos):', totalEgresos],
    ['Utilidad Neta del Ejercicio:', utilidadNeta],
    ['Margen de Rentabilidad Operativa:', `${((utilidadNeta / (totalIngresos || 1)) * 100).toFixed(1)}%`],
    ['Cantidad de Obras en Ejecución:', obras.filter((o) => o.status === 'en_ejecucion').length],
    [],
    ['DISTRIBUCIÓN SOCIETARIA DE UTILIDADES PACTADA'],
    ['Socio', 'Participación', 'Honorario Gerencia', 'Gastos/Retiros Imputados', 'Utilidad Neta Proyectada'],
  ];

  // Partners rows
  partners.forEach((p) => {
    let grossUtil = (utilidadNeta * p.sharePercent) / 100;
    let managerFeeText = '$0';
    if (p.id === 'maximo') {
      const managerFee = grossUtil * 0.20; // 20% of his share goes to the General Manager
      grossUtil = grossUtil - managerFee;
      managerFeeText = `-20% ($${managerFee.toLocaleString()})`;
    } else if (p.id === 'gerente') {
      grossUtil = utilidadNeta * 0.10; // 10% company profit (20% of Maximo)
      managerFeeText = `+20% Mayoritario ($${grossUtil.toLocaleString()})`;
    }

    const partnerGastos = transactions
      .filter((t) => t.partnerId === p.id && t.type === 'egreso')
      .reduce((a, b) => a + b.amount, 0);
    const netDividend = grossUtil - partnerGastos;

    resumenData.push([
      p.name + (p.id === 'gerente' ? ' (Socio Gerente)' : ''),
      p.id === 'maximo' ? '40% (Neto)' : p.id === 'gerente' ? '10% (Gerencia)' : `${p.sharePercent}%`,
      managerFeeText,
      partnerGastos,
      netDividend,
    ]);
  });

  const wsResumen = XLSX.utils.aoa_to_sheet(resumenData);
  XLSX.utils.book_append_sheet(wb, wsResumen, 'Resumen Ejecutivo');

  // 3. Sheet: Transacciones y Movimientos
  const txHeaders = [
    'ID',
    'Fecha',
    'Tipo',
    'Categoría',
    'Monto ($)',
    'Descripción',
    'Obra Imputada',
    'Socio Asociado',
    'Comprobante N°',
    'Medio de Pago',
    'Estado',
  ];

  const txRows = transactions.map((t) => {
    const obraObj = obras.find((o) => o.id === t.obraId);
    const catObj = CATEGORY_METADATA[t.category];
    const partnerObj = partners.find((p) => p.id === t.partnerId);

    return [
      t.id,
      t.date,
      t.type.toUpperCase(),
      catObj ? catObj.label : t.category,
      t.amount,
      t.description,
      obraObj ? obraObj.name : t.obraId === 'general' ? 'Administración General' : t.obraId,
      partnerObj ? partnerObj.name : 'N/A',
      t.receiptNumber || 'S/N',
      t.paymentMethod.toUpperCase(),
      t.status.toUpperCase(),
    ];
  });

  const wsTx = XLSX.utils.aoa_to_sheet([txHeaders, ...txRows]);
  XLSX.utils.book_append_sheet(wb, wsTx, 'Movimientos y Gastos');

  // 4. Sheet: Obras y Rentabilidad
  const obraHeaders = [
    'Código',
    'Nombre de Obra',
    'Cliente',
    'Ubicación',
    'Estado',
    'Superficie (m2)',
    'Presupuesto Oficial',
    'Ingresos Certificados',
    'Gastos Acumulados',
    'Margen Bruto ($)',
    'Margen Rentabilidad (%)',
    'Avance Físico (%)',
  ];

  const obraRows = obras.map((o) => {
    const obraIngresos = transactions
      .filter((t) => t.obraId === o.id && t.type === 'ingreso')
      .reduce((a, b) => a + b.amount, 0);

    const obraEgresos = transactions
      .filter((t) => t.obraId === o.id && t.type === 'egreso')
      .reduce((a, b) => a + b.amount, 0);

    const margen = obraIngresos - obraEgresos;
    const margenPct = obraIngresos > 0 ? ((margen / obraIngresos) * 100).toFixed(1) : '0';

    return [
      o.code,
      o.name,
      o.client,
      o.location,
      o.status.toUpperCase(),
      o.squareMeters,
      o.budgetTotal,
      obraIngresos,
      obraEgresos,
      margen,
      `${margenPct}%`,
      `${o.progressPercentage}%`,
    ];
  });

  const wsObras = XLSX.utils.aoa_to_sheet([obraHeaders, ...obraRows]);
  XLSX.utils.book_append_sheet(wb, wsObras, 'Análisis de Obras');

  // 5. Sheet: Control de Mano de Obra & Liquidación de Nómina
  const laborHeaders = [
    'Fecha',
    'Concepto / Liquidación',
    'Obra Destino',
    'Sub-rubro',
    'Importe Liquidado ($)',
    'Medio de Pago',
    'Comprobante / Acta',
  ];

  const laborRows = transactions
    .filter(
      (t) =>
        t.category === 'personal_obreros' ||
        t.category === 'personal_staff' ||
        t.category === 'cargas_sociales' ||
        t.category === 'subcontratos'
    )
    .map((t) => {
      const obraObj = obras.find((o) => o.id === t.obraId);
      const catObj = CATEGORY_METADATA[t.category];
      return [
        t.date,
        t.description,
        obraObj ? obraObj.name : 'Administración Central',
        catObj ? catObj.label : t.category,
        t.amount,
        t.paymentMethod.toUpperCase(),
        t.receiptNumber || 'S/N',
      ];
    });

  const wsLabor = XLSX.utils.aoa_to_sheet([laborHeaders, ...laborRows]);
  XLSX.utils.book_append_sheet(wb, wsLabor, 'Mano de Obra & Nómina');

  // Download trigger
  const fileName = `Construq_Reporte_Financiero_ManoDeObra_${new Date().toISOString().slice(0, 10)}.xlsx`;
  XLSX.writeFile(wb, fileName);
}

export function downloadSampleExcelTemplate() {
  const wb = XLSX.utils.book_new();

  const headers = [
    'Fecha (AAAA-MM-DD)',
    'Tipo (ingreso / egreso)',
    'Monto',
    'Descripción',
    'Código Obra (OBR-001 / OBR-002 / general)',
    'Categoría',
    'Medio de Pago (transferencia / cheque / efectivo / tarjeta)',
    'Socio (maximo / sergio / mario / gerente / vacio)',
    'Nro Comprobante',
  ];

  const sampleRows = [
    [
      '2026-09-01',
      'ingreso',
      15000000,
      'Certificación N° 5 de Obra',
      'OBR-001',
      'certificacion_obra',
      'transferencia',
      '',
      'FC-A 0001-1234',
    ],
    [
      '2026-09-02',
      'egreso',
      2800000,
      'Compra de 200 bolsas de cemento',
      'OBR-001',
      'materiales',
      'transferencia',
      '',
      'FC-A 0045-9871',
    ],
    [
      '2026-09-03',
      'egreso',
      3500000,
      'Pago Quincena cuadrilla albañiles',
      'OBR-002',
      'personal_obreros',
      'transferencia',
      '',
      'REC-Q1-SEP',
    ],
    [
      '2026-09-04',
      'egreso',
      1200000,
      'Pago F931 Cargas Sociales',
      'general',
      'cargas_sociales',
      'transferencia',
      '',
      'VEP-AFIP-2026',
    ],
    [
      '2026-09-05',
      'egreso',
      800000,
      'Retiro personal cuenta corriente',
      'general',
      'gastos_socios',
      'transferencia',
      'maximo',
      'TRANS-BANC-009',
    ],
  ];

  const ws = XLSX.utils.aoa_to_sheet([headers, ...sampleRows]);
  XLSX.utils.book_append_sheet(wb, ws, 'Plantilla Carga Masiva');
  XLSX.writeFile(wb, 'Plantilla_Construq_Gastos_Ingresos.xlsx');
}

export async function parseExcelOrCsvFile(file: File): Promise<Partial<Transaction>[]> {
  const data = await file.arrayBuffer();
  const wb = XLSX.read(data, { type: 'array' });
  const firstSheetName = wb.SheetNames[0];
  const ws = wb.Sheets[firstSheetName];

  const rawRows: any[] = XLSX.utils.sheet_to_json(ws, { header: 1 });
  if (rawRows.length < 2) {
    throw new Error('El archivo no contiene suficientes filas de datos.');
  }

  const results: Partial<Transaction>[] = [];

  // Detect header indices
  const header = rawRows[0].map((h: any) => String(h || '').toLowerCase().trim());
  const dateIdx = header.findIndex((h: string) => h.includes('fecha'));
  const typeIdx = header.findIndex((h: string) => h.includes('tipo'));
  const amountIdx = header.findIndex((h: string) => h.includes('monto') || h.includes('importe'));
  const descIdx = header.findIndex((h: string) => h.includes('desc') || h.includes('detalle') || h.includes('concepto'));
  const obraIdx = header.findIndex((h: string) => h.includes('obra'));
  const catIdx = header.findIndex((h: string) => h.includes('categor'));
  const payIdx = header.findIndex((h: string) => h.includes('pago') || h.includes('medio'));
  const partnerIdx = header.findIndex((h: string) => h.includes('socio'));
  const receiptIdx = header.findIndex((h: string) => h.includes('comprobante') || h.includes('factura'));

  for (let i = 1; i < rawRows.length; i++) {
    const row = rawRows[i];
    if (!row || row.length === 0) continue;

    const rawAmount = amountIdx !== -1 ? row[amountIdx] : 0;
    const cleanAmount = typeof rawAmount === 'number' ? rawAmount : parseFloat(String(rawAmount || '0').replace(/[^0-9.-]+/g, ''));
    if (isNaN(cleanAmount) || cleanAmount === 0) continue;

    const rawType = String(typeIdx !== -1 ? row[typeIdx] : 'egreso').toLowerCase();
    const type = rawType.includes('ing') ? 'ingreso' : 'egreso';

    let rawDate = dateIdx !== -1 ? row[dateIdx] : new Date().toISOString().slice(0, 10);
    // If it's Excel numeric date
    if (typeof rawDate === 'number') {
      const parsedDate = new Date((rawDate - (25567 + 2)) * 86400 * 1000);
      rawDate = parsedDate.toISOString().slice(0, 10);
    } else {
      rawDate = String(rawDate).slice(0, 10);
    }

    const desc = descIdx !== -1 ? String(row[descIdx] || 'Importación Excel') : 'Importación Excel';
    const rawObra = obraIdx !== -1 ? String(row[obraIdx] || 'general').toLowerCase() : 'general';
    const rawCat = catIdx !== -1 ? String(row[catIdx] || (type === 'ingreso' ? 'certificacion_obra' : 'materiales')).toLowerCase() : (type === 'ingreso' ? 'certificacion_obra' : 'materiales');
    const rawPartner = partnerIdx !== -1 ? String(row[partnerIdx] || '').toLowerCase() : '';
    const receipt = receiptIdx !== -1 ? String(row[receiptIdx] || '') : '';
    const rawPay = payIdx !== -1 ? String(row[payIdx] || 'transferencia').toLowerCase() : 'transferencia';

    let partnerId: any = null;
    if (rawPartner.includes('maximo') || rawPartner.includes('máximo')) partnerId = 'maximo';
    else if (rawPartner.includes('sergio')) partnerId = 'sergio';
    else if (rawPartner.includes('mario')) partnerId = 'mario';
    else if (rawPartner.includes('gerente') || rawPartner.includes('carlos') || rawPartner.includes('mendoza')) partnerId = 'gerente';

    let paymentMethod: any = 'transferencia';
    if (rawPay.includes('efec') || rawPay.includes('cash')) paymentMethod = 'efectivo';
    else if (rawPay.includes('cheq')) paymentMethod = 'cheque';
    else if (rawPay.includes('tarj') || rawPay.includes('card')) paymentMethod = 'tarjeta';

    results.push({
      id: `tx-imp-${Date.now()}-${i}`,
      type,
      date: rawDate,
      amount: Math.abs(cleanAmount),
      currency: 'ARS',
      description: desc,
      obraId: rawObra.includes('001') ? 'obr-001' : rawObra.includes('002') ? 'obr-002' : rawObra.includes('003') ? 'obr-003' : rawObra.includes('004') ? 'obr-004' : 'general',
      category: rawCat as any,
      partnerId,
      paymentMethod,
      receiptNumber: receipt,
      status: 'conciliado',
      createdAt: new Date().toISOString(),
    });
  }

  return results;
}
