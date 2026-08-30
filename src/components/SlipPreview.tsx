import React, { useState } from 'react';
import { Teacher, SalarySlip, SchoolSettings } from '../types';
import { formatRupiah } from '../utils';
import { Printer, ArrowLeft, Download, Image as ImageIcon, Loader2, Send, CheckCircle2, AlertCircle } from 'lucide-react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { sendSlipViaFonnte, openDirectWhatsappWeb } from '../utils/fonnte';

interface SlipPreviewProps {
  slip: SalarySlip;
  teacher?: Teacher;
  settings?: SchoolSettings;
  onBack: () => void;
}

export function SlipPreview({ slip, teacher, settings, onBack }: SlipPreviewProps) {
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [isDownloadingPng, setIsDownloadingPng] = useState(false);
  const [isSendingWa, setIsSendingWa] = useState(false);
  const [waStatus, setWaStatus] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const phone = teacher?.phone || slip.teacherPhone || '';
  const token = settings?.fonnteToken || '';

  const handlePrint = () => {
    window.print();
  };

  const handleSendWhatsapp = async () => {
    setWaStatus(null);
    if (!phone) {
      setWaStatus({
        type: 'error',
        text: 'Nomor WhatsApp guru belum diisi. Silakan edit data guru di menu Data Guru.'
      });
      return;
    }

    if (!token) {
      // If token not configured, open WA web direct link as convenience fallback
      openDirectWhatsappWeb(slip, phone);
      setWaStatus({
        type: 'error',
        text: 'API Token Fonnte belum diisi di Pengaturan. Membuka WhatsApp Web langsung...'
      });
      return;
    }

    try {
      setIsSendingWa(true);
      const res = await sendSlipViaFonnte({
        slip,
        phone,
        token,
        elementId: 'slip-document'
      });

      if (res.success) {
        setWaStatus({ type: 'success', text: res.message });
      } else {
        setWaStatus({ type: 'error', text: res.message });
      }
    } catch (err: any) {
      setWaStatus({ type: 'error', text: `Gagal mengirim: ${err.message || 'Error'}` });
    } finally {
      setIsSendingWa(false);
    }
  };

  const handleDownloadPdf = async () => {
    const element = document.getElementById('slip-document');
    if (!element) return;

    try {
      setIsDownloadingPdf(true);
      const canvas = await html2canvas(element, { scale: 2, backgroundColor: '#ffffff', logging: false });
      const imgData = canvas.toDataURL('image/jpeg', 0.98);
      
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
      const filename = `Slip_Gaji_${slip.teacherName.replace(/[^a-zA-Z0-9]/g, '_')}_${slip.month}_${slip.year}.pdf`;
      pdf.save(filename);
    } catch (err) {
      console.error('Error generating PDF:', err);
      window.print();
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  const handleDownloadPng = async () => {
    const element = document.getElementById('slip-document');
    if (!element) return;

    try {
      setIsDownloadingPng(true);
      const canvas = await html2canvas(element, { scale: 2, backgroundColor: '#ffffff' });
      const image = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = image;
      link.download = `Slip_Gaji_${slip.teacherName.replace(/[^a-zA-Z0-9]/g, '_')}_${slip.month}_${slip.year}.png`;
      link.click();
    } catch (err) {
      console.error('Error generating image:', err);
      alert('Gagal mengunduh gambar slip.');
    } finally {
      setIsDownloadingPng(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Action Controls - Hidden during print */}
      <div className="mb-6 flex flex-wrap justify-between items-center gap-3 print:hidden">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-2 text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors font-medium shadow-sm"
        >
          <ArrowLeft size={18} />
          <span>Kembali</span>
        </button>
        
        <div className="flex flex-wrap items-center gap-2">
          {/* Kirim WhatsApp (Fonnte API) */}
          <button
            onClick={handleSendWhatsapp}
            disabled={isSendingWa}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white hover:bg-emerald-700 rounded-lg transition-colors shadow-sm font-medium text-sm disabled:opacity-50"
            title="Kirim Otomatis Slip & PDF via Fonnte WA Gateway"
          >
            {isSendingWa ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Mengirim PDF WA...</span>
              </>
            ) : (
              <>
                <Send size={16} />
                <span>Kirim WA (Fonnte + PDF)</span>
              </>
            )}
          </button>

          {/* Download PNG */}
          <button 
            onClick={handleDownloadPng}
            disabled={isDownloadingPng}
            className="flex items-center gap-2 px-3.5 py-2 bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-300 rounded-lg transition-colors font-medium text-sm disabled:opacity-50"
            title="Download sebagai gambar PNG"
          >
            {isDownloadingPng ? <Loader2 size={16} className="animate-spin" /> : <ImageIcon size={16} className="text-blue-600" />}
            <span>Download PNG</span>
          </button>

          {/* Download PDF */}
          <button 
            onClick={handleDownloadPdf}
            disabled={isDownloadingPdf}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white hover:bg-emerald-700 rounded-lg transition-colors shadow-sm font-medium text-sm disabled:opacity-50"
            title="Download file PDF Slip Gaji"
          >
            {isDownloadingPdf ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
            <span>Download PDF</span>
          </button>

          {/* Cetak */}
          <button 
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-900 transition-colors shadow-sm font-medium text-sm"
            title="Cetak langsung / Simpan PDF Browser"
          >
            <Printer size={16} />
            <span>Cetak Slip</span>
          </button>
        </div>
      </div>

      {/* WA Status Alert */}
      {waStatus && (
        <div className={`mb-6 p-4 rounded-xl border flex items-start justify-between text-sm print:hidden ${
          waStatus.type === 'success'
            ? 'bg-emerald-50 text-emerald-900 border-emerald-300'
            : 'bg-amber-50 text-amber-900 border-amber-300'
        }`}>
          <div className="flex items-start gap-2.5">
            {waStatus.type === 'success' ? (
              <CheckCircle2 size={18} className="text-emerald-700 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle size={18} className="text-amber-700 shrink-0 mt-0.5" />
            )}
            <div>
              <p className="font-semibold">{waStatus.text}</p>
              {!token && waStatus.type === 'error' && (
                <p className="text-xs text-amber-800 mt-1">
                  Tip: Buka menu <strong>Pengaturan</strong> dan isikan <strong>API Token Fonnte</strong> untuk mengaktifkan pengiriman PDF otomatis secara langsung tanpa membuka WhatsApp Web.
                </p>
              )}
            </div>
          </div>
          <button onClick={() => setWaStatus(null)} className="text-slate-400 hover:text-slate-600 text-xs ml-4 font-bold">
            ✕
          </button>
        </div>
      )}

      {/* Slip Document Box */}
      <div 
        id="slip-document" 
        className="bg-white p-6 sm:p-10 rounded-xl shadow-md border border-slate-200 text-slate-900 print:shadow-none print:border-none print:p-0 print:m-0 font-sans max-w-3xl mx-auto"
      >
        
        {/* Title */}
        <div className="text-center font-bold mb-6">
          <h1 className="text-2xl sm:text-3xl tracking-wider uppercase text-slate-900 font-extrabold">SLIP GAJI</h1>
          <h2 className="text-xl sm:text-2xl uppercase text-slate-900 mt-0.5 font-bold">{slip.schoolName || 'MI AL-BAROKAH'}</h2>
          <p className="text-xs font-semibold text-slate-500 uppercase mt-1">PERIODE: {slip.month} {slip.year}</p>
        </div>

        {/* Header Metadata Info (2 Columns) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2 text-sm font-semibold mb-6">
          <div className="space-y-2">
            <div className="flex items-center">
              <span className="w-24 text-slate-800 font-bold">Nama</span>
              <span className="mr-2">:</span>
              <span className="flex-1 border-b border-slate-800 pb-0.5 text-slate-900 font-bold">{slip.teacherName}</span>
            </div>
            <div className="flex items-center">
              <span className="w-24 text-slate-800 font-bold">Jabatan</span>
              <span className="mr-2">:</span>
              <span className="flex-1 border-b border-slate-800 pb-0.5 text-slate-900">{slip.position || '-'}</span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center">
              <span className="w-32 text-slate-800 font-bold">Tugas Tambahan</span>
              <span className="mr-2">:</span>
              <span className="flex-1 border-b border-slate-800 pb-0.5 text-slate-900">{slip.tugasTambahan || '-'}</span>
            </div>
            <div className="flex items-center">
              <span className="w-32 text-slate-800 font-bold">Masa Kerja</span>
              <span className="mr-2">:</span>
              <span className="flex-1 border-b border-slate-800 pb-0.5 text-slate-900">{slip.masaKerja || '-'}</span>
            </div>
          </div>
        </div>

        {/* Table Header Bar */}
        <div className="w-full text-sm mb-6">
          {/* Green Border Top and Bottom Header */}
          <div className="grid grid-cols-2 border-t-2 border-b-2 border-emerald-600 py-1.5 font-bold text-emerald-700 text-sm tracking-wide">
            <div>PENERIMAAN (A)</div>
            <div>POTONGAN (B)</div>
          </div>

          {/* Grid Content Column (Penerimaan Left, Potongan Right) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 text-sm pt-3">
            
            {/* PENERIMAAN Column (Left) */}
            <div className="space-y-2.5">
              <div className="flex justify-between items-center">
                <span className="text-slate-800">Gaji Pokok</span>
                <div className="flex items-center gap-1 font-mono text-slate-900">
                  <span>Rp</span>
                  <span className="border-b border-slate-800 min-w-[110px] text-right pb-0.5 font-semibold">
                    {formatRupiah(slip.baseSalary).replace('Rp', '').trim()}
                  </span>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-slate-800">Beban Jam Mengajar (JTM)</span>
                <div className="flex items-center gap-1 font-mono text-slate-900">
                  <span>Rp</span>
                  <span className="border-b border-slate-800 min-w-[110px] text-right pb-0.5 font-semibold">
                    {formatRupiah(slip.bebanJTM).replace('Rp', '').trim()}
                  </span>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-slate-800">Insentif Walas</span>
                <div className="flex items-center gap-1 font-mono text-slate-900">
                  <span>Rp</span>
                  <span className="border-b border-slate-800 min-w-[110px] text-right pb-0.5 font-semibold">
                    {formatRupiah(slip.insentifWalas).replace('Rp', '').trim()}
                  </span>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-slate-800">Insentif Kinerja Tahunan</span>
                <div className="flex items-center gap-1 font-mono text-slate-900">
                  <span>Rp</span>
                  <span className="border-b border-slate-800 min-w-[110px] text-right pb-0.5 font-semibold">
                    {formatRupiah(slip.insentifKinerjaTahunan).replace('Rp', '').trim()}
                  </span>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-slate-800">Insentif Kinerja Bulanan</span>
                <div className="flex items-center gap-1 font-mono text-slate-900">
                  <span>Rp</span>
                  <span className="border-b border-slate-800 min-w-[110px] text-right pb-0.5 font-semibold">
                    {formatRupiah(slip.insentifKinerjaBulanan).replace('Rp', '').trim()}
                  </span>
                </div>
              </div>

              {Boolean(slip.insentifTusasTambahan) && (
                <div className="flex justify-between items-center">
                  <span className="text-slate-800">Insentif Tusas Tambahan</span>
                  <div className="flex items-center gap-1 font-mono text-slate-900">
                    <span>Rp</span>
                    <span className="border-b border-slate-800 min-w-[110px] text-right pb-0.5 font-semibold">
                      {formatRupiah(slip.insentifTusasTambahan || 0).replace('Rp', '').trim()}
                    </span>
                  </div>
                </div>
              )}

              {Boolean(slip.insentifEskul) && (
                <div className="flex justify-between items-center">
                  <span className="text-slate-800">Insentif Kegiatan Eskul</span>
                  <div className="flex items-center gap-1 font-mono text-slate-900">
                    <span>Rp</span>
                    <span className="border-b border-slate-800 min-w-[110px] text-right pb-0.5 font-semibold">
                      {formatRupiah(slip.insentifEskul || 0).replace('Rp', '').trim()}
                    </span>
                  </div>
                </div>
              )}

              <div className="flex justify-between items-center">
                <span className="text-slate-800">Masa Kerja</span>
                <div className="flex items-center gap-1 font-mono text-slate-900">
                  <span>Rp</span>
                  <span className="border-b border-slate-800 min-w-[110px] text-right pb-0.5 font-semibold">
                    {formatRupiah(slip.tunjanganMasaKerja).replace('Rp', '').trim()}
                  </span>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-slate-800">Pendidikan</span>
                <div className="flex items-center gap-1 font-mono text-slate-900">
                  <span>Rp</span>
                  <span className="border-b border-slate-800 min-w-[110px] text-right pb-0.5 font-semibold">
                    {formatRupiah(slip.tunjanganPendidikan).replace('Rp', '').trim()}
                  </span>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-slate-800">Iuran BPJS</span>
                <div className="flex items-center gap-1 font-mono text-slate-900">
                  <span>Rp</span>
                  <span className="border-b border-slate-800 min-w-[110px] text-right pb-0.5 font-semibold">
                    {formatRupiah(slip.tunjanganBPJS).replace('Rp', '').trim()}
                  </span>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-slate-800">Iuran Qurban</span>
                <div className="flex items-center gap-1 font-mono text-slate-900">
                  <span>Rp</span>
                  <span className="border-b border-slate-800 min-w-[110px] text-right pb-0.5 font-semibold">
                    {formatRupiah(slip.tunjanganQurban).replace('Rp', '').trim()}
                  </span>
                </div>
              </div>
            </div>

            {/* POTONGAN Column (Right) */}
            <div className="space-y-2.5 mt-4 md:mt-0">
              <div className="flex justify-between items-center">
                <span className="text-slate-800">Iuran BPJS Ketenagakerjaan</span>
                <div className="flex items-center gap-1 font-mono text-slate-900">
                  <span>Rp</span>
                  <span className="border-b border-slate-800 min-w-[110px] text-right pb-0.5 font-semibold">
                    {formatRupiah(slip.potonganBPJSKetenagakerjaan).replace('Rp', '').trim()}
                  </span>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-slate-800">Iuran Qurban</span>
                <div className="flex items-center gap-1 font-mono text-slate-900">
                  <span>Rp</span>
                  <span className="border-b border-slate-800 min-w-[110px] text-right pb-0.5 font-semibold">
                    {formatRupiah(slip.potonganQurban).replace('Rp', '').trim()}
                  </span>
                </div>
              </div>
            </div>

          </div>

          {/* Green Line Border Totals Bar */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 border-t-2 border-b-2 border-emerald-600 py-2 mt-6 font-bold text-slate-900">
            <div className="flex justify-between items-center">
              <span>JUMLAH PENERIMAAN</span>
              <div className="flex items-center gap-1 font-mono">
                <span>Rp</span>
                <span className="border-b border-slate-800 min-w-[110px] text-right font-extrabold">
                  {formatRupiah(slip.totalPenerimaan).replace('Rp', '').trim()}
                </span>
              </div>
            </div>

            <div className="flex justify-between items-center mt-2 md:mt-0">
              <span>JUMLAH POTONGAN</span>
              <div className="flex items-center gap-1 font-mono">
                <span>Rp</span>
                <span className="border-b border-slate-800 min-w-[110px] text-right font-extrabold">
                  {formatRupiah(slip.totalPotongan).replace('Rp', '').trim()}
                </span>
              </div>
            </div>
          </div>

          {/* TOTAL YANG DITERIMA */}
          <div className="flex flex-wrap items-center gap-2 mt-6 text-base font-bold text-slate-900">
            <span>TOTAL YANG DITERIMA (A-B):</span>
            <div className="flex items-center gap-1 font-mono">
              <span>Rp</span>
              <span className="border-b-2 border-slate-900 text-lg font-extrabold px-2 pb-0.5 min-w-[160px]">
                {formatRupiah(slip.netSalary).replace('Rp', '').trim()}
              </span>
            </div>
          </div>
        </div>

        {/* Signature Section */}
        <div className="mt-12 flex justify-end">
          <div className="text-center min-w-[220px]">
            <p className="font-medium text-slate-800 mb-20">Dibuat Oleh</p>
            <div className="w-52 border-b border-slate-800 mx-auto"></div>
            <p className="text-sm font-semibold text-slate-800 mt-1">
              {slip.createdByName || 'Bendahara'}
            </p>
          </div>
        </div>

        {slip.notes && (
          <div className="mt-6 pt-3 border-t border-slate-200 text-xs text-slate-500 italic">
            Catatan: {slip.notes}
          </div>
        )}

      </div>
    </div>
  );
}


