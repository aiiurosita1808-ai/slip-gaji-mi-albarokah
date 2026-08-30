import * as XLSX from 'xlsx';
import { Teacher, SalarySlip } from '../types';

export const EXCEL_TEMPLATE_HEADERS = [
  'NO',
  'NAMA GURU',
  'NO WA',
  'JABATAN',
  'TUGAS TAMBAHAN',
  'JTM',
  'Rp/JTM',
  'NOMINAL JTM',
  'GAJI POKOK',
  'INSENTIF WALAS',
  'INSENTIF KINERJA TH SBLMNYA',
  'INSENTIF BULANAN',
  'MASA KERJA',
  'PENDIDIKAN',
  'IURAN BPJS',
  'IURAN QURBAN',
  'INSENTIF TUSAS TAMBAHAN',
  'INSENTIF KEGIATAN ESKUL',
  'BPJS KETENAGAKERJAAN',
  'IURAN QURBAN POTONGAN'
];

export const downloadExcelTemplate = () => {
  const sampleData = [
    {
      'NO': 1,
      'NAMA GURU': 'Ahmad Fauzi, S.Pd.I',
      'NO WA': '081234567890',
      'JABATAN': 'Guru Kelas 4',
      'TUGAS TAMBAHAN': 'Wali Kelas 4A',
      'JTM': 24,
      'Rp/JTM': 10000,
      'NOMINAL JTM': 240000,
      'GAJI POKOK': 1500000,
      'INSENTIF WALAS': 150000,
      'INSENTIF KINERJA TH SBLMNYA': 200000,
      'INSENTIF BULANAN': 100000,
      'MASA KERJA': '5 Tahun',
      'PENDIDIKAN': 100000,
      'IURAN BPJS': 20000,
      'IURAN QURBAN': 50000,
      'INSENTIF TUSAS TAMBAHAN': 50000,
      'INSENTIF KEGIATAN ESKUL': 75000,
      'BPJS KETENAGAKERJAAN': 50000,
      'IURAN QURBAN POTONGAN': 50000,
    },
    {
      'NO': 2,
      'NAMA GURU': 'Siti Nurhaliza, S.Pd',
      'NO WA': '089876543210',
      'JABATAN': 'Guru Matematika',
      'TUGAS TAMBAHAN': 'Bendahara',
      'JTM': 20,
      'Rp/JTM': 10000,
      'NOMINAL JTM': 200000,
      'GAJI POKOK': 1400000,
      'INSENTIF WALAS': 0,
      'INSENTIF KINERJA TH SBLMNYA': 150000,
      'INSENTIF BULANAN': 100000,
      'MASA KERJA': '3 Tahun',
      'PENDIDIKAN': 100000,
      'IURAN BPJS': 20000,
      'IURAN QURBAN': 50000,
      'INSENTIF TUSAS TAMBAHAN': 100000,
      'INSENTIF KEGIATAN ESKUL': 50000,
      'BPJS KETENAGAKERJAAN': 50000,
      'IURAN QURBAN POTONGAN': 50000,
    }
  ];

  const worksheet = XLSX.utils.json_to_sheet(sampleData, { header: EXCEL_TEMPLATE_HEADERS });
  
  // Custom column widths
  worksheet['!cols'] = [
    { wch: 5 },  // NO
    { wch: 25 }, // NAMA GURU
    { wch: 16 }, // NO WA
    { wch: 18 }, // JABATAN
    { wch: 20 }, // TUGAS TAMBAHAN
    { wch: 8 },  // JTM
    { wch: 12 }, // Rp/JTM
    { wch: 15 }, // NOMINAL JTM
    { wch: 15 }, // GAJI POKOK
    { wch: 15 }, // INSENTIF WALAS
    { wch: 25 }, // INSENTIF KINERJA TH SBLMNYA
    { wch: 18 }, // INSENTIF BULANAN
    { wch: 14 }, // MASA KERJA
    { wch: 15 }, // PENDIDIKAN
    { wch: 14 }, // IURAN BPJS
    { wch: 15 }, // IURAN QURBAN
    { wch: 22 }, // INSENTIF TUSAS TAMBAHAN
    { wch: 22 }, // INSENTIF KEGIATAN ESKUL
    { wch: 22 }, // BPJS KETENAGAKERJAAN
    { wch: 22 }  // IURAN QURBAN POTONGAN
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Data Guru');
  
  XLSX.writeFile(workbook, 'Template_Data_Guru_MI_Al_Barokah.xlsx');
};

const parseNumber = (val: any): number => {
  if (val === undefined || val === null || val === '') return 0;
  if (typeof val === 'number') return val;
  const cleaned = String(val).replace(/[^0-9.-]+/g, '');
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
};

export const parseExcelFile = (file: File): Promise<Omit<Teacher, 'id'>[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        const jsonData: any[] = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

        const importedTeachers: Omit<Teacher, 'id'>[] = jsonData
          .filter(row => {
            const name = row['NAMA GURU'] || row['Nama Guru'] || row['NAMA'] || row['Nama'];
            return Boolean(name && String(name).trim() !== '');
          })
          .map((row) => {
            const name = String(row['NAMA GURU'] || row['Nama Guru'] || row['NAMA'] || row['Nama'] || '').trim();
            const rawPhone = row['NO WA'] || row['No WA'] || row['NO. WA'] || row['No. WA'] || row['NO HP'] || row['No HP'] || row['PHONE'] || row['Phone'] || row['WA'] || '';
            const phone = String(rawPhone).replace(/[^0-9]/g, '').trim();
            const position = String(row['JABATAN'] || row['Jabatan'] || 'Guru').trim();
            const tugasTambahan = String(row['TUGAS TAMBAHAN'] || row['Tugas Tambahan'] || '').trim();
            const masaKerja = String(row['MASA KERJA'] || row['Masa Kerja'] || '').trim();

            const jtmCount = parseNumber(row['JTM']);
            const rpJtm = parseNumber(row['Rp/JTM'] || row['RP/JTM'] || row['RP JTM']);
            let bebanJTM = parseNumber(row['NOMINAL JTM'] || row['Nominal JTM']);
            if (!bebanJTM && jtmCount > 0 && rpJtm > 0) {
              bebanJTM = jtmCount * rpJtm;
            }

            const baseSalary = parseNumber(row['GAJI POKOK'] || row['Gaji Pokok']);
            const insentifWalas = parseNumber(row['INSENTIF WALAS'] || row['Insentif Walas']);
            const insentifKinerjaTahunan = parseNumber(row['INSENTIF KINERJA TH SBLMNYA'] || row['Insentif Kinerja Tahunan']);
            const insentifKinerjaBulanan = parseNumber(row['INSENTIF BULANAN'] || row['Insentif Bulanan']);
            const insentifTusasTambahan = parseNumber(row['INSENTIF TUSAS TAMBAHAN'] || row['Insentif Tusas Tambahan']);
            const insentifEskul = parseNumber(row['INSENTIF KEGIATAN ESKUL'] || row['Insentif Kegiatan Eskul']);

            const tunjanganMasaKerja = parseNumber(row['TUNJANGAN MASA KERJA'] || row['Tunjangan Masa Kerja']);
            const tunjanganPendidikan = parseNumber(row['PENDIDIKAN'] || row['Pendidikan'] || row['TUNJANGAN PENDIDIKAN'] || row['Tunjangan Pendidikan']);
            const tunjanganBPJS = parseNumber(row['IURAN BPJS'] || row['Iuran BPJS'] || row['TUNJANGAN BPJS']);
            const tunjanganQurban = parseNumber(row['IURAN QURBAN'] || row['Iuran Qurban'] || row['IURAN QUBAN'] || row['TUNJANGAN QURBAN']);

            const potonganBPJSKetenagakerjaan = parseNumber(row['BPJS KETENAGAKERJAAN'] || row['BPJS Ketenagakerjaan']);
            const potonganQurban = parseNumber(row['IURAN QURBAN POTONGAN'] || row['Iuran Qurban Potongan'] || row['POTONGAN QURBAN'] || row['Potongan Qurban']);

            return {
              nip: String(row['NIP'] || row['Nip'] || '').trim(),
              name,
              phone,
              position,
              tugasTambahan,
              masaKerja,
              jtmCount,
              rpJtm,
              bebanJTM,
              baseSalary,
              insentifWalas,
              insentifKinerjaTahunan,
              insentifKinerjaBulanan,
              insentifTusasTambahan,
              insentifEskul,
              tunjanganMasaKerja,
              tunjanganPendidikan,
              tunjanganBPJS,
              tunjanganQurban,
              potonganBPJSKetenagakerjaan,
              potonganQurban
            };
          });

        resolve(importedTeachers);
      } catch (err) {
        reject(err);
      }
    };

    reader.onerror = (err) => reject(err);
    reader.readAsArrayBuffer(file);
  });
};

export const exportSlipsToExcel = (slips: SalarySlip[], month: string, year: number) => {
  const data = slips.map((slip, index) => ({
    'NO': index + 1,
    'NAMA GURU': slip.teacherName,
    'NO WA': slip.teacherPhone || '-',
    'JABATAN': slip.position || '-',
    'TUGAS TAMBAHAN': slip.tugasTambahan || '-',
    'MASA KERJA': slip.masaKerja || '-',
    'PERIODE': `${slip.month} ${slip.year}`,
    'GAJI POKOK': slip.baseSalary,
    'BEBAN JTM': slip.bebanJTM,
    'INSENTIF WALAS': slip.insentifWalas,
    'INSENTIF KINERJA TH SBLMNYA': slip.insentifKinerjaTahunan,
    'INSENTIF BULANAN': slip.insentifKinerjaBulanan,
    'INSENTIF TUSAS TAMBAHAN': slip.insentifTusasTambahan || 0,
    'INSENTIF KEGIATAN ESKUL': slip.insentifEskul || 0,
    'JUMLAH PENERIMAAN': slip.totalPenerimaan,
    'BPJS KETENAGAKERJAAN': slip.potonganBPJSKetenagakerjaan,
    'IURAN QURBAN': slip.potonganQurban,
    'JUMLAH POTONGAN': slip.totalPotongan,
    'GAJI BERSIH (NET)': slip.netSalary
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);

  const columnWidths = [
    { wch: 5 },  // NO
    { wch: 25 }, // NAMA GURU
    { wch: 16 }, // NO WA
    { wch: 15 }, // JABATAN
    { wch: 20 }, // TUGAS TAMBAHAN
    { wch: 14 }, // MASA KERJA
    { wch: 15 }, // PERIODE
    { wch: 15 }, // GAJI POKOK
    { wch: 15 }, // BEBAN JTM
    { wch: 15 }, // INSENTIF WALAS
    { wch: 25 }, // INSENTIF KINERJA TH SBLMNYA
    { wch: 18 }, // INSENTIF BULANAN
    { wch: 22 }, // INSENTIF TUSAS TAMBAHAN
    { wch: 22 }, // INSENTIF KEGIATAN ESKUL
    { wch: 20 }, // JUMLAH PENERIMAAN
    { wch: 22 }, // BPJS KETENAGAKERJAAN
    { wch: 15 }, // IURAN QURBAN
    { wch: 18 }, // JUMLAH POTONGAN
    { wch: 20 }  // GAJI BERSIH
  ];
  worksheet['!cols'] = columnWidths;

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, `Rekap Gaji ${month} ${year}`);
  XLSX.writeFile(workbook, `Rekap_Slip_Gaji_${month}_${year}.xlsx`);
};

