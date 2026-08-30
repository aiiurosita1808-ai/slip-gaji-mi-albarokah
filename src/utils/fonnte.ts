import { SalarySlip } from '../types';
import { formatRupiah } from '../utils';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

export function formatSalarySlipMessage(slip: SalarySlip): string {
  const penerimaanLines: string[] = [
    `• Gaji Pokok: ${formatRupiah(slip.baseSalary)}`,
    `• Beban JTM: ${formatRupiah(slip.bebanJTM)}`,
    `• Insentif Walas: ${formatRupiah(slip.insentifWalas)}`,
    `• Insentif Kinerja Tahunan: ${formatRupiah(slip.insentifKinerjaTahunan)}`,
    `• Insentif Kinerja Bulanan: ${formatRupiah(slip.insentifKinerjaBulanan)}`,
  ];

  if (slip.insentifTusasTambahan) {
    penerimaanLines.push(`• Insentif Tusas Tambahan: ${formatRupiah(slip.insentifTusasTambahan)}`);
  }
  if (slip.insentifEskul) {
    penerimaanLines.push(`• Insentif Eskul: ${formatRupiah(slip.insentifEskul)}`);
  }
  penerimaanLines.push(
    `• Masa Kerja: ${formatRupiah(slip.tunjanganMasaKerja)}`,
    `• Pendidikan: ${formatRupiah(slip.tunjanganPendidikan)}`,
    `• Iuran BPJS: ${formatRupiah(slip.tunjanganBPJS)}`,
    `• Iuran Qurban: ${formatRupiah(slip.tunjanganQurban)}`
  );

  const potonganLines: string[] = [
    `• BPJS Ketenagakerjaan: ${formatRupiah(slip.potonganBPJSKetenagakerjaan)}`,
    `• Iuran Qurban: ${formatRupiah(slip.potonganQurban)}`
  ];

  return `*SLIP GAJI GURU & STAFF*
*${slip.schoolName || 'MI AL-BAROKAH'}*
PERIODE: *${slip.month.toUpperCase()} ${slip.year}*

Yth. Bapak/Ibu *${slip.teacherName}*
Jabatan: ${slip.position || '-'}
Tugas Tambahan: ${slip.tugasTambahan || '-'}
Masa Kerja: ${slip.masaKerja || '-'}

*PENERIMAAN (A)*:
${penerimaanLines.join('\n')}
*Total Penerimaan (A): ${formatRupiah(slip.totalPenerimaan)}*

*POTONGAN (B)*:
${potonganLines.join('\n')}
*Total Potongan (B): ${formatRupiah(slip.totalPotongan)}*

==========================
*TOTAL DITERIMA (A-B): ${formatRupiah(slip.netSalary)}*
==========================

_Dokumen PDF Slip Gaji Resmi terlampir._
_Dibuat oleh: ${slip.createdByName || 'Bendahara'}_`;
}

export async function generatePdfBlobFromElement(elementId: string, filename: string): Promise<File | null> {
  const element = document.getElementById(elementId);
  if (!element) return null;

  try {
    const canvas = await html2canvas(element, { scale: 2, backgroundColor: '#ffffff', logging: false });
    const imgData = canvas.toDataURL('image/jpeg', 0.95);
    
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    
    pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
    const pdfArrayBuffer = pdf.output('arraybuffer');
    
    const pdfBlob = new Blob([pdfArrayBuffer], { type: 'application/pdf' });
    return new File([pdfBlob], filename, { type: 'application/pdf' });
  } catch (err) {
    console.error('Error generating PDF Blob:', err);
    return null;
  }
}

export interface SendFonnteResult {
  success: boolean;
  message: string;
}

export async function sendSlipViaFonnte(params: {
  slip: SalarySlip;
  phone: string;
  token: string;
  elementId?: string;
}): Promise<SendFonnteResult> {
  const { slip, phone, token, elementId } = params;

  if (!token || !token.trim()) {
    return {
      success: false,
      message: 'API Token Fonnte belum diisi. Silakan masukkan token Fonnte di menu Pengaturan.'
    };
  }

  const cleanPhone = phone.replace(/[^0-9]/g, '');
  if (!cleanPhone) {
    return {
      success: false,
      message: 'Nomor WhatsApp guru belum diisi atau format tidak valid.'
    };
  }

  const messageText = formatSalarySlipMessage(slip);
  const sanitizedTeacherName = slip.teacherName.replace(/[^a-zA-Z0-9]/g, '_');
  const filename = `Slip_Gaji_${sanitizedTeacherName}_${slip.month}_${slip.year}.pdf`;

  try {
    const formData = new FormData();
    formData.append('target', cleanPhone);
    formData.append('message', messageText);
    formData.append('countryCode', '62');
    formData.append('filename', filename);

    if (elementId) {
      const pdfFile = await generatePdfBlobFromElement(elementId, filename);
      if (pdfFile) {
        formData.append('file', pdfFile);
      }
    }

    const response = await fetch('https://api.fonnte.com/send', {
      method: 'POST',
      headers: {
        Authorization: token.trim(),
      },
      body: formData,
    });

    const data = await response.json();

    if (data.status === true || data.status === 'true' || response.ok) {
      return {
        success: true,
        message: `Slip gaji berhasil terkirim via Fonnte WA ke ${cleanPhone}!`
      };
    } else {
      return {
        success: false,
        message: data.reason || data.detail || data.message || 'Gagal mengirim pesan via Fonnte.'
      };
    }
  } catch (err: any) {
    console.error('Fonnte send error:', err);
    return {
      success: false,
      message: `Terjadi kesalahan koneksi ke Fonnte API: ${err.message || 'Error'}`
    };
  }
}

export function openDirectWhatsappWeb(slip: SalarySlip, phone?: string) {
  const cleanPhone = phone ? phone.replace(/[^0-9]/g, '') : '';
  const messageText = formatSalarySlipMessage(slip);
  const encodedMsg = encodeURIComponent(messageText);
  const url = cleanPhone 
    ? `https://wa.me/${cleanPhone}?text=${encodedMsg}`
    : `https://wa.me/?text=${encodedMsg}`;
  window.open(url, '_blank');
}
