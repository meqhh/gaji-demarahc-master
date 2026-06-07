import React, { useState, useContext } from "react";
import { AppContext } from "../context/AppContext";
import { useEffect } from "react";
import { API_BASE_URL } from "../config/api";

// ======================
// DATA TREATMENTS
// ======================
const treatments = [
  { id: 1, nama: "Pijat Bayi Sehat", category: "Baby Treatment", harga: 150000 },
  { id: 2, nama: "Pijat Balita", category: "Baby Treatment", harga: 185000 },
  { id: 3, nama: "Pijat Pediatric Bayi", category: "Baby Treatment", harga: 195000 },
  { id: 4, nama: "Pijat Pediatric Balita", category: "Baby Treatment", harga: 165000 },
  { id: 5, nama: "Baby Spa (Pijat + Swim + Gym)", category: "Baby Treatment", harga: 275000 },

  { id: 6, nama: "Haircut Bayi", category: "Baby Treatment", harga: 100000 },
  { id: 7, nama: "Haircut + Nails Cut", category: "Baby Treatment", harga: 150000 },
  { id: 8, nama: "Pijat Bayi + Haircut", category: "Baby Treatment", harga: 275000 },

  { id: 9, nama: "Tindik Steril Manual", category: "Baby Treatment", harga: 150000 },
  { id: 10, nama: "Tindik Steril dr Evoo (One Push)", category: "Baby Treatment", harga: 700000 },

  { id: 11, nama: "Happy Pregnancy", category: "Mommy Treatment", harga: 350000 },
  { id: 12, nama: "Happy Mommy (Pijat Ibu Nifas)", category: "Mommy Treatment", harga: 350000 },
  { id: 13, nama: "Happy Buna (Pijat Ibu Pasca SC)", category: "Mommy Treatment", harga: 350000 },
  { id: 14, nama: "Release Pregnancy Massage", category: "Mommy Treatment", harga: 350000 },
  { id: 15, nama: "Comfort Mommy Massage", category: "Mommy Treatment", harga: 550000 },

  { id: 16, nama: "Konsultasi Laktasi", category: "Laktasi Treatment", harga: 150000 },
  { id: 17, nama: "Pijat Laktasi + Oksitosin", category: "Laktasi Treatment", harga: 275000 },
  { id: 18, nama: "Pijat Laktasi", category: "Laktasi Treatment", harga: 400000 },
  { id: 19, nama: "Pijat Arugaan Laktasi (New)", category: "Laktasi Treatment", harga: 550000 },

  // Happy Deals Package
  { id: 20, nama: "Happy Deals 1 (Pijat Laktasi + Pijat Oksitosin + Pijat Bayi)", category: "Happy Deals", harga: 550000, fee: 10 },
  { id: 21, nama: "Happy Deals 2 (Pijat Oksitosin + Pijat Bayi Pediatric)", category: "Happy Deals", harga: 525000, fee: 10 },
  { id: 22, nama: "Happy Deals 3 (Pijat Laktasi + Konsultasi & Belajar Menyusui + Pijat Bayi)", category: "Happy Deals", harga: 690000, fee: 10 },
  { id: 23, nama: "Happy Deals 4 (Pijat Laktasi + Konsultasi Menyusui)", category: "Happy Deals", harga: 290000, fee: 10 },
  { id: 24, nama: "Happy Deals 5 (Pijat Laktasi + Belajar Menyusui + Konsultasi)", category: "Happy Deals", harga: 400000, fee: 10 },
  { id: 25, nama: "Happy Deals 6 (Pijat Laktasi Payudara saja + Pijat Pediatric)", category: "Happy Deals", harga: 440000, fee: 10 },

  // Gift For Mom
  { id: 26, nama: "Gift For Mom 1 (Konsultasi + Pijat Laktasi + Pijat Oksitosin)", category: "Gift For Mom", harga: 550000, fee: 10 },
  { id: 27, nama: "Gift For Mom 2 (Full Paket + Pijat Bayi)", category: "Gift For Mom", harga: 950000, fee: 10 },

  // Konselor Laktasi Services
  { id: 28, nama: "Konsultasi Laktasi (Konselor Laktasi)", category: "Konselor Laktasi", harga: 250000, fee: 10 },
  { id: 29, nama: "Konsultasi + Pijat Laktasi (Konselor Laktasi)", category: "Konselor Laktasi", harga: 500000, fee: 10 },

  // Konsultasi MPASI
  { id: 30, nama: "Konsultasi MP-ASI (60 menit)", category: "Konselor Laktasi", harga: 250000, fee: 10 },

  // Layanan lainnya
  { id: 31, nama: "Konsultasi + Belajar Posisi & Pelekatan Menyusui", category: "Konselor Laktasi", harga: 450000, fee: 10 },
  { id: 32, nama: "Konsultasi + Terapi Bingung Puting", category: "Konselor Laktasi", harga: 450000, fee: 10 },
  { id: 33, nama: "Konsultasi + Terapi Oral Bayi (Finger Feeding)", category: "Konselor Laktasi", harga: 500000, fee: 10 },

    // Paket Pendampingan Laktasi (Bidan Konselor)
  { id: 34, nama: "4x Pijat Laktasi + Oksitosin (Dengan Konselor Laktasi)", category: "Paket Laktasi", harga: 1800000, fee: 10 },
  { id: 35, nama: "6x Pijat Laktasi + Oksitosin (Dengan Konselor Laktasi)", category: "Paket Laktasi", harga: 2700000, fee: 10 },
  { id: 36, nama: "10x Pijat Laktasi + Oksitosin (Dengan Konselor Laktasi)", category: "Paket Laktasi", harga: 4000000, fee: 10 },

  // Mom & Baby Treatment Package
  { id: 37, nama: "Paket Mom & Baby (Konsultasi + Pijat Laktasi + Oksitosin + Pijat Bayi)", category: "Mom & Baby Treatment", harga: 750000, fee: 10 },

  // Paket New Mom
  { id: 38, nama: "Paket New Mom (Konsultasi + Pijat Laktasi + Oksitosin + Belajar DBF)", category: "Mom & Baby Treatment", harga: 750000, fee: 10 },

  // Paket Re-Laktasi
  { id: 39, nama: "Paket Re-Laktasi (Konsultasi + Teknik Menyusui + SNS + Pijat Laktasi)", category: "Re-Laktasi Package", harga: 750000, fee: 10 },

  // Breastfeeding Classes
  { id: 40, nama: "Breastfeeding Class (Ibu saja)", category: "Breastfeeding Class", harga: 450000, fee: 10 },
  { id: 41, nama: "Breastfeeding & New Born Class (Pasangan)", category: "Breastfeeding Class", harga: 750000, fee: 10 },

  // Postnatal / Comfort Massage Packages
  { id: 42, nama: "Pemasangan Gurita/Bengkung", category: "Postnatal Package", harga: 600000, fee: 10 },

  { id: 43, nama: "Comfort Mommy Massage 14 Hari (4x Pijat)", category: "Postnatal Package", harga: 1500_000, fee: 10 },
  { id: 44, nama: "Comfort Mommy Massage 30 Hari (3x Pijat)", category: "Postnatal Package", harga: 1200_000, fee: 10 },
  { id: 45, nama: "Comfort Mommy Massage 4x (Free 1x Pijat Bayi)", category: "Postnatal Package", harga: 2000_000, fee: 10 },
  { id: 46, nama: "Comfort Mommy Massage 6x (Free 2x Pijat Bayi)", category: "Postnatal Package", harga: 3000_000, fee: 10 },

  // Paket ASI Lancar
  { id: 47, nama: "Bundle 4x Pijat Laktasi (Free 1x Pijat Bayi)", category: "Paket ASI Lancar", harga: 1000_000, fee: 10 },
  { id: 48, nama: "Bundle 6x Pijat Laktasi (Free 2x Pijat Bayi)", category: "Paket ASI Lancar", harga: 1500_000, fee: 10 },

  { id: 49, nama: "Bundle 4x Laktasi Oksitosin (Free 2x Pijat Bayi)", category: "Paket ASI Lancar", harga: 1500_000, fee: 10 },
  { id: 50, nama: "Bundle 6x Laktasi Oksitosin (Free 1x Pijat Laktasi + 1x Pijat Bayi)", category: "Paket ASI Lancar", harga: 2250_000, fee: 10 },

  // Buna Baby Package
  { id: 51, nama: "Buna Baby 4x Laktasi + 4x Pijat Bayi", category: "Buna Baby Package", harga: 1650000, fee: 10 },
  { id: 52, nama: "Buna Baby 6x Laktasi + 6x Pijat Bayi (Free 1x Laktasi + 1x Pijat Bayi)", category: "Buna Baby Package", harga: 2450000, fee: 10 },
  { id: 53, nama: "Buna Baby 10x Laktasi + 10x Pijat Bayi (Free 2x Laktasi + 2x Pijat Bayi)", category: "Buna Baby Package", harga: 3900000, fee: 10 },

  // Baby Pediatric Package
  { id: 54, nama: "Baby Package 4x Pijat Pediatric", category: "Baby Package", harga: 650000, fee: 10 },
  { id: 55, nama: "Baby Package 6x Pijat Pediatric (Free 1x Pijat Bayi)", category: "Baby Package", harga: 950000, fee: 10 },
  { id: 56, nama: "Baby Package 10x Pijat Pediatric (Free 2x Pijat Bayi)", category: "Baby Package", harga: 1650000, fee: 10 },

  // Re-Laktasi Arugaan Package
  { id: 57, nama: "Re-Laktasi Arugaan 4x (Free 1x Pijat Laktasi)", category: "Re-Laktasi Package", harga: 2000000, fee: 10 },
  { id: 58, nama: "Re-Laktasi Arugaan 6x", category: "Re-Laktasi Package", harga: 3000000, fee: 10 },

  // Program Menyusui (Perbaikan DBF / Bingung Puting)
  { id: 59, nama: "Program Menyusui 3x Pertemuan", category: "Program Menyusui", harga: 1000000, fee: 10 },
  { id: 60, nama: "Program Menyusui 4x Pertemuan", category: "Program Menyusui", harga: 1200000, fee: 10 },
  { id: 61, nama: "Program Menyusui 6x Pertemuan (Free 2x Pijat Bayi)", category: "Program Menyusui", harga: 1800000, fee: 10 },

  // Paket Pijat Hamil
  { id: 62, nama: "Paket Pijat Hamil 3x (Free 1x Pijat Hamil)", category: "Pijat Hamil Package", harga: 1000000, fee: 10 },
  { id: 63, nama: "Paket Pijat Hamil 4x", category: "Pijat Hamil Package", harga: 1300000, fee: 10 },
  { id: 64, nama: "Paket Pijat Hamil 6x", category: "Pijat Hamil Package", harga: 2000000, fee: 10 },

  // Paket Pijat Badan Pasca Melahirkan
  { id: 65, nama: "Pijat Badan Pasca Melahirkan 3x (Tanpa Pijat Perut)", category: "Pijat Pasca Melahirkan", harga: 1000000, fee: 10 },
  { id: 66, nama: "Pijat Badan Pasca Melahirkan 4x", category: "Pijat Pasca Melahirkan", harga: 1400000, fee: 10 },
  { id: 67, nama: "Pijat Badan Pasca Melahirkan 6x (Free 2x Pijat Bayi)", category: "Pijat Pasca Melahirkan", harga: 2000000, fee: 10 },

  // Happy New Born 1
  { id: 68, nama: "Happy New Born 1 – 3x Kunjungan", category: "New Born Package", harga: 500000, fee: 10 },
  { id: 69, nama: "Happy New Born 1 – 7x Kunjungan", category: "New Born Package", harga: 900000, fee: 10 },

  // Happy New Born 2
  { id: 70, nama: "Happy New Born 2 – 3x Kunjungan (+ Pijat Laktasi 3x + Konsultasi)", category: "New Born Package", harga: 1500000, fee: 10 },
  { id: 71, nama: "Happy New Born 2 – 7x Kunjungan (+ Pijat Laktasi 2x + Konsultasi + Pijat Bayi)", category: "New Born Package", harga: 2000000, fee: 10 },

  // Happy New Born 3 (Wonderful Package)
  { id: 72, nama: "Happy New Born 3 – 14x Kunjungan", category: "New Born Package", harga: 2000000, fee: 10 },
  { id: 73, nama: "Happy New Born 3 – 30x Kunjungan", category: "New Born Package", harga: 3000000, fee: 10 },

  ];

const TREATMENT_FEE_DEDUCTION = 75000; // Rp75.000 potongan per treatment
const MAX_TREATMENT_FEE = 250000; // Rp250.000 maksimal fee
const MIN_TREATMENT_FEE = 25000; // Rp25.000 minimal fee setelah potongan
const ADMIN_FIXED_FEE_PERCENT = 15;

// FEE OTOMATIS BERDASARKAN KATEGORI
function getFeeByCategory(category) {
  const lower = category.toLowerCase();

  if (
    lower.includes("package") ||
    lower.includes("bundle") ||
    lower.includes("deal")
  ) {
    return 10; // fee paket/bundling
  }

  return 15; // fee single treatment
}

// Hitung fee treatment dengan batasan max dan potongan Rp75.000
function calculateTreatmentFee(harga, category) {
  const percentageRate = getFeeByCategory(category);
  const calculatedFee = (harga * percentageRate) / 100;
  
  // Cap fee agar tidak jadi jutaan
  const cappedFee = Math.min(calculatedFee, MAX_TREATMENT_FEE);
  
  // Kurangi dengan potongan Rp75.000
  const netFee = cappedFee - TREATMENT_FEE_DEDUCTION;
  
  if (cappedFee > 0 && netFee <= 0) {
    return MIN_TREATMENT_FEE;
  }
  
  return Math.max(netFee, 0);
}

function Treatment() {

const { karyawanData, addTreatment, addGaji } = useContext(AppContext);
console.log("DATA KARYAWAN:", karyawanData);

const [dataTreatment, setDataTreatment] = useState(() => {
  try {
    const saved = localStorage.getItem("treatments");
    return saved ? JSON.parse(saved) : treatments;
  } catch {
    return treatments;
  }
});
const [search, setSearch] = useState("");

// Load treatments from localStorage on mount
useEffect(() => {
  localStorage.setItem("treatments", JSON.stringify(dataTreatment));
}, [dataTreatment]);

// Fetch treatments from server on mount
useEffect(() => {
  const fetchTreatments = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/treatment`);
      if (response.ok) {
        const data = await response.json();
        if (data.success && Array.isArray(data.data)) {
          setDataTreatment(data.data);
        }
      }
    } catch (error) {
      console.error('Error fetching treatments from server:', error);
      // Fall back to localStorage
    }
  };

  fetchTreatments();
}, []);

const [showTambah, setShowTambah] = useState(false);
const [showDetail, setShowDetail] = useState(false);
const [showEdit, setShowEdit] = useState(false);
const [showCatat, setShowCatat] = useState(false);

const [detailData, setDetailData] = useState(null);
const [editData, setEditData] = useState(null);
const [selectedTreatment, setSelectedTreatment] = useState(null);

const [formData, setFormData] = useState({});
const [pasienKlinik, setPasienKlinik] = useState("");

const [bidanTerpilih, setBidanTerpilih] = useState("");
const [catatanTreatment, setCatatanTreatment] = useState([]);



  // FILTER DATA BY SEARCH
  const filteredData = dataTreatment.filter((item) =>
    item.nama.toLowerCase().includes(search.toLowerCase()) ||
    item.category.toLowerCase().includes(search.toLowerCase())
  );

  const totalTreatment = filteredData.length;
  const totalFeeTotal = filteredData.reduce((sum, item) => {
    const fee = calculateTreatmentFee(item.harga, item.category);
    return sum + fee;
  }, 0);

  const parsePasienKlinik = (value) => {
    if (!value || typeof value !== "string") {
      return { namaPasien: "", klinikHomeService: "" };
    }

    const parts = value.split(/\s*-\s*/);
    const namaPasien = (parts[0] || "").trim();
    const klinikHomeService = parts.slice(1).join(" - ").trim();

    return {
      namaPasien,
      klinikHomeService: klinikHomeService || "",
    };
  };

  // Format harga ke Rupiah
  const formatHarga = (harga) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(harga);
  };

  // Tambah data dengan API call ke server
  const handleTambah = async (e) => {
    e.preventDefault();
    const form = e.target;
    
    // Generate temp ID untuk optimistic update
    const tempId = `TEMP-${Date.now()}`;
    const newTreatment = {
      id: tempId,
      nama: form.nama.value,
      category: form.category.value,
      harga: parseInt(form.harga.value),
      fee: parseInt(form.fee.value) || getFeeByCategory(form.category.value),
    };

    // Optimistic update ke UI
    setDataTreatment([...dataTreatment, newTreatment]);
    form.reset();
    setShowTambah(false);

    try {
      // Simpan ke server
      const response = await fetch(`${API_BASE_URL}/treatment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
        },
        body: JSON.stringify(newTreatment)
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          // Replace temp ID dengan server ID
          setDataTreatment(prev =>
            prev.map(t => t.id === tempId ? { ...data.data, id: data.data.id || tempId } : t)
          );
          console.log('Treatment berhasil disimpan ke server:', data.data);
        }
      } else {
        const error = await response.json();
        throw new Error(error.message || 'Gagal menyimpan treatment ke server');
      }
    } catch (error) {
      console.error('Error menyimpan treatment:', error);
      alert(`Gagal menyimpan treatment: ${error.message}`);
      // Remove dari state jika gagal
      setDataTreatment(prev => prev.filter(t => t.id !== tempId));
    }
  };

  // Edit data dengan API call ke server
  const handleEdit = async (e) => {
    e.preventDefault();
    const form = e.target;
    const updated = {
      ...editData,
      nama: form.nama.value,
      category: form.category.value,
      harga: parseInt(form.harga.value),
      fee: parseInt(form.fee.value) || getFeeByCategory(form.category.value),
    };

    // Optimistic update ke UI
    setDataTreatment(dataTreatment.map((t) => (t.id === updated.id ? updated : t)));
    setShowEdit(false);

    try {
      // Simpan ke server
      const response = await fetch(`${API_BASE_URL}/treatment/${updated.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
        },
        body: JSON.stringify(updated)
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          setDataTreatment(prev =>
            prev.map(t => t.id === updated.id ? data.data : t)
          );
          console.log('Treatment berhasil diupdate di server:', data.data);
        }
      } else {
        const error = await response.json();
        throw new Error(error.message || 'Gagal mengupdate treatment di server');
      }
    } catch (error) {
      console.error('Error mengupdate treatment:', error);
      alert(`Gagal mengupdate treatment: ${error.message}`);
      // Rollback jika gagal
      const prevVersion = Array.isArray(dataTreatment) 
        ? dataTreatment.find(t => t.id === updated.id)
        : editData;
      if (prevVersion) {
        setDataTreatment(prev =>
          prev.map(t => t.id === updated.id ? prevVersion : t)
        );
      }
    }
  };

  // Hapus data dengan API call ke server
  const handleHapus = async (treatmentData) => {
    if (!treatmentData?.id) return;
    
    // Confirm delete
    if (!window.confirm(`Apakah Anda yakin ingin menghapus treatment "${treatmentData.nama}"?`)) {
      return;
    }

    try {
      // Delete from server first
      const response = await fetch(`${API_BASE_URL}/treatment/${treatmentData.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Gagal menghapus treatment');
      }

      // If server delete successful, remove from local state
      setDataTreatment((prev) => 
        Array.isArray(prev) ? prev.filter((t) => t.id !== treatmentData.id) : []
      );

      alert('Treatment berhasil dihapus');
    } catch (error) {
      console.error('Error menghapus treatment:', error);
      alert(`Gagal menghapus treatment: ${error.message}`);
    }
  };

  const handleCatatTreatment = (treatment) => {
    setSelectedTreatment(treatment);
    setPasienKlinik("");
    setBidanTerpilih("");
    setShowCatat(true);
  };

  const closeCatatModal = () => {
    setShowCatat(false);
    setSelectedTreatment(null);
    setPasienKlinik("");
    setBidanTerpilih("");
  };

  const simpanTreatment = async () => {
    if (!bidanTerpilih) {
      alert("Pilih bidan terlebih dahulu");
      return;
    }

    const feePercent = ADMIN_FIXED_FEE_PERCENT;
    const feeAmount = Math.round((Number(selectedTreatment.harga || 0) * feePercent) / 100);

    const parsedPasienKlinik = parsePasienKlinik(pasienKlinik);

    const dataBaru = {
      id: Date.now(),
      treatment: selectedTreatment.nama,
      bidan: bidanTerpilih,
      pasien: parsedPasienKlinik.namaPasien,
      klinikHomeService: parsedPasienKlinik.klinikHomeService,
      pasienKlinik: pasienKlinik,
      fee: feeAmount,
      feePercent: feePercent,
      feeAmount: feeAmount,
      tanggal: new Date().toLocaleDateString("id-ID"),
    };

    // Optimistically add to local catatan
    setCatatanTreatment([...catatanTreatment, dataBaru]);

    try {
      // Find karyawan record by nama to get id and kompensasi
      const karyawan = Array.isArray(karyawanData)
        ? karyawanData.find((k) => (k.nama || k.name) === bidanTerpilih)
        : null;

      const karyawanId = karyawan ? (karyawan.id || karyawan._id || karyawan.user_id) : null;

      // Prepare treatment payload for backend
      const treatmentPayload = {
        karyawanId: karyawanId,
        nama: selectedTreatment.nama,
        tipeLayanan: selectedTreatment.category || "Treatment",
        tanggal: new Date().toISOString(),
        treatment: selectedTreatment.nama,
        biaya: selectedTreatment.harga || 0,
        pasien: parsedPasienKlinik.namaPasien,
        klinik: parsedPasienKlinik.klinikHomeService,
        fee: feeAmount,
        feePercent: feePercent,
        feeAmount: feeAmount,
      };

      // Persist treatment to server (if authenticated)
      if (addTreatment) await addTreatment(treatmentPayload);

      // Prepare gaji payload using existing kompensasi dari karyawan (fallbacks)
      const now = new Date();
      const periode = `${String(now.getMonth() + 1).padStart(2, "0")}-${now.getFullYear()}`;

      const gajiPokok = Number(karyawan?.gajiPokok || 0);
      const tunjangan = Number(karyawan?.tunjangan || 0);
      const potonganAsuransi = Number(karyawan?.asuransi || 0);
      const potonganTax = Number(karyawan?.pajak || 0);

      const gajiKotor = gajiPokok + feeAmount + tunjangan;
      const gajiNetto = gajiKotor - potonganAsuransi - potonganTax;

      const gajiPayload = {
        karyawanId: karyawanId,
        karyawan: bidanTerpilih,
        nama: bidanTerpilih,
        tanggal: new Date().toISOString(),
        pasien: parsedPasienKlinik.namaPasien,
        namaPasien: parsedPasienKlinik.namaPasien,
        klinik: parsedPasienKlinik.klinikHomeService,
        klinikHomeService: parsedPasienKlinik.klinikHomeService,
        treatment: selectedTreatment.nama,
        harga: selectedTreatment.harga || 0,
        fee: feePercent,
        feePercent: feePercent,
        feeAmount: feeAmount,
        periode,
        gajiPokok,
        tunjangan,
        bonus: feeAmount,
        potonganAsuransi,
        potonganTax,
        gajiKotor,
        gajiNetto
      };

      if (addGaji) await addGaji(gajiPayload);

      console.log("DATA TREATMENT BARU:", dataBaru);
    } catch (e) {
      console.error('Gagal menyimpan treatment/gaji otomatis:', e);
    }

    closeCatatModal();
  };

  return (
    <div className="space-y-8 pb-8">
      <style>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .card-hover {
          transition: all 0.3s ease;
        }
        .card-hover:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 25px rgba(204, 69, 222, 0.2);
        }
        .animate-slide-up {
          animation: slideUp 0.6s ease-out forwards;
        }
        .animate-slide-down {
          animation: slideDown 0.6s ease-out forwards;
        }
      `}</style>

      {showCatat && selectedTreatment && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-white p-6 rounded-xl shadow-lg w-[500px]">
      
      <h2 className="text-xl font-bold mb-4">
        Catat Treatment
      </h2>

      <div className="mb-4">
        <label className="block font-semibold mb-1">
          Treatment
        </label>
        <input
          type="text"
          value={selectedTreatment.nama}
          disabled
          className="w-full border p-2 rounded bg-gray-100"
        />
      </div>

      <div className="mb-4">
        <label className="block font-semibold mb-1">
          Bidan
        </label>

        <select
          value={bidanTerpilih}
          onChange={(e) => setBidanTerpilih(e.target.value)}
          className="w-full border border-gray-300 px-4 py-2.5 rounded-lg focus:border-gray-500 focus:ring-2 focus:ring-gray-200 outline-none transition-all bg-white text-gray-700"
        >
          <option value="">Pilih Bidan</option>
          {karyawanData?.map?.((item) => (
            <option key={item.id} value={item.nama}>
              {item.nama}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-4">
        <label className="block font-semibold mb-1">Nama Pasien & Klinik / Home Service</label>
        <input
          type="text"
          value={pasienKlinik}
          onChange={(e) => setPasienKlinik(e.target.value)}
          placeholder="Masukkan nama pasien - Klinik/Home Service"
          className="w-full border border-gray-300 px-4 py-2.5 rounded-lg focus:border-gray-500 focus:ring-2 focus:ring-gray-200 outline-none transition-all bg-white text-gray-700"
        />
        <p className="text-xs text-gray-500 mt-2">Tulis nama pasien dan layanan Klinik/Home Service dalam satu kotak, misal: Budi - Klinik Demara.</p>
      </div>

      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={closeCatatModal}
          className="px-4 py-2 border rounded"
        >
          Batal
        </button>

        <button
          type="button"
          onClick={simpanTreatment}
          className="px-4 py-2 bg-green-600 text-white rounded"
        >
          Simpan
        </button>
        </div>
      </div>
    </div>
  )}

      <main>
        {/* Header Section */}
        <div className="mb-8 flex items-center justify-between animate-slide-down">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-1">Data Treatment</h1>
            <div className="flex items-center gap-2 text-gray-500">
              <span className="inline-block text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 10.5L12 4l9 6.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1V10.5z" />
                </svg>
              </span>
              <span className="text-gray-400">Data Treatment</span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowTambah(true)}
            className="px-6 py-3 border-2 border-cyan-400 text-cyan-600 font-bold rounded-lg hover:bg-cyan-50 transition-all duration-300 flex items-center gap-2"
          >
            <span>+</span> Tambah Treatment
          </button>
        </div>

        {/* Tabel Data */}
        <div className="bg-white shadow-md rounded-xl overflow-hidden card-hover animate-slide-up">
          <div className="border-b-2 border-gray-200 p-8">
            <h2 className="text-2xl font-bold text-gray-900">Daftar Treatment</h2>
          </div>

          {/* Search Bar */}
          <div className="bg-gray-50 p-6 border-b-2 border-gray-200">
            <div className="relative">
              <input
                type="text"
                placeholder="🔍 Cari treatment berdasarkan nama atau kategori..."
                className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all font-semibold text-gray-700"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <p className="text-sm text-gray-600 mt-2">Total ditemukan: <span className="font-bold text-purple-600">{filteredData.length}</span> treatment</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-white">
                  <th className="px-8 py-5 text-left text-sm font-bold text-gray-700">No.</th>
                  <th className="px-8 py-5 text-left text-sm font-bold text-gray-700">Nama Treatment</th>
                  <th className="px-8 py-5 text-left text-sm font-bold text-gray-700">Kategori</th>
                  <th className="px-8 py-5 text-left text-sm font-bold text-gray-700">Harga</th>
                  <th className="px-8 py-5 text-left text-sm font-bold text-gray-700">Fee (%)</th>
                  <th className="px-8 py-5 text-left text-sm font-bold text-gray-700">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map((t, idx) => (
                  <tr
                    key={t.id}
                    className="border-b border-gray-100 hover:bg-gray-50 transition-all duration-300 animate-slide-up"
                    style={{ animationDelay: `${idx * 0.05}s` }}
                  >
                    <td className="px-8 py-5 bg-gray-100 text-gray-800 font-semibold">{idx + 1}.</td>
                    <td className="px-8 py-5 bg-gray-100 text-gray-800 font-medium">{t.nama}</td>
                    <td className="px-8 py-5 bg-gray-100 text-gray-800 text-sm">{t.category}</td>
                    <td className="px-8 py-5 bg-gray-100 text-gray-800 font-semibold">{formatHarga(t.harga)}</td>
                    <td className="px-8 py-5 bg-gray-100 text-gray-800">{getFeeByCategory(t.category)}%</td>
                    <td className="px-8 py-5 bg-gray-100 text-center space-x-2">
                      <button
                        type="button"
                        onClick={() => {
                          setDetailData(t);
                          setShowDetail(true);
                        }}
                        className="text-blue-600 font-bold hover:text-blue-700 transition-colors"
                      >
                        Detail
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setEditData(t);
                          setShowEdit(true);
                        }}
                        className="text-orange-600 font-bold hover:text-orange-700 transition-colors"
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        onClick={() => handleHapus(t)}
                        className="text-red-600 font-bold hover:text-red-700 transition-colors"
                      >
                        Hapus
                      </button>

                      <button
                        type="button"
                        onClick={() => handleCatatTreatment(t)}
                        className="text-green-600 font-bold hover:text-green-700 transition-colors"
                      >
                        Catat
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredData.length === 0 && (
              <div className="text-center py-16">
                <p className="text-2xl text-gray-400">📭 Belum ada data treatment</p>
                <p className="text-gray-500 mt-2">Klik tombol "Tambah Treatment" untuk menambahkan data</p>
              </div>
            )}
          </div>
        </div>

        {/* === Modal Tambah === */}
        {showTambah && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm animate-slide-down">
            <div className="bg-white rounded-xl shadow-lg w-full max-w-2xl p-8 animate-slide-up">
              {/* Header */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-2xl font-semibold text-gray-900">Tambah Treatment Baru</h2>
                  <button
                    onClick={() => setShowTambah(false)}
                    className="text-gray-400 hover:text-gray-600 rounded-full w-10 h-10 flex items-center justify-center transition-colors"
                  >
                    ✕
                  </button>
                </div>
                <p className="text-sm text-gray-500">Tambahkan treatment baru ke dalam sistem</p>
              </div>

              {/* Form */}
              <form onSubmit={handleTambah} className="space-y-6">
                {/* Nama Treatment */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Nama Treatment</label>
                  <input
                    name="nama"
                    type="text"
                    placeholder="Masukkan nama treatment"
                    className="w-full border border-gray-300 px-4 py-3 rounded-lg focus:border-gray-400 focus:ring-1 focus:ring-gray-400 outline-none transition-colors bg-white"
                    required
                  />
                </div>

                {/* Kategori */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Kategori</label>
                  <input
                    name="category"
                    type="text"
                    placeholder="Masukkan kategori (mis: Baby Treatment)"
                    className="w-full border border-gray-300 px-4 py-3 rounded-lg focus:border-gray-400 focus:ring-1 focus:ring-gray-400 outline-none transition-colors bg-white"
                    required
                  />
                </div>

                {/* Harga & Fee */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Harga</label>
                    <input
                      name="harga"
                      type="number"
                      placeholder="Masukkan harga"
                      className="w-full border border-gray-300 px-4 py-3 rounded-lg focus:border-gray-400 focus:ring-1 focus:ring-gray-400 outline-none transition-colors bg-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Fee (%)</label>
                    <input
                      name="fee"
                      type="number"
                      placeholder="Masukkan fee"
                      className="w-full border border-gray-300 px-4 py-3 rounded-lg focus:border-gray-400 focus:ring-1 focus:ring-gray-400 outline-none transition-colors bg-white"
                    />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => setShowTambah(false)}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-gray-800 text-white rounded-lg font-medium hover:bg-gray-700 transition-colors"
                  >
                    Simpan
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* === Modal Detail === */}
        {showDetail && detailData && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm animate-slide-down">
            <div className="bg-white rounded-xl shadow-lg w-full max-w-2xl p-8 animate-slide-up">
              {/* Header */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-2xl font-semibold text-gray-900">Detail Treatment</h2>
                  <button
                    onClick={() => setShowDetail(false)}
                    className="text-gray-400 hover:text-gray-600 rounded-full w-10 h-10 flex items-center justify-center transition-colors"
                  >
                    ✕
                  </button>
                </div>
                <p className="text-sm text-gray-500">Informasi lengkap tentang layanan treatment</p>
              </div>

              {/* Content */}
              <div className="space-y-6">
                {/* Nama Treatment */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Nama Treatment</label>
                  <div className="bg-gray-50 border border-gray-200 px-4 py-3 rounded-lg">
                    <p className="text-gray-900 font-medium">{detailData.nama}</p>
                  </div>
                </div>

                {/* Kategori, Harga, Fee */}
                <div className="grid grid-cols-3 gap-4">
                  {/* Kategori */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Kategori</label>
                    <div className="bg-gray-50 border border-gray-200 px-4 py-3 rounded-lg">
                      <p className="text-gray-700 text-sm">{detailData.category}</p>
                    </div>
                  </div>

                  {/* Harga */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Harga Layanan</label>
                    <div className="bg-gray-50 border border-gray-200 px-4 py-3 rounded-lg">
                      <p className="text-gray-900 font-semibold">{formatHarga(detailData.harga)}</p>
                    </div>
                  </div>

                  {/* Fee */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Fee Komisi</label>
                    <div className="bg-gray-50 border border-gray-200 px-4 py-3 rounded-lg">
                      <p className="text-gray-900 font-semibold">{getFeeByCategory(detailData.category)}%</p>
                    </div>
                  </div>
                </div>

                {/* Total Estimasi & ID */}
                <div className="grid grid-cols-2 gap-4 bg-gray-50 border border-gray-200 p-4 rounded-lg">
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Total Estimasi Fee</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {formatHarga((detailData.harga * getFeeByCategory(detailData.category)) / 100)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase mb-1">ID Treatment</p>
                    <p className="text-lg font-semibold text-gray-900">#{detailData.id}</p>
                  </div>
                </div>

                {/* Action Button */}
                <div className="flex justify-end pt-6 border-t border-gray-200">
                  <button
                    onClick={() => setShowDetail(false)}
                    className="px-6 py-2 bg-gray-800 text-white rounded-lg font-medium hover:bg-gray-700 transition-colors"
                  >
                    Tutup
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* === Modal Edit === */}
        {showEdit && editData && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm animate-slide-down">
            <div className="bg-white rounded-xl shadow-lg w-full max-w-2xl p-8 animate-slide-up">
              {/* Header */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-2xl font-semibold text-gray-900">Edit Treatment</h2>
                  <button
                    onClick={() => setShowEdit(false)}
                    className="text-gray-400 hover:text-gray-600 rounded-full w-10 h-10 flex items-center justify-center transition-colors"
                  >
                    ✕
                  </button>
                </div>
                <p className="text-sm text-gray-500">Perbarui informasi treatment</p>
              </div>

              {/* Form */}
              <form onSubmit={handleEdit} className="space-y-6">
                {/* Nama Treatment */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Nama Treatment</label>
                  <input
                    name="nama"
                    type="text"
                    defaultValue={editData.nama}
                    className="w-full border border-gray-300 px-4 py-3 rounded-lg focus:border-gray-400 focus:ring-1 focus:ring-gray-400 outline-none transition-colors bg-white"
                    required
                  />
                </div>

                {/* Kategori */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Kategori</label>
                  <input
                    name="category"
                    type="text"
                    defaultValue={editData.category}
                    className="w-full border border-gray-300 px-4 py-3 rounded-lg focus:border-gray-400 focus:ring-1 focus:ring-gray-400 outline-none transition-colors bg-white"
                    required
                  />
                </div>

                {/* Harga & Fee */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Harga</label>
                    <input
                      name="harga"
                      type="number"
                      defaultValue={editData.harga}
                      className="w-full border border-gray-300 px-4 py-3 rounded-lg focus:border-gray-400 focus:ring-1 focus:ring-gray-400 outline-none transition-colors bg-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Fee (%)</label>
                    <input
                      name="fee"
                      type="number"
                      defaultValue={editData.fee}
                      className="w-full border border-gray-300 px-4 py-3 rounded-lg focus:border-gray-400 focus:ring-1 focus:ring-gray-400 outline-none transition-colors bg-white"
                    />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => setShowEdit(false)}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-gray-800 text-white rounded-lg font-medium hover:bg-gray-700 transition-colors"
                  >
                    Perbarui
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}

export default Treatment;
