import React from 'react';
import { formatRupiah } from '../utils';
import { useAppStore } from '../store';
import { Users, FileText, CheckCircle } from 'lucide-react';

export function DashboardView() {
  const { teachers, slips } = useAppStore();

  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  
  // Basic stats
  const totalTeachers = teachers.length;
  const slipsThisMonth = slips.filter(s => s.year === currentYear && s.month === new Intl.DateTimeFormat('id-ID', { month: 'long' }).format(new Date())).length;
  
  const totalSalaryThisMonth = slips
    .filter(s => s.year === currentYear && s.month === new Intl.DateTimeFormat('id-ID', { month: 'long' }).format(new Date()))
    .reduce((sum, slip) => sum + slip.netSalary, 0);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Dashboard</h2>
        <p className="text-slate-500 text-sm mt-1">Ringkasan data penggajian Madrasah Ibtidaiyah.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center">
            <Users size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Total Guru & Staff</p>
            <p className="text-2xl font-bold text-slate-900">{totalTeachers}</p>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-lg flex items-center justify-center">
            <FileText size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Slip Bulan Ini</p>
            <p className="text-2xl font-bold text-slate-900">{slipsThisMonth}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center gap-4">
          <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-lg flex items-center justify-center">
            <CheckCircle size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Total Pengeluaran Bulan Ini</p>
            <p className="text-2xl font-bold text-slate-900 tracking-tight">{formatRupiah(totalSalaryThisMonth)}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h3 className="text-lg font-bold text-slate-800 mb-4">Informasi Sistem</h3>
        <div className="prose prose-sm text-slate-600">
          <p>
            Selamat datang di Sistem Manajemen Slip Gaji Guru Madrasah Ibtidaiyah. Aplikasi ini dirancang untuk memudahkan tata usaha dalam mengelola data guru, mengatur komponen gaji (gaji pokok, tunjangan, dan potongan), serta mencetak slip gaji bulanan dalam format yang profesional.
          </p>
          <ul>
            <li><strong>Data Guru:</strong> Kelola data identitas dan gaji pokok standar setiap guru.</li>
            <li><strong>Slip Gaji:</strong> Buat rincian penerimaan dan potongan bulanan. Slip dapat langsung dicetak (Print to PDF).</li>
            <li><strong>Keamanan:</strong> Data Anda disimpan secara aman di dalam penyimpanan lokal browser (Local Storage).</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
