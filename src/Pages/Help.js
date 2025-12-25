import React, { useState } from 'react';
import Logo from '../Images/demaralogo.png';

export default function Help() {
  const [expandedFaq, setExpandedFaq] = useState(0);
  const [query, setQuery] = useState('');

  const faqs = [
    { 
      q: 'Bagaimana cara melihat slip gaji saya?', 
      a: 'Buka menu "Slip Gaji" di sidebar navigasi. Di halaman tersebut, Anda dapat melihat daftar slip gaji bulanan Anda, memilih periode tertentu, dan mengunduhnya dalam format PDF. Slip gaji berisi rincian lengkap gaji pokok, tunjangan, potongan, dan total gaji bersih.' 
    },
    { 
      q: 'Bagaimana cara mengajukan cuti?', 
      a: 'Navigasi ke menu "Cuti" atau "Pengajuan Cuti", kemudian klik tombol "Ajukan Cuti Baru". Isi formulir dengan tanggal mulai, tanggal selesai, jenis cuti, dan alasan pengajuan. Setelah submit, pengajuan akan dikirim ke atasan untuk persetujuan. Anda dapat memantau status pengajuan Anda di menu yang sama.' 
    },
    { 
      q: 'Bagaimana cara input absensi?', 
      a: 'Buka menu "Absensi" di dashboard karyawan. Sistem akan secara otomatis mencatat kehadiran Anda saat login. Anda juga dapat melihat riwayat absensi lengkap, termasuk jam masuk, jam keluar, dan status persetujuan dari atasan.' 
    },
    { 
      q: 'Bagaimana cara mengubah data pribadi saya?', 
      a: 'Klik menu profil di sudut kanan atas dashboard, pilih "Data Diri" atau "Profil", kemudian klik tombol "Edit" atau "Ubah Data". Perbarui informasi yang diperlukan seperti alamat, nomor telepon, atau email, lalu simpan perubahan. Data akan diperbarui setelah admin melakukan verifikasi.' 
    },
    { 
      q: 'Bagaimana cara reset kata sandi?', 
      a: 'Akses menu "Keamanan" dari dropdown profil Anda. Klik pada "Ubah Kata Sandi", masukkan kata sandi lama untuk verifikasi, kemudian masukkan kata sandi baru sebanyak dua kali. Pastikan kata sandi baru minimal 8 karakter dengan kombinasi huruf, angka, dan simbol untuk keamanan maksimal.' 
    },
    { 
      q: 'Apa itu autentikasi dua faktor dan bagaimana cara mengaktifkannya?', 
      a: 'Autentikasi dua faktor adalah lapisan keamanan tambahan yang memerlukan verifikasi ganda saat login. Selain password, Anda perlu memasukkan kode verifikasi yang dikirim ke nomor telepon terdaftar. Untuk mengaktifkan, buka menu "Keamanan", pilih "Autentikasi Dua Faktor", dan ikuti panduan setup.' 
    },
    { 
      q: 'Bagaimana cara menghubungi tim support?', 
      a: 'Tim support kami siap membantu melalui berbagai saluran: Email: admin@demara.com, WhatsApp: +62 812-3456-7890, atau melalui form kontak di aplikasi. Jam layanan: 09:00 - 17:00 WIB (Senin-Jumat). Untuk masalah darurat, hubungi nomor emergency yang tersedia di menu bantuan.' 
    },
  ];

  const filtered = faqs.filter(f => 
    f.q.toLowerCase().includes(query.toLowerCase()) || 
    f.a.toLowerCase().includes(query.toLowerCase())
  );

  const supportChannels = [
    { icon: '✉', title: 'Email Support', value: 'admin@demara.com', desc: 'Hubungi kami via email untuk pertanyaan umum' },
    { icon: '☎', title: 'WhatsApp', value: '+62 812-3456-7890', desc: 'Chat dengan tim support kami' },
    { icon: '🕐', title: 'Jam Layanan', value: '09:00 - 17:00 WIB', desc: 'Senin - Jumat (Hari Kerja)' }
  ];

  return (
    <main className="min-h-screen bg-gray-50 p-6 md:p-8">
      <style>{`
        @keyframes slideIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .animate-slide-in { animation: slideIn 0.4s ease-out; }
        .faq-item-hover { transition: all 0.2s ease; }
        .faq-item-hover:hover { background-color: #f9fafb; }
      `}</style>

      {/* Header */}
      <div className="mb-8 animate-slide-in">
        <div className="flex items-center gap-3 mb-4">
          <img src={Logo} alt="logo" className="w-10 h-auto" />
          <h1 className="text-3xl font-bold text-gray-900">Bantuan & Dukungan</h1>
        </div>
        <p className="text-gray-600">Dokumentasi lengkap, FAQ, dan dukungan teknis untuk membantu Anda memaksimalkan penggunaan sistem</p>
      </div>

      {/* Support Channels */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">
        {supportChannels.map((channel, idx) => (
          <div key={idx} className="bg-white border border-gray-200 rounded-lg p-6 animate-slide-in hover:border-gray-300 hover:shadow-sm transition-all" style={{ animationDelay: `${idx * 0.1}s` }}>
            <div className="text-3xl mb-3 text-gray-800">{channel.icon}</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{channel.title}</h3>
            <p className="text-base font-medium text-gray-700 mb-2">{channel.value}</p>
            <p className="text-sm text-gray-500">{channel.desc}</p>
          </div>
        ))}
      </div>

      {/* Search Box */}
      <div className="mb-8">
        <div className="relative">
          <input 
            value={query} 
            onChange={e => setQuery(e.target.value)} 
            placeholder="Cari topik bantuan..." 
            className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent"
          />
          <span className="absolute right-4 top-3 text-gray-400">🔍</span>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="bg-gray-100 border-b border-gray-200 px-6 py-4">
          <h2 className="text-xl font-bold text-gray-900">Pertanyaan yang Sering Diajukan (FAQ)</h2>
          <p className="text-sm text-gray-600 mt-1">Temukan jawaban untuk pertanyaan umum tentang sistem</p>
        </div>

        <div className="divide-y divide-gray-200">
          {filtered.map((faq, idx) => (
            <div key={idx} className="faq-item-hover">
              <button
                onClick={() => setExpandedFaq(expandedFaq === idx ? -1 : idx)}
                className="w-full px-6 py-4 flex items-center justify-between focus:outline-none"
              >
                <span className="font-semibold text-gray-900 text-left">{faq.q}</span>
                <span className={`text-gray-600 transition-transform duration-300 font-semibold text-lg ${expandedFaq === idx ? 'rotate-180' : ''}`}>›</span>
              </button>
              
              {expandedFaq === idx && (
                <div className="px-6 pb-4 bg-gray-50 border-t border-gray-200">
                  <p className="text-gray-700 leading-relaxed text-sm">{faq.a}</p>
                </div>
              )}
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="px-6 py-8 text-center">
              <p className="text-gray-500">Tidak ada hasil untuk "{query}". Coba kata kunci lain atau hubungi tim support.</p>
            </div>
          )}
        </div>
      </div>

      {/* Documentation Section */}
      <div className="mt-10 bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="bg-gray-100 border-b border-gray-200 px-6 py-4">
          <h2 className="text-xl font-bold text-gray-900">Dokumentasi & Panduan</h2>
          <p className="text-sm text-gray-600 mt-1">Panduan lengkap untuk setiap fitur sistem</p>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border-l-4 border-gray-400 bg-gray-50 rounded hover:bg-gray-100 transition-colors">
              <h3 className="font-semibold text-gray-900 mb-2">📚 Panduan Pengguna</h3>
              <p className="text-sm text-gray-600">Panduan lengkap tentang cara menggunakan portal Demara, navigasi menu, dan fitur-fitur utama yang tersedia.</p>
            </div>

            <div className="p-4 border-l-4 border-gray-400 bg-gray-50 rounded hover:bg-gray-100 transition-colors">
              <h3 className="font-semibold text-gray-900 mb-2">🔒 Keamanan & Privasi</h3>
              <p className="text-sm text-gray-600">Informasi penting tentang keamanan akun Anda, tips mencegah akses tidak sah, dan kebijakan privasi data pribadi.</p>
            </div>

            <div className="p-4 border-l-4 border-gray-400 bg-gray-50 rounded hover:bg-gray-100 transition-colors">
              <h3 className="font-semibold text-gray-900 mb-2">💼 Manajemen Data Pribadi</h3>
              <p className="text-sm text-gray-600">Cara mengubah data pribadi, mengelola profil, dan memperbarui informasi kontak Anda di sistem.</p>
            </div>

            <div className="p-4 border-l-4 border-gray-400 bg-gray-50 rounded hover:bg-gray-100 transition-colors">
              <h3 className="font-semibold text-gray-900 mb-2">🆘 Troubleshooting</h3>
              <p className="text-sm text-gray-600">Solusi untuk masalah teknis umum, seperti login gagal, data tidak termuat, atau masalah saat mengakses fitur.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Section */}
      <div className="mt-10 bg-gray-100 border border-gray-200 rounded-lg p-6 md:p-8">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Butuh Bantuan Lebih Lanjut?</h3>
        <p className="text-gray-700 mb-4">Jika Anda tidak menemukan jawaban yang Anda cari, jangan ragu untuk menghubungi tim support kami. Kami siap membantu Anda.</p>
        <div className="text-sm text-gray-600 space-y-2">
          <p><strong>Email:</strong> admin@demara.com</p>
          <p><strong>WhatsApp:</strong> +62 812-3456-7890</p>
          <p><strong>Jam Operasional:</strong> 09:00 - 17:00 WIB (Senin-Jumat)</p>
        </div>
      </div>
    </main>
  );
}
