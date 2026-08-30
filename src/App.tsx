import React, { useState, useEffect } from 'react';
import { ViewState } from './types';
import { useAppStore } from './store';
import { DashboardView } from './components/DashboardView';
import { TeachersView } from './components/TeachersView';
import { SalarySlipsView } from './components/SalarySlipsView';
import { SettingsView } from './components/SettingsView';
import { PublicSlipView } from './components/PublicSlipView';
import { LayoutDashboard, Users, FileText, School, Settings } from 'lucide-react';

export default function App() {
  const [currentView, setCurrentView] = useState<ViewState>('dashboard');
  const [publicSlipId, setPublicSlipId] = useState<string | null>(null);
  const store = useAppStore();

  useEffect(() => {
    // Basic routing for public slip viewer
    const path = window.location.pathname;
    if (path.startsWith('/slip/')) {
      const id = path.split('/slip/')[1];
      if (id) {
        setPublicSlipId(id);
      }
    }
  }, []);

  if (publicSlipId) {
    return <PublicSlipView slipId={publicSlipId} />;
  }

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        return <DashboardView />;
      case 'teachers':
        return (
          <TeachersView
            teachers={store.teachers}
            onAddTeacher={store.addTeacher}
            onUpdateTeacher={store.updateTeacher}
            onDeleteTeacher={store.deleteTeacher}
            onClearAllTeachers={store.clearAllTeachers}
          />
        );
      case 'slips':
        return (
          <SalarySlipsView
            teachers={store.teachers}
            slips={store.slips}
            onAddSlip={store.addSlip}
            onDeleteSlip={store.deleteSlip}
            settings={store.settings}
          />
        );
      case 'settings':
        return (
          <SettingsView
            settings={store.settings}
            onUpdateSettings={store.updateSettings}
          />
        );
      default:
        return <DashboardView />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      {/* Sidebar - hidden when printing */}
      <aside className="w-full md:w-64 bg-slate-900 text-slate-300 flex flex-col print:hidden shadow-xl z-10 md:min-h-screen">
        <div className="p-6 flex items-center gap-3 border-b border-slate-800">
          <div className="bg-emerald-500 p-2 rounded-lg text-white shrink-0">
            <School size={24} />
          </div>
          <div className="overflow-hidden">
            <h1 className="text-base font-bold text-white leading-tight truncate">{store.settings.schoolName || 'Sistem Gaji'}</h1>
            <p className="text-xs text-slate-400 truncate">{store.settings.subTitle || 'Madrasah Ibtidaiyah'}</p>
          </div>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2">
          <button
            onClick={() => setCurrentView('dashboard')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
              currentView === 'dashboard'
                ? 'bg-emerald-600 text-white'
                : 'hover:bg-slate-800 hover:text-white'
            }`}
          >
            <LayoutDashboard size={18} />
            Dashboard
          </button>
          
          <button
            onClick={() => setCurrentView('teachers')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
              currentView === 'teachers'
                ? 'bg-emerald-600 text-white'
                : 'hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Users size={18} />
            Data Guru & Staff
          </button>
          
          <button
            onClick={() => setCurrentView('slips')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
              currentView === 'slips'
                ? 'bg-emerald-600 text-white'
                : 'hover:bg-slate-800 hover:text-white'
            }`}
          >
            <FileText size={18} />
            Cetak Slip Gaji
          </button>

          <button
            onClick={() => setCurrentView('settings')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
              currentView === 'settings'
                ? 'bg-emerald-600 text-white'
                : 'hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Settings size={18} />
            Pengaturan
          </button>
        </nav>

        <div className="p-6 border-t border-slate-800 text-xs text-slate-500">
          &copy; {new Date().getFullYear()} {store.settings.schoolName || 'Madrasah Ibtidaiyah'}.
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-8 overflow-y-auto print:p-0 print:overflow-visible">
        <div className="max-w-6xl mx-auto print:max-w-none">
          {renderContent()}
        </div>
      </main>
    </div>
  );
}


