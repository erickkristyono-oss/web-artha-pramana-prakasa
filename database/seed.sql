-- =============================================================
--  Seed data: 4 layanan + paket (harga Rp10.000.000 – Rp50.000.000)
-- =============================================================

TRUNCATE service_packages, services RESTART IDENTITY CASCADE;

INSERT INTO services (slug, code, name, tagline, description, sort_order) VALUES
('laporan-keuangan', '01', 'Penyusunan & Pengelolaan Laporan Keuangan',
 'Laporan rapi, akurat, dan siap audit.',
 'Kami menyusun dan mengelola laporan keuangan sesuai SAK/PSAK: neraca, laba rugi, arus kas, dan perubahan ekuitas — lengkap dengan analisis rasio untuk pengambilan keputusan.', 1),
('sistem-informasi-akuntansi', '02', 'Sistem Informasi Akuntansi',
 'Proses akuntansi terotomasi dan terkendali.',
 'Perancangan, implementasi, dan migrasi sistem informasi akuntansi: chart of accounts, alur dokumen, kontrol internal, hingga pelatihan tim agar data keuangan real-time dan terintegrasi.', 2),
('konsultasi-pajak', '03', 'Konsultasi Pajak (Tax Consulting)',
 'Patuh pajak, efisien, tanpa kejutan.',
 'Perencanaan pajak, review kepatuhan PPh & PPN, pelaporan SPT Masa dan Tahunan, serta pendampingan pemeriksaan dan keberatan pajak oleh konsultan bersertifikat.', 3),
('restrukturisasi-keuangan', '04', 'Restrukturisasi Keuangan & Manajemen Utang',
 'Arus kas sehat, struktur modal kuat.',
 'Diagnosis kesehatan keuangan, penyusunan rencana restrukturisasi, negosiasi dengan kreditur, serta strategi manajemen utang untuk memulihkan likuiditas dan pertumbuhan.', 4);

INSERT INTO service_packages (service_id, name, price, duration, features, sort_order) VALUES
-- 01 Laporan Keuangan
(1, 'Starter',   10000000, '1 periode tahunan',
 ARRAY['Laporan keuangan tahunan (4 laporan utama)','Rekonsiliasi bank','1x sesi review'], 1),
(1, 'Business',  20000000, '12 bulan (bulanan)',
 ARRAY['Laporan keuangan bulanan','Analisis rasio & KPI','Catatan atas laporan keuangan','Konsultasi bulanan'], 2),
(1, 'Corporate', 35000000, '12 bulan + persiapan audit',
 ARRAY['Semua fitur Business','Konsolidasi multi-entitas','Pendampingan audit eksternal','Dedicated accountant'], 3),
-- 02 SIA
(2, 'Starter',   15000000, '4–6 minggu',
 ARRAY['Desain chart of accounts','Setup software akuntansi','Pelatihan 2 sesi'], 1),
(2, 'Business',  30000000, '2–3 bulan',
 ARRAY['Pemetaan proses bisnis','Implementasi & migrasi data','SOP & kontrol internal','Pelatihan tim'], 2),
(2, 'Corporate', 50000000, '3–5 bulan',
 ARRAY['Semua fitur Business','Integrasi ERP / sistem lain','Dashboard manajemen','Support 3 bulan pasca go-live'], 3),
-- 03 Pajak
(3, 'Starter',   10000000, '1 tahun pajak',
 ARRAY['Pelaporan SPT Tahunan Badan','Review PPh & PPN','Konsultasi via email'], 1),
(3, 'Business',  25000000, '12 bulan',
 ARRAY['SPT Masa & Tahunan','Perencanaan pajak','Tax health check','Konsultasi prioritas'], 2),
(3, 'Corporate', 40000000, '12 bulan',
 ARRAY['Semua fitur Business','Transfer pricing documentation','Pendampingan pemeriksaan pajak','Pengajuan keberatan / banding'], 3),
-- 04 Restrukturisasi
(4, 'Assessment', 20000000, '3–4 minggu',
 ARRAY['Financial health diagnosis','Analisis arus kas & utang','Rekomendasi strategi'], 1),
(4, 'Recovery',   35000000, '2–3 bulan',
 ARRAY['Rencana restrukturisasi','Proyeksi keuangan 3 tahun','Penjadwalan ulang utang','Negosiasi kreditur'], 2),
(4, 'Turnaround', 50000000, '4–6 bulan',
 ARRAY['Semua fitur Recovery','Pendampingan PKPU / perdamaian','Monitoring KPI bulanan','Advisor dedicated'], 3);
