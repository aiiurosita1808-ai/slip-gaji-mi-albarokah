import React, { useEffect, useState } from 'react';
import { db, doc, getDoc } from '../lib/firebase';
import { SalarySlip, SchoolSettings } from '../types';
import { SlipPreview } from './SlipPreview';
import { Loader2, AlertCircle } from 'lucide-react';

export function PublicSlipView({ slipId }: { slipId: string }) {
  const [slip, setSlip] = useState<SalarySlip | null>(null);
  const [settings, setSettings] = useState<SchoolSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchData() {
      try {
        const slipDoc = await getDoc(doc(db, 'salary_slips', slipId));
        if (slipDoc.exists()) {
          setSlip({ id: slipDoc.id, ...slipDoc.data() } as SalarySlip);
        } else {
          setError('Slip gaji tidak ditemukan.');
          setLoading(false);
          return;
        }

        const settingsDoc = await getDoc(doc(db, 'school_settings', 'config'));
        if (settingsDoc.exists()) {
          setSettings(settingsDoc.data() as SchoolSettings);
        } else {
          setError('Pengaturan sekolah tidak ditemukan.');
        }
      } catch (err) {
        setError('Terjadi kesalahan saat mengambil data.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [slipId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex items-center gap-3 text-slate-500">
          <Loader2 className="animate-spin" />
          <span>Memuat Slip Gaji...</span>
        </div>
      </div>
    );
  }

  if (error || !slip || !settings) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 flex flex-col items-center max-w-md text-center">
          <AlertCircle className="text-red-500 w-12 h-12 mb-4" />
          <h2 className="text-lg font-bold text-slate-800 mb-2">Gagal Memuat</h2>
          <p className="text-slate-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-8 print:bg-white print:p-0 print:min-h-0">
      <div className="max-w-4xl mx-auto flex flex-col items-center print:block print:max-w-none print:m-0">
        <div className="w-full bg-white rounded-xl shadow-sm border border-slate-200 p-4 sm:p-8 overflow-x-auto print:overflow-visible print:border-none print:shadow-none print:p-0">
          <SlipPreview slip={slip} settings={settings} isPublic={true} />
        </div>
      </div>
    </div>
  );
}
