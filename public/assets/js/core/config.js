export const COMPANY = {
  name: 'PT Artha Pramana Prakasa',
  email: 'ptarthapramanaprakasa@gmail.com',
  phone: '087796084428',
  phoneDisplay: '0877-9608-4428',
  whatsapp: '6287796084428',
  address:
    'Menara Agrinas Palma Lantai 15 – 03, Jl. HR Rasuna Said Kavling VI No.9 Blok X2, Kuningan, Setiabudi, DKI Jakarta 12950',
  mapQuery: 'Menara Agrinas Palma, Jl. HR Rasuna Said, Kuningan, Jakarta',
};

export const SERVICE_NAMES = [
  'Penyusunan & Pengelolaan Laporan Keuangan',
  'Sistem Informasi Akuntansi',
  'Konsultasi Pajak (Tax Consulting)',
  'Restrukturisasi Keuangan & Manajemen Utang',
];

const DEFAULT_WA_TEXT = `Halo ${COMPANY.name}, saya ingin berkonsultasi mengenai layanan keuangan.`;

export const waLink = (text = DEFAULT_WA_TEXT) =>
  `https://wa.me/${COMPANY.whatsapp}?text=${encodeURIComponent(text)}`;
