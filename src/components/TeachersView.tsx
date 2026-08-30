import React, { useState, useRef } from 'react';
import { Teacher } from '../types';
import { formatRupiah } from '../utils';
import { Plus, Edit2, Trash2, X, FileSpreadsheet, Upload, Download } from 'lucide-react';
import { downloadExcelTemplate, parseExcelFile } from '../utils/excelHelper';

interface TeachersViewProps {
  teachers: Teacher[];
  onAddTeacher: (teacher: Omit<Teacher, 'id'>) => void;
  onUpdateTeacher: (id: string, updates: Partial<Teacher>) => void;
  onDeleteTeacher: (id: string) => void;
  onClearAllTeachers?: () => void;
}

export function TeachersView({ teachers, onAddTeacher, onUpdateTeacher, onDeleteTeacher, onClearAllTeachers }: TeachersViewProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
  const [deletingTeacher, setDeletingTeacher] = useState<Teacher | null>(null);
  const [showClearAllConfirm, setShowClearAllConfirm] = useState(false);
  const [uploadMessage, setUploadMessage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleOpenModal = (teacher?: Teacher) => {
    if (teacher) {
      setEditingTeacher(teacher);
    } else {
      setEditingTeacher(null);
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingTeacher(null);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      setUploadMessage(null);
      const importedData = await parseExcelFile(file);
      
      if (importedData.length === 0) {
        alert('File Excel tidak berisi data guru yang valid.');
        return;
      }

      let addedCount = 0;
      importedData.forEach((teacherData) => {
        onAddTeacher(teacherData);
        addedCount++;
      });

      setUploadMessage(`Berhasil mengimpor ${addedCount} data guru dari file Excel!`);
      setTimeout(() => setUploadMessage(null), 5000);
    } catch (error) {
      console.error('Error importing file:', error);
      alert('Gagal membaca file Excel. Pastikan format file sesuai dengan template.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const jtmCount = Number(formData.get('jtmCount')) || 0;
    const rpJtm = Number(formData.get('rpJtm')) || 0;
    let bebanJTM = Number(formData.get('bebanJTM')) || 0;
    if (jtmCount > 0 && rpJtm > 0) {
      bebanJTM = jtmCount * rpJtm;
    }

    const teacherData: Omit<Teacher, 'id'> = {
      nip: formData.get('nip') as string,
      name: formData.get('name') as string,
      phone: formData.get('phone') as string,
      position: formData.get('position') as string,
      tugasTambahan: formData.get('tugasTambahan') as string,
      masaKerja: formData.get('masaKerja') as string,
      jtmCount,
      rpJtm,
      bebanJTM,
      baseSalary: Number(formData.get('baseSalary')) || 0,
      insentifWalas: Number(formData.get('insentifWalas')) || 0,
      insentifKinerjaTahunan: Number(formData.get('insentifKinerjaTahunan')) || 0,
      insentifKinerjaBulanan: Number(formData.get('insentifKinerjaBulanan')) || 0,
      insentifTusasTambahan: Number(formData.get('insentifTusasTambahan')) || 0,
      insentifEskul: Number(formData.get('insentifEskul')) || 0,
      tunjanganMasaKerja: Number(formData.get('tunjanganMasaKerja')) || 0,
      tunjanganPendidikan: Number(formData.get('tunjanganPendidikan')) || 0,
      tunjanganBPJS: Number(formData.get('tunjanganBPJS')) || 0,
      tunjanganQurban: Number(formData.get('tunjanganQurban')) || 0,
      potonganBPJSKetenagakerjaan: Number(formData.get('potonganBPJSKetenagakerjaan')) || 0,
      potonganQurban: Number(formData.get('potonganQurban')) || 0,
    };

    if (editingTeacher) {
      onUpdateTeacher(editingTeacher.id, teacherData);
    } else {
      onAddTeacher(teacherData);
    }
    handleCloseModal();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Data Guru & Staff</h2>
          <p className="text-slate-500 text-sm mt-1">Kelola data guru dan rincian komponen gaji pokok madrasah.</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-2">
          {/* Template Download */}
          <button
            onClick={downloadExcelTemplate}
            className="flex items-center gap-2 px-3.5 py-2 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-lg transition-colors text-sm font-medium border border-slate-300"
            title="Download Template Format Excel"
          >
            <Download size={16} className="text-emerald-700" />
            <span>Template Excel</span>
          </button>

          {/* Upload Excel */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx, .xls, .csv"
            onChange={handleFileUpload}
            className="hidden"
            id="excel-upload-input"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="flex items-center gap-2 px-3.5 py-2 bg-emerald-50 text-emerald-800 border border-emerald-300 hover:bg-emerald-100 rounded-lg transition-colors text-sm font-medium disabled:opacity-50"
          >
            <Upload size={16} className="text-emerald-700" />
            <span>{isUploading ? 'Memproses...' : 'Upload Excel Masal'}</span>
          </button>

          {/* Tambah Manual */}
          <button
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors shadow-sm text-sm font-medium"
          >
            <Plus size={18} />
            <span>Tambah Data Guru</span>
          </button>

          {/* Hapus Semua Data Guru */}
          {teachers.length > 0 && onClearAllTeachers && (
            <button
              onClick={() => setShowClearAllConfirm(true)}
              className="flex items-center gap-1.5 px-3 py-2 text-red-700 bg-red-50 border border-red-200 hover:bg-red-100 rounded-lg transition-colors text-sm font-medium"
              title="Hapus Seluruh Data Guru"
            >
              <Trash2 size={16} />
              <span>Hapus Semua ({teachers.length})</span>
            </button>
          )}
        </div>
      </div>

      {uploadMessage && (
        <div className="p-4 bg-emerald-100 text-emerald-900 border border-emerald-300 rounded-xl text-sm font-medium flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileSpreadsheet size={18} className="text-emerald-700" />
            <span>{uploadMessage}</span>
          </div>
          <button onClick={() => setUploadMessage(null)} className="text-emerald-700 hover:text-emerald-900">
            <X size={16} />
          </button>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs md:text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600">
                <th className="py-3 px-4 font-semibold">No / NIP</th>
                <th className="py-3 px-4 font-semibold">Nama Guru</th>
                <th className="py-3 px-4 font-semibold">Jabatan & Tugas</th>
                <th className="py-3 px-4 font-semibold text-center">JTM</th>
                <th className="py-3 px-4 font-semibold text-right">Gaji Pokok</th>
                <th className="py-3 px-4 font-semibold text-right">Nominal JTM</th>
                <th className="py-3 px-4 font-semibold text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {teachers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500">
                    Belum ada data guru. Silakan tambah data atau upload file Excel.
                  </td>
                </tr>
              ) : (
                teachers.map((teacher, idx) => (
                  <tr key={teacher.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 text-slate-500">
                      <div className="font-semibold text-slate-700">#{idx + 1}</div>
                      <div className="text-xs text-slate-400">{teacher.nip || '-'}</div>
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-900">
                      <div>{teacher.name}</div>
                      {teacher.phone && (
                        <div className="text-xs text-emerald-700 font-mono flex items-center gap-1 mt-0.5">
                          <span>📱 {teacher.phone}</span>
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      <div className="font-medium text-emerald-800">{teacher.position}</div>
                      {teacher.tugasTambahan && (
                        <div className="text-xs text-slate-500">{teacher.tugasTambahan}</div>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center text-slate-700 font-medium">
                      {teacher.jtmCount ? `${teacher.jtmCount} Jam` : '-'}
                    </td>
                    <td className="py-3 px-4 text-right font-medium text-slate-700">
                      {formatRupiah(teacher.baseSalary)}
                    </td>
                    <td className="py-3 px-4 text-right font-medium text-emerald-700">
                      {formatRupiah(teacher.bebanJTM)}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleOpenModal(teacher)}
                          className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors" title="Edit Data Guru"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => setDeletingTeacher(teacher)}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors" title="Hapus Guru"
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

      {/* Modal Tambah/Edit Data Guru */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center p-5 border-b border-slate-200">
              <h3 className="text-xl font-bold text-slate-800">
                {editingTeacher ? 'Edit Data Guru' : 'Tambah Data Guru Baru'}
              </h3>
              <button
                onClick={handleCloseModal}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-md hover:bg-slate-100 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-y-auto max-h-[75vh]">
              <div className="p-5 space-y-6">
                
                {/* Informasi Identitas */}
                <div className="space-y-4">
                  <h4 className="font-bold text-slate-800 border-b border-slate-200 pb-2">1. Identitas Guru & Tugas</h4>
                  
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-700">NIP / No. Pegawai</label>
                      <input
                        name="nip"
                        defaultValue={editingTeacher?.nip}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                        placeholder="Opsional"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-700">Nama Lengkap *</label>
                      <input
                        name="name"
                        required
                        defaultValue={editingTeacher?.name}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                        placeholder="Budi Santoso, S.Pd"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-700">No. WhatsApp / HP</label>
                      <input
                        name="phone"
                        defaultValue={editingTeacher?.phone}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm font-mono"
                        placeholder="081234567890"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-700">Jabatan *</label>
                      <input
                        name="position"
                        required
                        defaultValue={editingTeacher?.position}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                        placeholder="Guru Kelas / Mapel"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-700">Tugas Tambahan</label>
                      <input
                        name="tugasTambahan"
                        defaultValue={editingTeacher?.tugasTambahan}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                        placeholder="Walas / Bendahara"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-700">Masa Kerja</label>
                      <input
                        name="masaKerja"
                        defaultValue={editingTeacher?.masaKerja}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                        placeholder="misal: 5 Tahun"
                      />
                    </div>
                  </div>
                </div>

                {/* Perhitungan JTM */}
                <div className="space-y-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <h4 className="font-bold text-slate-800 border-b border-slate-300 pb-2">2. Beban Jam Mengajar (JTM)</h4>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-slate-700">Jumlah JTM (Jam)</label>
                      <input
                        name="jtmCount"
                        type="number"
                        min="0"
                        defaultValue={editingTeacher?.jtmCount || 0}
                        className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm bg-white"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-slate-700">Tarif Rp / JTM</label>
                      <input
                        name="rpJtm"
                        type="number"
                        min="0"
                        defaultValue={editingTeacher?.rpJtm || 0}
                        className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm bg-white"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-slate-700">Nominal JTM Total (Rp)</label>
                      <input
                        name="bebanJTM"
                        type="number"
                        min="0"
                        defaultValue={editingTeacher?.bebanJTM || 0}
                        className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm bg-white"
                        placeholder="Otomatis JTM x Rp/JTM"
                      />
                    </div>
                  </div>
                </div>

                {/* Standard Penerimaan (A) */}
                <div className="space-y-4">
                  <h4 className="font-bold text-emerald-800 border-b border-emerald-200 pb-2">3. Komponen Penerimaan (A) - Rp</h4>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-slate-700">Gaji Pokok</label>
                      <input
                        name="baseSalary"
                        type="number"
                        min="0"
                        defaultValue={editingTeacher?.baseSalary || 0}
                        className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-medium text-slate-700">Insentif Walas</label>
                      <input
                        name="insentifWalas"
                        type="number"
                        min="0"
                        defaultValue={editingTeacher?.insentifWalas || 0}
                        className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-medium text-slate-700">Insentif Kinerja Tahunan</label>
                      <input
                        name="insentifKinerjaTahunan"
                        type="number"
                        min="0"
                        defaultValue={editingTeacher?.insentifKinerjaTahunan || 0}
                        className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-medium text-slate-700">Insentif Kinerja Bulanan</label>
                      <input
                        name="insentifKinerjaBulanan"
                        type="number"
                        min="0"
                        defaultValue={editingTeacher?.insentifKinerjaBulanan || 0}
                        className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-medium text-slate-700">Masa Kerja (Tunjangan)</label>
                      <input
                        name="tunjanganMasaKerja"
                        type="number"
                        min="0"
                        defaultValue={editingTeacher?.tunjanganMasaKerja || 0}
                        className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-medium text-slate-700">Pendidikan (Tunjangan)</label>
                      <input
                        name="tunjanganPendidikan"
                        type="number"
                        min="0"
                        defaultValue={editingTeacher?.tunjanganPendidikan || 0}
                        className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-medium text-slate-700">Iuran BPJS (Penerimaan)</label>
                      <input
                        name="tunjanganBPJS"
                        type="number"
                        min="0"
                        defaultValue={editingTeacher?.tunjanganBPJS || 0}
                        className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-medium text-slate-700">Iuran Qurban (Penerimaan)</label>
                      <input
                        name="tunjanganQurban"
                        type="number"
                        min="0"
                        defaultValue={editingTeacher?.tunjanganQurban || 0}
                        className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-medium text-slate-700">Insentif Tusas Tambahan</label>
                      <input
                        name="insentifTusasTambahan"
                        type="number"
                        min="0"
                        defaultValue={editingTeacher?.insentifTusasTambahan || 0}
                        className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-medium text-slate-700">Insentif Kegiatan Eskul</label>
                      <input
                        name="insentifEskul"
                        type="number"
                        min="0"
                        defaultValue={editingTeacher?.insentifEskul || 0}
                        className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                      />
                    </div>
                  </div>
                </div>

                {/* Standard Potongan (B) */}
                <div className="space-y-4">
                  <h4 className="font-bold text-red-800 border-b border-red-200 pb-2">4. Komponen Potongan (B) - Rp</h4>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-slate-700">Iuran BPJS Ketenagakerjaan</label>
                      <input
                        name="potonganBPJSKetenagakerjaan"
                        type="number"
                        min="0"
                        defaultValue={editingTeacher?.potonganBPJSKetenagakerjaan || 0}
                        className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-medium text-slate-700">Iuran Qurban</label>
                      <input
                        name="potonganQurban"
                        type="number"
                        min="0"
                        defaultValue={editingTeacher?.potonganQurban || 0}
                        className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
                      />
                    </div>
                  </div>
                </div>

              </div>

              <div className="p-5 border-t border-slate-200 bg-slate-50 flex justify-end gap-3 mt-auto">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors text-sm font-medium"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors shadow-sm text-sm font-medium"
                >
                  Simpan Data Guru
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Modal Confirm Delete Single Teacher */}
      {deletingTeacher && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden p-6 space-y-4">
            <div className="flex items-center gap-3 text-red-600">
              <div className="p-3 bg-red-100 rounded-full">
                <Trash2 size={24} />
              </div>
              <h3 className="text-lg font-bold text-slate-800">Hapus Data Guru</h3>
            </div>
            <p className="text-sm text-slate-600">
              Apakah Anda yakin ingin menghapus data guru <strong className="text-slate-800">{deletingTeacher.name}</strong>? Data yang dihapus tidak dapat dikembalikan.
            </p>
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeletingTeacher(null)}
                className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  onDeleteTeacher(deletingTeacher.id);
                  setDeletingTeacher(null);
                }}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 shadow-sm transition-colors"
              >
                Hapus Data
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Modal Confirm Delete All Teachers */}
      {showClearAllConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden p-6 space-y-4">
            <div className="flex items-center gap-3 text-red-600">
              <div className="p-3 bg-red-100 rounded-full">
                <Trash2 size={24} />
              </div>
              <h3 className="text-lg font-bold text-slate-800">Hapus Semua Data Guru</h3>
            </div>
            <p className="text-sm text-slate-600">
              Apakah Anda yakin ingin menghapus <strong>seluruh ({teachers.length}) data guru</strong>? Tindakan ini akan mengosongkan seluruh daftar guru dan tidak dapat dikembalikan.
            </p>
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowClearAllConfirm(false)}
                className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  if (onClearAllTeachers) onClearAllTeachers();
                  setShowClearAllConfirm(false);
                }}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 shadow-sm transition-colors"
              >
                Ya, Hapus Semua
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

