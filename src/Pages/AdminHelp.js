import React, { useState } from "react";

function AdminHelp() {
  const [expandedFaq, setExpandedFaq] = useState(0);
  const [query, setQuery] = useState('');

  const faqData = [
    {
      question: "Bagaimana cara mengelola data karyawan?",
      answer: "Buka menu 'Karyawan' di dashboard admin. Di halaman ini Anda dapat: (1) Menambah karyawan baru dengan mengklik 'Tambah Karyawan', (2) Mengedit data karyawan yang ada dengan mengklik ikon edit, (3) Menghapus karyawan dengan mengklik ikon delete, (4) Mencari karyawan dengan nama atau ID. Setiap perubahan akan tersimpan otomatis di database dan notifikasi akan dikirim ke karyawan yang bersangkutan."
    },
    {
      question: "Bagaimana cara mengelola data gaji dan tunjangan?",
      answer: "Navigasi ke menu 'Gaji' untuk mengelola komponen gaji. Anda dapat: (1) Menetapkan gaji pokok per karyawan atau berdasarkan departemen, (2) Menambah/mengurangi tunjangan seperti tunjangan makan, transportasi, atau keluarga, (3) Menetapkan potongan gaji (pajak, asuransi, dll), (4) Membuat template gaji untuk berbagai departemen. Sistem akan otomatis menghitung total gaji bersih berdasarkan konfigurasi yang telah ditentukan."
    },
    {
      question: "Bagaimana cara membuat dan mengelola slip gaji?",
      answer: "Buka menu 'Slip Gaji' untuk membuat slip bulanan karyawan. Langkah: (1) Pilih bulan dan tahun yang akan dibuat slipnya, (2) Sistem akan menampilkan daftar semua karyawan yang aktif, (3) Klik 'Generate Slip' untuk membuat slip otomatis berdasarkan data gaji yang sudah dikonfigurasi, (4) Review slip sebelum dikirim ke karyawan, (5) Klik 'Publish' untuk mengirim slip ke portal karyawan. Karyawan dapat mengunduh slip dalam format PDF dari portal mereka."
    },
    {
      question: "Bagaimana cara mengelola permintaan cuti karyawan?",
      answer: "Akses menu 'Cuti & Perijinan' untuk melihat semua permintaan cuti dari karyawan. Anda dapat: (1) Melihat daftar permintaan yang menunggu persetujuan dengan detail lengkap, (2) Menyetujui atau menolak permintaan dengan menambahkan catatan, (3) Melihat riwayat cuti karyawan berdasarkan periode tertentu, (4) Mengatur jenis cuti yang tersedia (cuti tahunan, sakit, dll), (5) Mengatur kuota cuti per tahun untuk setiap karyawan atau departemen."
    },
    {
      question: "Bagaimana cara memonitor absensi karyawan?",
      answer: "Buka menu 'Absensi' untuk melihat rekapitulasi kehadiran. Fitur mencakup: (1) Dashboard absensi harian yang menunjukkan karyawan hadir, izin, atau sakit, (2) Filter berdasarkan tanggal, departemen, atau status kehadiran, (3) Laporan mingguan dan bulanan dengan grafik analisis, (4) Rekap detail jam masuk-keluar per karyawan, (5) Export data absensi dalam format Excel atau PDF untuk keperluan administrasi."
    },
    {
      question: "Bagaimana cara reset kata sandi karyawan?",
      answer: "Di menu 'Manajemen Pengguna' atau 'Keamanan', cari karyawan yang ingin di-reset kata sandinya. Pilih 'Reset Password' dan sistem akan: (1) Menghasilkan password sementara otomatis, (2) Mengirim password baru ke email karyawan atau menampilkannya langsung, (3) Memastikan karyawan diminta mengganti password saat login berikutnya untuk alasan keamanan. Anda dapat melacak history perubahan password untuk setiap user."
    },
    {
      question: "Bagaimana cara mengaktifkan dan mengelola autentikasi dua faktor?",
      answer: "Buka menu 'Keamanan Sistem' → 'Autentikasi Dua Faktor'. Di sini Anda dapat: (1) Mengaktifkan autentikasi 2FA untuk semua admin atau per user, (2) Memilih metode verifikasi (SMS, email, atau aplikasi authenticator), (3) Melihat status 2FA setiap user admin, (4) Melakukan reset 2FA untuk user yang lupa backup code, (5) Mengatur kebijakan keamanan seperti timeout session dan upaya login maksimal. Semua perubahan keamanan akan dicatat dalam audit log."
    },
    {
      question: "Bagaimana cara mengakses laporan dan analitik?",
      answer: "Menu 'Laporan & Analytics' menyediakan insights mendalam tentang operasional. Anda dapat: (1) Melihat dashboard overview dengan KPI utama (jumlah karyawan, rata-rata gaji, tingkat absensi), (2) Generate custom report dengan berbagai filter dan parameter, (3) Menganalisis tren absensi, lembur, dan cuti per periode, (4) Membuat laporan finansial untuk penggajian bulanan, (5) Export semua laporan dalam format PDF, Excel, atau CSV untuk presentasi kepada manajemen puncak."
    },
    {
      question: "Bagaimana cara melakukan backup dan restore data?",
      answer: "Navigasi ke menu 'Pengaturan Sistem' → 'Backup & Restore'. Fitur ini memungkinkan Anda untuk: (1) Membuat backup otomatis data sistem (recommended: daily), (2) Membuat backup manual kapan saja dengan satu klik, (3) Melihat daftar backup yang tersedia dengan waktu pembuatan dan ukuran file, (4) Melakukan restore data ke backup tertentu jika diperlukan recovery, (5) Mengatur lokasi penyimpanan backup (local server atau cloud storage). Semua proses backup akan diverifikasi dan dicatat untuk audit trail."
    }
  ];

  const filtered = faqData.filter(f =>
    f.question.toLowerCase().includes(query.toLowerCase()) ||
    f.answer.toLowerCase().includes(query.toLowerCase())
  );

  const supportChannels = [
    { icon: "📧", title: "Email Support", value: "admin@demara.com", description: "Hubungi kami via email untuk pertanyaan teknis" },
    { icon: "📞", title: "WhatsApp", value: "+62 812-3456-7890", description: "Chat dengan tim support kami" },
    { icon: "🕐", title: "Jam Layanan", value: "09:00 - 17:00 WIB", description: "Senin - Jumat (Hari Kerja)" }
  ];

  const documentationGuides = [
    {
      title: "📖 Panduan Admin Lengkap",
      description: "Dokumentasi komprehensif tentang semua fitur admin panel Demara, termasuk setup awal, konfigurasi sistem, dan best practices pengelolaan data karyawan."
    },
    {
      title: "🔐 Keamanan & Best Practices",
      description: "Panduan keamanan sistem, manajemen user admin, autentikasi multi-faktor, audit log, dan langkah-langkah preventif untuk mencegah akses tidak sah ke sistem."
    },
    {
      title: "📊 Penggajian & Laporan",
      description: "Panduan lengkap tentang proses penggajian, komponen gaji, perhitungan pajak, pembuatan slip gaji, dan cara menghasilkan laporan finansial untuk departemen keuangan."
    },
    {
      title: "⚙️ Pengaturan & Maintenance",
      description: "Informasi tentang konfigurasi sistem, backup data, disaster recovery, upgrade aplikasi, dan maintenance rutin yang perlu dilakukan untuk performa optimal."
    },
    {
      title: "👥 Manajemen Karyawan",
      description: "Tutorial tentang menambah karyawan, mengelola data pribadi, departemen, posisi, dan struktur organisasi dalam sistem HR Demara."
    },
    {
      title: "📱 Integrasi & API",
      description: "Dokumentasi teknis untuk developer tentang API sistem, integrasi pihak ketiga, webhooks, dan cara mengintegrasikan Demara dengan sistem eksternal lainnya."
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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Bantuan & Dukungan Admin</h1>
        <p className="text-gray-600">Dokumentasi lengkap, FAQ, dan panduan teknis untuk administrasi sistem Demara</p>
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
          <p className="text-sm text-gray-600 mt-1">Panduan langkah demi langkah untuk fitur-fitur utama admin panel</p>
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

      {/* Documentation & Resources */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden mb-10">
        <div className="bg-gray-100 border-b border-gray-200 px-6 py-4">
          <h2 className="text-xl font-bold text-gray-900">Dokumentasi & Panduan</h2>
          <p className="text-sm text-gray-600 mt-1">Panduan lengkap untuk setiap aspek penggunaan admin panel</p>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {documentationGuides.map((guide, idx) => (
              <div key={idx} className="p-4 border-l-4 border-gray-400 bg-gray-50 rounded hover:bg-gray-100 transition-colors cursor-pointer">
                <h3 className="font-semibold text-gray-900 mb-2">{guide.title}</h3>
                <p className="text-sm text-gray-600">{guide.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Best Practices Section */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden mb-10">
        <div className="bg-gray-100 border-b border-gray-200 px-6 py-4">
          <h2 className="text-xl font-bold text-gray-900">Best Practices & Tips</h2>
        </div>

        <div className="p-6 space-y-4">
          <div className="flex gap-4">
            <div className="text-2xl">✓</div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">Backup Rutin</h3>
              <p className="text-sm text-gray-600">Selalu lakukan backup data sistem secara berkala (minimal 1x sehari) untuk mencegah kehilangan data penting. Simpan backup di lokasi yang aman.</p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="text-2xl">✓</div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">Update Sistem Berkala</h3>
              <p className="text-sm text-gray-600">Selalu update sistem ke versi terbaru untuk mendapatkan fitur baru, peningkatan performa, dan patch keamanan terkini.</p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="text-2xl">✓</div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">Keamanan Akun Admin</h3>
              <p className="text-sm text-gray-600">Gunakan password yang kuat, aktifkan autentikasi dua faktor, dan jangan bagikan kredensial admin ke siapa pun. Monitor audit log secara teratur.</p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="text-2xl">✓</div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">Verifikasi Data Berkala</h3>
              <p className="text-sm text-gray-600">Secara berkala verifikasi dan validasi data karyawan, gaji, dan laporan untuk memastikan akurasi dan konsistensi informasi di sistem.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Section */}
      <div className="bg-gray-100 border border-gray-200 rounded-lg p-6 md:p-8">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Butuh Bantuan Teknis?</h3>
        <p className="text-gray-700 mb-4">Tim support teknis kami siap membantu menyelesaikan masalah atau menjawab pertanyaan teknis tentang sistem admin Demara.</p>
        <div className="text-sm text-gray-600 space-y-2">
          <p><strong>Email:</strong> admin@demara.com</p>
          <p><strong>WhatsApp:</strong> +62 812-3456-7890</p>
          <p><strong>Jam Operasional:</strong> 09:00 - 17:00 WIB (Senin-Jumat)</p>
          <p className="text-xs text-gray-500 mt-4">Untuk masalah darurat, hubungi: +62 812-9999-9999 (24/7)</p>
        </div>
      </div>
    </main>
  );
}

export default AdminHelp;
