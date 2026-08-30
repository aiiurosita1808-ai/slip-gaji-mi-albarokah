export interface Teacher {
  id: string;
  nip: string;
  name: string;
  phone?: string;
  position: string;
  tugasTambahan: string;
  masaKerja: string;
  
  // Perhitungan JTM
  jtmCount?: number;
  rpJtm?: number;
  bebanJTM: number; // NOMINAL JTM (JTM * Rp/JTM)

  // Penerimaan
  baseSalary: number;
  insentifWalas: number;
  insentifKinerjaTahunan: number;
  insentifKinerjaBulanan: number;
  insentifTusasTambahan?: number;
  insentifEskul?: number;
  tunjanganMasaKerja: number;
  tunjanganPendidikan: number;
  tunjanganBPJS: number;
  tunjanganQurban: number;

  // Potongan
  potonganBPJSKetenagakerjaan: number;
  potonganQurban: number;
}

export interface SalarySlip {
  id: string;
  teacherId: string;
  month: string;
  year: number;
  schoolName: string;
  
  // Teacher snapshot info for print accuracy
  teacherName: string;
  teacherPhone?: string;
  position: string;
  tugasTambahan: string;
  masaKerja: string;

  // JTM Info
  jtmCount?: number;
  rpJtm?: number;
  bebanJTM: number;

  // Penerimaan (A)
  baseSalary: number;
  insentifWalas: number;
  insentifKinerjaTahunan: number;
  insentifKinerjaBulanan: number;
  insentifTusasTambahan?: number;
  insentifEskul?: number;
  tunjanganMasaKerja: number;
  tunjanganPendidikan: number;
  tunjanganBPJS: number;
  tunjanganQurban: number;
  
  // Potongan (B)
  potonganBPJSKetenagakerjaan: number;
  potonganQurban: number;

  totalPenerimaan: number;
  totalPotongan: number;
  netSalary: number;
  
  issueDate: string;
  createdByName: string;
  notes?: string;
}

export interface SchoolSettings {
  schoolName: string;
  subTitle: string;
  address: string;
  phone: string;
  email: string;
  headmasterName: string;
  treasurerName: string;
  defaultRpJtm: number;
  fonnteToken?: string;
  logoImage?: string; // base64
  signatureImage?: string; // base64
  stampImage?: string; // base64
}

export type ViewState = 'dashboard' | 'teachers' | 'slips' | 'settings';

