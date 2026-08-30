import { useState, useEffect } from 'react';
import { Teacher, SalarySlip, SchoolSettings } from './types';
import { db, collection, doc, onSnapshot, setDoc, updateDoc, deleteDoc, writeBatch } from './lib/firebase';

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

  const [loading, setLoading] = useState<boolean>(true);

  // Real-time Firestore Sync for Teachers
  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'teachers'), (snapshot) => {
      if (!snapshot.empty) {
        const loaded: Teacher[] = [];
        snapshot.forEach((docSnap) => {
          loaded.push({ id: docSnap.id, ...docSnap.data() } as Teacher);
        });
        setTeachers(loaded);
        localStorage.setItem('mi_teachers', JSON.stringify(loaded));
      } else {
        // Seed initial teachers if empty
        INITIAL_TEACHERS.forEach(t => {
          setDoc(doc(db, 'teachers', t.id), t).catch(err => console.warn('Seed teacher error:', err));
        });
      }
      setLoading(false);
    }, (err) => {
      console.warn('Firestore teachers listener notice:', err.message);
      setLoading(false);
    });

    return () => unsub();
  }, []);

  // Real-time Firestore Sync for Slips
  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'salary_slips'), (snapshot) => {
      const loaded: SalarySlip[] = [];
      snapshot.forEach((docSnap) => {
        loaded.push({ id: docSnap.id, ...docSnap.data() } as SalarySlip);
      });
      setSlips(loaded);
      localStorage.setItem('mi_slips', JSON.stringify(loaded));
    }, (err) => {
      console.warn('Firestore slips listener notice:', err.message);
    });

    return () => unsub();
  }, []);

  // Real-time Firestore Sync for School Settings
  useEffect(() => {
    const settingsDocRef = doc(db, 'school_settings', 'config');
    const unsub = onSnapshot(settingsDocRef, (docSnap) => {
      if (docSnap.exists()) {
        const loaded = docSnap.data() as SchoolSettings;
        setSettings(loaded);
        localStorage.setItem('mi_settings', JSON.stringify(loaded));
      } else {
        // Seed default settings if empty
        setDoc(settingsDocRef, DEFAULT_SETTINGS).catch(err => console.warn('Seed settings error:', err));
      }
    }, (err) => {
      console.warn('Firestore settings listener notice:', err.message);
    });

    return () => unsub();
  }, []);

  const updateSettings = async (newSettings: Partial<SchoolSettings>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    localStorage.setItem('mi_settings', JSON.stringify(updated));
    try {
      await setDoc(doc(db, 'school_settings', 'config'), updated, { merge: true });
    } catch (err) {
      console.warn('Updating settings in Firestore:', err);
    }
  };

  const addTeacher = async (teacher: Omit<Teacher, 'id'>) => {
    const newId = crypto.randomUUID();
    const newTeacher: Teacher = { ...teacher, id: newId };
    setTeachers(prev => {
      const updated = [...prev, newTeacher];
      localStorage.setItem('mi_teachers', JSON.stringify(updated));
      return updated;
    });
    try {
      await setDoc(doc(db, 'teachers', newId), newTeacher);
    } catch (err) {
      console.warn('Adding teacher to Firestore:', err);
    }
  };

  const updateTeacher = async (id: string, updates: Partial<Teacher>) => {
    setTeachers(prev => {
      const updated = prev.map(t => t.id === id ? { ...t, ...updates } : t);
      localStorage.setItem('mi_teachers', JSON.stringify(updated));
      return updated;
    });
    try {
      await updateDoc(doc(db, 'teachers', id), updates);
    } catch (err) {
      console.warn('Updating teacher in Firestore:', err);
    }
  };

  const deleteTeacher = async (id: string) => {
    setTeachers(prev => {
      const updated = prev.filter(t => t.id !== id);
      localStorage.setItem('mi_teachers', JSON.stringify(updated));
      return updated;
    });
    try {
      await deleteDoc(doc(db, 'teachers', id));
    } catch (err) {
      console.warn('Deleting teacher from Firestore:', err);
    }
  };

  const clearAllTeachers = async () => {
    const oldTeachers = [...teachers];
    setTeachers([]);
    localStorage.removeItem('mi_teachers');
    try {
      const batch = writeBatch(db);
      oldTeachers.forEach(t => {
        batch.delete(doc(db, 'teachers', t.id));
      });
      await batch.commit();
    } catch (err) {
      console.warn('Clearing teachers in Firestore:', err);
    }
  };

  const addSlip = async (slip: Omit<SalarySlip, 'id'>) => {
    const newId = crypto.randomUUID();
    const newSlip: SalarySlip = { ...slip, id: newId };
    setSlips(prev => {
      const updated = [...prev, newSlip];
      localStorage.setItem('mi_slips', JSON.stringify(updated));
      return updated;
    });
    try {
      await setDoc(doc(db, 'salary_slips', newId), newSlip);
    } catch (err) {
      console.warn('Adding slip to Firestore:', err);
    }
  };

  const deleteSlip = async (id: string) => {
    setSlips(prev => {
      const updated = prev.filter(s => s.id !== id);
      localStorage.setItem('mi_slips', JSON.stringify(updated));
      return updated;
    });
    try {
      await deleteDoc(doc(db, 'salary_slips', id));
    } catch (err) {
      console.warn('Deleting slip from Firestore:', err);
    }
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
    loading,
  };
}
