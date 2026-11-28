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
- **Logo dan gambar:**
  - Logo disimpan maksimal 200px dengan kompresi optimal (target <38KB) untuk mempercepat loading.
  - Logo di-preload saat aplikasi dimuat pertama kali agar tidak lag saat pindah tab.
  - Pemasangan logo ke DOM menggunakan `requestIdleCallback` untuk menghindari blocking rendering utama.
  - Gambar background login dipisah per ukuran layar untuk mengurangi ukuran file yang dimuat.
- Gunakan lazy loading untuk gambar/file berat dan tunda render grafik atau iframe sampai diperlukan.

## Pengaturan Asesmen
- **Pertemuan Ujian** dan **KKM** sekarang diatur **per Program Paket**, bukan global di Settings.
- Setiap paket memiliki nilai `PertemuanUjian` (minimal pertemuan sebelum ujian akhir) dan `KKM` (standar kelulusan) sendiri.
- Laporan periode dan tampilan ujian akhir menggunakan nilai dari paket yang dipilih, bukan dari Settings.

## Kantin
- `kantinData` hanya memuat sheet sesuai subtab dan di-cache frontend selama 15 detik; mutasi mengosongkan cache baca melalui `api()`.
- Harga penjualan dan stok divalidasi ulang di server; transaksi dibungkus `withLock_()` dan memakai `RequestID` untuk mencegah klik/ulang permintaan ganda.
- Google Sheets tidak menyediakan transaksi multi-sheet atomik. Semua validasi harus selesai sebelum tulis pertama; jangan menganggap lock mencegah kegagalan sebagian.
- Barcode dan pustaka label dimuat hanya saat dibutuhkan. Foto produk/QRIS tetap terkompresi agar tidak membebani sheet dan pembukaan tab.
- Kasir memuat data lewat satu permintaan `kantinData` dengan `Tab: 'pos'` (produk aktif + pembeli baru + siswa/pegawai dalam kolom aman + maks. 50 penjualan terbaru). Jangan memecahnya menjadi beberapa permintaan.
- Siswa & pegawai otomatis menjadi pembeli (`PembeliID` = `U:<username>`); `KantinPembeli` hanya untuk pembeli baru di luar data pengguna.
- Tanggal+jam transaksi POS hanya bisa diatur admin; kasir lain selalu memakai waktu server. Kolom tanggal Kantin harus tetap terdaftar di `TIME_COLS_` (teks) agar jam tidak hilang, dan kolom barcode di `TEXT_COLS_` agar angka 0 di depan tidak terhapus.
- Stok Masuk tanpa ceklis Pembelanjaan hanya menambah stok. Dengan ceklis (atau lewat tab Pembelanjaan) tercatat sebagai pembelanjaan; metode `Hutang Belanja` membuat baris Hutang tanpa kas keluar.
- Pustaka pemindai (ZXing) dimuat hanya saat tombol scan ditekan; kamera dimatikan saat modal ditutup. Pemilih produk/pembeli memfilter dari data yang sudah dimuat (tanpa permintaan server per ketikan). Filter Semua/Tanggal/Bulan/Tahun (termasuk rekap per bulan) bekerja di sisi klien.
- POS tidak boleh menggambar ulang seluruh panel saat keranjang berubah; hanya daftar item dan ringkasan pembayaran yang diperbarui.
- Penjualan terbaru di bawah POS dibalik halaman (10 per halaman) di klien; jangan menambah permintaan server per halaman.
- Cetak struk otomatis adalah setelan per perangkat (`ca_printer` di localStorage). Keranjang harus dikosongkan sebelum mencetak agar kegagalan printer tidak mengulang transaksi.
- **Laporan (Kantin > Laporan):** satu permintaan `kantinReport` per periode (`Dari`/`Sampai`, maks. 366 hari) dengan cache frontend 15 detik (`RTTL.kantinReport`, terdaftar di `READS`). Jangan memecahnya menjadi beberapa permintaan per jenis laporan.
- Server hanya mengirim data periode: foto/barcode produk tidak ikut, stok awal/akhir dan saldo awal dihitung sebagai agregat di server, piutang/hutang hanya yang belum lunas atau dicatat pada periode. Semua pembacaan sheet lewat `read_()` (satu kali per sheet).
- Berpindah jenis laporan dihitung di klien dari data yang sudah dimuat (tanpa permintaan server). Tombol "Muat ulang" mengosongkan `RC` lalu mengambil data baru; perubahan periode hanya memuat sesuai aksi pengguna (tanpa polling).
- Pratinjau tabel dibatasi 300-400 baris per bagian; PDF, cetak, dan Excel memuat seluruh baris. PDF dibuat dengan jsPDF yang sudah ada (tanpa plugin), ExcelJS dimuat hanya saat tombol Excel ditekan (cadangan: SheetJS).
- HPP/laba pada laporan adalah **estimasi** (memakai harga beli produk saat laporan dibuat, karena harga beli saat transaksi tidak disimpan di `KantinPenjualan`).

- **Pajak:** `kTaxCalc` (index.html) dan `kTaxCalc_` (Kantin.gs) HARUS identik; ubah keduanya sekaligus lalu uji kesamaannya dengan banyak kasus acak. Server selalu menghitung ulang; POS mengirim `TotalTampil` dan transaksi ditolak bila berbeda. Pembulatan diskon dan pajak per baris memakai cara kumulatif agar tidak ada nilai negatif.
- Pajak transaksi disimpan di baris penjualan (`Pajak`, `DPP`, `PajakNama`, `PajakInklusif`, `PajakRincian`) sehingga perubahan tarif tidak mengubah transaksi lama. `Total` = yang dibayar pembeli (termasuk pajak); penjualan bersih/laba memakai `Total - Pajak`. Setoran dicatat di `KantinKeuangan` kategori `Setor Pajak` dan tidak dihitung sebagai biaya.
- Konfigurasi pajak disimpan sebagai satu baris `KantinPajak` di sheet Settings. Tab Pajak memakai satu `kantinData` (`Tab: 'pajak'`) dengan rekap bulanan yang dihitung di server.
- Pegawai toko (`KantinPegawai`, `KantinAbsensi`) dimuat lewat satu `kantinData` (`Tab: 'pegawai'`); jam absen selalu dari server, koreksi hanya admin.
- Kontak tambahan siswa/pegawai disimpan di `KantinPembeli` (satu baris per `Username`). WhatsApp kosong berarti mengikuti No. HP pengguna; nomor HP pegawai hanya dikirim ke admin.
- **Urutan menu & sub-tab** disimpan per akun di sheet `UserPrefs`, dikirim bersama respons `login` (tanpa request tambahan), dan hanya ditulis saat pengguna menekan Simpan. Menerapkan urutan cukup memindahkan tombol di DOM, tanpa menggambar ulang panel. Tab baru yang ditambahkan kelak otomatis berada di akhir.
- Mengganti cara pilih pada toolbar periode Laporan tidak boleh memuat data; hanya memilih nilai yang memuat.
- Kolom baru pada sheet selalu ditambahkan **di akhir** `SCHEMA` agar data lama tidak bergeser.

- POS: etalase 60% dan keranjang 40%, tinggi keduanya sama dan diatur `posFit()` mengikuti layar. Isi yang panjang digulir di dalam panel.
- Keranjang yang ditunda disimpan di `localStorage` perangkat kasir (`ca_kantin_hold`), tanpa request server dan tanpa memesan stok. Harga/stok diperiksa lagi saat dibuka; entri baru dihapus setelah pembayaran berhasil. Entri yang hasil kirimnya tidak pasti diberi tanda dan harus dikonfirmasi sebelum dibuka lagi.
- Sertifikat berukuran 1247×812 (rasio F4 landscape). Hiasan harus berupa elemen nyata (SVG pada `<img>`), bukan `::before/::after`, karena pseudo-element tidak ikut saat diunduh. Huruf khusus sertifikat dimuat hanya saat fitur dipakai.

## Keuangan
- Termin dihitung dari **nominal**: tiap termin `ceil(harga / jumlah termin)` (`terminState_`). `Dibuka` menentukan akses pertemuan, `Dibayar` = termin yang lunas, `Sisa`/`Kurang`/`Tagihan` untuk pengingat. Paket tanpa harga (0) tetap dihitung per transaksi.
- Harga dikunci per pendaftaran (`Langganan.Harga`); saat harga paket diubah, pendaftaran lama yang belum terkunci diisi harga sebelumnya.
- Posisi termin/sisa pada tiap pembayaran dihitung saat dibaca (`payRows_`, urut tanggal lalu baris), sehingga tetap benar setelah ubah/hapus. Jangan menyimpannya sebagai angka tetap.
- Pajak pembayaran: `payTax`/`payRate` (index.html) dan `payTax_`/`payRate_` (Code.gs) HARUS identik. Tarif disimpan di baris pembayaran; perubahan pengaturan tidak mengubah transaksi lama. `Jumlah` = uang diterima; yang mengurangi tagihan = `payPokok_`. Konfigurasi satu baris `KeuPajak` di Settings, kategori di `KeuKategori`.
- Ubah/hapus pembayaran, ubah/hapus pemasukan-pengeluaran, seluruh aksi gaji, pengaturan pajak, dan hapus kategori hanya admin (diperiksa di server). Selain admin tidak menerima nama/rincian gaji.
- Satu permintaan `keuangan` untuk semua sub-tab (cache 15 dtk) dan satu `keuReport` per periode (maks. 366 hari). Pindah jenis laporan tidak memanggil server. Laporan Keuangan dan Kantin memakai kerangka yang sama (`lapShell`, `kRepHtml`, `kRepPdf`, `kRepXlsx`).
- Saldo = pembayaran siswa + pemasukan - pengeluaran - gaji - pengambilan dana. Gaji hanya disimpan di `KeuGaji` (tidak digandakan ke `KeuTransaksi`).
- Di laporan, kategori yang mengandung kata "modal" atau "penarikan", serta pengambilan dana, tidak dihitung sebagai hasil usaha.
- Aksi keuangan baru harus berawalan `keu` atau masuk daftar `setup_()` di `route_`, dan aksi baca didaftarkan di `READS`.

## Verifikasi sebelum rilis
1. Periksa sintaks JavaScript `Code.gs`, `Kantin.gs`, dan `index.html`.
2. Uji buka/tutup tab Catatan Guru, Catatan Siswa, LMS, dan Kantin berulang; kunjungan kedua dalam TTL tidak boleh mengirim request baca baru.
3. Uji tambah/edit/hapus; data harus langsung diperbarui dan tidak membaca cache lama.
4. Uji navigasi cepat antartab untuk memastikan respons lama tidak menimpa tab baru.
5. Uji desktop dan ponsel pada koneksi lambat.
6. Uji loading logo saat login dan pindah tab; harus smooth tanpa lag.
7. Uji transaksi kantin: stok tidak negatif atau berkurang dua kali, kembalian tunai, nominal Transfer/QRIS harus pas, Belum Bayar hanya pembeli terdaftar, pembelian menambah stok, dan cicilan memperbarui sisa serta jumlah dibayar.
8. Uji barcode pabrik/aplikasi, label thermal tinggi 39–45 mm, label A4/F4, dan struk pada printer yang benar-benar digunakan.
9. Uji scan barcode pada perangkat nyata (ponsel Android/iOS dan laptop): barcode pabrik EAN-13, label buatan aplikasi (Code128), dan alat scan USB di kolom pencarian.
10. Uji ulang tombol Batal pada modal bertumpuk (form produk > scan/kamera) dan pastikan kamera mati setelah modal ditutup.
11. Uji tab Laporan: ganti periode dan jenis laporan; pindah jenis laporan tidak boleh mengirim request baru, kunjungan kedua dalam 15 detik tidak boleh mengirim request baca baru, dan tombol Muat ulang harus mengambil data terbaru.
12. Uji Unduh PDF, Cetak (F4), dan Unduh Excel untuk setiap jenis laporan pada periode kosong, periode berisi, dan periode panjang (banyak halaman); cocokkan total laporan dengan tab Penjualan/Keuangan/Piutang/Hutang.
13. Jangan mengklaim lebih cepat atau transaksi atomik tanpa pengujian pada deployment yang sebenarnya.
14. Uji pajak: otomatis dan manual, harga belum/sudah termasuk pajak, produk tarif khusus/bebas, struk, serta cocokkan total Laporan Pajak dengan Penjualan.
15. Uji absen pegawai (masuk ganda ditolak, koreksi admin) dan urutan menu/sub-tab setelah keluar lalu masuk lagi.
16. Uji simpan/lanjutkan keranjang di POS, dan unduh PDF keenam desain sertifikat dengan satu dan dua penanda tangan di perangkat yang benar-benar dipakai.
17. Uji Keuangan: bayar kurang lalu lunasi (pengingat & struk), ubah/hapus sebagai admin, pastikan pegawai tidak melihat tombolnya, pajak termasuk/ditambahkan, gaji, saldo, dan cocokkan laporan dengan tab terkait di perangkat serta printer yang benar-benar dipakai.
