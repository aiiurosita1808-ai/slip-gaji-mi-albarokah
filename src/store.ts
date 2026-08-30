import { useState, useEffect } from 'react';
import { Teacher, SalarySlip, SchoolSettings } from './types';

const DEFAULT_SETTINGS: SchoolSettings = {
  schoolName: 'MI AL-BAROKAH',
  subTitle: 'Madrasah Ibtidaiyah Al-Barokah',
  address: 'Jl. Pendidikan Islam No. 45, Kecamatan Cibiru, Kota Bandung',
  phone: '0812-3456-7890',
  email: 'mialbarokah@example.sch.id',
  headmasterName: 'Hj. Siti Aminah, S.Ag',
  treasurerName: 'Ahmad Fauzi, S.Pd.I',
  defaultRpJtm: 10000,
  fonnteToken: '',
};

const INITIAL_TEACHERS: Teacher[] = [
  {
    id: '1',
    nip: '198001012005011001',
    name: 'Ahmad Fauzi, S.Pd.I',
    position: 'Guru Kelas 4',
    tugasTambahan: 'Wali Kelas 4A',
    masaKerja: '5 Tahun',
    baseSalary: 1500000,
    bebanJTM: 240000,
    insentifWalas: 150000,
    insentifKinerjaTahunan: 200000,
    insentifKinerjaBulanan: 100000,
    tunjanganMasaKerja: 100000,
    tunjanganPendidikan: 150000,
    tunjanganBPJS: 50000,
    tunjanganQurban: 50000,
    potonganBPJSKetenagakerjaan: 50000,
    potonganQurban: 50000,
  },
  {
    id: '2',
    nip: '198505152010012003',
    name: 'Siti Aminah, S.Ag',
    position: 'Kepala Madrasah',
    tugasTambahan: 'Penanggung Jawab Academik',
    masaKerja: '10 Tahun',
    baseSalary: 2500000,
    bebanJTM: 300000,
    insentifWalas: 0,
    insentifKinerjaTahunan: 500000,
    insentifKinerjaBulanan: 250000,
    tunjanganMasaKerja: 300000,
    tunjanganPendidikan: 250000,
    tunjanganBPJS: 75000,
    tunjanganQurban: 50000,
    potonganBPJSKetenagakerjaan: 75000,
    potonganQurban: 50000,
  }
];

export function useAppStore() {
  const [teachers, setTeachers] = useState<Teacher[]>(() => {
    const saved = localStorage.getItem('mi_teachers');
    return saved ? JSON.parse(saved) : INITIAL_TEACHERS;
  });

  const [slips, setSlips] = useState<SalarySlip[]>(() => {
    const saved = localStorage.getItem('mi_slips');
    return saved ? JSON.parse(saved) : [];
  });

  const [settings, setSettings] = useState<SchoolSettings>(() => {
    const saved = localStorage.getItem('mi_settings');
    return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
  });

  useEffect(() => {
    localStorage.setItem('mi_teachers', JSON.stringify(teachers));
  }, [teachers]);

  useEffect(() => {
    localStorage.setItem('mi_slips', JSON.stringify(slips));
  }, [slips]);

  useEffect(() => {
    localStorage.setItem('mi_settings', JSON.stringify(settings));
  }, [settings]);

  const updateSettings = (newSettings: Partial<SchoolSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  const addTeacher = (teacher: Omit<Teacher, 'id'>) => {
    const newTeacher = { ...teacher, id: crypto.randomUUID() };
    setTeachers(prev => [...prev, newTeacher]);
  };

  const updateTeacher = (id: string, updates: Partial<Teacher>) => {
    setTeachers(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
  };

  const deleteTeacher = (id: string) => {
    setTeachers(prev => prev.filter(t => t.id !== id));
  };

  const clearAllTeachers = () => {
    setTeachers([]);
  };

  const addSlip = (slip: Omit<SalarySlip, 'id'>) => {
    const newSlip = { ...slip, id: crypto.randomUUID() };
    setSlips(prev => [...prev, newSlip]);
  };

  const deleteSlip = (id: string) => {
    setSlips(prev => prev.filter(s => s.id !== id));
  };

  return {
    teachers,
    addTeacher,
    updateTeacher,
    deleteTeacher,
    clearAllTeachers,
    slips,
    addSlip,
    deleteSlip,
    settings,
    updateSettings,
  };
}
