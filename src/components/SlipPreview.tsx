import React, { useState } from 'react';
import { Teacher, SalarySlip, SchoolSettings } from '../types';
import { formatRupiah } from '../utils';
import { Printer, ArrowLeft, Download, Image as ImageIcon, Loader2, Send, CheckCircle2, AlertCircle } from 'lucide-react';
import html2canvas from 'html2canvas-pro';
import { jsPDF } from 'jspdf';
import { sendSlipViaFonnte, openDirectWhatsappWeb } from '../utils/fonnte';

interface SlipPreviewProps {
  slip: SalarySlip;
  teacher?: Teacher;
  settings?: SchoolSettings;
  onBack?: () => void;
  isPublic?: boolean;
}

export function SlipPreview({ slip, teacher, settings, onBack, isPublic }: SlipPreviewProps) {
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
      
      const canvas = await html2canvas(element, { 
        scale: 2,
        useCORS: true,
        allowTaint: false,
        backgroundColor: '#ffffff',
        logging: false,
        onclone: (clonedDoc) => {
          const clonedSlip = clonedDoc.getElementById('slip-document');
          if (clonedSlip) {
            clonedSlip.style.width = '800px';
            clonedSlip.style.minWidth = '800px';
            clonedSlip.style.maxWidth = '800px';
            clonedSlip.style.backgroundColor = '#ffffff';
            clonedSlip.style.fontFamily = 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif';
          }

          try {
            const styleSheets = Array.from(document.styleSheets);
            let aggregatedCss = '';
            for (const sheet of styleSheets) {
              try {
                if (sheet.cssRules) {
                  for (const rule of Array.from(sheet.cssRules)) {
                    aggregatedCss += rule.cssText + '\n';
                  }
                }
              } catch {
                // Ignore cross-origin stylesheet errors
              }
            }
            if (aggregatedCss) {
              const styleEl = clonedDoc.createElement('style');
              styleEl.textContent = aggregatedCss;
              clonedDoc.head.appendChild(styleEl);
            }
          } catch (e) {
            console.warn('Could not inline stylesheets in clonedDoc', e);
          }
        }
      });
      
      const imgData = canvas.toDataURL('image/jpeg', 0.98);
      
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      
      const margin = 10;
      const printableWidth = pageWidth - (margin * 2);
      const printableHeight = (canvas.height * printableWidth) / canvas.width;
      
      pdf.addImage(imgData, 'JPEG', margin, margin, printableWidth, printableHeight);
      const filename = `Slip_Gaji_${slip.teacherName.replace(/[^a-zA-Z0-9]/g, '_')}_${slip.month}_${slip.year}.pdf`;
      
      pdf.save(filename);
    } catch (err) {
      console.error('Error generating PDF:', err);
      // Fallback: If direct canvas generation fails, offer native print / save as PDF
      const usePrint = window.confirm(
        'Gagal mengunduh file PDF secara langsung. Apakah Anda ingin mencetak atau menyimpannya sebagai PDF melalui jendela Cetak peramban?'
      );
      if (usePrint) {
        window.print();
      }
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  const handleDownloadPng = async () => {
    const element = document.getElementById('slip-document');
    if (!element) return;

    try {
      setIsDownloadingPng(true);
      
      const canvas = await html2canvas(element, { 
        scale: 2,
        useCORS: true,
        allowTaint: false,
        backgroundColor: '#ffffff',
        logging: false,
        onclone: (clonedDoc) => {
          const clonedSlip = clonedDoc.getElementById('slip-document');
          if (clonedSlip) {
            clonedSlip.style.width = '800px';
            clonedSlip.style.minWidth = '800px';
            clonedSlip.style.maxWidth = '800px';
            clonedSlip.style.backgroundColor = '#ffffff';
            clonedSlip.style.fontFamily = 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif';
          }
        }
      });
      
      const dataUrl = canvas.toDataURL('image/png');
      const filename = `Slip_Gaji_${slip.teacherName.replace(/[^a-zA-Z0-9]/g, '_')}_${slip.month}_${slip.year}.png`;
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = filename;
      link.click();
    } catch (err) {
      console.error('Error generating image:', err);
      alert(`Gagal mengunduh gambar PNG. Silakan gunakan fitur "Cetak Slip" untuk menyimpan slip.`);
    } finally {
      setIsDownloadingPng(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Action Controls - Hidden during print */}
      <div className="mb-6 flex flex-wrap justify-between items-center gap-3 print:hidden">
        <div>
          {!isPublic && onBack && (
            <button 
              onClick={onBack}
              className="flex items-center gap-2 px-4 py-2 text-[#334155] bg-white border border-[#cbd5e1] rounded-lg hover:bg-[#f8fafc] transition-colors font-medium shadow-sm"
            >
              <ArrowLeft size={18} />
              <span>Kembali</span>
            </button>
          )}
        </div>
        
        <div className="flex flex-wrap items-center gap-2">
          {/* Kirim WhatsApp (Fonnte API) */}
          {!isPublic && (
            <button
              onClick={handleSendWhatsapp}
              disabled={isSendingWa}
              className="flex items-center gap-2 px-4 py-2 bg-[#059669] text-[#ffffff] hover:bg-[#047857] rounded-lg transition-colors shadow-sm font-medium text-sm disabled:opacity-50"
              title="Kirim Otomatis Slip via Fonnte WA Gateway"
            >
              {isSendingWa ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Mengirim Link WA...</span>
                </>
              ) : (
                <>
                  <Send size={16} />
                  <span>Kirim WA (Link Download)</span>
                </>
              )}
            </button>
          )}

          {/* Download PNG */}
          <button 
            onClick={handleDownloadPng}
            disabled={isDownloadingPng}
            className="flex items-center gap-2 px-3.5 py-2 bg-[#f1f5f9] text-[#334155] hover:bg-[#e2e8f0] border border-[#cbd5e1] rounded-lg transition-colors font-medium text-sm disabled:opacity-50"
            title="Download sebagai gambar PNG"
          >
            {isDownloadingPng ? <Loader2 size={16} className="animate-spin" /> : <ImageIcon size={16} className="text-[#2563eb]" />}
            <span>Download PNG</span>
          </button>

          {/* Download PDF */}
          <button 
            onClick={handleDownloadPdf}
            disabled={isDownloadingPdf}
            className="flex items-center gap-2 px-4 py-2 bg-[#059669] text-[#ffffff] hover:bg-[#047857] rounded-lg transition-colors shadow-sm font-medium text-sm disabled:opacity-50"
            title="Download file PDF Slip Gaji"
          >
            {isDownloadingPdf ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
            <span>Download PDF</span>
          </button>

          {/* Cetak */}
          <button 
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 bg-[#1e293b] text-[#ffffff] rounded-lg hover:bg-[#0f172a] transition-colors shadow-sm font-medium text-sm"
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
            ? 'bg-[#ecfdf5] text-[#064e3b] border-[#6ee7b7]'
            : 'bg-[#fffbeb] text-[#78350f] border-[#fcd34d]'
        }`}>
          <div className="flex items-start gap-2.5">
            {waStatus.type === 'success' ? (
              <CheckCircle2 size={18} className="text-[#047857] shrink-0 mt-0.5" />
            ) : (
              <AlertCircle size={18} className="text-[#b45309] shrink-0 mt-0.5" />
            )}
            <div>
              <p className="font-semibold">{waStatus.text}</p>
              {!token && waStatus.type === 'error' && (
                <p className="text-xs text-[#92400e] mt-1">
                  Tip: Buka menu <strong>Pengaturan</strong> dan isikan <strong>API Token Fonnte</strong> untuk mengaktifkan pengiriman PDF otomatis secara langsung tanpa membuka WhatsApp Web.
                </p>
              )}
            </div>
          </div>
          <button onClick={() => setWaStatus(null)} className="text-[#94a3b8] hover:text-[#475569] text-xs ml-4 font-bold">
            ✕
          </button>
        </div>
      )}

      {/* Scrollable Wrapper for Mobile Export */}
      <div className="w-full overflow-x-auto print:overflow-visible pb-4">
        <div className="min-w-fit flex justify-center">
          {/* Slip Document Box */}
          <div 
            id="slip-document" 
            className="bg-[#ffffff] p-6 sm:p-10 rounded-xl shadow-md border border-[#e2e8f0] text-[#0f172a] print:shadow-none print:border-none print:p-0 print:m-0 font-sans w-[800px]"
            style={{
              width: '800px',
              minWidth: '800px',
              maxWidth: '800px',
              backgroundColor: '#ffffff',
              color: '#0f172a',
              fontFamily: 'Arial, Helvetica, sans-serif',
              boxSizing: 'border-box',
              padding: '40px',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              margin: '0 auto'
            }}
          >
            <style>{`
              #slip-document {
                font-family: Arial, Helvetica, sans-serif !important;
                background-color: #ffffff !important;
                color: #0f172a !important;
                width: 800px !important;
                min-width: 800px !important;
                box-sizing: border-box !important;
              }
              #slip-document * {
                box-sizing: border-box !important;
              }
              .slip-header {
                display: flex !important;
                align-items: center !important;
                justify-content: space-between !important;
                border-bottom: 2px solid #059669 !important;
                padding-bottom: 16px !important;
                margin-bottom: 24px !important;
                gap: 16px !important;
              }
              .slip-logo-container {
                width: 96px !important;
                flex-shrink: 0 !important;
                display: flex !important;
                align-items: center !important;
                justify-content: center !important;
              }
              .slip-logo-img {
                max-width: 96px !important;
                max-height: 96px !important;
                object-fit: contain !important;
              }
              .slip-title-center {
                flex: 1 !important;
                text-align: center !important;
              }
              .slip-h1 {
                font-size: 26px !important;
                font-weight: 800 !important;
                letter-spacing: 2px !important;
                text-transform: uppercase !important;
                color: #0f172a !important;
                margin: 0 !important;
              }
              .slip-h2 {
                font-size: 20px !important;
                font-weight: 700 !important;
                text-transform: uppercase !important;
                color: #0f172a !important;
                margin: 4px 0 0 0 !important;
              }
              .slip-p-period {
                font-size: 12px !important;
                font-weight: 600 !important;
                text-transform: uppercase !important;
                color: #64748b !important;
                margin: 4px 0 0 0 !important;
              }
              .slip-meta-grid {
                display: grid !important;
                grid-template-columns: 1fr 1fr !important;
                column-gap: 32px !important;
                row-gap: 8px !important;
                font-size: 14px !important;
                font-weight: 600 !important;
                margin-bottom: 24px !important;
              }
              .slip-meta-row {
                display: flex !important;
                align-items: center !important;
                margin-bottom: 6px !important;
              }
              .slip-meta-key {
                width: 125px !important;
                color: #1e293b !important;
                font-weight: 700 !important;
                flex-shrink: 0 !important;
              }
              .slip-meta-colon {
                margin-right: 8px !important;
                flex-shrink: 0 !important;
              }
              .slip-meta-val {
                flex: 1 !important;
                border-bottom: 1px solid #1e293b !important;
                padding-bottom: 2px !important;
                color: #0f172a !important;
                font-weight: 600 !important;
              }
              .slip-table-bar {
                display: grid !important;
                grid-template-columns: 1fr 1fr !important;
                column-gap: 32px !important;
                border-top: 2px solid #059669 !important;
                border-bottom: 2px solid #059669 !important;
                padding: 6px 0 !important;
                font-weight: 700 !important;
                color: #047857 !important;
                font-size: 14px !important;
                letter-spacing: 0.5px !important;
              }
              .slip-columns-body {
                display: grid !important;
                grid-template-columns: 1fr 1fr !important;
                column-gap: 32px !important;
                font-size: 14px !important;
                padding-top: 12px !important;
              }
              .slip-item-row {
                display: flex !important;
                justify-content: space-between !important;
                align-items: center !important;
                margin-bottom: 10px !important;
              }
              .slip-item-name {
                color: #1e293b !important;
              }
              .slip-item-right {
                display: flex !important;
                align-items: center !important;
                gap: 4px !important;
                font-family: monospace, Courier, sans-serif !important;
                color: #0f172a !important;
              }
              .slip-item-underline {
                border-bottom: 1px solid #1e293b !important;
                min-width: 110px !important;
                text-align: right !important;
                padding-bottom: 2px !important;
                font-weight: 600 !important;
              }
              .slip-totals-grid {
                display: grid !important;
                grid-template-columns: 1fr 1fr !important;
                column-gap: 32px !important;
                border-top: 2px solid #059669 !important;
                border-bottom: 2px solid #059669 !important;
                padding: 8px 0 !important;
                margin-top: 24px !important;
                font-weight: 700 !important;
                color: #0f172a !important;
                font-size: 14px !important;
              }
              .slip-net-salary-box {
                display: flex !important;
                align-items: center !important;
                gap: 8px !important;
                margin-top: 24px !important;
                font-size: 16px !important;
                font-weight: 700 !important;
                color: #0f172a !important;
              }
              .slip-net-salary-val {
                border-bottom: 2px solid #0f172a !important;
                font-size: 18px !important;
                font-weight: 800 !important;
                padding: 0 8px 2px 8px !important;
                min-width: 160px !important;
                font-family: monospace, Courier, sans-serif !important;
              }
              .slip-signature-wrapper {
                margin-top: 36px !important;
                display: flex !important;
                justify-content: flex-end !important;
              }
              .slip-signature-box {
                text-align: center !important;
                width: 250px !important;
                min-width: 250px !important;
              }
              .slip-signature-canvas {
                position: relative !important;
                width: 250px !important;
                height: 100px !important;
                margin: 4px auto !important;
              }
              .slip-stamp-img {
                position: absolute !important;
                top: 5px !important;
                left: 10px !important;
                width: 90px !important;
                height: 90px !important;
                object-fit: contain !important;
                opacity: 0.8 !important;
                mix-blend-mode: multiply !important;
                pointer-events: none !important;
                z-index: 5 !important;
              }
              .slip-sign-img {
                position: absolute !important;
                top: 10px !important;
                z-index: 10 !important;
                width: 150px !important;
                height: 80px !important;
                object-fit: contain !important;
                pointer-events: none !important;
              }
              .slip-signature-line {
                width: 160px !important;
                border-bottom: 2px solid #cbd5e1 !important;
                position: absolute !important;
                bottom: 15px !important;
              }
              .slip-signer-name {
                font-weight: 700 !important;
                color: #0f172a !important;
                text-decoration: underline !important;
                text-underline-offset: 4px !important;
                margin-top: 6px !important;
              }
              .slip-notes-footer {
                margin-top: 24px !important;
                padding-top: 12px !important;
                border-top: 1px solid #e2e8f0 !important;
                font-size: 12px !important;
                color: #64748b !important;
                font-style: italic !important;
              }
            `}</style>
          
          {/* Title */}
        <div className="slip-header flex items-center justify-between gap-4 mb-6 border-b-2 border-[#059669] pb-4">
          <div className="slip-logo-container w-20 sm:w-24 shrink-0 flex items-center justify-center">
            {settings?.logoImage ? (
              <img 
                src={settings.logoImage} 
                crossOrigin="anonymous"
                alt="Logo" 
                className="slip-logo-img max-w-[80px] sm:max-w-[96px] h-auto object-contain" 
              />
            ) : (
              <div className="w-16 h-16 bg-[#f1f5f9] rounded-full flex items-center justify-center text-[#cbd5e1]">
                <ImageIcon size={24} />
              </div>
            )}
          </div>
          <div className="slip-title-center text-center flex-1">
            <h1 className="slip-h1 text-2xl sm:text-3xl tracking-wider uppercase text-[#0f172a] font-extrabold">SLIP GAJI</h1>
            <h2 className="slip-h2 text-xl sm:text-2xl uppercase text-[#0f172a] mt-0.5 font-bold">{slip.schoolName || 'MI AL-BAROKAH'}</h2>
            <p className="slip-p-period text-xs font-semibold text-[#64748b] uppercase mt-1">PERIODE: {slip.month} {slip.year}</p>
          </div>
          <div className="w-20 sm:w-24 shrink-0"></div> {/* Spacer for symmetry */}
        </div>

        {/* Header Metadata Info (2 Columns) */}
        <div className="slip-meta-grid grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2 text-sm font-semibold mb-6">
          <div className="space-y-2">
            <div className="slip-meta-row flex items-center">
              <span className="slip-meta-key w-24 text-[#1e293b] font-bold">Nama</span>
              <span className="slip-meta-colon mr-2">:</span>
              <span className="slip-meta-val flex-1 border-b border-[#1e293b] pb-0.5 text-[#0f172a] font-bold">{slip.teacherName}</span>
            </div>
            <div className="slip-meta-row flex items-center">
              <span className="slip-meta-key w-24 text-[#1e293b] font-bold">Jabatan</span>
              <span className="slip-meta-colon mr-2">:</span>
              <span className="slip-meta-val flex-1 border-b border-[#1e293b] pb-0.5 text-[#0f172a]">{slip.position || '-'}</span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="slip-meta-row flex items-center">
              <span className="slip-meta-key w-32 text-[#1e293b] font-bold">Tugas Tambahan</span>
              <span className="slip-meta-colon mr-2">:</span>
              <span className="slip-meta-val flex-1 border-b border-[#1e293b] pb-0.5 text-[#0f172a]">{slip.tugasTambahan || '-'}</span>
            </div>
            <div className="slip-meta-row flex items-center">
              <span className="slip-meta-key w-32 text-[#1e293b] font-bold">Masa Kerja</span>
              <span className="slip-meta-colon mr-2">:</span>
              <span className="slip-meta-val flex-1 border-b border-[#1e293b] pb-0.5 text-[#0f172a]">{slip.masaKerja || '-'}</span>
            </div>
          </div>
        </div>

        {/* Table Header Bar */}
        <div className="w-full text-sm mb-6">
          {/* Green Border Top and Bottom Header */}
          <div className="slip-table-bar grid grid-cols-2 border-t-2 border-b-2 border-[#059669] py-1.5 font-bold text-[#047857] text-sm tracking-wide">
            <div>PENERIMAAN (A)</div>
            <div>POTONGAN (B)</div>
          </div>

          {/* Grid Content Column (Penerimaan Left, Potongan Right) */}
          <div className="slip-columns-body grid grid-cols-1 md:grid-cols-2 gap-x-8 text-sm pt-3">
            
            {/* PENERIMAAN Column (Left) */}
            <div className="space-y-2.5">
              <div className="slip-item-row flex justify-between items-center">
                <span className="slip-item-name text-[#1e293b]">Gaji Pokok</span>
                <div className="slip-item-right flex items-center gap-1 font-mono text-[#0f172a]">
                  <span>Rp</span>
                  <span className="slip-item-underline border-b border-[#1e293b] min-w-[110px] text-right pb-0.5 font-semibold">
                    {formatRupiah(slip.baseSalary).replace('Rp', '').trim()}
                  </span>
                </div>
              </div>

              <div className="slip-item-row flex justify-between items-center">
                <span className="slip-item-name text-[#1e293b]">Beban Jam Mengajar (JTM)</span>
                <div className="slip-item-right flex items-center gap-1 font-mono text-[#0f172a]">
                  <span>Rp</span>
                  <span className="slip-item-underline border-b border-[#1e293b] min-w-[110px] text-right pb-0.5 font-semibold">
                    {formatRupiah(slip.bebanJTM).replace('Rp', '').trim()}
                  </span>
                </div>
              </div>

              <div className="slip-item-row flex justify-between items-center">
                <span className="slip-item-name text-[#1e293b]">Insentif Walas</span>
                <div className="slip-item-right flex items-center gap-1 font-mono text-[#0f172a]">
                  <span>Rp</span>
                  <span className="slip-item-underline border-b border-[#1e293b] min-w-[110px] text-right pb-0.5 font-semibold">
                    {formatRupiah(slip.insentifWalas).replace('Rp', '').trim()}
                  </span>
                </div>
              </div>

              <div className="slip-item-row flex justify-between items-center">
                <span className="slip-item-name text-[#1e293b]">Insentif Kinerja Tahunan</span>
                <div className="slip-item-right flex items-center gap-1 font-mono text-[#0f172a]">
                  <span>Rp</span>
                  <span className="slip-item-underline border-b border-[#1e293b] min-w-[110px] text-right pb-0.5 font-semibold">
                    {formatRupiah(slip.insentifKinerjaTahunan).replace('Rp', '').trim()}
                  </span>
                </div>
              </div>

              <div className="slip-item-row flex justify-between items-center">
                <span className="slip-item-name text-[#1e293b]">Insentif Kinerja Bulanan</span>
                <div className="slip-item-right flex items-center gap-1 font-mono text-[#0f172a]">
                  <span>Rp</span>
                  <span className="slip-item-underline border-b border-[#1e293b] min-w-[110px] text-right pb-0.5 font-semibold">
                    {formatRupiah(slip.insentifKinerjaBulanan).replace('Rp', '').trim()}
                  </span>
                </div>
              </div>

              {Boolean(slip.insentifTusasTambahan) && (
                <div className="slip-item-row flex justify-between items-center">
                  <span className="slip-item-name text-[#1e293b]">Insentif Tusas Tambahan</span>
                  <div className="slip-item-right flex items-center gap-1 font-mono text-[#0f172a]">
                    <span>Rp</span>
                    <span className="slip-item-underline border-b border-[#1e293b] min-w-[110px] text-right pb-0.5 font-semibold">
                      {formatRupiah(slip.insentifTusasTambahan || 0).replace('Rp', '').trim()}
                    </span>
                  </div>
                </div>
              )}

              {Boolean(slip.insentifEskul) && (
                <div className="slip-item-row flex justify-between items-center">
                  <span className="slip-item-name text-[#1e293b]">Insentif Kegiatan Eskul</span>
                  <div className="slip-item-right flex items-center gap-1 font-mono text-[#0f172a]">
                    <span>Rp</span>
                    <span className="slip-item-underline border-b border-[#1e293b] min-w-[110px] text-right pb-0.5 font-semibold">
                      {formatRupiah(slip.insentifEskul || 0).replace('Rp', '').trim()}
                    </span>
                  </div>
                </div>
              )}

              <div className="slip-item-row flex justify-between items-center">
                <span className="slip-item-name text-[#1e293b]">Masa Kerja</span>
                <div className="slip-item-right flex items-center gap-1 font-mono text-[#0f172a]">
                  <span>Rp</span>
                  <span className="slip-item-underline border-b border-[#1e293b] min-w-[110px] text-right pb-0.5 font-semibold">
                    {formatRupiah(slip.tunjanganMasaKerja).replace('Rp', '').trim()}
                  </span>
                </div>
              </div>

              <div className="slip-item-row flex justify-between items-center">
                <span className="slip-item-name text-[#1e293b]">Pendidikan</span>
                <div className="slip-item-right flex items-center gap-1 font-mono text-[#0f172a]">
                  <span>Rp</span>
                  <span className="slip-item-underline border-b border-[#1e293b] min-w-[110px] text-right pb-0.5 font-semibold">
                    {formatRupiah(slip.tunjanganPendidikan).replace('Rp', '').trim()}
                  </span>
                </div>
              </div>

              <div className="slip-item-row flex justify-between items-center">
                <span className="slip-item-name text-[#1e293b]">Iuran BPJS</span>
                <div className="slip-item-right flex items-center gap-1 font-mono text-[#0f172a]">
                  <span>Rp</span>
                  <span className="slip-item-underline border-b border-[#1e293b] min-w-[110px] text-right pb-0.5 font-semibold">
                    {formatRupiah(slip.tunjanganBPJS).replace('Rp', '').trim()}
                  </span>
                </div>
              </div>

              <div className="slip-item-row flex justify-between items-center">
                <span className="slip-item-name text-[#1e293b]">Iuran Qurban</span>
                <div className="slip-item-right flex items-center gap-1 font-mono text-[#0f172a]">
                  <span>Rp</span>
                  <span className="slip-item-underline border-b border-[#1e293b] min-w-[110px] text-right pb-0.5 font-semibold">
                    {formatRupiah(slip.tunjanganQurban).replace('Rp', '').trim()}
                  </span>
                </div>
              </div>
            </div>

            {/* POTONGAN Column (Right) */}
            <div className="space-y-2.5 mt-4 md:mt-0">
              <div className="slip-item-row flex justify-between items-center">
                <span className="slip-item-name text-[#1e293b]">Iuran BPJS Ketenagakerjaan</span>
                <div className="slip-item-right flex items-center gap-1 font-mono text-[#0f172a]">
                  <span>Rp</span>
                  <span className="slip-item-underline border-b border-[#1e293b] min-w-[110px] text-right pb-0.5 font-semibold">
                    {formatRupiah(slip.potonganBPJSKetenagakerjaan).replace('Rp', '').trim()}
                  </span>
                </div>
              </div>

              <div className="slip-item-row flex justify-between items-center">
                <span className="slip-item-name text-[#1e293b]">Iuran Qurban</span>
                <div className="slip-item-right flex items-center gap-1 font-mono text-[#0f172a]">
                  <span>Rp</span>
                  <span className="slip-item-underline border-b border-[#1e293b] min-w-[110px] text-right pb-0.5 font-semibold">
                    {formatRupiah(slip.potonganQurban).replace('Rp', '').trim()}
                  </span>
                </div>
              </div>
            </div>

          </div>

          {/* Green Line Border Totals Bar */}
          <div className="slip-totals-grid grid grid-cols-1 md:grid-cols-2 gap-x-8 border-t-2 border-b-2 border-[#059669] py-2 mt-6 font-bold text-[#0f172a]">
            <div className="slip-item-row flex justify-between items-center">
              <span>JUMLAH PENERIMAAN</span>
              <div className="slip-item-right flex items-center gap-1 font-mono">
                <span>Rp</span>
                <span className="slip-item-underline border-b border-[#1e293b] min-w-[110px] text-right font-extrabold">
                  {formatRupiah(slip.totalPenerimaan).replace('Rp', '').trim()}
                </span>
              </div>
            </div>

            <div className="slip-item-row flex justify-between items-center mt-2 md:mt-0">
              <span>JUMLAH POTONGAN</span>
              <div className="slip-item-right flex items-center gap-1 font-mono">
                <span>Rp</span>
                <span className="slip-item-underline border-b border-[#1e293b] min-w-[110px] text-right font-extrabold">
                  {formatRupiah(slip.totalPotongan).replace('Rp', '').trim()}
                </span>
              </div>
            </div>
          </div>

          {/* TOTAL YANG DITERIMA */}
          <div className="slip-net-salary-box flex flex-wrap items-center gap-2 mt-6 text-base font-bold text-[#0f172a]">
            <span>TOTAL YANG DITERIMA (A-B):</span>
            <div className="flex items-center gap-1 font-mono">
              <span>Rp</span>
              <span className="slip-net-salary-val border-b-2 border-[#0f172a] text-lg font-extrabold px-2 pb-0.5 min-w-[160px]">
                {formatRupiah(slip.netSalary).replace('Rp', '').trim()}
              </span>
            </div>
          </div>
        </div>

        {/* Signature Section */}
        <div 
          className="slip-signature-wrapper mt-12 flex justify-end"
          style={{ marginTop: '36px', display: 'flex', justifyContent: 'flex-end' }}
        >
          <div 
            className="slip-signature-box text-center min-w-[220px]"
            style={{ textAlign: 'center', width: '250px', minWidth: '250px' }}
          >
            <p 
              className="mb-1 text-[#475569] text-sm"
              style={{ marginBottom: '4px', color: '#475569', fontSize: '13px' }}
            >
              Sumedang, {new Date(slip.issueDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
            <p 
              className="font-bold text-[#1e293b] mb-2"
              style={{ fontWeight: 700, color: '#1e293b', marginBottom: '8px', fontSize: '14px' }}
            >
              Bendahara / Pembuat Slip
            </p>
            
            <div 
              className="slip-signature-canvas relative my-2"
              style={{ position: 'relative', width: '250px', height: '100px', margin: '4px auto' }}
            >
              {/* Stamp (on the left edge of signature) */}
              {settings?.stampImage && (
                <img 
                  src={settings.stampImage} 
                  crossOrigin="anonymous"
                  alt="Stempel" 
                  className="slip-stamp-img pointer-events-none"
                  style={{
                    position: 'absolute',
                    top: '5px',
                    left: '10px',
                    width: '90px',
                    height: '90px',
                    objectFit: 'contain',
                    opacity: 0.8,
                    mixBlendMode: 'multiply',
                    pointerEvents: 'none',
                    zIndex: 5
                  }}
                />
              )}
              {/* Signature */}
              {settings?.signatureImage && (
                <img 
                  src={settings.signatureImage} 
                  crossOrigin="anonymous"
                  alt="Tanda Tangan" 
                  className="slip-sign-img pointer-events-none"
                  style={{
                    position: 'absolute',
                    top: '10px',
                    left: settings?.stampImage ? '75px' : '50px',
                    width: '150px',
                    height: '80px',
                    objectFit: 'contain',
                    pointerEvents: 'none',
                    zIndex: 10
                  }}
                />
              )}
              {/* Placeholder line if no signature */}
              {!settings?.signatureImage && (
                <div 
                  className="slip-signature-line"
                  style={{
                    width: '160px',
                    borderBottom: '2px solid #cbd5e1',
                    position: 'absolute',
                    bottom: '15px',
                    left: settings?.stampImage ? '70px' : '45px'
                  }}
                ></div>
              )}
            </div>

            <p 
              className="slip-signer-name font-bold text-[#0f172a] underline underline-offset-4"
              style={{
                fontWeight: 700,
                color: '#0f172a',
                textDecoration: 'underline',
                textUnderlineOffset: '4px',
                marginTop: '6px',
                fontSize: '14px'
              }}
            >
              {slip.createdByName || 'Bendahara'}
            </p>
          </div>
        </div>

        {slip.notes && (
          <div className="slip-notes-footer mt-6 pt-3 border-t border-[#e2e8f0] text-xs text-[#64748b] italic">
            Catatan: {slip.notes}
          </div>
        )}

      </div>
        </div>
      </div>
    </div>
  );
}


