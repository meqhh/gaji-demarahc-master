import React, { useState } from "react";

function KaryawanHelp() {
  const [expandedFaq, setExpandedFaq] = useState(0);
  const [query, setQuery] = useState('');

  const faqData = [
    {
      question: "Bagaimana cara melihat slip gaji saya?",
      answer: "Buka menu 'Slip Gaji' di sidebar navigasi kiri. Di halaman tersebut Anda dapat: (1) Melihat daftar slip gaji untuk setiap bulan, (2) Memilih periode tertentu dengan filter bulan dan tahun, (3) Mengunduh slip gaji dalam format PDF untuk disimpan atau dicetak, (4) Melihat rincian lengkap gaji pokok, tunjangan, potongan, dan total gaji bersih. Slip dapat diunduh kapan saja untuk keperluan administratif Anda."
    },
    {
      question: "Bagaimana cara memasukkan/melihat absensi saya?",
      answer: "Akses menu 'Absensi' di sidebar atau dashboard utama. Fitur absensi mencakup: (1) Sistem akan otomatis mencatat kehadiran Anda saat login ke portal, (2) Anda dapat melihat riwayat absensi harian lengkap dengan jam masuk dan jam keluar, (3) Status persetujuan dari atasan akan ditampilkan untuk setiap record, (4) Jika ada ketidaksesuaian, Anda dapat menambahkan keterangan atau melakukan koreksi dengan bukti pendukung yang akan di-review atasan."
    },
    {
      question: "Bagaimana cara mengajukan cuti?",
      answer: "Navigasi ke menu 'Cuti' atau 'Pengajuan Cuti'. Untuk mengajukan cuti: (1) Klik tombol 'Ajukan Cuti Baru', (2) Isi formulir dengan memilih tanggal mulai dan tanggal selesai cuti, (3) Pilih jenis cuti (cuti tahunan, cuti sakit, cuti alasan penting, dll), (4) Tuliskan alasan pengajuan dengan detail yang jelas, (5) Submit pengajuan. Sistem akan secara otomatis mengirim ke atasan Anda untuk persetujuan. Anda dapat melacak status pengajuan di menu yang sama."
    },
    {
      question: "Bagaimana cara mengubah data pribadi saya?",
      answer: "Untuk mengubah data pribadi: (1) Klik menu profil di sudut kanan atas dashboard (biasanya menampilkan nama atau foto Anda), (2) Pilih 'Data Diri' atau 'Profil' dari dropdown menu, (3) Klik tombol 'Edit' atau 'Ubah Data Diri', (4) Perbarui informasi seperti alamat, nomor telepon, email, nomor darurat, atau data keluarga, (5) Klik 'Simpan Perubahan' untuk mengirim perubahan. Data akan diverifikasi oleh admin sebelum difinalisasi di sistem."
    },
    {
      question: "Bagaimana cara reset/mengubah kata sandi?",
      answer: "Untuk mengubah password: (1) Buka dropdown menu profil Anda di kanan atas, (2) Pilih menu 'Keamanan' atau 'Pengaturan Akun', (3) Cari opsi 'Ubah Kata Sandi' atau 'Reset Password', (4) Masukkan kata sandi lama Anda untuk verifikasi keamanan, (5) Masukkan kata sandi baru sebanyak dua kali untuk konfirmasi, (6) Pastikan password baru minimal 8 karakter dengan kombinasi huruf besar, huruf kecil, angka, dan simbol untuk keamanan maksimal. Jika lupa password, hubungi tim HR atau support."
    },
    {
      question: "Apa itu autentikasi dua faktor dan bagaimana cara mengaktifkannya?",
      answer: "Autentikasi dua faktor (2FA) adalah fitur keamanan tambahan yang melindungi akun Anda dengan memerlukan verifikasi ganda saat login. Selain memasukkan password, Anda juga perlu memasukkan kode verifikasi yang dikirim ke nomor telepon terdaftar. Untuk mengaktifkan 2FA: (1) Buka menu 'Keamanan' dari dropdown profil, (2) Cari opsi 'Autentikasi Dua Faktor' atau 'Enable 2FA', (3) Ikuti panduan setup dan pilih metode verifikasi (SMS atau aplikasi authenticator), (4) Verifikasi nomor telepon Anda, (5) Simpan backup code yang diberikan di tempat aman. Fitur ini sangat disarankan untuk proteksi maksimal."
    },
    {
      question: "Bagaimana cara menghubungi tim support?",
      answer: "Tim support kami siap membantu Anda melalui berbagai saluran komunikasi: (1) Email: karyawan@demara.com atau admin@demara.com untuk pertanyaan umum, (2) WhatsApp: +62 812-3456-7890 untuk respons lebih cepat, (3) Chat internal melalui aplikasi jika tersedia fitur chat, (4) Jam layanan: 09:00 - 17:00 WIB (Senin-Jumat). Untuk masalah mendesak di luar jam kerja, ada nomor emergency yang dapat Anda hubungi. Sertakan detail masalah Anda agar tim support dapat membantu lebih efisien."
    },
    {
      question: "Bagaimana cara membaca dan memahami komponen gaji di slip gaji?",
      answer: "Slip gaji Anda berisi beberapa komponen utama: (1) Gaji Pokok - jumlah gaji dasar Anda sesuai posisi, (2) Tunjangan - tambahan seperti tunjangan makan, transportasi, keluarga, atau tunjangan lainnya, (3) Insentif/Bonus - bonus performa atau insentif tambahan yang diterima bulan tersebut, (4) Potongan - termasuk pajak penghasilan (PPh), asuransi, atau potongan lainnya sesuai peraturan, (5) Total Gaji Kotor - jumlah sebelum potongan, (6) Total Gaji Bersih - jumlah final yang akan diterima ke rekening Anda. Jika ada pertanyaan tentang komponen tertentu, hubungi HR atau tim support."
    },
    {
      question: "Bagaimana cara mengunduh dokumen atau bukti kerja?",
      answer: "Untuk mengunduh dokumen yang diperlukan: (1) Buka menu yang sesuai (Slip Gaji, Absensi, Pengajuan, dll), (2) Temukan dokumen yang ingin Anda download, (3) Klik tombol 'Unduh', 'Download', atau ikon download yang biasanya berupa panah ke bawah, (4) Pilih format file yang diinginkan (PDF atau Excel jika tersedia opsi), (5) File akan tersimpan di folder 'Downloads' komputer Anda. Anda dapat membuka, mencetak, atau membagikan file tersebut sesuai kebutuhan."
    }
  ];

  const filtered = faqData.filter(f =>
    f.question.toLowerCase().includes(query.toLowerCase()) ||
    f.answer.toLowerCase().includes(query.toLowerCase())
  );

  const supportChannels = [
    { icon: "📧", title: "Email Support", value: "karyawan@demara.com", description: "Hubungi kami via email untuk pertanyaan umum" },
    { icon: "📞", title: "WhatsApp", value: "+62 812-3456-7890", description: "Chat dengan tim support kami" },
    { icon: "🕐", title: "Jam Layanan", value: "09:00 - 17:00 WIB", description: "Senin - Jumat (Hari Kerja)" }
  ];

  const guides = [
    {
      title: "📖 Panduan Pengguna Lengkap",
      description: "Panduan komprehensif tentang cara menggunakan portal karyawan Demara, navigasi menu, dan semua fitur yang tersedia untuk Anda."
    },
    {
      title: "🔐 Keamanan & Privasi Akun",
      description: "Informasi penting tentang keamanan akun Anda, cara menjaga password tetap aman, dan praktik terbaik penggunaan sistem HR."
    },
    {
      title: "💰 Slip Gaji & Komponen Gaji",
      description: "Panduan lengkap cara membaca slip gaji, memahami setiap komponen gaji, perhitungan, dan cara mengunduh slip untuk arsip pribadi."
    },
    {
      title: "✓ Absensi & Kehadiran",
      description: "Tutorial tentang sistem pencatatan absensi, melihat riwayat kehadiran, memahami status, dan cara koreksi jika ada kesalahan."
    },
    {
      title: "📋 Pengajuan Cuti & Perijinan",
      description: "Panduan lengkap tentang cara mengajukan cuti, jenis-jenis cuti yang tersedia, proses persetujuan, dan tracking status pengajuan."
    },
    {
      title: "👤 Manajemen Profil & Data Pribadi",
      description: "Cara mengubah informasi profil, data pribadi, nomor telepon, email, dan informasi keluarga dengan aman di sistem."
    }
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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Bantuan & Dukungan Karyawan</h1>
        <p className="text-gray-600">Panduan penggunaan portal, FAQ, dan dukungan teknis untuk memaksimalkan pengalaman Anda</p>
      </div>

      {/* Support Channels */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">
        {supportChannels.map((channel, idx) => (
          <div key={idx} className="bg-white border border-gray-200 rounded-lg p-6 animate-slide-in hover:border-gray-300 hover:shadow-sm transition-all" style={{ animationDelay: `${idx * 0.1}s` }}>
            <div className="text-3xl mb-3 text-gray-800">{channel.icon}</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{channel.title}</h3>
            <p className="text-base font-medium text-gray-700 mb-2">{channel.value}</p>
            <p className="text-sm text-gray-500">{channel.description}</p>
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
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden mb-10">
        <div className="bg-gray-100 border-b border-gray-200 px-6 py-4">
          <h2 className="text-xl font-bold text-gray-900">Pertanyaan yang Sering Diajukan (FAQ)</h2>
          <p className="text-sm text-gray-600 mt-1">Panduan langkah demi langkah untuk fitur-fitur utama portal karyawan</p>
        </div>

        <div className="divide-y divide-gray-200">
          {filtered.map((faq, idx) => (
            <div key={idx} className="faq-item-hover">
              <button
                onClick={() => setExpandedFaq(expandedFaq === idx ? -1 : idx)}
                className="w-full px-6 py-4 flex items-center justify-between focus:outline-none"
              >
                <span className="font-semibold text-gray-900 text-left">{faq.question}</span>
                <span className={`text-gray-600 transition-transform duration-300 font-semibold text-lg ${expandedFaq === idx ? 'rotate-180' : ''}`}>›</span>
              </button>
              
              {expandedFaq === idx && (
                <div className="px-6 pb-4 bg-gray-50 border-t border-gray-200">
                  <p className="text-gray-700 leading-relaxed text-sm whitespace-pre-wrap">{faq.answer}</p>
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

      {/* Documentation & Guides */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden mb-10">
        <div className="bg-gray-100 border-b border-gray-200 px-6 py-4">
          <h2 className="text-xl font-bold text-gray-900">Panduan & Dokumentasi</h2>
          <p className="text-sm text-gray-600 mt-1">Panduan lengkap untuk setiap fitur portal karyawan</p>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {guides.map((guide, idx) => (
              <div key={idx} className="p-4 border-l-4 border-gray-400 bg-gray-50 rounded hover:bg-gray-100 transition-colors cursor-pointer">
                <h3 className="font-semibold text-gray-900 mb-2">{guide.title}</h3>
                <p className="text-sm text-gray-600">{guide.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tips Section */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden mb-10">
        <div className="bg-gray-100 border-b border-gray-200 px-6 py-4">
          <h2 className="text-xl font-bold text-gray-900">Tips & Rekomendasi</h2>
        </div>

        <div className="p-6 space-y-4">
          <div className="flex gap-4">
            <div className="text-2xl">💡</div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">Simpan Password dengan Aman</h3>
              <p className="text-sm text-gray-600">Gunakan password yang kuat dengan kombinasi huruf besar, huruf kecil, angka, dan simbol. Jangan bagikan password Anda ke siapa pun dan ganti secara berkala.</p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="text-2xl">💡</div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">Aktivkan Autentikasi Dua Faktor</h3>
              <p className="text-sm text-gray-600">Aktifkan fitur 2FA untuk lapisan keamanan tambahan. Ini melindungi akun Anda dari akses tidak sah dengan memerlukan kode verifikasi tambahan.</p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="text-2xl">💡</div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">Unduh Slip Gaji Secara Berkala</h3>
              <p className="text-sm text-gray-600">Selalu unduh dan simpan slip gaji Anda setiap bulan untuk arsip pribadi dan keperluan administratif di masa depan.</p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="text-2xl">💡</div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">Update Data Pribadi</h3>
              <p className="text-sm text-gray-600">Selalu update data pribadi Anda seperti nomor telepon dan email agar sistem dapat menghubungi Anda dengan mudah untuk keperluan penting.</p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="text-2xl">💡</div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">Periksa Absensi Secara Berkala</h3>
              <p className="text-sm text-gray-600">Secara rutin cek riwayat absensi Anda untuk memastikan semua record sudah tercatat dengan benar. Lapor ke HR jika ada ketidaksesuaian.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Section */}
      <div className="bg-gray-100 border border-gray-200 rounded-lg p-6 md:p-8">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Butuh Bantuan Lebih Lanjut?</h3>
        <p className="text-gray-700 mb-4">Jika Anda tidak menemukan jawaban yang Anda cari atau menghadapi masalah teknis, hubungi tim support kami segera. Tim kami siap membantu Anda.</p>
        <div className="text-sm text-gray-600 space-y-2">
          <p><strong>Email:</strong> karyawan@demara.com</p>
          <p><strong>WhatsApp:</strong> +62 812-3456-7890</p>
          <p><strong>Jam Operasional:</strong> 09:00 - 17:00 WIB (Senin-Jumat)</p>
          <p className="text-xs text-gray-500 mt-4">Untuk masalah darurat, hubungi: +62 812-9999-9999</p>
        </div>
      </div>
    </main>
  );
}

export default KaryawanHelp;
