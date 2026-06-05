import React, { useState, useEffect, useContext } from "react";
import { AppContext } from "../context/AppContext";

function Karyawan() {
  const { karyawanData = [], addKaryawan, updateKaryawan, deleteKaryawan } = useContext(AppContext);
  
  const [data, setData] = useState([]);
  const [showTambah, setShowTambah] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [detailData, setDetailData] = useState(null);
  const [editData, setEditData] = useState(null);
  const [preview, setPreview] = useState(null);
  const [search, setSearch] = useState("");

  // Initialize data on mount
  useEffect(() => {
    const savedData = Array.isArray(karyawanData) && karyawanData.length > 0 
      ? karyawanData 
      : [];
    
    setData(savedData);
  }, [karyawanData]);

  const toBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });

  const formatTanggalDisplay = (dateStr) => {
    if (!dateStr) return "-";
    const bulan = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agt", "Sep", "Okt", "Nov", "Des"];
    const d = new Date(dateStr);
    if (isNaN(d)) return dateStr;
    return `${String(d.getDate()).padStart(2, "0")} ${bulan[d.getMonth()]} ${d.getFullYear()}`;
  };

  const getNextId = () => {
    if (!Array.isArray(data) || data.length === 0) return "001";
    const numIds = data.map(k => parseInt(k.id)).filter(n => !isNaN(n));
    return String(Math.max(...numIds) + 1).padStart(3, "0");
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const base64 = await toBase64(file);
      setPreview(base64);
    }
  };

  const handleTambah = async (e) => {
    e.preventDefault();
    const form = e.target;
    const fotoFile = form.foto.files[0];
    let fotoBase64 = null;
    if (fotoFile) fotoBase64 = await toBase64(fotoFile);

    const newKaryawan = {
      id: getNextId(),
      nama: form.nama.value,
      posisi: form.posisi.value,
      nohp: form.nohp.value,
      email: form.email.value,
      alamat: form.alamat.value,
      tempatLahir: form.tempatLahir.value,
      tanggalLahir: form.tanggalLahir.value,
      tglMasuk: form.tglMasuk.value,
      tglKontrak: form.tglKontrak.value,
      lamaKontrak: form.lamaKontrak.value,
      foto: fotoBase64,
      gajiPokok: Number(form.gajiPokok.value) || 0,
      transportasi: Number(form.transportasi.value) || 0,
      bpjs: Number(form.bpjs.value) || 0,
    };

    const updatedData = [...data, newKaryawan];
    setData(updatedData);
    addKaryawan(newKaryawan);
    try {
      localStorage.setItem("karyawanData", JSON.stringify(updatedData));
    } catch (error) {
      console.warn('LocalStorage quota exceeded while saving karyawanData after add, skipping persistence.', error);
    }
    form.reset();
    setPreview(null);
    setShowTambah(false);
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    const form = e.target;
    const fotoFile = form.foto.files[0];
    let fotoBase64 = editData.foto;
    if (fotoFile) fotoBase64 = await toBase64(fotoFile);

    const updated = {
      ...editData,
      nama: form.nama.value,
      posisi: form.posisi.value,
      nohp: form.nohp.value,
      email: form.email.value,
      alamat: form.alamat.value,
      tempatLahir: form.tempatLahir.value,
      tanggalLahir: form.tanggalLahir.value,
      tglMasuk: form.tglMasuk.value,
      tglKontrak: form.tglKontrak.value,
      lamaKontrak: form.lamaKontrak.value,
      foto: fotoBase64,
      gajiPokok: Number(form.gajiPokok.value) || 0,
      transportasi: Number(form.transportasi.value) || 0,
      bpjs: Number(form.bpjs.value) || 0,
    };

    const updatedData = data.map(k => k.id === updated.id ? updated : k);
    setData(updatedData);
    updateKaryawan(updated.id, updated);
    try {
      localStorage.setItem("karyawanData", JSON.stringify(updatedData));
    } catch (error) {
      console.warn('LocalStorage quota exceeded while saving karyawanData after edit, skipping persistence.', error);
    }
    setShowEdit(false);
  };

  const handleHapus = (id) => {
    if (window.confirm("Yakin ingin menghapus karyawan ini?")) {
      const updatedData = data.filter(k => String(k.id) !== String(id));
      setData(updatedData);
      deleteKaryawan(id);
      try {
        localStorage.setItem("karyawanData", JSON.stringify(updatedData));
      } catch (error) {
        console.warn('LocalStorage quota exceeded while saving karyawanData after delete, skipping persistence.', error);
      }
    }
  };

  const filteredData = Array.isArray(data) ? data.filter(k =>
    k.nama.toLowerCase().includes(search.toLowerCase()) ||
    k.posisi.toLowerCase().includes(search.toLowerCase()) ||
    k.email.toLowerCase().includes(search.toLowerCase())
  ) : [];

  return (
    <div className="space-y-8 pb-8 p-8 bg-gray-50 min-h-screen">
      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .card-hover { transition: all 0.3s ease; }
        .card-hover:hover { transform: translateY(-4px); box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1); }
        .animate-slide-up { animation: slideUp 0.6s ease-out forwards; }
        .animate-slide-down { animation: slideDown 0.6s ease-out forwards; }
      `}</style>

      {/* Header */}
      <div className="flex items-center justify-between animate-slide-down">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-1">Data Karyawan</h1>
          <p className="text-gray-600 text-sm">Kelola data dan informasi karyawan perusahaan</p>
        </div>
        <button
          onClick={() => setShowTambah(true)}
          className="px-6 py-3 bg-gray-900 text-white font-bold rounded-lg hover:bg-gray-800 transition-all flex items-center gap-2"
        >
          <span>+</span> Tambah Karyawan
        </button>
      </div>

      {/* Search Bar */}
      <div className="animate-slide-up">
        <input
          type="text"
          placeholder="Cari nama, posisi, atau email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 transition-all bg-white"
        />
      </div>

      {/* Table */}
      <div className="bg-white shadow-sm border border-gray-200 rounded-lg overflow-hidden card-hover animate-slide-up">
        <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between bg-gray-50">
          <h2 className="text-lg font-bold text-gray-900">Data Karyawan ({filteredData.length})</h2>
          <span className="text-sm text-gray-500">{filteredData.length} dari {Array.isArray(data) ? data.length : 0} karyawan</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wide">No</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wide">ID</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wide">Nama</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wide">Posisi</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wide">Email</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wide">Tgl Masuk</th>
                <th className="px-6 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wide">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((k, idx) => (
                <tr key={k.id} className="border-b border-gray-100 hover:bg-gray-50 transition-all">
                  <td className="px-6 py-4 text-gray-800 font-semibold">{idx + 1}</td>
                  <td className="px-6 py-4 text-gray-700 font-semibold">{k.id}</td>
                  <td className="px-6 py-4 text-gray-900 font-semibold">{k.nama}</td>
                  <td className="px-6 py-4 text-gray-700">{k.posisi}</td>
                  <td className="px-6 py-4 text-gray-600 text-sm">{k.email || "-"}</td>
                  <td className="px-6 py-4 text-gray-600 text-sm">{formatTanggalDisplay(k.tglMasuk)}</td>
                  <td className="px-6 py-4 text-center flex items-center justify-center gap-2">
                    <button
                      onClick={() => {
                        setDetailData(k);
                        setShowDetail(true);
                      }}
                      className="text-blue-600 font-semibold hover:text-blue-700 transition-colors text-sm"
                    >
                      Detail
                    </button>
                    <button
                      onClick={() => {
                        setEditData(k);
                        setShowEdit(true);
                      }}
                      className="text-gray-600 font-semibold hover:text-gray-700 transition-colors text-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleHapus(k.id)}
                      className="text-red-600 font-semibold hover:text-red-700 transition-colors text-sm"
                    >
                      Hapus
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredData.length === 0 && (
            <div className="text-center py-16">
              <p className="text-lg text-gray-500">Tidak ada data karyawan</p>
              <p className="text-gray-400 text-sm mt-1">Tambahkan data baru untuk memulai</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal Tambah */}
      {showTambah && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-3xl p-8 animate-slide-up max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6 sticky top-0 bg-white">
              <h2 className="text-2xl font-bold text-gray-900">Tambah Karyawan Baru</h2>
              <button onClick={() => setShowTambah(false)} className="text-2xl text-gray-500 hover:text-gray-700">✕</button>
            </div>
            <form onSubmit={handleTambah} className="grid grid-cols-2 gap-6">
              {[
                ["Nama", "nama"],
                ["Posisi", "posisi"],
                ["Gaji Pokok", "gajiPokok", "number"],
                ["Transportasi", "transportasi", "number"],
                ["BPJS/TK", "bpjs", "number"],
                ["Nomor HP", "nohp"],
                ["Email", "email", "email"],
                ["Tempat Lahir", "tempatLahir"],
                ["Tanggal Lahir", "tanggalLahir", "date"],
                ["Lama Kontrak", "lamaKontrak"],
                ["Tanggal Masuk", "tglMasuk", "date"],
                ["Tanggal Kontrak", "tglKontrak", "date"],
              ].map(([label, name, type = "text"]) => (
                <div key={name}>
                  <label className="block text-sm font-bold text-gray-700 mb-2">{label}</label>
                  <input
                    name={name}
                    type={type}
                    className="w-full border border-gray-200 px-4 py-2.5 rounded-lg focus:border-gray-900 focus:ring-2 focus:ring-gray-900 focus:ring-opacity-10 outline-none transition-all"
                    required={["nama", "posisi", "nohp", "email", "tglMasuk"].includes(name)}
                  />
                </div>
              ))}
              <div className="col-span-2">
                <label className="block text-sm font-bold text-gray-700 mb-2">Alamat</label>
                <textarea name="alamat" className="w-full border border-gray-200 px-4 py-2.5 rounded-lg focus:border-gray-900 focus:ring-2 focus:ring-gray-900 focus:ring-opacity-10 outline-none transition-all" rows="3" />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-bold text-gray-700 mb-2">Upload Foto</label>
                <input name="foto" type="file" accept="image/*" onChange={handleFileChange} className="w-full border border-gray-200 px-4 py-2.5 rounded-lg" />
                {preview && <img src={preview} alt="preview" className="w-24 h-24 rounded-full mt-3 object-cover border-2 border-gray-200" />}
              </div>
              <div className="col-span-2 flex justify-end gap-3 mt-4 sticky bottom-0 bg-white pt-4">
                <button type="button" onClick={() => setShowTambah(false)} className="px-6 py-2.5 border border-gray-200 rounded-lg text-gray-700 font-semibold hover:bg-gray-50 transition-all">Batal</button>
                <button type="submit" className="px-6 py-2.5 bg-gray-900 text-white rounded-lg font-semibold hover:bg-gray-800 transition-all">Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Detail */}
      {showDetail && detailData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl p-8 animate-slide-up max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6 sticky top-0 bg-white">
              <h2 className="text-2xl font-bold text-gray-900">Detail Karyawan</h2>
              <button onClick={() => setShowDetail(false)} className="text-2xl text-gray-500 hover:text-gray-700">✕</button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {detailData.foto && (
                <div className="col-span-2 flex justify-center">
                  <img src={detailData.foto} alt="Foto" className="w-40 h-40 rounded-full object-cover border-4 border-gray-200 shadow-sm" />
                </div>
              )}
              {Object.entries({
                "Nama": detailData.nama,
                "Posisi": detailData.posisi,
                "Gaji Pokok": `Rp ${Number(detailData.gajiPokok || 0).toLocaleString("id-ID")}`,
                "Transportasi": `Rp ${Number(detailData.transportasi || 0).toLocaleString("id-ID")}`,
                "BPJS/TK": `Rp ${Number(detailData.bpjs || 0).toLocaleString("id-ID")}`,
                "Nomor HP": detailData.nohp,
                "Email": detailData.email,
                "Alamat": detailData.alamat,
                "Tempat Lahir": detailData.tempatLahir,
                "Tanggal Lahir": formatTanggalDisplay(detailData.tanggalLahir),
                "Tanggal Masuk": formatTanggalDisplay(detailData.tglMasuk),
                "Tanggal Kontrak": formatTanggalDisplay(detailData.tglKontrak),
                "Lama Kontrak": detailData.lamaKontrak,
              }).map(([label, value]) => (
                <div key={label} className={label === "Alamat" ? "col-span-2" : ""}>
                  <label className="block text-sm font-bold text-gray-700 mb-1">{label}</label>
                  <p className="border border-gray-200 px-4 py-2.5 rounded-lg bg-gray-50 text-gray-800">{value || "-"}</p>
                </div>
              ))}
            </div>
            <div className="flex justify-end gap-3 mt-8 sticky bottom-0 bg-white pt-4">
              <button onClick={() => { setEditData(detailData); setShowDetail(false); setShowEdit(true); }} className="px-6 py-2.5 border border-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-all">Edit</button>
              <button onClick={() => setShowDetail(false)} className="px-6 py-2.5 bg-gray-900 text-white font-semibold rounded-lg hover:bg-gray-800 transition-all">Tutup</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Edit */}
      {showEdit && editData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-3xl p-8 animate-slide-up max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6 sticky top-0 bg-white">
              <h2 className="text-2xl font-bold text-gray-900">Edit Karyawan</h2>
              <button onClick={() => setShowEdit(false)} className="text-2xl text-gray-500 hover:text-gray-700">✕</button>
            </div>
            <form onSubmit={handleEdit} className="grid grid-cols-2 gap-6">
              {[
                ["Nama", "nama"],
                ["Posisi", "posisi"],
                ["Transportasi", "transportasi", "number"],
                ["BPJS/TK", "bpjs", "number"],
                ["Nomor HP", "nohp"],
                ["Email", "email", "email"],
                ["Tempat Lahir", "tempatLahir"],
                ["Tanggal Lahir", "tanggalLahir", "date"],
                ["Tanggal Masuk", "tglMasuk", "date"],
                ["Tanggal Kontrak", "tglKontrak", "date"],
                ["Lama Kontrak", "lamaKontrak"],
                ["Gaji Pokok", "gajiPokok", "number"],
                
              ].map(([label, name, type = "text"]) => (
                <div key={name}>
                  <label className="block text-sm font-bold text-gray-700 mb-2">{label}</label>
                  <input
                    name={name}
                    defaultValue={editData[name]}
                    type={type}
                    className="w-full border border-gray-200 px-4 py-2.5 rounded-lg focus:border-gray-900 focus:ring-2 focus:ring-gray-900 focus:ring-opacity-10 outline-none transition-all"
                  />
                </div>
              ))}
              <div className="col-span-2">
                <label className="block text-sm font-bold text-gray-700 mb-2">Alamat</label>
                <textarea name="alamat" defaultValue={editData.alamat} className="w-full border border-gray-200 px-4 py-2.5 rounded-lg focus:border-gray-900 focus:ring-2 focus:ring-gray-900 focus:ring-opacity-10 outline-none transition-all" rows="3" />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-bold text-gray-700 mb-2">Upload Foto Baru</label>
                <input name="foto" type="file" accept="image/*" onChange={handleFileChange} className="w-full border border-gray-200 px-4 py-2.5 rounded-lg" />
                {preview && <img src={preview} alt="preview" className="w-24 h-24 rounded-full mt-3 object-cover border-2 border-gray-200" />}
              </div>
              <div className="col-span-2 flex justify-end gap-3 mt-4 sticky bottom-0 bg-white pt-4">
                <button type="button" onClick={() => setShowEdit(false)} className="px-6 py-2.5 border border-gray-200 rounded-lg text-gray-700 font-semibold hover:bg-gray-50 transition-all">Batal</button>
                <button type="submit" className="px-6 py-2.5 bg-gray-900 text-white rounded-lg font-semibold hover:bg-gray-800 transition-all">Perbarui</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Karyawan;
