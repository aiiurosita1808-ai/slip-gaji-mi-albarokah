import React, { useState } from 'react';
import { SchoolSettings } from '../types';
import { Building2, UserCheck, Calculator, Save, CheckCircle2, MessageSquare, Key, ExternalLink } from 'lucide-react';

interface SettingsViewProps {
  settings: SchoolSettings;
  onUpdateSettings: (newSettings: Partial<SchoolSettings>) => void;
}

export function SettingsView({ settings, onUpdateSettings }: SettingsViewProps) {
  const [formData, setFormData] = useState<SchoolSettings>({ ...settings });
  const [isSaved, setIsSaved] = useState(false);

  const handleChange = (field: keyof SchoolSettings, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setIsSaved(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSettings(formData);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Pengaturan Madrasah</h1>
          <p className="text-sm text-slate-500 mt-1">Kelola identitas madrasah, penanggung jawab, tarif penggajian, dan integrasi WhatsApp Gateway.</p>
        </div>
        {isSaved && (
          <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-sm font-medium animate-fade-in">
            <CheckCircle2 size={18} />
            <span>Pengaturan Berhasil Disimpan!</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Card 1: Identitas & Kop Madrasah */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-slate-100 text-emerald-700">
            <div className="p-2 bg-emerald-50 rounded-lg">
              <Building2 size={20} />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-800">Identitas & Kop Madrasah</h2>
              <p className="text-xs text-slate-500">Informasi ini akan tercetak pada Kop Slip Gaji.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Nama Singkat Madrasah (Header Slip)</label>
              <input
                type="text"
                value={formData.schoolName}
                onChange={e => handleChange('schoolName', e.target.value)}
                className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="misal: MI AL-BAROKAH"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Nama Lengkap Madrasah</label>
              <input
                type="text"
                value={formData.subTitle}
                onChange={e => handleChange('subTitle', e.target.value)}
                className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="misal: Madrasah Ibtidaiyah Al-Barokah"
              />
            </div>

            <div className="md:col-span-2 space-y-1">
              <label className="text-xs font-semibold text-slate-700">Alamat Lengkap Madrasah</label>
              <input
                type="text"
                value={formData.address}
                onChange={e => handleChange('address', e.target.value)}
                className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="misal: Jl. Pendidikan No. 45, Bandung"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Nomor Telepon / WA</label>
              <input
                type="text"
                value={formData.phone}
                onChange={e => handleChange('phone', e.target.value)}
                className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="misal: 0812-3456-7890"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Email Madrasah</label>
              <input
                type="email"
                value={formData.email}
                onChange={e => handleChange('email', e.target.value)}
                className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="misal: mialbarokah@example.sch.id"
              />
            </div>
          </div>
        </div>

        {/* Card 2: Penanggung Jawab & Tanda Tangan */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-slate-100 text-emerald-700">
            <div className="p-2 bg-emerald-50 rounded-lg">
              <UserCheck size={20} />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-800">Penanggung Jawab & Tanda Tangan</h2>
              <p className="text-xs text-slate-500">Nama pejabat yang akan ditampilkan pada tanda tangan slip.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Nama Bendahara / Pembuat Slip (TTD)</label>
              <input
                type="text"
                value={formData.treasurerName}
                onChange={e => handleChange('treasurerName', e.target.value)}
                className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="misal: Ahmad Fauzi, S.Pd.I"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Nama Kepala Madrasah</label>
              <input
                type="text"
                value={formData.headmasterName}
                onChange={e => handleChange('headmasterName', e.target.value)}
                className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="misal: Hj. Siti Aminah, S.Ag"
              />
            </div>
          </div>
        </div>

        {/* Card 3: Standar Tarif Penggajian */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-slate-100 text-emerald-700">
            <div className="p-2 bg-emerald-50 rounded-lg">
              <Calculator size={20} />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-800">Standar Penggajian (Default)</h2>
              <p className="text-xs text-slate-500">Tarif perhitungan otomatis per jam mengajar (JTM).</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Default Rp per JTM (Jam Tatap Muka)</label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-slate-400 text-sm font-semibold">Rp</span>
                <input
                  type="number"
                  value={formData.defaultRpJtm}
                  onChange={e => handleChange('defaultRpJtm', Number(e.target.value) || 0)}
                  className="w-full pl-10 pr-3.5 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                  placeholder="10000"
                  min="0"
                />
              </div>
              <p className="text-xs text-slate-400">Tarif ini digunakan sebagai pengali default saat hitung JTM guru.</p>
            </div>
          </div>
        </div>

        {/* Card 4: WhatsApp Gateway API (Fonnte) */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 text-emerald-700">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-50 rounded-lg">
                <MessageSquare size={20} />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-800">Integrasi WhatsApp Gateway (Fonnte)</h2>
                <p className="text-xs text-slate-500">Kirim slip gaji langsung ke WA guru beserta lampiran PDF otomatis.</p>
              </div>
            </div>

            <a
              href="https://fonnte.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs text-emerald-700 hover:text-emerald-800 font-medium"
            >
              <span>Buka Fonnte.com</span>
              <ExternalLink size={14} />
            </a>
          </div>

          <div className="space-y-3 pt-2">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <Key size={14} className="text-emerald-600" />
                <span>API Token Fonnte</span>
              </label>
              <input
                type="password"
                value={formData.fonnteToken || ''}
                onChange={e => handleChange('fonnteToken', e.target.value)}
                className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="Masukkan API Token dari dashboard Fonnte Anda"
              />
              <p className="text-xs text-slate-500 mt-1">
                Dapatkan Token API gratis / langganan Anda dari menu Device / Profile di dashboard <a href="https://fonnte.com" target="_blank" rel="noreferrer" className="text-emerald-700 underline font-medium">Fonnte</a>.
              </p>
            </div>

            <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-lg text-xs text-emerald-900 space-y-1">
              <div className="font-semibold flex items-center gap-1">
                <CheckCircle2 size={14} className="text-emerald-700" />
                <span>Fitur Pengiriman Fonnte WhatsApp Gateway:</span>
              </div>
              <ul className="list-disc list-inside space-y-0.5 text-emerald-800">
                <li>Mengirim pesan teks rincian penerimaan, potongan, dan total gaji bersih.</li>
                <li>Melampirkan file dokumen <strong>PDF Slip Gaji</strong> resmi secara otomatis.</li>
                <li>Jika token kosong, sistem akan menggunakan opsi pesan instan WhatsApp Web sebagai alternatif.</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors shadow-md font-medium text-sm"
          >
            <Save size={18} />
            <span>Simpan Perubahan Pengaturan</span>
          </button>
        </div>
      </form>
    </div>
  );
}
