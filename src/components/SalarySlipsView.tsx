import React, { useState, useMemo } from 'react';
import { Teacher, SalarySlip, SchoolSettings } from '../types';
import { formatRupiah, MONTHS } from '../utils';
import { Plus, Printer, Trash2, Filter, Download, Send } from 'lucide-react';
import { SlipPreview } from './SlipPreview';
import { exportSlipsToExcel } from '../utils/excelHelper';


interface SalarySlipsViewProps {
  teachers: Teacher[];
  slips: SalarySlip[];
  onAddSlip: (slip: Omit<SalarySlip, 'id'>) => void;
  onDeleteSlip: (id: string) => void;
  settings?: SchoolSettings;
}

export function SalarySlipsView({ teachers, slips, onAddSlip, onDeleteSlip, settings }: SalarySlipsViewProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSlip, setSelectedSlip] = useState<SalarySlip | null>(null);
  const [deletingSlip, setDeletingSlip] = useState<SalarySlip | null>(null);
  const [filterMonth, setFilterMonth] = useState<string>(MONTHS[new Date().getMonth()]);
  const [filterYear, setFilterYear] = useState<number>(new Date().getFullYear());

  // Form State
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>('');
  const [schoolName, setSchoolName] = useState<string>(settings?.schoolName || 'MI AL-BAROKAH');
  const [createdByName, setCreatedByName] = useState<string>(settings?.treasurerName || 'Bendahara');
  const [slipMonth, setSlipMonth] = useState<string>(MONTHS[new Date().getMonth()]);
  const [slipYear, setSlipYear] = useState<number>(new Date().getFullYear());
  const [notes, setNotes] = useState<string>('');

  // Editable Slip Items
  const [baseSalary, setBaseSalary] = useState<number>(0);
  const [bebanJTM, setBebanJTM] = useState<number>(0);
  const [insentifWalas, setInsentifWalas] = useState<number>(0);
  const [insentifKinerjaTahunan, setInsentifKinerjaTahunan] = useState<number>(0);
  const [insentifKinerjaBulanan, setInsentifKinerjaBulanan] = useState<number>(0);
  const [tunjanganMasaKerja, setTunjanganMasaKerja] = useState<number>(0);
  const [tunjanganPendidikan, setTunjanganPendidikan] = useState<number>(0);
  const [tunjanganBPJS, setTunjanganBPJS] = useState<number>(0);
  const [tunjanganQurban, setTunjanganQurban] = useState<number>(0);
  
  const [potonganBPJSKetenagakerjaan, setPotonganBPJSKetenagakerjaan] = useState<number>(0);
  const [potonganQurban, setPotonganQurban] = useState<number>(0);

  const selectedTeacher = useMemo(() => 
    teachers.find(t => t.id === selectedTeacherId), 
  [teachers, selectedTeacherId]);

  const totalPenerimaan = useMemo(() => {
    return baseSalary + bebanJTM + insentifWalas + insentifKinerjaTahunan + insentifKinerjaBulanan + tunjanganMasaKerja + tunjanganPendidikan + tunjanganBPJS + tunjanganQurban;
  }, [baseSalary, bebanJTM, insentifWalas, insentifKinerjaTahunan, insentifKinerjaBulanan, tunjanganMasaKerja, tunjanganPendidikan, tunjanganBPJS, tunjanganQurban]);

  const totalPotongan = useMemo(() => {
    return potonganBPJSKetenagakerjaan + potonganQurban;
  }, [potonganBPJSKetenagakerjaan, potonganQurban]);

  const netSalary = useMemo(() => {
    return totalPenerimaan - totalPotongan;
  }, [totalPenerimaan, totalPotongan]);

  const filteredSlips = slips.filter(s => s.month === filterMonth && s.year === filterYear).sort((a, b) => {
    const tA = teachers.find(t => t.id === a.teacherId)?.name || '';
    const tB = teachers.find(t => t.id === b.teacherId)?.name || '';
    return tA.localeCompare(tB);
  });

  const handleSelectTeacher = (id: string) => {
    setSelectedTeacherId(id);
    const t = teachers.find(item => item.id === id);
    if (t) {
      setBaseSalary(t.baseSalary || 0);
      setBebanJTM(t.bebanJTM || 0);
      setInsentifWalas(t.insentifWalas || 0);
      setInsentifKinerjaTahunan(t.insentifKinerjaTahunan || 0);
      setInsentifKinerjaBulanan(t.insentifKinerjaBulanan || 0);
      setTunjanganMasaKerja(t.tunjanganMasaKerja || 0);
      setTunjanganPendidikan(t.tunjanganPendidikan || 0);
      setTunjanganBPJS(t.tunjanganBPJS || 0);
      setTunjanganQurban(t.tunjanganQurban || 0);
      setPotonganBPJSKetenagakerjaan(t.potonganBPJSKetenagakerjaan || 0);
      setPotonganQurban(t.potonganQurban || 0);
    }
  };

  const handleOpenModal = () => {
    if (teachers.length > 0) {
      handleSelectTeacher(teachers[0].id);
    }
    setSchoolName(settings?.schoolName || 'MI AL-BAROKAH');
    setCreatedByName(settings?.treasurerName || 'Bendahara');
    setNotes('');
    setSlipMonth(filterMonth);
    setSlipYear(filterYear);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedTeacher) return;

    onAddSlip({
      teacherId: selectedTeacher.id,
      month: slipMonth,
      year: slipYear,
      schoolName: schoolName || 'MI AL-BAROKAH',
      teacherName: selectedTeacher.name,
      teacherPhone: selectedTeacher.phone || '',
      position: selectedTeacher.position,
      tugasTambahan: selectedTeacher.tugasTambahan || '',
      masaKerja: selectedTeacher.masaKerja || '',
      baseSalary,
      bebanJTM,
      insentifWalas,
      insentifKinerjaTahunan,
      insentifKinerjaBulanan,
      tunjanganMasaKerja,
      tunjanganPendidikan,
      tunjanganBPJS,
      tunjanganQurban,
      potonganBPJSKetenagakerjaan,
      potonganQurban,
      totalPenerimaan,
      totalPotongan,
      netSalary,
      issueDate: new Date().toISOString(),
      createdByName: createdByName || 'Bendahara',
      notes
    });
    
    handleCloseModal();
  };

  const getTeacherName = (id: string) => teachers.find(t => t.id === id)?.name || 'Unknown';
  const getTeacherNIP = (id: string) => teachers.find(t => t.id === id)?.nip || '-';

  return (
    <div className="space-y-6">
      {selectedSlip ? (
        <SlipPreview 
          slip={selectedSlip} 
          teacher={teachers.find(t => t.id === selectedSlip.teacherId)} 
          settings={settings}
          onBack={() => setSelectedSlip(null)} 
        />
      ) : (
        <>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-2xl font-bold text-slate-800">Slip Gaji</h2>
              <p className="text-slate-500 text-sm mt-1">Buat dan cetak slip gaji guru.</p>
            </div>
            
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-slate-200 shadow-sm">
                <Filter size={16} className="text-slate-400" />
                <select 
                  value={filterMonth}
                  onChange={(e) => setFilterMonth(e.target.value)}
                  className="bg-transparent text-sm font-medium text-slate-700 outline-none"
                >
                  {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
                <select 
                  value={filterYear}
                  onChange={(e) => setFilterYear(Number(e.target.value))}
                  className="bg-transparent text-sm font-medium text-slate-700 outline-none"
                >
                  {[...Array(5)].map((_, i) => {
                    const y = new Date().getFullYear() - i;
                    return <option key={y} value={y}>{y}</option>;
                  })}
                </select>
              </div>

              {filteredSlips.length > 0 && (
                <button
                  onClick={() => exportSlipsToExcel(filteredSlips, filterMonth, filterYear)}
                  className="flex items-center gap-1.5 px-3.5 py-2 text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors text-sm font-medium shadow-sm"
                  title="Download Rekap Slip Gaji ke Excel"
                >
                  <Download size={16} className="text-emerald-700" />
                  <span>Rekap Excel</span>
                </button>
              )}

              <button
                onClick={handleOpenModal}
                disabled={teachers.length === 0}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
              >
                <Plus size={18} />
                <span>Buat Slip Baru</span>
              </button>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-sm">
                    <th className="py-3 px-4 font-semibold">Nama Guru</th>
                    <th className="py-3 px-4 font-semibold">NIP/ID</th>
                    <th className="py-3 px-4 font-semibold">Bulan</th>
                    <th className="py-3 px-4 font-semibold text-right">Gaji Bersih</th>
                    <th className="py-3 px-4 font-semibold text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredSlips.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-12 text-center">
                        <div className="text-slate-400 mb-2 flex justify-center">
                          <Printer size={32} />
                        </div>
                        <p className="text-slate-500 font-medium">Belum ada slip gaji.</p>
                        <p className="text-slate-400 text-sm mt-1">Buat slip gaji untuk bulan {filterMonth} {filterYear}.</p>
                      </td>
                    </tr>
                  ) : (
                    filteredSlips.map((slip) => (
                      <tr key={slip.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3 px-4 font-medium text-slate-900">{getTeacherName(slip.teacherId)}</td>
                        <td className="py-3 px-4 text-slate-600 text-sm">{getTeacherNIP(slip.teacherId)}</td>
                        <td className="py-3 px-4 text-slate-600 text-sm">{slip.month} {slip.year}</td>
                        <td className="py-3 px-4 text-right font-bold text-emerald-700">
                          {formatRupiah(slip.netSalary)}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => setSelectedSlip(slip)}
                              className="px-3 py-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 rounded transition-colors flex items-center gap-1.5"
                              title="Kirim WA, Lihat & Download PDF Slip"
                            >
                              <Send size={14} /> Kirim WA / Cetak
                            </button>
                            <button
                              onClick={() => setDeletingSlip(slip)}
                              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                              title="Hapus"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Create Slip Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl overflow-hidden flex flex-col my-6 max-h-[90vh]">
            <div className="flex justify-between items-center p-5 border-b border-slate-200">
              <h3 className="text-xl font-bold text-slate-800">Buat Slip Gaji MI AL-BAROKAH</h3>
              <button
                onClick={handleCloseModal}
                className="text-slate-400 hover:text-slate-600 font-medium"
              >
                Tutup
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="flex flex-col overflow-y-auto">
              <div className="p-6 space-y-6">
                
                {/* Header Info */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700">Nama Madrasah</label>
                    <input
                      type="text"
                      value={schoolName}
                      onChange={(e) => setSchoolName(e.target.value)}
                      className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white text-sm"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700">Pilih Guru *</label>
                    <select
                      required
                      value={selectedTeacherId}
                      onChange={(e) => handleSelectTeacher(e.target.value)}
                      className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white text-sm"
                    >
                      {teachers.map(t => (
                        <option key={t.id} value={t.id}>{t.name} ({t.position})</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex gap-2">
                    <div className="space-y-1 flex-1">
                      <label className="text-xs font-semibold text-slate-700">Bulan</label>
                      <select
                        value={slipMonth}
                        onChange={(e) => setSlipMonth(e.target.value)}
                        className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white text-sm"
                      >
                        {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
                      </select>
                    </div>
                    <div className="space-y-1 w-20">
                      <label className="text-xs font-semibold text-slate-700">Tahun</label>
                      <input
                        type="number"
                        value={slipYear}
                        onChange={(e) => setSlipYear(Number(e.target.value))}
                        className="w-full px-2 py-1.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white text-sm"
                      />
                    </div>
                  </div>
                </div>

                {selectedTeacher && (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      
                      {/* Section PENERIMAAN (A) */}
                      <div className="space-y-3 bg-emerald-50/50 p-4 rounded-xl border border-emerald-100">
                        <h4 className="font-bold text-emerald-800 border-b border-emerald-200 pb-2 text-sm flex justify-between">
                          <span>PENERIMAAN (A)</span>
                          <span className="font-mono">{formatRupiah(totalPenerimaan)}</span>
                        </h4>
                        
                        <div className="space-y-2 text-xs">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-slate-700">Gaji Pokok</span>
                            <input
                              type="number"
                              value={baseSalary}
                              onChange={(e) => setBaseSalary(Number(e.target.value))}
                              className="w-32 px-2 py-1 border border-slate-300 rounded text-right bg-white focus:outline-emerald-500"
                            />
                          </div>
                          
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-slate-700">Beban Jam Mengajar (JTM)</span>
                            <input
                              type="number"
                              value={bebanJTM}
                              onChange={(e) => setBebanJTM(Number(e.target.value))}
                              className="w-32 px-2 py-1 border border-slate-300 rounded text-right bg-white focus:outline-emerald-500"
                            />
                          </div>

                          <div className="flex items-center justify-between gap-2">
                            <span className="text-slate-700">Insentif Walas</span>
                            <input
                              type="number"
                              value={insentifWalas}
                              onChange={(e) => setInsentifWalas(Number(e.target.value))}
                              className="w-32 px-2 py-1 border border-slate-300 rounded text-right bg-white focus:outline-emerald-500"
                            />
                          </div>

                          <div className="flex items-center justify-between gap-2">
                            <span className="text-slate-700">Insentif Kinerja Tahunan</span>
                            <input
                              type="number"
                              value={insentifKinerjaTahunan}
                              onChange={(e) => setInsentifKinerjaTahunan(Number(e.target.value))}
                              className="w-32 px-2 py-1 border border-slate-300 rounded text-right bg-white focus:outline-emerald-500"
                            />
                          </div>

                          <div className="flex items-center justify-between gap-2">
                            <span className="text-slate-700">Insentif Kinerja Bulanan</span>
                            <input
                              type="number"
                              value={insentifKinerjaBulanan}
                              onChange={(e) => setInsentifKinerjaBulanan(Number(e.target.value))}
                              className="w-32 px-2 py-1 border border-slate-300 rounded text-right bg-white focus:outline-emerald-500"
                            />
                          </div>

                          <div className="flex items-center justify-between gap-2">
                            <span className="text-slate-700">Masa Kerja</span>
                            <input
                              type="number"
                              value={tunjanganMasaKerja}
                              onChange={(e) => setTunjanganMasaKerja(Number(e.target.value))}
                              className="w-32 px-2 py-1 border border-slate-300 rounded text-right bg-white focus:outline-emerald-500"
                            />
                          </div>

                          <div className="flex items-center justify-between gap-2">
                            <span className="text-slate-700">Pendidikan</span>
                            <input
                              type="number"
                              value={tunjanganPendidikan}
                              onChange={(e) => setTunjanganPendidikan(Number(e.target.value))}
                              className="w-32 px-2 py-1 border border-slate-300 rounded text-right bg-white focus:outline-emerald-500"
                            />
                          </div>

                          <div className="flex items-center justify-between gap-2">
                            <span className="text-slate-700">Iuran BPJS</span>
                            <input
                              type="number"
                              value={tunjanganBPJS}
                              onChange={(e) => setTunjanganBPJS(Number(e.target.value))}
                              className="w-32 px-2 py-1 border border-slate-300 rounded text-right bg-white focus:outline-emerald-500"
                            />
                          </div>

                          <div className="flex items-center justify-between gap-2">
                            <span className="text-slate-700">Iuran Qurban</span>
                            <input
                              type="number"
                              value={tunjanganQurban}
                              onChange={(e) => setTunjanganQurban(Number(e.target.value))}
                              className="w-32 px-2 py-1 border border-slate-300 rounded text-right bg-white focus:outline-emerald-500"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Section POTONGAN (B) */}
                      <div className="space-y-3 bg-red-50/50 p-4 rounded-xl border border-red-100 flex flex-col">
                        <h4 className="font-bold text-red-800 border-b border-red-200 pb-2 text-sm flex justify-between">
                          <span>POTONGAN (B)</span>
                          <span className="font-mono">{formatRupiah(totalPotongan)}</span>
                        </h4>
                        
                        <div className="space-y-2 text-xs">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-slate-700">Iuran BPJS Ketenagakerjaan</span>
                            <input
                              type="number"
                              value={potonganBPJSKetenagakerjaan}
                              onChange={(e) => setPotonganBPJSKetenagakerjaan(Number(e.target.value))}
                              className="w-32 px-2 py-1 border border-slate-300 rounded text-right bg-white focus:outline-red-500"
                            />
                          </div>

                          <div className="flex items-center justify-between gap-2">
                            <span className="text-slate-700">Iuran Qurban</span>
                            <input
                              type="number"
                              value={potonganQurban}
                              onChange={(e) => setPotonganQurban(Number(e.target.value))}
                              className="w-32 px-2 py-1 border border-slate-300 rounded text-right bg-white focus:outline-red-500"
                            />
                          </div>
                        </div>

                        <div className="pt-4 border-t border-red-100 space-y-3 mt-auto">
                          <div className="space-y-1">
                            <label className="text-xs font-semibold text-slate-700">Penandatangan (Dibuat Oleh)</label>
                            <input
                              type="text"
                              value={createdByName}
                              onChange={(e) => setCreatedByName(e.target.value)}
                              className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs bg-white focus:outline-emerald-500"
                              placeholder="misal: Bendahara / Kepala TU"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-xs font-semibold text-slate-700">Catatan Tambahan</label>
                            <textarea
                              value={notes}
                              onChange={(e) => setNotes(e.target.value)}
                              rows={2}
                              className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs bg-white focus:outline-emerald-500"
                              placeholder="Catatan opsional..."
                            />
                          </div>
                        </div>
                      </div>

                    </div>

                    <div className="p-4 bg-slate-900 rounded-xl text-white flex justify-between items-center shadow-md">
                      <div>
                        <span className="text-xs uppercase tracking-wider text-slate-400 block font-semibold">TOTAL YANG DITERIMA (A-B)</span>
                        <span className="text-sm text-slate-300">{selectedTeacher.name}</span>
                      </div>
                      <span className="text-2xl font-mono font-bold text-emerald-400">
                        {formatRupiah(netSalary)}
                      </span>
                    </div>
                  </>
                )}
              </div>

              <div className="p-5 border-t border-slate-200 bg-slate-50 flex justify-end gap-3 rounded-b-xl mt-auto">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors text-sm font-medium"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={!selectedTeacher}
                  className="px-6 py-2 text-white bg-emerald-700 rounded-lg hover:bg-emerald-800 transition-colors shadow-sm text-sm font-bold disabled:opacity-50"
                >
                  Simpan & Buat Slip Gaji
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Modal Confirm Delete Slip */}
      {deletingSlip && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden p-6 space-y-4">
            <div className="flex items-center gap-3 text-red-600">
              <div className="p-3 bg-red-100 rounded-full">
                <Trash2 size={24} />
              </div>
              <h3 className="text-lg font-bold text-slate-800">Hapus Slip Gaji</h3>
            </div>
            <p className="text-sm text-slate-600">
              Apakah Anda yakin ingin menghapus slip gaji <strong className="text-slate-800">{getTeacherName(deletingSlip.teacherId)}</strong> periode <strong className="text-slate-800">{deletingSlip.month} {deletingSlip.year}</strong>?
            </p>
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeletingSlip(null)}
                className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  onDeleteSlip(deletingSlip.id);
                  setDeletingSlip(null);
                }}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 shadow-sm transition-colors"
              >
                Hapus Slip
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
