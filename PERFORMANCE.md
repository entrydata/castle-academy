# Aturan Wajib Performa Castle Academy

Aturan ini berlaku untuk setiap pembaruan dan fitur baru. Jangan menghapus optimasi yang sudah ada tanpa pengganti yang setara atau lebih cepat.

## Backend (`Code.gs`)
- Wajib gunakan `read_()` untuk pembacaan data sheet; jangan membaca sheet berulang dalam satu request.
- Setiap perubahan data wajib melalui `write_()`/`del_()` agar cache server dibatalkan dengan benar.
- Jangan memanggil fungsi berat seperti `lview_()`, `asm_()`, atau membaca seluruh sheet berulang di dalam perulangan. Ambil sekali, kelompokkan dengan Map/object, lalu cari dari memori.
- Request tab harus mengembalikan hanya data yang dibutuhkan. Hindari mengirim isi panjang, foto, file, dan seluruh data pengguna jika tidak diperlukan.
- Gunakan lock hanya pada operasi tulis yang benar-benar memerlukannya, dengan cakupan sesingkat mungkin.
- Jangan menambahkan polling otomatis ke server untuk daftar catatan, dashboard, atau daftar kelas.

## Frontend (`index.html`)
- Pertahankan cache request baca melalui `RC`/`RTTL`; request dengan parameter sama dan TTL aktif tidak boleh mengulang panggilan server.
- Catatan memakai cache 60 detik dan daftar kelas 20 detik. Mutasi melalui `api()` harus mengosongkan cache agar data terbaru tetap diambil.
- Muat data independen secara paralel dengan `Promise.all`; jangan membuat antrean request yang tidak perlu.
- Navigasi tab tidak boleh menunggu pemuatan data tab lain. Jangan me-render ulang seluruh tampilan untuk perubahan kecil.
- Input dan editor tidak boleh memanggil server pada setiap ketukan tombol. Simpan hanya atas aksi pengguna atau debounce autosave bila ditambahkan.
- Gambar harus dikompresi dan memiliki dimensi tampilan yang sesuai. Hindari base64 besar pada HTML atau cache request.
- Gunakan lazy loading untuk gambar/file berat dan tunda render grafik atau iframe sampai diperlukan.

## Verifikasi sebelum rilis
1. Periksa sintaks JavaScript `Code.gs` dan `index.html`.
2. Uji buka/tutup tab Catatan Guru, Catatan Siswa, dan LMS berulang; kunjungan kedua dalam TTL tidak boleh mengirim request baca baru.
3. Uji tambah/edit/hapus; data harus langsung diperbarui dan tidak membaca cache lama.
4. Uji navigasi cepat antartab untuk memastikan respons lama tidak menimpa tab baru.
5. Uji desktop dan ponsel pada koneksi lambat.
6. Jangan mengklaim lebih cepat tanpa pengujian pada deployment yang sebenarnya.
