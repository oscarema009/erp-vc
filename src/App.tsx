/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  getInitialData,
  saveTransactions,
  saveObras,
  savePartners,
  saveSession,
} from './services/storage';
import {
  Transaction,
  Obra,
  Partner,
  UserSession,
} from './types';
import { Navbar } from './components/Navbar';
import { Sidebar, ActiveTab } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { FastEntryView } from './components/FastEntryView';
import { ObrasView } from './components/ObrasView';
import { PartnersView } from './components/PartnersView';
import { TaxesAndPayrollView } from './components/TaxesAndPayrollView';
import { ReportsView } from './components/ReportsView';
import { AIAssistantView } from './components/AIAssistantView';
import { WhatsAppBotView } from './components/WhatsAppBotView';
import { SecurityView } from './components/SecurityView';
import { ExcelImporterModal } from './components/ExcelImporterModal';
import { LoginModal } from './components/LoginModal';

export default function App() {
  const [data, setData] = useState(() => getInitialData());
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [selectedObraFilter, setSelectedObraFilter] = useState('all');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isExcelModalOpen, setIsExcelModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [fastEntryDefaultObra, setFastEntryDefaultObra] = useState<string>('obr-001');

  const { transactions, obras, partners, session } = data;

  // Handlers for Transactions
  const handleAddTransaction = (newTx: Transaction) => {
    const updated = [newTx, ...transactions];
    saveTransactions(updated);
    setData((prev) => ({ ...prev, transactions: updated }));
  };

  const handleDeleteTransaction = (id: string) => {
    const updated = transactions.filter((t) => t.id !== id);
    saveTransactions(updated);
    setData((prev) => ({ ...prev, transactions: updated }));
  };

  const handleImportTransactions = (imported: Transaction[]) => {
    const updated = [...imported, ...transactions];
    saveTransactions(updated);
    setData((prev) => ({ ...prev, transactions: updated }));
  };

  // Handlers for Obras
  const handleAddObra = (newObra: Obra) => {
    const updated = [...obras, newObra];
    saveObras(updated);
    setData((prev) => ({ ...prev, obras: updated }));
  };

  const handleUpdateObra = (updatedObra: Obra) => {
    const updated = obras.map((o) => (o.id === updatedObra.id ? updatedObra : o));
    saveObras(updated);
    setData((prev) => ({ ...prev, obras: updated }));
  };

  // Session handler
  const handleUpdateSession = (newSession: UserSession) => {
    saveSession(newSession);
    setData((prev) => ({ ...prev, session: newSession }));
  };

  // Shortcut to switch to Fast Entry with a preselected Obra
  const handleSelectObraFastEntry = (obraId: string) => {
    setFastEntryDefaultObra(obraId);
    setActiveTab('fast_entry');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-slate-950">
      {/* Top Navigation */}
      <Navbar
        session={session}
        obras={obras}
        selectedObraId={selectedObraFilter}
        onSelectObra={setSelectedObraFilter}
        onOpenExcelModal={() => setIsExcelModalOpen(true)}
        onOpenLoginModal={() => setIsLoginModalOpen(true)}
        onToggleMobileMenu={() => setMobileMenuOpen((prev) => !prev)}
        onSelectTab={setActiveTab}
      />

      {/* Main App Layout */}
      <div className="flex-1 flex max-w-[1600px] w-full mx-auto">
        {/* Left Sidebar */}
        <Sidebar
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          mobileOpen={mobileMenuOpen}
          onCloseMobile={() => setMobileMenuOpen(false)}
          onOpenExcelModal={() => setIsExcelModalOpen(true)}
        />

        {/* Content Container */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0 overflow-x-hidden">
          {activeTab === 'dashboard' && (
            <Dashboard
              transactions={transactions}
              obras={obras}
              partners={partners}
              onSelectTab={setActiveTab}
              onOpenExcelModal={() => setIsExcelModalOpen(true)}
              onSelectObraFastEntry={handleSelectObraFastEntry}
            />
          )}

          {activeTab === 'fast_entry' && (
            <FastEntryView
              obras={obras}
              partners={partners}
              transactions={transactions}
              onAddTransaction={handleAddTransaction}
              onDeleteTransaction={handleDeleteTransaction}
              defaultObraId={fastEntryDefaultObra}
            />
          )}

          {activeTab === 'obras' && (
            <ObrasView
              obras={obras}
              transactions={transactions}
              onAddObra={handleAddObra}
              onUpdateObra={handleUpdateObra}
              onSelectObraFastEntry={handleSelectObraFastEntry}
            />
          )}

          {activeTab === 'partners' && (
            <PartnersView
              partners={partners}
              transactions={transactions}
              onAddTransaction={handleAddTransaction}
            />
          )}

          {activeTab === 'taxes_payroll' && (
            <TaxesAndPayrollView transactions={transactions} />
          )}

          {activeTab === 'reports' && (
            <ReportsView
              transactions={transactions}
              obras={obras}
              partners={partners}
            />
          )}

          {activeTab === 'ai_assistant' && (
            <AIAssistantView
              transactions={transactions}
              obras={obras}
              partners={partners}
            />
          )}

          {activeTab === 'whatsapp_bot' && (
            <WhatsAppBotView
              obras={obras}
              partners={partners}
              onAddTransaction={handleAddTransaction}
            />
          )}

          {activeTab === 'security' && (
            <SecurityView
              session={session}
              onUpdateSession={handleUpdateSession}
              onOpenLoginModal={() => setIsLoginModalOpen(true)}
            />
          )}
        </main>
      </div>

      {/* Modals */}
      <ExcelImporterModal
        isOpen={isExcelModalOpen}
        onClose={() => setIsExcelModalOpen(false)}
        onImportTransactions={handleImportTransactions}
      />

      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        currentSession={session}
        onLoginSuccess={handleUpdateSession}
      />
    </div>
  );
}
