// Muat .env bila ada (development). Di hosting, variabel diisi lewat panel sehingga file ini boleh tidak ada.
// Harus diimpor paling awal, sebelum modul yang membaca process.env.
try {
  process.loadEnvFile();
} catch {
  /* tidak ada .env — pakai environment dari sistem */
}
