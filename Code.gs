/**
 * Castle Academy - Group Learning Management System
 * Backend Google Apps Script (database = Google Sheets yang terikat dengan script ini)
 * Login awal: Admin / 123456 (segera ganti setelah login pertama)
 */
const SALT = 'castle-academy-v1';
const TZ = 'Asia/Jakarta';
const DEF = { AkunGoogle: 'entrydatamedia@gmail.com', SpreadsheetID: '13-kdcOqVavIJZfi8DJ4HsP97EbZO_O6s7hdPJz3gvxg',
  FolderID: '1ZFKW4lxEynAVUSNVZ8N_Ymy5Y01t2eVn', Nama: 'Castle Academy', WarnaUtama: '#2a7de1', WarnaAksen: '#f4b740',
  WarnaLatar: '#f0f6fd', HargaPaket: '100000', PertemuanUjian: '8', KKM: '70', GithubURL: 'https://entrydata.github.io/castle-academy/', Logo: '', LogoCenter: '', LogoRect: '', LogoSlogan: '', TurnURL: 'free.expressturn.com:3478', TurnUser: '000000002109484340', TurnPass: 'Rk1AftbcduEpkBBFAuUb+7M6KRU=' };
const TEMA_ = ['def', 'mil', 'f100', 'adv', 'clr', 'game', 'spc', 'ocn', 'cnd', 'kls', 'btk', 'sak', 'aur', 'snt', 'lab'];
const PTS = { pg: 1, js: 2, es: 4 };   // poin maksimum: Pilihan Ganda 1, Jawaban Singkat 2, Essay 4
const OPT = { js: [0, 0.5, 1, 1.5, 2], es: [0, 1, 2, 3, 4] }; // bobot koreksi
const SCHEMA = {
  Users:     ['Username', 'PasswordHash', 'Role', 'Nama', 'Jenjang', 'Program', 'Kelompok', 'Mulai', 'Paket', 'HP', 'HPOrtu', 'Gmail', 'Alamat', 'KodeReg'],
  Asesmen:   ['Kode', 'Nama', 'Program', 'Jenjang', 'Kelompok', 'Periode', 'Durasi', 'Tipe', 'Status', 'Dibuat', 'JSON', 'Tema', 'Kamera'],
  Sesi:      ['Key', 'Kode', 'Username', 'Nama', 'Mulai', 'Status'],
  Paket:     ['ID', 'Program', 'Jenjang', 'Nama', 'Pertemuan', 'PerBulan', 'Harga', 'Materi', 'Deskripsi', 'Pemahaman', 'Keterampilan', 'Status'],
  Langganan: ['ID', 'Username', 'PaketID', 'Mulai', 'Status'],
  Pengambilan: ['ID', 'Tanggal', 'Bulan', 'Metode', 'Jumlah', 'Keterangan', 'Penginput'],
  Foto:      ['Username', 'Data'],
  Progress:  ['ID', 'Username', 'Pertemuan', 'Tanggal', 'Kehadiran', 'Catatan', 'Tutor', 'Paket', 'LID', 'Nilai', 'Metode', 'LmsID'],
  Results:   ['ID', 'Username', 'Nama', 'Program', 'Tanggal', 'Skor', 'Kategori', 'Benar', 'Total', 'Paket', 'Kode', 'Judul', 'Poin', 'Max', 'Pending', 'Jawaban', 'Koreksi', 'Alasan'],
  Payments:  ['ID', 'Username', 'Nama', 'Paket', 'Tanggal', 'Jumlah', 'Metode', 'Status', 'Catatan', 'LID', 'PaketNama', 'Termin', 'Penginput'],
  Kelas:     ['ID', 'Nama', 'PaketID', 'Kelompok', 'Deskripsi', 'Pengajar', 'Status', 'Dibuat'],
  LMS:       ['ID', 'KelasID', 'Tipe', 'Judul', 'Isi', 'Files', 'Links', 'Dibuat', 'Tenggat', 'Penulis', 'Kode', 'Maks', 'Catat', 'GuruOnly', 'Pertemuan', 'Urutan', 'Lembar', 'Canvas'],
  LmsPertemuan: ['Key', 'KelasID', 'Pertemuan', 'Visible', 'Locked', 'Executed', 'Room'],
  MeetingBookmarks: ['Key', 'KelasID', 'Username', 'Pertemuan', 'Waktu'],
  LmsSub:    ['Key', 'PostID', 'Username', 'Nama', 'Status', 'Teks', 'Files', 'Waktu', 'Nilai', 'Komentar', 'Dicatat', 'Pertemuan', 'Canvas'],
  NoteFolders: ['ID', 'Username', 'Nama', 'Urutan', 'Dibuat'],
  Notes:     ['ID', 'Username', 'FolderID', 'Judul', 'Isi', 'Dibuat', 'Diubah'],
  Comments:  ['ID', 'PostID', 'Username', 'Nama', 'Role', 'Isi', 'Waktu'],
  ClassRead: ['Key', 'KelasID', 'Username', 'Waktu'],
  Bookmarks: ['Key', 'KelasID', 'Username', 'PostID', 'Waktu'],
  RekapTugas: ['Key', 'KelasID', 'Username', 'LID', 'Rata', 'Dinilai', 'Total', 'Detail', 'Waktu'],
  Settings:  ['Key', 'Value']
};

function doGet(e) {
  setup_();
  const gh = settings_().GithubURL;
  if (gh && !(e && e.parameter && e.parameter.mode === 'gas')) {
    // Alihkan ke halaman GitHub dan bawa alamat API, sehingga siswa/pegawai tidak perlu menempel alamat server.
    const to = gh + (gh.indexOf('?') < 0 ? '?' : '&') + 'api=' + encodeURIComponent(ScriptApp.getService().getUrl());
    const html = '<!DOCTYPE html><html><head><base target="_top"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>'
      + '<body style="font-family:sans-serif;text-align:center;padding:48px 20px;color:#12315c"><h2>Castle Academy</h2><p>Membuka aplikasi...</p>'
      + '<p><a href="' + to + '" target="_top" style="display:inline-block;padding:12px 22px;border-radius:10px;background:#2a7de1;color:#fff;text-decoration:none;font-weight:bold">Buka aplikasi</a></p>'
      + '<p style="color:#5d7394;font-size:13px">Tambahkan ?mode=gas pada alamat ini untuk membuka versi Apps Script.</p>'
      + '<script>setTimeout(function(){try{window.top.location.href=' + JSON.stringify(to) + '}catch(x){}},300)</script></body></html>';
    return HtmlService.createHtmlOutput(html).setTitle('Castle Academy').addMetaTag('viewport', 'width=device-width, initial-scale=1');
  }
  return HtmlService.createHtmlOutputFromFile('index')
    .setTitle('Castle Academy')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

/* ---------- Setup & helper data ---------- */
function ss_() { return SpreadsheetApp.openById(PropertiesService.getScriptProperties().getProperty('SS_ID') || DEF.SpreadsheetID); }

const SIG_ = JSON.stringify(SCHEMA).split('').reduce((a, ch) => (a * 31 + ch.charCodeAt(0)) | 0, 7);
const TIME_COLS_ = { LmsSub: ['Waktu'], Comments: ['Waktu'], ClassRead: ['Waktu'], Bookmarks: ['Waktu'], MeetingBookmarks: ['Waktu'], Notes: ['Dibuat', 'Diubah'], NoteFolders: ['Dibuat'], RekapTugas: ['Waktu'] };
function setup_() {
  const cc = CacheService.getScriptCache(), flag = 'su_time2_' + SIG_ + '_' + ssId_();
  if (cc.get(flag)) return;
  const s = ss_();
  Object.keys(SCHEMA).forEach(n => {
    let sh = s.getSheetByName(n);
    if (sh) {
      if (sh.getLastColumn() < SCHEMA[n].length) sh.getRange(1, 1, 1, SCHEMA[n].length).setValues([SCHEMA[n]]).setFontWeight('bold').setBackground('#17224d').setFontColor('#ffffff');
    } else {
      sh = s.insertSheet(n);
      sh.appendRow(SCHEMA[n]);
      sh.setFrozenRows(1);
      sh.getRange(1, 1, 1, SCHEMA[n].length).setFontWeight('bold').setBackground('#17224d').setFontColor('#ffffff');
      if (n === 'Users') { sh.getRange('A:A').setNumberFormat('@'); sh.getRange('J:K').setNumberFormat('@'); }
      if (n === 'Pengambilan') sh.getRange('C:C').setNumberFormat('@');
      if (n === 'Foto') sh.getRange('A:A').setNumberFormat('@');
      if (n === 'LmsSub' || n === 'RekapTugas') sh.getRange('A:C').setNumberFormat('@');
    }
    (TIME_COLS_[n] || []).forEach(key => {
      const col = SCHEMA[n].indexOf(key) + 1, count = sh.getLastRow() - 1;
      const range = count > 0 ? sh.getRange(2, col, count, 1) : null;
      const values = range ? range.getValues() : [], formulas = range ? range.getFormulas() : [];
      sh.getRange(1, col, sh.getMaxRows(), 1).setNumberFormat('@');
      values.forEach((r, i) => {
        if (r[0] instanceof Date && !formulas[i][0]) sh.getRange(i + 2, col).setValue(Utilities.formatDate(r[0], TZ, 'yyyy-MM-dd HH:mm:ss.SSS'));
      });
      inval_(n);
    });
  });
  const u = s.getSheetByName('Users');
  if (u.getLastRow() < 2) u.appendRow(['Admin', hash_('123456'), 'admin', 'Administrator', '', '', '', '', 1]);
  const st = s.getSheetByName('Settings');
  seedSettings_();
  cc.put(flag, '1', 600);
}

function hash_(p) {
  return Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, SALT + p)
    .map(b => ('0' + (b & 255).toString(16)).slice(-2)).join('');
}

const MEMO_ = {};
let SSID_ = null;
function ssId_() { return SSID_ || (SSID_ = PropertiesService.getScriptProperties().getProperty('SS_ID') || DEF.SpreadsheetID); }
function inval_(n) { delete MEMO_[n]; try { CacheService.getScriptCache().remove('sh_' + ssId_() + '_' + n); } catch (e) {} }

// Membaca sheet dengan 2 lapis cache: memori (selama satu permintaan) dan CacheService (60 detik, dihapus saat ada penulisan).
function read_(name) {
  let rows = MEMO_[name];
  if (!rows) {
    const c = CacheService.getScriptCache(), k = 'sh_' + ssId_() + '_' + name, j = c.get(k);
    if (j) rows = JSON.parse(j);
    else {
      const v = ss_().getSheetByName(name).getDataRange().getValues(), h = v.shift();
      rows = v.map((r, i) => {
        const o = { _row: i + 2 };
        h.forEach((key, x) => o[key] = r[x] instanceof Date ? Utilities.formatDate(r[x], TZ, (TIME_COLS_[name] || []).indexOf(key) >= 0 ? 'yyyy-MM-dd HH:mm:ss.SSS' : 'yyyy-MM-dd') : r[x]);
        return o;
      });
      const s = JSON.stringify(rows);
      if (s.length < 90000) { try { c.put(k, s, 60); } catch (e) {} }
    }
    MEMO_[name] = rows;
  }
  return rows.map(o => Object.assign({}, o));
}

function write_(name, row, obj) {
  const sh = ss_().getSheetByName(name), cols = SCHEMA[name];
  const vals = cols.map(k => {
    const v = obj[k] === undefined ? '' : obj[k];
    return ['NoteFolders', 'Notes', 'Comments'].indexOf(name) >= 0 && typeof v === 'string' && /^\s*[=+\-@]/.test(v) ? "'" + v : v;
  });
  if (row) sh.getRange(row, 1, 1, cols.length).setValues([vals]); else sh.appendRow(vals);
  inval_(name);
}

const del_ = (name, row) => { ss_().getSheetByName(name).deleteRow(row); inval_(name); };
const today_ = () => Utilities.formatDate(new Date(), TZ, 'yyyy-MM-dd');
const pub_ = u => ({ Username: String(u.Username), Role: u.Role, Nama: u.Nama, Jenjang: u.Jenjang, Program: u.Program, Kelompok: u.Kelompok, Mulai: u.Mulai, Paket: Number(u.Paket) || 1, HP: u.HP, HPOrtu: u.HPOrtu, Gmail: u.Gmail, Alamat: u.Alamat, KodeReg: u.KodeReg });

function kategori_(s) {
  return s >= 90 ? 'Excellent' : s >= 80 ? 'Very Good' : s >= 70 ? 'Good' : s >= 60 ? 'Developing' : 'Needs Improvement';
}

/* ---------- Autentikasi ---------- */
function login(username, password) {
  try {
    setup_();
    const u = read_('Users').find(x => String(x.Username).toLowerCase() === String(username || '').trim().toLowerCase());
    if (!u || u.PasswordHash !== hash_(String(password || ''))) throw new Error('Username atau password salah.');
    const token = Utilities.getUuid();
    CacheService.getScriptCache().put(token, String(u.Username), 21600);
    return { ok: true, data: { token: token, user: pub_(u) } };
  } catch (e) { return { ok: false, error: e.message }; }
}

function session_(token) {
  const c = CacheService.getScriptCache(), un = token && c.get(token);
  if (!un) throw new Error('Sesi berakhir. Silakan login kembali.');
  const j = c.get('u_' + token);
  if (j) return JSON.parse(j);
  const u = read_('Users').find(x => String(x.Username) === un);
  if (!u) throw new Error('Sesi berakhir. Silakan login kembali.');
  const o = Object.assign({}, u, { PasswordHash: '' });
  c.put('u_' + token, JSON.stringify(o), 120);
  return o;
}

function logout(token) { CacheService.getScriptCache().removeAll([token, 'u_' + token]); return { ok: true }; }

/* ---------- API tunggal ---------- */
function api(action, token, p) {
  try { return { ok: true, data: route_(action, token, p || {}) }; }
  catch (e) { return { ok: false, error: e.message }; }
}

function route_(a, t, p) {
  const me = session_(t), admin = me.Role === 'admin', staff = me.Role !== 'siswa';
  const need = c => { if (!c) throw new Error('Akses ditolak.'); };
  switch (a) {
    case 'dashboard': return staff ? dashStaff_(admin) : dashStudent_(me);
    case 'users': need(staff); return usersX_().filter(u => admin || u.Role === 'siswa');
    case 'saveUser': need(staff); return saveUser_(p, admin);
    case 'delUser': {
      need(staff);
      const u = read_('Users').find(x => String(x.Username) === p.Username);
      if (!u) throw new Error('Pengguna tidak ditemukan.');
      if (!admin && u.Role !== 'siswa') throw new Error('Akses ditolak.');
      if (String(u.Username) === String(me.Username)) throw new Error('Anda tidak dapat menghapus akun sendiri.');
      del_('Users', u._row);
      const ft = read_('Foto').find(x => String(x.Username) === String(u.Username)); if (ft) del_('Foto', ft._row);
      return true;
    }
    case 'progress': {
      const un = staff ? p.Username : String(me.Username);
      return read_('Progress').filter(x => String(x.Username) === String(un) && (!p.LID || x.LID === p.LID))
        .map(x => Object.assign({}, x, { N: parse_(x.Nilai, {}) })).sort((a, b) => a.Pertemuan - b.Pertemuan);
    }
    case 'saveProgress': need(staff); return saveProg_(p, me);
    case 'results': {
      const r = read_('Results').filter(x => staff || String(x.Username) === String(me.Username));
      return r.sort((x, y) => String(y.Tanggal).localeCompare(String(x.Tanggal)));
    }
    case 'asesmen': need(staff); return asm_().map(a => { const o = Object.assign({}, a, { Jumlah: a.soal.length }); delete o.soal; return o; });
    case 'asesmenDetail': need(staff); return asm_().find(x => x.Kode === p.Kode) || null;
    case 'saveAsesmen': need(staff); return saveAsm_(p);
    case 'delAsesmen': { need(staff); const a = read_('Asesmen').find(x => x.Kode === p.Kode); if (a) del_('Asesmen', a._row); return true; }
    case 'pakets': need(staff); return pk_();
    case 'savePaket': need(staff); return savePaket_(p);
    case 'delPaket': {
      need(staff);
      if (read_('Langganan').some(l => l.PaketID === p.ID)) throw new Error('Paket sudah punya siswa terdaftar. Ubah statusnya menjadi Nonaktif.');
      const x = read_('Paket').find(r => r.ID === p.ID); if (x) del_('Paket', x._row); return true;
    }
    case 'langganan': need(staff); return lview_();
    case 'setLangganan': {
      need(staff);
      const l = read_('Langganan').find(x => x.ID === p.ID);
      if (!l) throw new Error('Data tidak ditemukan.');
      l.Status = p.Status === 'Aktif' ? 'Aktif' : 'Nonaktif'; write_('Langganan', l._row, l); return true;
    }
    case 'myAsesmen': need(!staff); return myAsm_(me);
    case 'examStart': need(!staff); return examStart_(me, p.kode);
    case 'examPing': need(!staff); return examPing_(me, p);
    case 'examSubmit': need(!staff); return examSubmit_(me, p);
    case 'monitor': need(staff); return monitor_(p.kode);
    case 'stopSiswa': need(staff); CacheService.getScriptCache().put('stop_' + p.kode + '_' + p.Username, '1', 21600); return true;
    case 'resetSiswa': need(staff); return resetSiswa_(p);
    case 'hasil': need(staff); return hasil_(p.kode);
    case 'nilai': need(staff); return nilai_(p);
    case 'lapProgram': need(staff); return lapProgram_(p.pid, p.n);
    case 'foto': return fotoOf_(staff ? String(p.Username) : String(me.Username));
    case 'savePhoto': need(staff); return saveFoto_(p);
    case 'ice': return ice_();
    case 'rtcSend': return rtcSend_(me, staff, p);
    case 'rtcRecv': return rtcRecv_(me, staff, p);
    case 'keuangan': need(staff); return keu_();
    case 'savePayment': need(staff); return savePayment_(p, me);
    case 'saveWithdrawal': need(staff); return saveWd_(p, me);
    case 'delWithdrawal': { need(admin); const x = read_('Pengambilan').find(r => r.ID === p.ID); if (x) del_('Pengambilan', x._row); return true; }
    case 'report': return report_(staff ? p.Username : String(me.Username), p.LID);
    case 'settings': need(admin); return Object.assign(settings_(), { ApiURL: ScriptApp.getService().getUrl() });
    case 'noteFolders': return noteFolders_(me);
    case 'saveNoteFolder': return withLock_(() => saveNoteFolder_(p, me));
    case 'delNoteFolder': return withLock_(() => delNoteFolder_(p.ID, me));
    case 'notes': return notes_(p.FolderID, me);
    case 'saveNote': return withLock_(() => saveNote_(p, me));
    case 'delNote': return withLock_(() => delNote_(p.ID, me));
    case 'kelasList': return kelasList_(me, staff);
    case 'kelasView': return kelasView_(me, staff, p.ID);
    case 'kelasSubs': need(staff); return kelasSubs_(p.ID);
    case 'saveKelas': need(staff); return saveKelas_(p, me);
    case 'delKelas': need(admin); return withLock_(() => delKelas_(p.ID));
    case 'savePertemuan': need(staff); return withLock_(() => savePertemuan_(p));
    case 'movePost': need(staff); return withLock_(() => movePost_(p));
    case 'savePost': need(staff); return withLock_(() => savePost_(p, me));
    case 'delPost': need(staff); return withLock_(() => delPost_(p.ID));
    case 'comments': return comments_(p.PostID, me, staff);
    case 'saveComment': return withLock_(() => saveComment_(p, me, staff));
    case 'delComment': return withLock_(() => delComment_(p.ID, me, staff));
    case 'markClassRead': return withLock_(() => markClassRead_(p.ID, me, staff));
    case 'saveBookmark': return withLock_(() => saveBookmark_(p.ID, p.PostID, me, staff));
    case 'toggleMeetingBookmark': need(staff); return withLock_(() => toggleMeetingBookmark_(p, me, staff));
    case 'saveFile': return saveFile_(me, staff, p);
    case 'fileGet': return fileGet_(me, staff, p.ID, p.Act);
    case 'tesLms': need(admin); return tesLms_();
    case 'submitTugas': need(!staff); return withLock_(() => submit_(me, p));
    case 'nilaiTugas': need(staff); return gradeSub_(p);
    case 'lmsProgressData': need(staff); return catatLmsData_(p.ID);
    case 'saveLmsProgress': need(staff); return withLock_(() => saveCatatLmsNilai_(me, p));
    case 'saveCatatLms': need(staff); return withLock_(() => recordProg_(me, p));
    case 'rekapTugas': need(staff); return rekapTugas_(p.ID);
    case 'saveRekapTugas': need(staff); return withLock_(() => saveRekapTugas_(p));
    case 'tugasProg': return tugasProg_(me, staff, p);
    case 'saveSettings': need(admin); return saveSettings_(p);
    case 'zoomConfig': need(admin); return zoomConfigStatus_();
    case 'saveZoomConfig': need(admin); return withLock_(() => saveZoomConfig_(p));
    case 'testZoomConfig': need(admin); return testZoomConfig_();
    case 'createZoomMeeting': need(staff); return withLock_(() => createZoomMeeting_(p));
    case 'joinZoomMeeting': return joinZoomMeeting_(me, staff, p);
    case 'testConn': need(admin); return testConn_();
    case 'backup': need(admin); return backup_();
  }
  throw new Error('Aksi tidak dikenal.');
}


function saveUser_(p, admin) {
  const un = String(p.Username || '').trim();
  if (!un || !p.Nama) throw new Error('Username dan nama wajib diisi.');
  const role = admin ? p.Role : 'siswa';
  if (!['admin', 'pegawai', 'siswa'].includes(role)) throw new Error('Peran tidak valid.');
  const all = read_('Users');
  const ex = all.find(x => String(x.Username).toLowerCase() === un.toLowerCase());
  if (ex && !admin && ex.Role !== 'siswa') throw new Error('Akses ditolak.');
  if (!ex && !p.Password) throw new Error('Password wajib diisi untuk pengguna baru.');
  if (p.Password && String(p.Password).length < 6) throw new Error('Password minimal 6 karakter.');
  if (role === 'siswa' && !p.Jenjang) throw new Error('Siswa wajib memiliki jenjang.');
  if (p.Gmail && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(p.Gmail)) throw new Error('Format Gmail tidak valid.');
  if (p.KodeReg && all.some(x => x.KodeReg === p.KodeReg && String(x.Username).toLowerCase() !== un.toLowerCase())) throw new Error('Kode registrasi sudah dipakai siswa lain.');
  ss_().getSheetByName('Users').getRange('J:K').setNumberFormat('@');
  write_('Users', ex ? ex._row : 0, {
    Username: ex ? ex.Username : un, PasswordHash: p.Password ? hash_(p.Password) : ex.PasswordHash, Role: role,
    Nama: p.Nama, Jenjang: p.Jenjang, Program: p.Program, Kelompok: p.Kelompok, Mulai: p.Mulai, Paket: ex ? ex.Paket : 1,
    HP: p.HP, HPOrtu: p.HPOrtu, Gmail: p.Gmail, Alamat: p.Alamat,
    KodeReg: p.KodeReg || (ex && ex.KodeReg) || (role === 'siswa' ? 'CA-' + Utilities.getUuid().slice(0, 6).toUpperCase() : '')
  });
  return true;
}



/* ---------- Pengaturan ---------- */
function settings_() {
  const o = Object.assign({}, DEF);
  try { read_('Settings').forEach(r => { if (r.Key) o[r.Key] = String(r.Value); }); } catch (e) {}
  o.SpreadsheetID = PropertiesService.getScriptProperties().getProperty('SS_ID') || DEF.SpreadsheetID;
  return o;
}

function publicSettings() {
  try {
    setup_();
    const s = settings_();
    return { ok: true, data: { Nama: s.Nama, WarnaUtama: s.WarnaUtama, WarnaAksen: s.WarnaAksen, WarnaLatar: s.WarnaLatar, HargaPaket: s.HargaPaket, PertemuanUjian: s.PertemuanUjian, Logo: s.Logo || '', LogoCenter: s.LogoCenter || '', LogoRect: s.LogoRect || '', LogoSlogan: s.LogoSlogan || '' } };
  } catch (e) { return { ok: false, error: e.message }; }
}

const idFrom_ = s => { const m = String(s || '').match(/[-\w]{25,}/); return m ? m[0] : ''; };

function saveSettings_(p) {
  const v = Object.assign({}, p);
  v.SpreadsheetID = idFrom_(p.SpreadsheetID); v.FolderID = idFrom_(p.FolderID);
  ['WarnaUtama', 'WarnaAksen', 'WarnaLatar'].forEach(k => { if (!/^#[0-9a-f]{6}$/i.test(v[k])) throw new Error('Format warna harus #RRGGBB.'); });
  ['Logo', 'LogoCenter', 'LogoRect', 'LogoSlogan'].forEach(k => {
    v[k] = String(v[k] || '');
    if (v[k] && (v[k].length > 46000 || !/^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+\/=]+$/.test(v[k]))) throw new Error('Logo tidak valid atau terlalu besar. Pilih gambar lain.');
  });
  try { SpreadsheetApp.openById(v.SpreadsheetID); } catch (e) { throw new Error('Spreadsheet tidak valid atau tidak dapat diakses akun script.'); }
  if (v.FolderID) { try { DriveApp.getFolderById(v.FolderID); } catch (e) { throw new Error('Folder Drive tidak valid atau tidak dapat diakses.'); } }
  try { PropertiesService.getScriptProperties().deleteProperty('LMS_FOLDER'); } catch (e) {}
  PropertiesService.getScriptProperties().setProperty('SS_ID', v.SpreadsheetID);
  SSID_ = null; Object.keys(MEMO_).forEach(k => delete MEMO_[k]);
  PropertiesService.getScriptProperties().deleteProperty('SET_V');
  setup_();
  const cur = read_('Settings');
  Object.keys(DEF).forEach(k => { const r = cur.find(x => x.Key === k); write_('Settings', r ? r._row : 0, { Key: k, Value: String(v[k] == null ? '' : v[k]) }); });
  return true;
}

function testConn_() {
  const s = settings_();
  return { sheet: ss_().getName(), akun: Session.getEffectiveUser().getEmail(), folder: s.FolderID ? DriveApp.getFolderById(s.FolderID).getName() : '(belum diatur)' };
}

function backup_() {
  const s = settings_(), f = s.FolderID ? DriveApp.getFolderById(s.FolderID) : DriveApp.getRootFolder();
  return DriveApp.getFileById(ss_().getId()).makeCopy('Backup ' + s.Nama + ' ' + Utilities.formatDate(new Date(), TZ, 'yyyy-MM-dd HHmm'), f).getUrl();
}

/* ---------- Paket, pembayaran, ujian ---------- */
function paketOf_(un) { return Number((read_('Users').find(u => String(u.Username) === String(un)) || {}).Paket) || 1; }



/* ---------- CBT: Daftar Asesmen, ujian siswa, pantau, laporan ---------- */
function asm_() {
  return read_('Asesmen').filter(a => a.Kode).map(a => {
    let s = []; try { s = JSON.parse(a.JSON || '[]'); } catch (e) {}
    return Object.assign({}, a, { soal: s, JSON: undefined, Periode: /^PK/.test(String(a.Periode)) ? a.Periode : '' });
  });
}

function saveAsm_(p) {
  if (!p.Nama || (!p.Program && !p.Periode)) throw new Error('Nama dan program asesmen wajib diisi.');
  const soal = (p.soal || []).map(q => ({ t: q.t, q: String(q.q || '').trim(), o: q.t === 'pg' ? (q.o || []).map(x => String(x || '').trim()) : [], k: String(q.k || '').trim() }));
  if (!soal.length) throw new Error('Tambahkan minimal satu soal.');
  soal.forEach((q, i) => {
    if (!q.q) throw new Error('Soal ' + (i + 1) + ' belum diisi.');
    if (q.t === 'pg' && (q.o.filter(Boolean).length < 2 || !q.k || !'ABCD'.includes(q.k))) throw new Error('Soal ' + (i + 1) + ': isi minimal 2 opsi dan pilih kunci jawaban.');
  });
  const js = JSON.stringify(soal);
  if (js.length > 48000) throw new Error('Isi soal terlalu panjang. Pecah menjadi dua asesmen.');
  let prog = p.Program, jen = p.Jenjang;
  if (p.Periode) {
    const pk = pk_().find(x => x.ID === String(p.Periode).split(':')[0]);
    if (!pk) throw new Error('Periode paket tidak ditemukan.');
    prog = pk.Program; jen = pk.Jenjang;
  }
  const ex = p.Kode && read_('Asesmen').find(a => a.Kode === p.Kode);
  write_('Asesmen', ex ? ex._row : 0, { Kode: ex ? ex.Kode : 'A' + Utilities.getUuid().slice(0, 5).toUpperCase(), Nama: p.Nama, Program: prog,
    Jenjang: jen, Kelompok: p.Kelompok, Periode: p.Periode || '', Durasi: Number(p.Durasi) || 60, Tipe: p.Tipe === 'Final' ? 'Final' : 'Formatif',
    Status: p.Status === 'Draft' ? 'Draft' : 'Aktif', Dibuat: ex ? ex.Dibuat : today_(), JSON: js,
    Tema: TEMA_.indexOf(p.Tema) >= 0 ? p.Tema : 'def', Kamera: p.Kamera === 'Ya' ? 'Ya' : 'Tidak' });
  return true;
}


function examStart_(me, kode) {
  const a = myAsm_(me).find(x => x.Kode === kode);
  if (!a) throw new Error('Asesmen tidak tersedia untuk Anda.');
  if (a.state !== 'open') throw new Error(a.msg || 'Asesmen ini sudah dikerjakan.');
  const A = asm_().find(x => x.Kode === kode), k = Number(me.Paket) || 1;
  write_('Sesi', 0, { Key: kode + '|' + me.Username + '|' + k, Kode: kode, Username: String(me.Username), Nama: me.Nama, Mulai: new Date().toISOString(), Status: 'MULAI' });
  CacheService.getScriptCache().remove('stop_' + kode + '_' + me.Username);
  return { Nama: A.Nama, Durasi: A.Durasi, Tema: A.Tema || 'def', Kamera: A.Kamera || 'Tidak', soal: A.soal.map((q, i) => ({ i: i, t: q.t, q: q.q, o: q.o })) };
}

function examPing_(me, p) {
  const c = CacheService.getScriptCache(), k = p.kode + '_' + me.Username;
  c.put('ping_' + k, JSON.stringify({ d: Number(p.d) || 0, t: Date.now() }), 21600);
  return { stop: !!c.get('stop_' + k), rt: c.get('rts_' + p.kode + '_' + me.Username) || '' };
}

function score_(r, a) {
  const ans = JSON.parse(r.Jawaban || '[]'), kor = JSON.parse(r.Koreksi || '{}');
  let poin = 0, max = 0, pend = 0, benar = 0;
  a.soal.forEach((q, i) => {
    max += PTS[q.t] || 1;
    if (q.t === 'pg') { if (ans[i] && ans[i] === q.k) { poin++; benar++; } }
    else if (ans[i]) { if (kor[i] !== undefined) poin += Number(kor[i]); else pend++; }
  });
  r.Poin = poin; r.Max = max; r.Pending = pend; r.Benar = benar; r.Total = a.soal.length;
  r.Skor = max ? Math.round(poin / max * 100) : 0; r.Kategori = kategori_(r.Skor);
}

function examSubmit_(me, p) {
  const k = Number(me.Paket) || 1, kode = p.kode, un = String(me.Username);
  const s = read_('Sesi').find(x => x.Key === kode + '|' + un + '|' + k);
  if (!s) throw new Error('Sesi ujian tidak ditemukan.');
  const ex = read_('Results').find(r => String(r.Username) === un && r.Kode === kode && (Number(r.Paket) || 1) === k);
  if (ex) return ex;
  const a = asm_().find(x => x.Kode === kode), ans = p.answers || {};
  const clean = a.soal.map((q, i) => { const x = ans[i] == null ? '' : String(ans[i]); return q.t === 'js' ? x.slice(0, 60) : x.slice(0, 3000); });
  const r = { ID: Utilities.getUuid(), Username: un, Nama: me.Nama, Program: a.Program, Tanggal: today_(), Paket: k, Kode: kode, Judul: a.Nama, Jawaban: JSON.stringify(clean), Koreksi: '{}', Alasan: String(p.reason || '').slice(0, 60) };
  score_(r, a);
  write_('Results', 0, r);
  write_('Sesi', s._row, Object.assign({}, s, { Status: 'SELESAI' }));
  return r;
}

function monitor_(kode) {
  const a = asm_().find(x => x.Kode === kode);
  if (!a) throw new Error('Asesmen tidak ditemukan.');
  const ses = read_('Sesi').filter(s => s.Kode === kode), res = read_('Results').filter(r => r.Kode === kode);
  const ls = read_('Langganan').filter(x => x.Status !== 'Nonaktif').map(x => ({ Username: String(x.Username), PaketID: x.PaketID })), us = read_('Users').filter(u => u.Role === 'siswa' && elig_(u, a, ls));
  const pg = CacheService.getScriptCache().getAll(us.map(u => 'ping_' + kode + '_' + u.Username));
  return { Nama: a.Nama, total: a.soal.length, kamera: a.Kamera === 'Ya', list: us.map(u => {
    const un = String(u.Username), k = Number(u.Paket) || 1;
    const s = ses.find(x => x.Key === kode + '|' + un + '|' + k), r = res.find(x => String(x.Username) === un && (Number(x.Paket) || 1) === k);
    let g = null; try { g = JSON.parse(pg['ping_' + kode + '_' + un]); } catch (e) {}
    return { Username: un, Nama: u.Nama, Kelompok: u.Kelompok, status: r ? 'Selesai' : s ? 'Sedang ujian' : 'Belum mulai',
      d: r ? a.soal.length : (g ? g.d : 0), ago: g && !r ? Math.round((Date.now() - g.t) / 1000) : null, nilai: r ? r.Skor : null, pending: r ? r.Pending : 0, alasan: r ? r.Alasan : '' };
  }) };
}

function resetSiswa_(p) {
  const un = String(p.Username), k = paketOf_(un);
  const s = read_('Sesi').find(x => x.Key === p.kode + '|' + un + '|' + k); if (s) del_('Sesi', s._row);
  const r = read_('Results').find(x => String(x.Username) === un && x.Kode === p.kode && (Number(x.Paket) || 1) === k); if (r) del_('Results', r._row);
  CacheService.getScriptCache().removeAll(['ping_' + p.kode + '_' + un, 'stop_' + p.kode + '_' + un]);
  return true;
}

function hasil_(kode) {
  const a = asm_().find(x => x.Kode === kode);
  if (!a) throw new Error('Asesmen tidak ditemukan.');
  const kel = {}; read_('Users').forEach(u => kel[u.Username] = u.Kelompok);
  return { a: a, list: read_('Results').filter(r => r.Kode === kode).map(r => Object.assign({}, r, { Kelompok: kel[r.Username] || '' })) };
}

function nilai_(p) {
  const r = read_('Results').find(x => x.ID === p.ID), a = r && asm_().find(x => x.Kode === r.Kode);
  if (!a) throw new Error('Data hasil tidak ditemukan.');
  const q = a.soal[p.idx];
  if (!q || q.t === 'pg' || OPT[q.t].indexOf(Number(p.bobot)) < 0) throw new Error('Bobot nilai tidak valid.');
  const kor = JSON.parse(r.Koreksi || '{}'); kor[p.idx] = Number(p.bobot); r.Koreksi = JSON.stringify(kor);
  score_(r, a); write_('Results', r._row, r);
  return { Skor: r.Skor, Pending: r.Pending };
}

/* ---------- Program paket, langganan, progres, keuangan ---------- */
const parse_ = (s, d) => { try { return JSON.parse(s || ''); } catch (e) { return d; } };
const avg_ = a => a.length ? Math.round(a.reduce((s, x) => s + x, 0) / a.length * 10) / 10 : null;
const desc_ = (a, b) => String(b.Tanggal).localeCompare(String(a.Tanggal));

function pk_() {
  return read_('Paket').filter(x => x.ID).map(x => {
    const n = Number(x.Pertemuan) || 0, pb = Number(x.PerBulan) || 8;
    return Object.assign({}, x, { P: parse_(x.Pemahaman, []), K: parse_(x.Keterampilan, []), Pertemuan: n, PerBulan: pb, Harga: Number(x.Harga) || 0, Termin: Math.max(1, Math.ceil(n / pb)), PertemuanUjian: Number(x.PertemuanUjian) || 8, KKM: Number(x.KKM) || 70 });
  });
}

function savePaket_(p) {
  const nm = a => (a || []).map(x => String(x || '').trim()).filter(Boolean);
  const P = nm(p.P), K = nm(p.K), n = Number(p.Pertemuan), pb = Number(p.PerBulan) || 8, h = Number(p.Harga) || 0;
  const pu = Number(p.PertemuanUjian) || 8, kkm = Number(p.KKM) || 70;
  if (!String(p.Program || '').trim() || !p.Jenjang || !String(p.Nama || '').trim()) throw new Error('Nama program, jenjang, dan paket belajar wajib diisi.');
  if (!(n > 0) || !(pb > 0)) throw new Error('Jumlah pertemuan tidak valid.');
  if (h < 0) throw new Error('Harga paket tidak valid.');
  if (!(pu > 0 && pu <= n)) throw new Error('Pertemuan ujian harus antara 1 dan ' + n + '.');
  if (!(kkm > 0 && kkm <= 100)) throw new Error('KKM harus antara 1 dan 100.');
  if (P.length > 6 || K.length > 6) throw new Error('Maksimal 6 pemahaman materi dan 6 keterampilan.');
  const ex = p.ID && read_('Paket').find(x => x.ID === p.ID);
  write_('Paket', ex ? ex._row : 0, { ID: ex ? ex.ID : 'PK' + Utilities.getUuid().slice(0, 5).toUpperCase(), Program: String(p.Program).trim(), Jenjang: p.Jenjang,
    Nama: String(p.Nama).trim(), Pertemuan: n, PerBulan: pb, Harga: h, Materi: p.Materi, Deskripsi: p.Deskripsi, Pemahaman: JSON.stringify(P),
    Keterampilan: JSON.stringify(K), PertemuanUjian: pu, KKM: kkm, Status: p.Status === 'Nonaktif' ? 'Nonaktif' : 'Aktif' });
  return true;
}

// Paket yang diikuti siswa (langganan) beserta status pembayaran termin dan pertemuan
function lview_() {
  const pks = pk_(), us = read_('Users'), pay = read_('Payments'), prog = read_('Progress');
  return read_('Langganan').filter(l => l.ID).map(l => {
    const pk = pks.find(x => x.ID === l.PaketID) || { Nama: '(paket dihapus)', Program: '-', P: [], K: [], Pertemuan: 0, PerBulan: 8, Harga: 0, Termin: 1 };
    const u = us.find(x => String(x.Username) === String(l.Username)) || {};
    const pays = pay.filter(x => x.LID === l.ID), meet = prog.filter(x => x.LID === l.ID).length, paid = pays.length;
    const st = l.Status === 'Nonaktif' ? 'Nonaktif' : (pk.Pertemuan && meet >= pk.Pertemuan) ? 'Selesai' : (paid < pk.Termin && meet >= paid * pk.PerBulan) ? 'Menunggu termin' : 'Aktif';
    return { ID: l.ID, Username: String(l.Username), Nama: u.Nama || '-', Kelompok: u.Kelompok || '', Jenjang: u.Jenjang || '', KodeReg: u.KodeReg || '', PaketID: l.PaketID, PaketNama: pk.Nama, Program: pk.Program,
      P: pk.P, K: pk.K, Total: pk.Pertemuan, PerBulan: pk.PerBulan, Termin: pk.Termin, Harga: pk.Harga, Dibayar: paid, Terbayar: pays.reduce((s, x) => s + Number(x.Jumlah), 0),
      Tercatat: meet, Mulai: l.Mulai, Status: st, StatusDb: l.Status };
  });
}

function usersX_() {
  const ls = lview_().filter(x => x.Status === 'Aktif' || x.Status === 'Menunggu termin');
  return read_('Users').map(u => Object.assign(pub_(u), { PaketAktif: ls.filter(x => x.Username === String(u.Username)).map(x => x.Program + ' – ' + x.PaketNama) }));
}

function savePayment_(p, me) {
  const u = read_('Users').find(x => String(x.Username) === String(p.Username) && x.Role === 'siswa'), pk = pk_().find(x => x.ID === p.PaketID);
  if (!u || !pk) throw new Error('Pilih siswa dan paket belajar.');
  if (pk.Status === 'Nonaktif') throw new Error('Paket ini sedang nonaktif.');
  const jml = Number(p.Jumlah);
  if (!(jml > 0)) throw new Error('Jumlah pembayaran tidak valid.');
  const ex = read_('Langganan').find(x => String(x.Username) === String(u.Username) && x.PaketID === pk.ID && x.Status !== 'Nonaktif');
  const n = (ex ? read_('Payments').filter(x => x.LID === ex.ID).length : 0) + 1;
  if (n > pk.Termin) throw new Error('Seluruh termin paket ini sudah lunas.');
  const tgl = p.Tanggal || today_();
  const l = ex || { ID: 'L' + Utilities.getUuid().slice(0, 7).toUpperCase(), Username: String(u.Username), PaketID: pk.ID, Mulai: tgl, Status: 'Aktif' };
  if (!ex) {
    write_('Langganan', 0, l);
    if (!String(u.Program).includes(pk.Program)) { u.Program = u.Program ? u.Program + ', ' + pk.Program : pk.Program; write_('Users', u._row, u); }
  }
  write_('Payments', 0, { ID: Utilities.getUuid(), Username: String(u.Username), Nama: u.Nama, Paket: 1, Tanggal: tgl, Jumlah: jml, Metode: p.Metode, Status: 'Lunas',
    Catatan: p.Catatan, LID: l.ID, PaketNama: pk.Nama, Termin: n, Penginput: me.Nama });
  return { Termin: n, Total: pk.Termin };
}

function keu_() {
  const pay = read_('Payments').sort(desc_), wd = read_('Pengambilan').sort(desc_), saldo = { Tunai: 0, Transfer: 0 }, L = lview_();
  pay.forEach(x => saldo[x.Metode] = (saldo[x.Metode] || 0) + Number(x.Jumlah));
  wd.forEach(x => saldo[x.Metode] = (saldo[x.Metode] || 0) - Number(x.Jumlah));
  return { pay: pay.map(x => Object.assign({}, x, { N: (L.find(l => l.ID === x.LID) || {}).Termin || '' })), wd: wd, saldo: saldo };
}

function saveWd_(p, me) {
  const j = Number(p.Jumlah), m = p.Metode;
  if (!(j > 0)) throw new Error('Jumlah pengambilan tidak valid.');
  if (['Tunai', 'Transfer'].indexOf(m) < 0) throw new Error('Pilih metode pengambilan.');
  const sd = keu_().saldo[m] || 0;
  if (j > sd) throw new Error('Saldo ' + m + ' tidak cukup (tersedia Rp' + sd + ').');
  const t = p.Tanggal || today_();
  write_('Pengambilan', 0, { ID: Utilities.getUuid(), Tanggal: t, Bulan: t.slice(0, 7), Metode: m, Jumlah: j, Keterangan: p.Keterangan, Penginput: me.Nama });
  return true;
}

function saveProg_(p, me) {
  const l = lview_().find(x => x.ID === p.LID && x.Username === String(p.Username));
  if (!l) throw new Error('Pilih siswa dan paket aktif.');
  const n = Number(p.Pertemuan);
  if (!(n >= 1 && n <= l.Total)) throw new Error('Pertemuan harus antara 1 dan ' + l.Total + '.');
  const nil = { P: {}, K: {} };
  ['P', 'K'].forEach(g => l[g].forEach(nm => { const v = Number(((p.Nilai || {})[g] || {})[nm]); if (v) { if (!(v >= 1 && v <= 10)) throw new Error('Nilai harus skala 1-10.'); nil[g][nm] = v; } }));
  const ex = read_('Progress').find(x => x.LID === l.ID && Number(x.Pertemuan) === n);
  write_('Progress', ex ? ex._row : 0, { ID: ex ? ex.ID : Utilities.getUuid(), Username: l.Username, Pertemuan: n, Tanggal: p.Tanggal || today_(), Kehadiran: p.Kehadiran,
    Catatan: p.Catatan, Tutor: me.Nama, Paket: 1, LID: l.ID, Nilai: JSON.stringify(nil), Metode: ex ? ex.Metode : '', LmsID: ex ? ex.LmsID : '' });
  return true;
}

function report_(un, lid) {
  const ls = lview_().filter(x => x.Username === String(un) && x.Status !== 'Nonaktif'), l = ls.find(x => x.ID === lid) || ls[0];
  if (!l) throw new Error('Siswa belum memiliki paket aktif.');
  const u = read_('Users').find(x => String(x.Username) === String(un)) || {}, codes = asm_().filter(a => String(a.Periode).split(':')[0] === l.PaketID).map(a => a.Kode);
  return { l: l, ls: ls.map(x => ({ ID: x.ID, Program: x.Program, PaketNama: x.PaketNama })), pk: { P: l.P, K: l.K },
    user: { Nama: u.Nama, Jenjang: u.Jenjang, Kelompok: u.Kelompok, HPOrtu: u.HPOrtu },
    prog: read_('Progress').filter(x => x.LID === l.ID).map(x => Object.assign({}, x, { N: parse_(x.Nilai, {}) })).sort((a, b) => a.Pertemuan - b.Pertemuan),
    res: read_('Results').filter(r => String(r.Username) === String(un) && codes.indexOf(r.Kode) >= 0), tugas: tugasOf_(l.ID), lembaga: settings_().Nama, tgl: today_(), foto: fotoOf_(un) };
}


function dashStudent_(me) {
  const un = String(me.Username), ls = lview_().filter(x => x.Username === un && x.Status !== 'Nonaktif'), res = read_('Results').filter(x => String(x.Username) === un).sort(desc_);
  return { user: pub_(me), pakets: ls, pertemuan: ls.reduce((s, x) => s + x.Tercatat, 0), hadir: read_('Progress').filter(x => String(x.Username) === un && x.Kehadiran === 'Hadir').length,
    terakhir: res[0] || null, rata: res.length ? Math.round(res.reduce((s, r) => s + Number(r.Skor), 0) / res.length) : 0 };
}

/* ---------- Kelayakan asesmen & ujian siswa ---------- */
function elig_(u, a, ls) {
  if (a.Kelompok && a.Kelompok !== u.Kelompok) return false;
  if (a.Periode) return ls.some(l => l.Username === String(u.Username) && l.PaketID === String(a.Periode).split(':')[0]);
  return String(u.Program).includes(a.Program) && (!a.Jenjang || a.Jenjang === u.Jenjang);
}

function myAsm_(me) {
  const un = String(me.Username), k = Number(me.Paket) || 1, ls = lview_().filter(x => x.Username === un && x.Status !== 'Nonaktif');
  const ses = read_('Sesi').filter(s => String(s.Username) === un), pr = read_('Progress').filter(x => String(x.Username) === un);
  const res = read_('Results').filter(r => String(r.Username) === un && (Number(r.Paket) || 1) === k);
  const classes = kelasVisible_(me, false, ls), posts = read_('LMS'), allowedCodes = {};
  classes.forEach(k => { const meetings = meetings_(k); posts.filter(x => x.KelasID === k.ID && x.Tipe === 'asesmen' && postAllowed_(x, meetings)).forEach(x => allowedCodes[x.Kode] = true); });
  const linkedCodes = {};
  posts.filter(x => x.Tipe === 'asesmen').forEach(x => linkedCodes[x.Kode] = true);
  return asm_().filter(a => a.Status === 'Aktif' && elig_(me, a, ls) && (!linkedCodes[a.Kode] || allowedCodes[a.Kode])).map(a => {
    const o = { Kode: a.Kode, Nama: a.Nama, Program: a.Program, Tipe: a.Tipe, Durasi: a.Durasi, Jumlah: a.soal.length, state: 'open', msg: '', Tema: a.Tema || 'def', Kamera: a.Kamera || 'Tidak' };
    const s = ses.find(x => x.Key === a.Kode + '|' + un + '|' + k), r = res.find(x => x.Kode === a.Kode);
    if (r) { o.state = 'done'; o.nilai = r.Skor; o.pending = r.Pending; }
    else if (s) { o.state = 'locked'; o.msg = 'Sudah dimulai. Minta tutor mengizinkan ujian ulang bila perlu.'; }
    else if (a.Tipe === 'Final') {
      let need = 8, lid = null;
      if (a.Periode) { 
        const pp = String(a.Periode).split(':'), l = ls.find(x => x.PaketID === pp[0]); 
        if (l) { 
          const pkData = pk_().find(x => x.ID === l.PaketID);
          need = pkData ? pkData.PertemuanUjian : 8;
          need = Math.min(Number(pp[1]) > 0 ? Number(pp[1]) * l.PerBulan : l.Total, l.Total); 
          lid = l.ID; 
        } 
      }
      if (!pr.some(x => (!lid || x.LID === lid) && Number(x.Pertemuan) >= need)) { o.state = 'locked'; o.msg = 'Ujian akhir dibuka setelah pertemuan ke-' + need + ' dicatat oleh tutor.'; }
    }
    return o;
  });
}

/* ---------- Laporan periode program ---------- */
function lapProgram_(pid, n) {
  const pk = pk_().find(x => x.ID === pid);
  if (!pk) throw new Error('Paket tidak ditemukan.');
  n = Number(n) || 0;
  const lo = n > 0 ? (n - 1) * pk.PerBulan + 1 : 1, hi = n > 0 ? Math.min(n * pk.PerBulan, pk.Pertemuan) : pk.Pertemuan;
  const as = asm_().filter(a => { const pp = String(a.Periode).split(':'); return pp[0] === pid && (n === 0 || Number(pp[1]) === n); });
  const res = read_('Results'), prog = read_('Progress'), snaps = read_('RekapTugas');
  const rows = lview_().filter(l => l.PaketID === pid && l.Status !== 'Nonaktif').map(l => {
    const inr = prog.filter(x => x.LID === l.ID && Number(x.Pertemuan) >= lo && Number(x.Pertemuan) <= hi).sort((a, b) => a.Pertemuan - b.Pertemuan), nv = inr.map(x => parse_(x.Nilai, {}));
    // tiap aspek: nilai pertama (f), nilai terakhir (l), dan perubahan (d = l - f) pada periode yang dipilih
    const col = (g, names) => names.map(nm => {
      const v = nv.map(o => Number((o[g] || {})[nm])).filter(x => x > 0);
      return v.length ? { f: v[0], l: v[v.length - 1], d: v.length > 1 ? Math.round((v[v.length - 1] - v[0]) * 10) / 10 : null, n: v.length } : null;
    });
    const P = col('P', pk.P), K = col('K', pk.K), all = P.concat(K).filter(Boolean), tg = tugasOf_(l.ID, lo, hi, snaps);
    const nl = as.map(a => { const r = res.filter(x => String(x.Username) === l.Username && x.Kode === a.Kode).pop(); return r ? { n: Number(r.Skor), p: Number(r.Pending) } : null; });
    return { Username: l.Username, LID: l.ID, Nama: l.Nama, Kelompok: l.Kelompok, Hadir: inr.filter(x => x.Kehadiran === 'Hadir').length, Tercatat: inr.length, P: P, K: K, nilai: nl,
      kem: avg_(all.map(x => x.d).filter(d => d != null)), akhir: avg_(all.map(x => x.l)), avgAs: avg_(nl.filter(Boolean).map(x => x.n)),
      avgP: avg_(P.filter(Boolean).map(x => x.l)), avgK: avg_(K.filter(Boolean).map(x => x.l)), avgTg: tg ? tg.rata : null, tgN: tg ? tg.dinilai : 0, tgT: tg ? tg.total : 0 };
  });
  return { pk: pk, n: n, lo: lo, hi: hi, kkm: pk.KKM, asesmen: as.map(a => ({ Kode: a.Kode, Nama: a.Nama })), rows: rows };
}

/* ---------- Dashboard (grafik) ---------- */
function dashStaff_() {
  const us = read_('Users'), res = read_('Results'), ls = lview_().filter(l => l.Status !== 'Nonaktif'), pr = read_('Progress'), sc = {}, last = {};
  pr.forEach(x => {
    const n = parse_(x.Nilai, {}), v = [];
    ['P', 'K'].forEach(g => Object.keys(n[g] || {}).forEach(k => v.push(Number(n[g][k]))));
    if (v.length) { const b = String(x.Tanggal).slice(0, 7); (sc[b] = sc[b] || { p: [], a: [] }).p.push(avg_(v)); }
    const c = last[x.LID]; if (!c || Number(x.Pertemuan) > Number(c.Pertemuan)) last[x.LID] = x;
  });
  res.forEach(r => { const b = String(r.Tanggal).slice(0, 7); (sc[b] = sc[b] || { p: [], a: [] }).a.push(Number(r.Skor)); });
  const sb = {}; ls.filter(l => l.Status !== 'Selesai').forEach(l => { const k = (l.Jenjang || '-') + ' • ' + l.Program; sb[k] = (sb[k] || 0) + 1; });
  const byL = {};
  pr.forEach(x => { (byL[x.LID] = byL[x.LID] || []).push(x); });
  Object.keys(byL).forEach(k => byL[k].sort((a, b) => Number(a.Pertemuan) - Number(b.Pertemuan)));
  const firstOf = (lid, g, a) => { const rs = byL[lid] || []; for (let i = 0; i < rs.length; i++) { const v = Number((parse_(rs[i].Nilai, {})[g] || {})[a]); if (v > 0) return v; } return null; };
  const radar = ls.filter(l => last[l.ID]).map(l => {
    const x = last[l.ID], n = parse_(x.Nilai, {}), items = [];
    l.P.forEach(a => { if (n.P && n.P[a]) items.push({ n: a, v: n.P[a], f: firstOf(l.ID, 'P', a) }); });
    l.K.forEach(a => { if (n.K && n.K[a]) items.push({ n: a, v: n.K[a], f: firstOf(l.ID, 'K', a) }); });
    return { Username: l.Username, Nama: l.Nama, Jenjang: l.Jenjang, Kelompok: l.Kelompok, Paket: l.PaketNama, Pertemuan: x.Pertemuan, Tanggal: x.Tanggal, items: items };
  }).filter(x => x.items.length >= 3).sort((a, b) => String(b.Tanggal).localeCompare(String(a.Tanggal))).slice(0, 12);
  return { siswa: us.filter(u => u.Role === 'siswa').length, soal: read_('Asesmen').length, ujian: res.length,
    rata: res.length ? Math.round(res.reduce((s, r) => s + Number(r.Skor), 0) / res.length) : 0,
    aktif: ls.filter(l => l.Status !== 'Selesai').length, menunggu: ls.filter(l => l.Status === 'Menunggu termin').length,
    hampir: ls.filter(l => l.Status === 'Menunggu termin' || (l.Status === 'Aktif' && l.Total && l.Tercatat >= l.Total - 2)),
    terbaru: res.sort(desc_).slice(0, 5),
    bulanan: Object.keys(sc).sort().slice(-12).map(b => ({ b: b, prog: avg_(sc[b].p), as: avg_(sc[b].a) })),
    sebaran: Object.keys(sb).map(k => ({ label: k, n: sb[k] })).sort((a, b) => b.n - a.n), radar: radar };
}

/* ---------- Video langsung (WebRTC): Apps Script hanya meneruskan pesan penyambungan ---------- */
function ice_() {
  const s = settings_(), o = [{ urls: ['stun:stun.l.google.com:19302', 'stun:stun1.l.google.com:19302'] }];
  const hosts = String(s.TurnURL || '').split(/[\s,]+/).filter(Boolean);
  if (hosts.length && s.TurnUser && s.TurnPass) {
    const urls = [];
    hosts.forEach(h => { if (/^turns?:/i.test(h)) urls.push(h); else { urls.push('turn:' + h); urls.push('turn:' + h + '?transport=tcp'); } });
    o.push({ urls: urls, username: s.TurnUser, credential: s.TurnPass });
  }
  return o;
}

const rid_ = s => /^[A-Za-z0-9]{4,24}$/.test(String(s || ''));

function rtcSend_(me, staff, p) {
  const kode = String(p.kode), un = staff ? String(p.Username) : String(me.Username), sid = String(p.sid || ''), msgs = p.msgs;
  if (!rid_(sid) || !Array.isArray(msgs) || !msgs.length) return 0;
  const c = CacheService.getScriptCache(), k = 'rm_' + (staff ? 'p2s' : 's2p') + '_' + kode + '_' + un + '_' + sid, kT = 'rts_' + kode + '_' + un;
  const arr = parse_(c.get(k), []);
  msgs.slice(0, 30).forEach(m => { if (m && typeof m.t === 'string' && arr.length < 150) arr.push({ t: m.t.slice(0, 2), d: m.d || null }); });
  const v = JSON.stringify(arr);
  if (v.length > 90000) return arr.length;
  c.put(k, v, 600);
  if (staff && msgs.some(m => m && m.t === 'o')) c.put(kT, sid, 180);
  if (staff && msgs.some(m => m && m.t === 'x') && c.get(kT) === sid) c.remove(kT);
  return arr.length;
}

function rtcRecv_(me, staff, p) {
  const kode = String(p.kode), un = staff ? String(p.Username) : String(me.Username), sid = String(p.sid || '');
  if (!rid_(sid)) return { m: [], n: 0 };
  const arr = parse_(CacheService.getScriptCache().get('rm_' + (staff ? 's2p' : 'p2s') + '_' + kode + '_' + un + '_' + sid), []);
  return { m: arr.slice(Math.max(0, Number(p.from) || 0)), n: arr.length };
}

/* ---------- API untuk halaman yang di-hosting di GitHub Pages ---------- */

/* ---------- Catatan pribadi ---------- */
function cleanRich_(v, max) {
  const s = String(v || '');
  if (s.length > max) throw new Error('Isi terlalu panjang (maksimal ' + max.toLocaleString('id-ID') + ' karakter).');
  const tags = /^(?:p|div|br|b|strong|i|em|u|s|strike|blockquote|pre|code|ul|ol|li|h1|h2|h3|h4|h5|h6|span|hr|a|table|thead|tbody|tfoot|tr|td|th)$/;
  const escapeAttr = value => value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const decodeAttr = value => value.replace(/&(?:amp|quot|apos|lt|gt|#(?:x[0-9a-f]+|[0-9]+));?/gi, entity => {
    const named = { amp: '&', quot: '"', apos: "'", lt: '<', gt: '>' };
    const key = entity.slice(1).replace(/;$/, '').toLowerCase();
    if (named[key]) return named[key];
    const n = key.charAt(0) === '#' ? parseInt(key.slice(key.charAt(1) === 'x' ? 2 : 1), key.charAt(1) === 'x' ? 16 : 10) : 0;
    return n > 0 && n <= 0x10ffff ? String.fromCodePoint(n) : '\ufffd';
  });
  return s.replace(/<!--[\s\S]*?(?:-->|$)|<(?:"[^"]*"|'[^']*'|[^'">])*>/g, raw => {
    const m = raw.match(/^<\s*(\/?)\s*([a-z0-9]+)(?=[\s/>])([\s\S]*)>$/i);
    if (!m || !tags.test(m[2].toLowerCase())) return '';
    const tag = m[2].toLowerCase();
    if (m[1]) return '</' + tag + '>';
    const values = {}, re = /([^\s"'<>\/=]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'`<>]+)))?/g;
    let a;
    while ((a = re.exec(m[3]))) {
      const key = a[1].toLowerCase();
      if (!Object.prototype.hasOwnProperty.call(values, key)) values[key] = decodeAttr(a[2] !== undefined ? a[2] : a[3] !== undefined ? a[3] : a[4] || '');
    }
    let attrs = '';
    if (tag === 'a' && values.href && /^https?:\/\/[^\s\u0000-\u001f\u007f"'<>\\]+$/i.test(values.href) && /^https?:\/\/[^/?#:@]+(?::[0-9]+)?(?:[/?#]|$)/i.test(values.href)) {
      attrs += ' href="' + escapeAttr(values.href) + '" rel="noopener noreferrer" target="_blank"';
    }
    const safe = [];
    String(values.style || '').split(';').forEach(d => {
      const part = d.match(/^\s*([a-z-]+)\s*:\s*([^;]+?)\s*$/i);
      if (!part) return;
      const key = part[1].toLowerCase(), val = part[2].toLowerCase().trim();
      if (key === 'background-color' && /^(?:#[0-9a-f]{3,4}|#[0-9a-f]{6}|#[0-9a-f]{8}|transparent|yellow|orange|red|green|blue|pink|white|black|rgb\(\s*(?:\d{1,3}\s*,\s*){2}\d{1,3}\s*\))$/.test(val)) safe.push(key + ':' + val);
      if (key === 'list-style-type' && /^(?:decimal|decimal-leading-zero|lower-alpha|upper-alpha|lower-latin|upper-latin|lower-roman|upper-roman|disc|circle|square|none)$/.test(val)) safe.push(key + ':' + val);
    });
    if (safe.length) attrs += ' style="' + safe.join(';') + '"';
    if (tag === 'td' || tag === 'th') ['colspan', 'rowspan'].forEach(key => {
      if (/^\d{1,2}$/.test(values[key] || '') && Number(values[key]) >= 1 && Number(values[key]) <= 20) attrs += ' ' + key + '="' + Number(values[key]) + '"';
    });
    return '<' + tag + attrs + '>';
  });
}

function noteFolders_(me) {
  const un = String(me.Username);
  return read_('NoteFolders').filter(x => String(x.Username) === un).map(x => ({ ID: x.ID, Nama: x.Nama }))
    .sort((a, b) => String(a.Nama).localeCompare(String(b.Nama)));
}

function saveNoteFolder_(p, me) {
  const un = String(me.Username), nm = String(p.Nama || '').trim();
  if (!nm) throw new Error('Nama folder wajib diisi.');
  if (nm.length > 100) throw new Error('Nama folder maksimal 100 karakter.');
  const ex = p.ID && read_('NoteFolders').find(x => x.ID === p.ID && String(x.Username) === un);
  if (p.ID && !ex) throw new Error('Folder tidak ditemukan.');
  if (read_('NoteFolders').some(x => String(x.Username) === un && String(x.Nama).toLowerCase() === nm.toLowerCase() && (!ex || x.ID !== ex.ID))) throw new Error('Nama folder sudah digunakan.');
  write_('NoteFolders', ex ? ex._row : 0, { ID: ex ? ex.ID : 'NF' + Utilities.getUuid(), Username: un, Nama: nm, Dibuat: ex ? ex.Dibuat : now_() });
  return true;
}

function delNoteFolder_(id, me) {
  const un = String(me.Username), f = read_('NoteFolders').find(x => x.ID === id && String(x.Username) === un);
  if (!f) throw new Error('Folder tidak ditemukan.');
  const ns = read_('Notes').filter(x => String(x.Username) === un && x.FolderID === f.ID);
  ns.forEach(x => { x.FolderID = ''; write_('Notes', x._row, x); });
  del_('NoteFolders', f._row);
  return true;
}

function noteOut_(x) {
  return { ID: x.ID, FolderID: x.FolderID || '', Title: x.Judul || '', Content: x.Isi || '', Dibuat: x.Dibuat, Diubah: x.Diubah };
}

function notes_(folderID, me) {
  const un = String(me.Username);
  if (folderID && !read_('NoteFolders').some(x => x.ID === folderID && String(x.Username) === un)) throw new Error('Folder tidak ditemukan.');
  return read_('Notes').filter(x => String(x.Username) === un && (!folderID || x.FolderID === folderID)).map(noteOut_)
    .sort((a, b) => String(b.Diubah).localeCompare(String(a.Diubah)));
}

function saveNote_(p, me) {
  const un = String(me.Username), fid = String(p.FolderID || ''), title = String(p.Title || '').trim();
  if (fid && !read_('NoteFolders').some(x => x.ID === fid && String(x.Username) === un)) throw new Error('Folder tidak ditemukan.');
  if (!title) throw new Error('Judul catatan wajib diisi.');
  if (title.length > 200) throw new Error('Judul maksimal 200 karakter.');
  const content = cleanRich_(p.Content, 45000), ex = p.ID && read_('Notes').find(x => x.ID === p.ID && String(x.Username) === un);
  if (p.ID && !ex) throw new Error('Catatan tidak ditemukan.');
  const id = ex ? ex.ID : 'NT' + Utilities.getUuid();
  write_('Notes', ex ? ex._row : 0, { ID: id, Username: un, FolderID: fid, Judul: title, Isi: content,
    Dibuat: ex ? ex.Dibuat : now_(), Diubah: now_() });
  return { ID: id };
}

function delNote_(id, me) {
  const x = read_('Notes').find(n => n.ID === id && String(n.Username) === String(me.Username));
  if (!x) throw new Error('Catatan tidak ditemukan.');
  del_('Notes', x._row); return true;
}

/* ---------- LMS: Grup Kelas ---------- */
const LMS_MIME = { pdf: 'application/pdf', doc: 'application/msword', docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  xls: 'application/vnd.ms-excel', xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', ppt: 'application/vnd.ms-powerpoint',
  pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation', txt: 'text/plain', csv: 'text/csv',
  jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', gif: 'image/gif', webp: 'image/webp',
  mp3: 'audio/mpeg', wav: 'audio/wav', m4a: 'audio/mp4', ogg: 'audio/ogg', aac: 'audio/aac', mp4: 'video/mp4', webm: 'video/webm', mov: 'video/quicktime', zip: 'application/zip' };
const LMS_MAXMB = { staff: 15, siswa: 10 };
// Jenis file yang bisa ditampilkan langsung di viewer LMS (PDF, Word .docx, Excel, gambar, suara, video, teks).
const LMS_VIEW = { pdf: 1, docx: 1, xls: 1, xlsx: 1, csv: 1, txt: 1, jpg: 1, jpeg: 1, png: 1, gif: 1, webp: 1, mp3: 1, wav: 1, m4a: 1, ogg: 1, aac: 1, mp4: 1, webm: 1, mov: 1 };
const extOf_ = n => (String(n).indexOf('.') >= 0 ? String(n).split('.').pop() : '').toLowerCase();
// Mode akses berkas: guru = disembunyikan dari siswa; lihat = viewer saja; unduh = tautan unduh saja; keduanya = viewer + unduh.
function modeOf_(mode, name) {
  const v = !!LMS_VIEW[extOf_(name)];
  if (mode === 'guru' || mode === 'unduh') return mode;
  if (mode === 'lihat' || mode === 'keduanya') return v ? mode : 'unduh';
  return v ? 'lihat' : 'unduh';
}
const HINT_IZIN = 'Izin Google Drive belum aktif untuk script ini. Buka Apps Script > Setelan project (ikon roda gigi) > centang "Tampilkan file manifes appsscript.json di editor", lalu pastikan oauthScopes memuat https://www.googleapis.com/auth/drive (lihat berkas appsscript.json yang disertakan). Setelah disimpan, jalankan fungsi otorisasiDrive dan klik Izinkan, lalu Deploy > Kelola deployment > ikon pensil > Versi baru > Deploy.';
const HINT_FOLDER = 'Folder Drive tidak dapat diakses akun script. Periksa "Folder utama Drive" di Pengaturan (akun script harus punya akses Editor ke folder itu), atau kosongkan isiannya agar file disimpan di My Drive.';
function drv_(step, fn) {
  try { return fn(); } catch (e) {
    const m = String((e && e.message) || e);
    if (/^Gagal /.test(m)) throw e;
    let hint = '';
    if (/Required permissions|auth\/drive|permission to call|izin yang diperlukan|tidak memiliki izin|not have permission to call/i.test(m)) hint = ' → ' + HINT_IZIN;
    else if (/Unexpected error|No item with the given ID|access|akses|tidak dapat diakses|not found|tidak ditemukan/i.test(m)) hint = ' → ' + HINT_FOLDER;
    throw new Error('Gagal ' + step + ': ' + m.slice(0, 200) + hint);
  }
}
const now_ = () => Utilities.formatDate(new Date(), TZ, 'yyyy-MM-dd HH:mm:ss.SSS');

function withLock_(fn) {
  const lk = LockService.getScriptLock();
  lk.waitLock(15000);
  try { return fn(); } finally { lk.releaseLock(); }
}

const cleanName_ = (v, fb) => String(v || '').replace(/[\\\/:*?"<>|\r\n\t]+/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 80) || (fb || 'Tanpa nama');
function subFolder_(parent, name, fb) {
  const nm = cleanName_(name, fb), it = parent.getFoldersByName(nm);
  return it.hasNext() ? it.next() : parent.createFolder(nm);
}
// Folder utama (Pengaturan) bila bisa diakses; jika tidak, My Drive akun script.
function lmsBase_() {
  const st = settings_();
  let root = null;
  if (st.FolderID) { try { root = DriveApp.getFolderById(st.FolderID); } catch (e) { root = null; } }
  return root || drv_('membuka My Drive', () => DriveApp.getRootFolder());
}
// Dokumen File LMS > Nama Grup Kelas > Nama Materi (> subfolder opsional, mis. Pengumpulan Siswa > Nama Siswa)
function lmsFolder_(kelasNama, itemNama, subs) {
  const base = lmsBase_();
  return drv_('membuat folder LMS di Drive', () => {
    let f = subFolder_(base, 'Dokumen File LMS');
    if (kelasNama) f = subFolder_(f, kelasNama, 'Kelas');
    if (itemNama) f = subFolder_(f, itemNama, 'Materi');
    (subs || []).forEach(x => { f = subFolder_(f, x); });
    return f;
  });
}

// Diagnosis penyimpanan LMS (tombol di Pengaturan, dan fungsi otorisasiDrive di editor).
function tesLms_() {
  const out = { langkah: [], ok: true, petunjuk: '' }, st = settings_();
  const step = (nama, fn) => { try { out.langkah.push({ nama: nama, ok: true, info: String(fn() || 'berhasil') }); return true; } catch (e) { out.ok = false; out.langkah.push({ nama: nama, ok: false, info: String((e && e.message) || e).slice(0, 300) }); return false; } };
  const izin = step('Akses Google Drive (My Drive)', () => DriveApp.getRootFolder().getName());
  if (st.FolderID) step('Folder utama di Pengaturan', () => DriveApp.getFolderById(st.FolderID).getName());
  let f = null;
  if (step('Folder Dokumen File LMS > Kelas > Materi', () => { f = lmsFolder_('(uji) Grup Kelas', '(uji) Materi'); return f.getName() + ' (' + f.getId() + ')'; })) {
    step('Tulis dan hapus file uji', () => { const t = f.createFile('tes-izin.txt', 'ok'); t.setDescription('u:tes'); t.setTrashed(true); return 'berhasil'; });
    step('Bersihkan folder uji', () => { const k = f.getParents().next(); f.setTrashed(true); k.setTrashed(true); return 'berhasil'; });
  }
  if (!out.ok) out.petunjuk = izin ? HINT_FOLDER : HINT_IZIN;
  return out;
}
function otorisasiDrive() {
  const r = tesLms_();
  r.langkah.forEach(l => Logger.log((l.ok ? 'OK    ' : 'GAGAL ') + l.nama + ' -> ' + l.info));
  if (!r.ok) throw new Error('Uji penyimpanan LMS GAGAL. ' + r.langkah.filter(l => !l.ok).map(l => l.nama + ': ' + l.info).join(' | ') + ' || ' + r.petunjuk);
  Logger.log('Semua langkah berhasil. Izin Drive aktif.');
  return r;
}
function trashFiles_(arr) { (arr || []).forEach(f => { try { DriveApp.getFileById(f.id).setTrashed(true); } catch (e) {} }); }
function delRows_(name, rows) { rows.sort((a, b) => b - a).forEach(r => del_(name, r)); }

// Siswa anggota kelas = siswa dengan langganan paket yang sama (dan kelompok yang sama bila diisi).
function kelasMembers_(k, lv) {
  lv = lv || lview_();
  const us = read_('Users'), seen = {}, out = [];
  lv.filter(l => l.PaketID === k.PaketID && l.Status !== 'Nonaktif').forEach(l => {
    if (seen[l.Username]) return;
    const u = us.find(x => String(x.Username) === l.Username) || {};
    if (k.Kelompok && String(u.Kelompok || '') !== String(k.Kelompok)) return;
    seen[l.Username] = 1;
    out.push({ Username: l.Username, Nama: u.Nama || l.Nama, Kelompok: u.Kelompok || '', LID: l.ID });
  });
  return out.sort((a, b) => String(a.Nama).localeCompare(String(b.Nama)));
}

function kelasVisible_(me, staff, lv) {
  const ks = read_('Kelas').filter(k => k.ID);
  if (staff) return ks;
  const un = String(me.Username), mine = lv.filter(l => l.Username === un && l.Status !== 'Nonaktif');
  return ks.filter(k => k.Status !== 'Arsip' && mine.some(l => l.PaketID === k.PaketID) && (!k.Kelompok || String(k.Kelompok) === String(me.Kelompok || '')));
}

function kelasInfo_(k, pks) {
  const pk = pks.find(x => x.ID === k.PaketID) || { Program: '-', Jenjang: '', Nama: '(paket dihapus)' };
  return { ID: k.ID, Nama: k.Nama, PaketID: k.PaketID, Kelompok: k.Kelompok || '', Deskripsi: k.Deskripsi || '', Pengajar: k.Pengajar || '', Status: k.Status || 'Aktif',
    Dibuat: k.Dibuat, Program: pk.Program, Jenjang: pk.Jenjang, PaketNama: pk.Nama };
}

function meetNumber_(x) { const n = Number(x.Pertemuan); return Number.isInteger(n) && n > 0 ? n : 1; }
function meetings_(k) {
  const pk = pk_().find(x => x.ID === k.PaketID), n = Math.max(1, pk ? Math.floor(Number(pk.Pertemuan) || 0) : 0);
  const rows = read_('LmsPertemuan').filter(x => x.KelasID === k.ID);
  return Array.from({ length: n }, (_, i) => {
    const r = rows.find(x => Number(x.Pertemuan) === i + 1) || {};
    return { Pertemuan: i + 1, Visible: String(r.Visible) !== '0', Locked: String(r.Locked) === '1', Executed: String(r.Executed) === '1', Room: String(r.Room || '') };
  });
}
function meetingPercent_(meetings) {
  return meetings.length ? Math.round(meetings.filter(m => m.Executed).length * 100 / meetings.length) : 0;
}
function postAllowed_(x, meetings) {
  const m = meetings.find(z => z.Pertemuan === meetNumber_(x));
  return String(x.GuruOnly) !== '1' && !!m && m.Visible && !m.Locked;
}
function savePertemuan_(p) {
  const k = read_('Kelas').find(x => x.ID === p.KelasID);
  if (!k) throw new Error('Grup kelas tidak ditemukan.');
  const n = Number(p.Pertemuan), current = meetings_(k).find(x => x.Pertemuan === n);
  if (!current) throw new Error('Pertemuan tidak valid.');
  const b = (v, fallback) => v === undefined ? fallback : v === true || v === 1 || v === '1';
  const old = read_('LmsPertemuan').find(x => x.KelasID === k.ID && Number(x.Pertemuan) === n);
  if (p.Room !== undefined && typeof p.Room !== 'string') throw new Error('URL room tidak valid.');
  const room = p.Room === undefined ? current.Room : p.Room.trim();
  if (room && (room.length > 2048 || !/^https?:\/\/[^\s\/?#]+(?:[\/?#][^\s]*)?$/i.test(room) || /[<>"'\\]/.test(room))) throw new Error('URL room harus berupa URL http atau https yang valid.');
  write_('LmsPertemuan', old ? old._row : 0, { Key: k.ID + '|' + n, KelasID: k.ID, Pertemuan: n,
    Visible: b(p.Visible, current.Visible) ? '1' : '0', Locked: b(p.Locked, current.Locked) ? '1' : '0', Executed: b(p.Executed, current.Executed) ? '1' : '0', Room: room });
  return true;
}
function movePost_(p) {
  const x = read_('LMS').find(z => z.ID === p.ID), k = x && read_('Kelas').find(z => z.ID === x.KelasID);
  if (!k) throw new Error('Item tidak ditemukan.');
  const n = Number(p.Pertemuan), pos = Number(p.Urutan);
  if (!meetings_(k).some(m => m.Pertemuan === n) || !Number.isInteger(pos) || pos < 1) throw new Error('Pertemuan atau urutan tidak valid.');
  const posts = read_('LMS').filter(z => z.KelasID === k.ID && z.ID !== x.ID);
  const order = a => a.sort((u, v) => (Number(u.Urutan) || u._row) - (Number(v.Urutan) || v._row) || u._row - v._row);
  const target = order(posts.filter(z => meetNumber_(z) === n));
  x.Pertemuan = n; target.splice(Math.min(pos - 1, target.length), 0, x);
  const source = meetNumber_(read_('LMS').find(z => z.ID === x.ID));
  [target].concat(source === n ? [] : [order(posts.filter(z => meetNumber_(z) === source))]).forEach(group => group.forEach((z, i) => {
    z.Pertemuan = meetNumber_(z); z.Urutan = i + 1; write_('LMS', z._row, z);
  }));
  return true;
}

function kelasList_(me, staff) {
  const lv = lview_(), pks = pk_(), posts = read_('LMS'), subs = read_('LmsSub'), un = String(me.Username);
  const readAt = classReadAt_(k => String(k.Username) === un);
  const comments = read_('Comments');
  const bookmarks = read_('Bookmarks').filter(x => String(x.Username) === un);
  return kelasVisible_(me, staff, lv).map(k => {
    const o = kelasInfo_(k, pks), meetings = meetings_(k), ps = posts.filter(x => x.KelasID === k.ID && (staff || postAllowed_(x, meetings)));
    o.persen = meetingPercent_(meetings);
    o.nMateri = ps.filter(x => x.Tipe === 'materi').length; o.nTugas = ps.filter(x => x.Tipe === 'tugas').length; o.nAsesmen = ps.filter(x => x.Tipe === 'asesmen').length;
    if (staff) o.nSiswa = kelasMembers_(k, lv).length;
    else o.belum = ps.filter(x => x.Tipe === 'tugas' && !subs.some(s => s.PostID === x.ID && String(s.Username) === un)).length;
    const t = readAt[k.ID] || '';
    o.unread = staff
      ? comments.filter(c => ps.some(x => x.ID === c.PostID) && String(c.Role) === 'siswa' && String(c.Waktu) > t).length
      : comments.filter(c => ps.some(x => x.ID === c.PostID) && String(c.Username) !== un && String(c.Waktu) > t).length;
    if (staff) o.unread += subs.filter(s => ps.some(x => x.ID === s.PostID && x.Tipe === 'tugas') && s.Waktu && String(s.Waktu) > t).length;
    o.bookmarked = bookmarks.some(b => String(b.KelasID) === String(k.ID) && ps.some(x => x.ID === b.PostID));
    const bmk = bookmarks.filter(b => String(b.KelasID) === String(k.ID) && b.PostID && ps.some(x => x.ID === b.PostID));
    o.bmPost = bmk.length;
    const bMeet = {};
    bmk.forEach(b => { const p = ps.find(x => x.ID === b.PostID); if (p) bMeet[meetNumber_(p) || 0] = true; });
    o.bmMeet = Object.keys(bMeet).map(Number).sort((a, b) => a - b);
    return o;
  }).sort((a, b) => String(a.Nama).localeCompare(String(b.Nama)));
}

function classReadAt_(flt) {
  const out = {};
  read_('ClassRead').forEach(r => {
    if ((!flt || flt(r)) && (!out[r.KelasID] || String(r.Waktu) > String(out[r.KelasID]))) out[r.KelasID] = r.Waktu;
  });
  return out;
}

function postUnread_(x, comments, subs, readAt, staff, un) {
  const unreadComments = comments.filter(c => staff ? String(c.Role) === 'siswa' : String(c.Username) !== un)
    .filter(c => String(c.Waktu) > readAt).length;
  // Pengumpulan tugas juga muncul pada kartu kelas; hitung kegiatan yang sama di detail.
  return unreadComments + (staff && x.Tipe === 'tugas' ? subs.filter(s => s.Waktu && String(s.Waktu) > readAt).length : 0);
}

function subOut_(s) {
  return { Status: s.Status, Teks: s.Teks || '', Files: parse_(s.Files, []), Waktu: s.Waktu, Nilai: s.Nilai === '' || s.Nilai == null ? null : Number(s.Nilai),
    Komentar: s.Komentar || '', Dicatat: String(s.Dicatat) === '1', Pertemuan: s.Pertemuan === '' ? null : Number(s.Pertemuan), Canvas: s.Canvas || '' };
}

function kelasView_(me, staff, id) {
  const lv = lview_(), k = kelasVisible_(me, staff, lv).find(x => x.ID === id);
  if (!k) throw new Error('Grup kelas tidak ditemukan atau Anda bukan anggotanya.');
  const un = String(me.Username), subs = read_('LmsSub'), res = read_('Results'), members = kelasMembers_(k, lv), mset = members.map(m => m.Username);
  const asmAll = asm_(), myA = staff ? [] : myAsm_(me), comments = read_('Comments');
  const readAt = classReadAt_(r => String(r.Username) === un)[k.ID] || '';
  const bm = read_('Bookmarks').find(x => String(x.Username) === un && String(x.KelasID) === String(k.ID)) || null;
  const meetings = meetings_(k);
  const posts = read_('LMS').filter(x => x.KelasID === id && (staff || postAllowed_(x, meetings))).sort((a, b) => meetNumber_(a) - meetNumber_(b) || (Number(a.Urutan) || a._row) - (Number(b.Urutan) || b._row) || a._row - b._row).map(x => {
    const o = { ID: x.ID, Tipe: x.Tipe, Judul: x.Judul, Isi: x.Isi || '', Files: parse_(x.Files, []).map(f => ({ id: f.id, name: f.name, mime: f.mime, size: f.size, mode: f.mode || modeOf_('keduanya', f.name) })).filter(f => staff || f.mode !== 'guru'), Links: parse_(x.Links, []), Dibuat: x.Dibuat, Tenggat: x.Tenggat || '',
      Penulis: x.Penulis, Kode: x.Kode || '', Maks: Number(x.Maks) || 100, Catat: String(x.Catat) === '1', GuruOnly: String(x.GuruOnly) === '1', Pertemuan: meetNumber_(x), Urutan: Number(x.Urutan) || x._row,
      Lembar: x.Tipe === 'tugas' ? String(x.Lembar || '') : '', Canvas: x.Tipe === 'tugas' && String(x.Canvas) === '1' };
    const ss = subs.filter(z => z.PostID === x.ID), cs = comments.filter(c => c.PostID === x.ID);
    o.nKomentar = cs.length;
    o.unread = postUnread_(x, cs, ss, readAt, staff, un);
    if (x.Tipe === 'asesmen') { const a = asmAll.find(z => z.Kode === x.Kode); o.AsmNama = a ? a.Nama : '(asesmen dihapus)'; o.AsmStatus = a ? a.Status : ''; o.AsmTipe = a ? a.Tipe : ''; o.AsmDurasi = a ? a.Durasi : 0; o.AsmJumlah = a ? a.soal.length : 0; }
    if (staff) {
      o.total = members.length;
      o.selesai = x.Tipe === 'asesmen' ? mset.filter(u => res.some(r => String(r.Username) === u && r.Kode === x.Kode)).length : ss.filter(z => mset.indexOf(String(z.Username)) >= 0).length;
      o.dinilai = ss.filter(z => z.Status === 'Dinilai').length;
      o.dicatat = ss.filter(z => String(z.Dicatat) === '1').length;
    } else {
      const s = ss.find(z => String(z.Username) === un);
      o.sub = s ? subOut_(s) : null;
      if (x.Tipe === 'asesmen') o.asm = myA.find(z => z.Kode === x.Kode) || null;
    }
    return o;
  });
  const bookmarkedMeetings = staff ? read_('MeetingBookmarks').filter(x => String(x.Username) === un && String(x.KelasID) === String(k.ID)).map(x => Number(x.Pertemuan)).filter(n => meetings.some(m => m.Pertemuan === n)) : [];
  const info = kelasInfo_(k, pk_()); info.persen = meetingPercent_(meetings);
  return { k: info, persen: info.persen, meetings: staff ? meetings : meetings.filter(m => m.Visible).map(m => Object.assign({}, m, { Room: m.Locked ? '' : m.Room })), bookmarkedMeetings: bookmarkedMeetings, members: staff ? members.map(m => ({ Username: m.Username, Nama: m.Nama, Kelompok: m.Kelompok })) : [], posts: posts, bookmarkPostID: bm && posts.some(x => x.ID === bm.PostID) ? bm.PostID : '', readAt: readAt };
}

function classOfPost_(pid, me, staff) {
  const x = read_('LMS').find(z => z.ID === pid);
  if (!x) throw new Error('Item tidak ditemukan.');
  const k = kelasVisible_(me, staff, lview_()).find(z => String(z.ID) === String(x.KelasID));
  if (!k || (!staff && !postAllowed_(x, meetings_(k)))) throw new Error('Item tidak ditemukan atau akses ditolak.');
  return x;
}

function commentOut_(c) {
  return { ID: c.ID, PostID: c.PostID, Username: c.Username, Nama: c.Nama, Role: c.Role, Isi: c.Isi, Waktu: c.Waktu };
}

function comments_(pid, me, staff) {
  classOfPost_(pid, me, staff);
  return read_('Comments').filter(c => c.PostID === pid).map(commentOut_).sort((a, b) => String(a.Waktu).localeCompare(String(b.Waktu)));
}

function saveComment_(p, me, staff) {
  const x = classOfPost_(p.PostID, me, staff), isi = cleanRich_(p.Isi, 3000).trim();
  if (!isi) throw new Error('Komentar wajib diisi.');
  write_('Comments', 0, { ID: 'CM' + Utilities.getUuid(), PostID: x.ID, Username: String(me.Username), Nama: me.Nama || me.Username,
    Role: staff ? (me.Role === 'admin' ? 'admin' : 'pegawai') : 'siswa', Isi: isi, Waktu: now_() });
  return true;
}

function delComment_(id, me, staff) {
  const c = read_('Comments').find(x => x.ID === id);
  if (!c) throw new Error('Komentar tidak ditemukan.');
  classOfPost_(c.PostID, me, staff);
  if (!staff && String(c.Username) !== String(me.Username)) throw new Error('Akses ditolak.');
  del_('Comments', c._row); return true;
}

function markClassRead_(id, me, staff) {
  const k = kelasVisible_(me, staff, lview_()).find(x => String(x.ID) === String(id));
  if (!k) throw new Error('Grup kelas tidak ditemukan atau Anda bukan anggotanya.');
  const un = String(me.Username), key = String(k.ID) + '|' + un, ex = read_('ClassRead').find(x => x.Key === key);
  write_('ClassRead', ex ? ex._row : 0, { Key: key, KelasID: String(k.ID), Username: un, Waktu: now_() });
  return true;
}

function toggleMeetingBookmark_(p, me, staff) {
  // Frontend per pertemuan mengirim KelasID, pilihan bookmark di bagian atas mengirim ID: terima keduanya.
  const kid = String(p.ID || p.KelasID || '');
  const k = read_('Kelas').find(x => String(x.ID) === kid);
  if (!k || !kelasVisible_(me, !!staff, lview_()).some(x => String(x.ID) === String(k.ID))) throw new Error('Grup kelas tidak ditemukan atau akses ditolak.');
  const n = Number(p.Pertemuan), m = meetings_(k).find(x => x.Pertemuan === n);
  if (!m || !Number.isInteger(n) || n < 1) throw new Error('Pertemuan tidak valid.');
  const un = String(me.Username), rows = read_('MeetingBookmarks'), ex = rows.find(x => String(x.Key) === k.ID + '|' + un + '|' + n);
  if (ex) { del_('MeetingBookmarks', ex._row); return { bookmarked: false, Pertemuan: n }; }
  write_('MeetingBookmarks', 0, { Key: k.ID + '|' + un + '|' + n, KelasID: k.ID, Username: un, Pertemuan: n, Waktu: now_() });
  return { bookmarked: true, Pertemuan: n };
}

function saveBookmark_(id, postID, me, staff) {
  const k = kelasVisible_(me, staff, lview_()).find(x => String(x.ID) === String(id));
  if (!k) throw new Error('Grup kelas tidak ditemukan atau Anda bukan anggotanya.');
  const un = String(me.Username), rows = read_('Bookmarks');
  const key = String(k.ID) + '|' + un, ex = rows.find(r => String(r.Key) === key || (String(r.Username) === un && String(r.KelasID) === String(k.ID)));
  if (!postID) { if (ex) del_('Bookmarks', ex._row); return true; }
  const x = read_('LMS').find(z => z.ID === postID && String(z.KelasID) === String(k.ID));
  if (!x || (!staff && !postAllowed_(x, meetings_(k)))) throw new Error('Item tidak ditemukan atau akses ditolak.');
  write_('Bookmarks', ex ? ex._row : 0, { Key: key, KelasID: String(k.ID), Username: un, PostID: String(x.ID), Waktu: now_() });
  return true;
}

function kelasSubs_(pid) {
  const x = read_('LMS').find(z => z.ID === pid);
  if (!x) throw new Error('Item tidak ditemukan.');
  const k = read_('Kelas').find(z => z.ID === x.KelasID), members = kelasMembers_(k), subs = read_('LmsSub').filter(s => s.PostID === pid), res = read_('Results');
  return { post: { ID: x.ID, Judul: x.Judul, Tipe: x.Tipe, Tenggat: x.Tenggat || '', Maks: Number(x.Maks) || 100, Catat: String(x.Catat) === '1', Kode: x.Kode || '' },
    rows: members.map(m => {
      const s = subs.find(z => String(z.Username) === m.Username), r = x.Tipe === 'asesmen' ? res.find(z => String(z.Username) === m.Username && z.Kode === x.Kode) : null;
      return { Username: m.Username, Nama: m.Nama, Kelompok: m.Kelompok, sub: s ? subOut_(s) : null, skor: r ? Number(r.Skor) : null, selesaiAsm: !!r };
    }) };
}

function saveKelas_(p, me) {
  const pk = pk_().find(x => x.ID === p.PaketID);
  if (!pk) throw new Error('Pilih program paket untuk grup kelas ini.');
  const nm = String(p.Nama || '').trim() || (pk.Program + ' – ' + pk.Nama);
  if (nm.length > 100) throw new Error('Nama grup kelas maksimal 100 karakter.');
  const ex = p.ID && read_('Kelas').find(x => x.ID === p.ID);
  write_('Kelas', ex ? ex._row : 0, { ID: ex ? ex.ID : 'KL' + Utilities.getUuid().slice(0, 6).toUpperCase(), Nama: nm, PaketID: pk.ID, Kelompok: String(p.Kelompok || '').trim().slice(0, 60),
    Deskripsi: String(p.Deskripsi || '').slice(0, 1000), Pengajar: String(p.Pengajar || '').trim().slice(0, 80) || me.Nama, Status: p.Status === 'Arsip' ? 'Arsip' : 'Aktif', Dibuat: ex ? ex.Dibuat : today_() });
  return true;
}

function delKelas_(id) {
  const k = read_('Kelas').find(x => x.ID === id);
  if (!k) return true;
  const ps = read_('LMS').filter(x => x.KelasID === id), pids = ps.map(x => x.ID), subs = read_('LmsSub').filter(s => pids.indexOf(s.PostID) >= 0);
  ps.forEach(x => trashFiles_(parse_(x.Files, []))); subs.forEach(s => trashFiles_(parse_(s.Files, [])));
  delRows_('Comments', read_('Comments').filter(c => pids.indexOf(c.PostID) >= 0).map(c => c._row));
  delRows_('LmsPertemuan', read_('LmsPertemuan').filter(r => r.KelasID === id).map(r => r._row));
  delRows_('ClassRead', read_('ClassRead').filter(r => r.KelasID === id).map(r => r._row));
  delRows_('Bookmarks', read_('Bookmarks').filter(r => r.KelasID === id).map(r => r._row));
  delRows_('MeetingBookmarks', read_('MeetingBookmarks').filter(r => r.KelasID === id).map(r => r._row));
  delRows_('RekapTugas', read_('RekapTugas').filter(r => r.KelasID === id).map(r => r._row));
  delRows_('LmsSub', subs.map(s => s._row)); delRows_('LMS', ps.map(x => x._row)); del_('Kelas', k._row);
  return true;
}


/* ---------- Lembar tugas & Canvas jawaban: sanitasi HTML (hanya tag pengolah kata yang aman) ---------- */
const HTML_TAGS_ = 'b|strong|i|em|u|s|strike|sup|sub|br|p|div|span|ul|ol|li|table|thead|tbody|tr|td|th|h3|blockquote';
function cleanHtml_(h, max) {
  let t = String(h || '');
  if (t.length > (max || 40000)) throw new Error('Isi terlalu panjang. Persingkat teks Anda (maksimal sekitar ' + (max || 40000) + ' karakter termasuk format).');
  t = t.replace(/<!--[\s\S]*?-->/g, '').replace(/<(script|style|iframe|object|embed|svg|math|form|textarea|select|button|video|audio|noscript)\b[\s\S]*?(?:<\/\1\s*>|$)/gi, '');
  t = t.replace(/<(\/?)([a-z][a-z0-9]*)\b([^>]*)>/gi, (m, sl, tag, attrs) => {
    tag = tag.toLowerCase();
    if (!new RegExp('^(' + HTML_TAGS_ + ')$').test(tag)) return '';
    if (sl) return '</' + tag + '>';
    let a = '';
    const al = /text-align\s*:\s*(left|center|right|justify)/i.exec(attrs);
    if (al && ['p', 'div', 'li', 'td', 'th', 'h3', 'blockquote'].indexOf(tag) >= 0) a += ' style="text-align:' + al[1].toLowerCase() + '"';
    if (tag === 'td' || tag === 'th') {
      const cs = /colspan\s*=\s*["']?(\d{1,2})/i.exec(attrs), rs = /rowspan\s*=\s*["']?(\d{1,2})/i.exec(attrs);
      if (cs) a += ' colspan="' + cs[1] + '"'; if (rs) a += ' rowspan="' + rs[1] + '"';
    }
    if (tag === 'ol') { const ls = /list-style-type\s*:\s*(decimal|lower-alpha|upper-alpha|lower-roman|upper-roman)/i.exec(attrs); if (ls) a += ' style="list-style-type:' + ls[1].toLowerCase() + '"'; }
    return '<' + tag + a + '>';
  });
  // Tanda "<" yang bukan tag aman di atas dijadikan teks biasa.
  return t.replace(new RegExp('<(?!\\/?(?:' + HTML_TAGS_ + ')(?: style="[a-z:\\-; ]+"| colspan="\\d+"| rowspan="\\d+")*>)', 'gi'), '&lt;').trim();
}
const htmlText_ = h => String(h || '').replace(/<[^>]*>/g, ' ').replace(/&nbsp;|&#160;/g, ' ').trim();

function savePost_(p, me) {
  const k = read_('Kelas').find(x => x.ID === p.KelasID);
  if (!k) throw new Error('Grup kelas tidak ditemukan.');
  const tipe = ['materi', 'tugas', 'asesmen'].indexOf(p.Tipe) >= 0 ? p.Tipe : '';
  if (!tipe) throw new Error('Jenis item tidak valid.');
  const ex = p.ID && read_('LMS').find(x => x.ID === p.ID && x.KelasID === k.ID);
  let judul = String(p.Judul || '').trim(), kode = '';
  if (tipe === 'asesmen') { const a = asm_().find(z => z.Kode === p.Kode); if (!a) throw new Error('Pilih asesmen dari daftar asesmen.'); kode = a.Kode; if (!judul) judul = a.Nama; }
  if (!judul) throw new Error('Judul wajib diisi.');
  if (judul.length > 150) throw new Error('Judul maksimal 150 karakter.');
  const isi = String(p.Isi || '');
  if (isi.length > 20000) throw new Error('Teks terlalu panjang (maksimal 20.000 karakter).');
  const old = ex ? parse_(ex.Files, []) : [];
  const files = (Array.isArray(p.Files) ? p.Files : []).slice(0, 10).map(f => {
    const id = String((f && f.id) || '');
    if (!/^[\w-]{15,}$/.test(id)) throw new Error('Data lampiran tidak valid.');
    const o = old.find(z => z.id === id);
    if (o) return { id: o.id, name: o.name, mime: o.mime, size: o.size, mode: modeOf_(f.mode || o.mode || 'keduanya', o.name) };
    let fl; try { fl = DriveApp.getFileById(id); } catch (e) { throw new Error('Lampiran tidak ditemukan. Unggah ulang filenya.'); }
    if (String(fl.getDescription() || '').indexOf('u:') !== 0) throw new Error('Lampiran tidak valid.');
    const nm = String(fl.getName()).slice(0, 120);
    return { id: id, name: nm, mime: fl.getMimeType(), size: fl.getSize(), mode: modeOf_(f.mode, nm) };
  });
  const links = (Array.isArray(p.Links) ? p.Links : String(p.Links || '').split(/\n/)).map(u => String(u).trim()).filter(Boolean);
  if (links.length > 10) throw new Error('Maksimal 10 tautan per item.');
  links.forEach(u => { if (!/^https?:\/\/\S+$/i.test(u) || u.length > 500) throw new Error('Tautan tidak valid: ' + u.slice(0, 60)); });
  const tg = String(p.Tenggat || '').trim();
  if (tg && !/^\d{4}-\d{2}-\d{2}$/.test(tg)) throw new Error('Format tenggat tidak valid.');
  const mx = Math.min(1000, Math.max(1, Number(p.Maks) || 100));
  const lembar = tipe !== 'tugas' ? '' : p.Lembar === undefined ? (ex ? String(ex.Lembar || '') : '') : cleanHtml_(p.Lembar, 40000);
  const canvasOn = tipe === 'tugas' && (p.Canvas === undefined ? !!(ex && String(ex.Canvas) === '1') : (p.Canvas === true || p.Canvas === 'true' || p.Canvas === '1' || p.Canvas === 1));
  const meet = Number(p.Pertemuan) || (ex ? meetNumber_(ex) : 1), existing = read_('LMS').filter(z => z.KelasID === k.ID && meetNumber_(z) === meet && (!ex || z.ID !== ex.ID));
  const urut = Number(p.Urutan) > 0 ? Number(p.Urutan) : (ex && meetNumber_(ex) === meet ? Number(ex.Urutan) || ex._row : existing.reduce((max, z) => Math.max(max, Number(z.Urutan) || z._row), 0) + 1);
  if (!meetings_(k).some(m => m.Pertemuan === meet)) throw new Error('Pertemuan tidak valid.');
  write_('LMS', ex ? ex._row : 0, { ID: ex ? ex.ID : 'LM' + Utilities.getUuid().slice(0, 8).toUpperCase(), KelasID: k.ID, Tipe: tipe, Judul: judul, Isi: isi, Files: JSON.stringify(files), Links: JSON.stringify(links),
    Dibuat: ex ? ex.Dibuat : today_(), Tenggat: tipe === 'tugas' ? tg : '', Penulis: ex ? ex.Penulis : me.Nama, Kode: kode, Maks: tipe === 'tugas' ? mx : '', Catat: p.Catat ? '1' : '', GuruOnly: (p.GuruOnly === undefined ? ex && String(ex.GuruOnly) === '1' : p.GuruOnly === true || p.GuruOnly === '1') ? '1' : '', Pertemuan: meet, Urutan: urut,
    Lembar: lembar && (htmlText_(lembar) || /<table/i.test(lembar)) ? lembar : '', Canvas: canvasOn ? '1' : '' });
  trashFiles_(old.filter(o => !files.some(f => f.id === o.id)));
  return true;
}

function delPost_(id) {
  const x = read_('LMS').find(z => z.ID === id);
  if (!x) return true;
  const subs = read_('LmsSub').filter(s => s.PostID === id);
  trashFiles_(parse_(x.Files, [])); subs.forEach(s => trashFiles_(parse_(s.Files, [])));
  delRows_('Comments', read_('Comments').filter(c => c.PostID === id).map(c => c._row));
  delRows_('Bookmarks', read_('Bookmarks').filter(b => b.PostID === id).map(b => b._row));
  delRows_('LmsSub', subs.map(s => s._row)); del_('LMS', x._row);
  return true;
}

function saveFile_(me, staff, p) {
  const nm = String(p.Name || '').replace(/[\\\/:*?"<>|]+/g, '_').replace(/^\.+/, '').slice(0, 120) || 'file';
  const ext = (nm.indexOf('.') >= 0 ? nm.split('.').pop() : '').toLowerCase();
  if (!LMS_MIME[ext]) throw new Error('Jenis file .' + (ext || '?') + ' tidak didukung. Gunakan PDF, Word, Excel, PowerPoint, gambar, audio, video, atau ZIP.');
  if (!staff) {
    const post = classOfPost_(p.PostID, me, false);
    if (post.Tipe !== 'tugas') throw new Error('Akses ditolak.');
  }
  let kelasNama = '', itemNama = '', subs = [];
  if (staff) {
    const k = read_('Kelas').find(x => x.ID === p.KelasID);
    if (!k) throw new Error('Grup kelas tidak ditemukan.');
    kelasNama = k.Nama; itemNama = String(p.Judul || '').trim();
    if (!itemNama) throw new Error('Isi judul materi/tugas terlebih dahulu sebelum mengunggah file, agar folder materinya terbentuk.');
  } else {
    const post = read_('LMS').find(x => x.ID === p.PostID), k = read_('Kelas').find(x => x.ID === post.KelasID);
    kelasNama = k.Nama; itemNama = post.Judul; subs = ['Pengumpulan Siswa', me.Nama || me.Username];
  }
  const bytes = Utilities.base64Decode(String(p.Data || ''));
  if (!bytes.length) throw new Error('File kosong.');
  const mb = LMS_MAXMB[staff ? 'staff' : 'siswa'];
  if (bytes.length > mb * 1024 * 1024) throw new Error('Ukuran file maksimal ' + mb + ' MB. Untuk video yang lebih besar, tempel tautan YouTube atau Google Drive.');
  const f = drv_('menyimpan file ke Drive', () => { const fl = lmsFolder_(kelasNama, itemNama, subs).createFile(Utilities.newBlob(bytes, LMS_MIME[ext], nm)); fl.setDescription('u:' + me.Username); return fl; });
  return { id: f.getId(), name: nm, mime: LMS_MIME[ext], size: bytes.length, mode: staff ? modeOf_(p.Mode, nm) : '' };
}

function fileGet_(me, staff, id, act) {
  id = String(id || '');
  const un = String(me.Username), lv = lview_(), ok = kelasVisible_(me, staff, lv).map(k => k.ID);
  let ref = null, own = false;
  const classes = kelasVisible_(me, staff, lv);
  const visiblePosts = read_('LMS').filter(x => { const k = classes.find(z => z.ID === x.KelasID); return !!k && (staff || postAllowed_(x, meetings_(k))); });
  visiblePosts.forEach(x => { parse_(x.Files, []).forEach(f => { if (f.id === id) ref = f; }); });
  if (!ref) read_('LmsSub').forEach(s => { if ((staff || String(s.Username) === un) && visiblePosts.some(x => x.ID === s.PostID)) parse_(s.Files, []).forEach(f => { if (f.id === id) { ref = f; own = true; } }); });
  if (!ref) throw new Error('File tidak ditemukan atau akses ditolak.');
  if (!staff && !own) {
    const m = ref.mode || modeOf_('keduanya', ref.name), dl = act === 'dl';
    if (m === 'guru') throw new Error('File ini khusus untuk guru.');
    if (dl && m !== 'unduh' && m !== 'keduanya') throw new Error('File ini hanya dapat dilihat di LMS, tidak dapat diunduh.');
    if (!dl && m !== 'lihat' && m !== 'keduanya') throw new Error('File ini disediakan sebagai tautan unduh.');
  }
  const fl = drv_('membaca file dari Drive', () => DriveApp.getFileById(id));
  if (fl.getSize() > 15 * 1024 * 1024) throw new Error('File terlalu besar untuk dibuka di aplikasi.');
  return { name: ref.name, mime: ref.mime, data: Utilities.base64Encode(fl.getBlob().getBytes()) };
}

function checkFiles_(arr, old, un, max) {
  return (Array.isArray(arr) ? arr : []).slice(0, max).map(f => {
    const id = String((f && f.id) || '');
    if (!/^[\w-]{15,}$/.test(id)) throw new Error('Data lampiran tidak valid.');
    const o = old.find(z => z.id === id);
    if (o) return o;
    let fl; try { fl = DriveApp.getFileById(id); } catch (e) { throw new Error('Lampiran tidak ditemukan. Unggah ulang filenya.'); }
    if (String(fl.getDescription() || '') !== 'u:' + un) throw new Error('Lampiran tidak valid.');
    return { id: id, name: String(fl.getName()).slice(0, 120), mime: fl.getMimeType(), size: fl.getSize(), pub: 0 };
  });
}

// Siswa: menandai materi selesai dipelajari, atau mengumpulkan tugas.
function submit_(me, p) {
  const post = classOfPost_(p.PostID, me, false);
  const un = String(me.Username), key = post.ID + '|' + un, ex = read_('LmsSub').find(s => s.PostID === post.ID && String(s.Username) === un);
  if (post.Tipe === 'materi') {
    if (p.Done === false) {
      if (ex) { if (String(ex.Dicatat) === '1') throw new Error('Sudah tercatat di Catatan Progres, tidak dapat dibatalkan.'); del_('LmsSub', ex._row); }
      return true;
    }
    if (!ex) write_('LmsSub', 0, { Key: key, PostID: post.ID, Username: un, Nama: me.Nama, Status: 'Selesai', Waktu: now_() });
    return true;
  }
  if (post.Tipe !== 'tugas') throw new Error('Jenis item ini tidak dapat dikumpulkan.');
  if (ex && ex.Status === 'Dinilai') throw new Error('Tugas sudah dinilai. Hubungi guru bila perlu mengirim ulang.');
  const teks = String(p.Teks || '');
  if (teks.length > 10000) throw new Error('Jawaban terlalu panjang (maksimal 10.000 karakter).');
  const old = ex ? parse_(ex.Files, []) : [], files = checkFiles_(p.Files, old, un, 5);
  const cv = String(post.Canvas) !== '1' ? '' : p.Canvas === undefined ? (ex ? String(ex.Canvas || '') : '') : cleanHtml_(p.Canvas, 40000);
  const cvAda = !!(htmlText_(cv) || /<table/i.test(cv));
  if (!teks.trim() && !files.length && !cvAda) throw new Error(String(post.Canvas) === '1' ? 'Tulis jawaban pada lembar jawaban (Canvas) atau lampirkan file tugas.' : 'Tulis jawaban atau lampirkan file tugas.');
  trashFiles_(old.filter(o => !files.some(f => f.id === o.id)));
  write_('LmsSub', ex ? ex._row : 0, { Key: key, PostID: post.ID, Username: un, Nama: me.Nama, Status: 'Terkumpul', Teks: teks.trim(), Files: JSON.stringify(files), Waktu: now_(),
    Nilai: '', Komentar: ex ? ex.Komentar : '', Dicatat: ex ? ex.Dicatat : '', Pertemuan: ex ? ex.Pertemuan : '', Canvas: cvAda ? cv : '' });
  return true;
}

function gradeSub_(p) {
  const post = read_('LMS').find(x => x.ID === p.PostID), s = read_('LmsSub').find(x => x.PostID === p.PostID && String(x.Username) === String(p.Username));
  if (!post || post.Tipe !== 'tugas') throw new Error('Tugas tidak ditemukan.');
  if (!s) throw new Error('Siswa belum mengumpulkan tugas.');
  const mx = Number(post.Maks) || 100, nl = p.Nilai === '' || p.Nilai == null ? '' : Number(p.Nilai);
  if (nl !== '' && !(nl >= 0 && nl <= mx)) throw new Error('Nilai harus antara 0 dan ' + mx + '.');
  write_('LmsSub', s._row, Object.assign({}, s, { Status: nl === '' ? 'Terkumpul' : 'Dinilai', Nilai: nl, Komentar: String(p.Komentar || '').slice(0, 1000) }));
  return true;
}

function catatLmsData_(id) {
  const post = read_('LMS').find(x => String(x.ID) === String(id || ''));
  if (!post) throw new Error('Item tidak ditemukan.');
  if (String(post.Catat) !== '1') throw new Error('Item ini tidak ditandai sebagai pertemuan di Catatan Progres.');
  const k = read_('Kelas').find(x => x.ID === post.KelasID);
  if (!k) throw new Error('Grup kelas tidak ditemukan.');
  const pk = pk_().find(x => x.ID === k.PaketID);
  if (!pk) throw new Error('Paket untuk grup kelas ini sudah dihapus.');
  const subs = read_('LmsSub').filter(s => s.PostID === post.ID), results = read_('Results'), progress = read_('Progress');
  return { post: { ID: post.ID, Judul: post.Judul, Tipe: post.Tipe }, P: pk.P, K: pk.K, paket: { ID: pk.ID, Nama: pk.Nama, Pertemuan: pk.Pertemuan, P: pk.P, K: pk.K },
    rows: kelasMembers_(k).map(m => {
      const s = subs.find(x => String(x.Username) === m.Username);
      const r = post.Tipe === 'asesmen' ? results.find(x => String(x.Username) === m.Username && x.Kode === post.Kode) : null;
      const matches = progress.filter(x => String(x.Username) === m.Username && x.LmsID === post.ID);
      const pr = matches.length === 1 ? matches[0] : null;
      const taken = progress.filter(x => x.LID === m.LID).map(x => Number(x.Pertemuan));
      let next = 1; while (taken.indexOf(next) >= 0) next++;
      return { Username: m.Username, Nama: m.Nama, Kelompok: m.Kelompok, LID: m.LID,
        selesai: post.Tipe === 'asesmen' ? !!r : !!s, dicatat: !!pr || !!(s && String(s.Dicatat) === '1'),
        konflik: matches.length > 1 || !!(s && String(s.Dicatat) === '1' && !pr),
        pertemuan: pr ? Number(pr.Pertemuan) : (s && s.Pertemuan ? Number(s.Pertemuan) : null),
        pertemuanBerikut: next <= pk.Pertemuan ? next : null, Nilai: pr ? parse_(pr.Nilai, { P: {}, K: {} }) : { P: {}, K: {} }, Catatan: pr ? String(pr.Catatan || '') : '' };
    }) };
}

function saveCatatLmsNilai_(me, p) {
  const data = catatLmsData_(p.ID), m = data.rows.find(x => x.Username === String(p.Username || ''));
  if (!m) throw new Error('Siswa bukan anggota kelas.');
  if (m.konflik) throw new Error('Data pencatatan tidak konsisten; periksa Catatan Progres terlebih dahulu.');
  if (!m.selesai) throw new Error('Siswa belum menyelesaikan item ini.');
  const input = p.Nilai;
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Nilai tidak valid.');
  const nil = { P: {}, K: {} };
  Object.keys(input).forEach(g => { if (g !== 'P' && g !== 'K') throw new Error('Kelompok kriteria tidak valid.'); });
  ['P', 'K'].forEach(g => {
    const values = input[g] == null ? {} : input[g];
    if (typeof values !== 'object' || Array.isArray(values)) throw new Error('Nilai kriteria tidak valid.');
    Object.keys(values).forEach(nm => {
      if (data.paket[g].indexOf(nm) < 0) throw new Error('Kriteria tidak dikenal: ' + nm);
      const raw = values[nm];
      if (raw === '' || raw == null) return;
      if ((typeof raw !== 'number' && typeof raw !== 'string') || (typeof raw === 'string' && !raw.trim())) throw new Error('Nilai harus skala 1-10.');
      const v = Number(raw);
      if (!isFinite(v) || v < 1 || v > 10) throw new Error('Nilai harus skala 1-10.');
      nil[g][nm] = v;
    });
  });
  const all = read_('Progress'), existing = all.find(x => String(x.Username) === m.Username && x.LmsID === data.post.ID);
  let n, pr;
  if (existing) {
    n = Number(existing.Pertemuan);
    if (p.Pertemuan != null && p.Pertemuan !== '' && Number(p.Pertemuan) !== n) throw new Error('Nomor pertemuan yang sudah dicatat tidak dapat diubah.');
    pr = Object.assign({}, existing, { Nilai: JSON.stringify(nil), Catatan: p.Catatan === undefined ? existing.Catatan : String(p.Catatan || '') });
    write_('Progress', existing._row, pr);
  } else {
    n = p.Pertemuan == null || p.Pertemuan === '' ? m.pertemuanBerikut : Number(p.Pertemuan);
    if (!Number.isInteger(n) || n < 1 || n > data.paket.Pertemuan) throw new Error('Nomor pertemuan tidak valid atau paket sudah penuh.');
    if (all.some(x => x.LID === m.LID && Number(x.Pertemuan) === n)) throw new Error('Pertemuan sudah digunakan oleh catatan lain.');
    const s = read_('LmsSub').find(x => x.PostID === data.post.ID && String(x.Username) === m.Username);
    const post = read_('LMS').find(x => x.ID === data.post.ID);
    const r = post.Tipe === 'asesmen' ? read_('Results').find(x => String(x.Username) === m.Username && x.Kode === post.Kode) : null;
    let cat = 'Pertemuan daring (asinkron): ' + post.Judul;
    if (post.Tipe === 'tugas' && s && s.Nilai !== '' && s.Nilai != null) cat += ' • nilai tugas ' + s.Nilai + '/' + (Number(post.Maks) || 100);
    if (r) cat += ' • skor ' + r.Skor;
    if (p.Catatan !== undefined) cat = String(p.Catatan || '');
    pr = { ID: Utilities.getUuid(), Username: m.Username, Pertemuan: n, Tanggal: today_(), Kehadiran: 'Hadir', Catatan: cat, Tutor: me.Nama, Paket: 1, LID: m.LID, Nilai: JSON.stringify(nil), Metode: 'Daring', LmsID: post.ID };
    write_('Progress', 0, pr);
  }
  const sub = read_('LmsSub').find(x => x.PostID === data.post.ID && String(x.Username) === m.Username);
  const base = sub ? Object.assign({}, sub) : { Key: data.post.ID + '|' + m.Username, PostID: data.post.ID, Username: m.Username, Nama: m.Nama, Status: 'Selesai', Waktu: now_() };
  write_('LmsSub', sub ? sub._row : 0, Object.assign(base, { Dicatat: '1', Pertemuan: n }));
  return { Username: m.Username, LID: pr.LID, pertemuan: n, Nilai: nil, Catatan: pr.Catatan, dicatat: true, selesai: true, ID: pr.ID };
}

// Mencatat siswa yang sudah menyelesaikan item ke Catatan Progres sebagai pertemuan daring (asinkron).
function recordProg_(me, p) {
  const post = read_('LMS').find(x => x.ID === p.ID);
  if (!post) throw new Error('Item tidak ditemukan.');
  if (String(post.Catat) !== '1') throw new Error('Item ini tidak ditandai sebagai pertemuan di Catatan Progres. Ubah item lalu centang opsinya.');
  const k = read_('Kelas').find(x => x.ID === post.KelasID), pk = pk_().find(x => x.ID === k.PaketID);
  if (!pk) throw new Error('Paket untuk grup kelas ini sudah dihapus.');
  const members = kelasMembers_(k), subs = read_('LmsSub').filter(s => s.PostID === post.ID), res = read_('Results'), prog = read_('Progress').map(x => ({ LID: x.LID, Pertemuan: Number(x.Pertemuan) }));
  const out = { dicatat: 0, belum: 0, penuh: 0, sudah: 0 };
  members.forEach(m => {
    const s = subs.find(x => String(x.Username) === m.Username);
    if ((s && String(s.Dicatat) === '1') || read_('Progress').some(x => String(x.Username) === m.Username && x.LmsID === post.ID)) { out.sudah++; return; }
    const r = post.Tipe === 'asesmen' ? res.find(z => String(z.Username) === m.Username && z.Kode === post.Kode) : null;
    if (!(post.Tipe === 'asesmen' ? r : s)) { out.belum++; return; }
    const taken = prog.filter(x => x.LID === m.LID).map(x => x.Pertemuan);
    let n = 1; while (taken.indexOf(n) >= 0) n++;
    if (n > pk.Pertemuan) { out.penuh++; return; }
    let cat = 'Pertemuan daring (asinkron): ' + post.Judul;
    if (post.Tipe === 'tugas' && s.Nilai !== '' && s.Nilai != null) cat += ' • nilai tugas ' + s.Nilai + '/' + (Number(post.Maks) || 100);
    if (post.Tipe === 'asesmen') cat += ' • skor ' + r.Skor;
    write_('Progress', 0, { ID: Utilities.getUuid(), Username: m.Username, Pertemuan: n, Tanggal: today_(), Kehadiran: 'Hadir', Catatan: cat, Tutor: me.Nama, Paket: 1, LID: m.LID,
      Nilai: JSON.stringify({ P: {}, K: {} }), Metode: 'Daring', LmsID: post.ID });
    prog.push({ LID: m.LID, Pertemuan: n });
    const base = s ? Object.assign({}, s) : { Key: post.ID + '|' + m.Username, PostID: post.ID, Username: m.Username, Nama: m.Nama, Status: 'Selesai', Waktu: now_() };
    write_('LmsSub', s ? s._row : 0, Object.assign(base, { Dicatat: '1', Pertemuan: n }));
    out.dicatat++;
  });
  return out;
}


/* ---------- Rekap tugas grup kelas -> Catatan Progres -> Laporan periode ---------- */
// Nilai tugas dinormalkan ke skala 0-100 (nilai / nilai maksimum tugas) agar bisa dirata-ratakan antar tugas.
const pct_ = (v, mx) => Math.round(Number(v) / (Number(mx) || 100) * 1000) / 10;

function tugasPosts_(kelasID) {
  return read_('LMS').filter(x => x.KelasID === kelasID && x.Tipe === 'tugas')
    .sort((a, b) => meetNumber_(a) - meetNumber_(b) || (Number(a.Urutan) || a._row) - (Number(b.Urutan) || b._row) || a._row - b._row);
}

// Detail tugas satu siswa: status (belum / terkumpul / dinilai), nilai, dan ketepatan waktu.
function tugasItems_(posts, un, subs) {
  return posts.map(x => {
    const s = subs.find(z => z.PostID === x.ID && String(z.Username) === un), mx = Number(x.Maks) || 100;
    const has = s && s.Nilai !== '' && s.Nilai != null && s.Status === 'Dinilai';
    return { id: x.ID, j: String(x.Judul).slice(0, 80), p: meetNumber_(x), m: mx, tg: x.Tenggat || '',
      s: !s ? 'belum' : has ? 'dinilai' : 'terkumpul', v: has ? Number(s.Nilai) : null, pc: has ? pct_(s.Nilai, mx) : null,
      t: s && x.Tenggat && String(s.Waktu).slice(0, 10) > x.Tenggat ? 1 : 0, w: s ? String(s.Waktu).slice(0, 16) : '' };
  });
}
const meanPc_ = items => avg_(items.filter(i => i.pc != null).map(i => i.pc));

function rekapTugas_(id) {
  const k = read_('Kelas').find(x => x.ID === id);
  if (!k) throw new Error('Grup kelas tidak ditemukan.');
  const posts = tugasPosts_(k.ID), members = kelasMembers_(k), subs = read_('LmsSub').filter(s => posts.some(x => x.ID === s.PostID));
  const snaps = read_('RekapTugas').filter(r => r.KelasID === k.ID), pk = pk_().find(x => x.ID === k.PaketID) || {};
  const siswa = members.map(m => {
    const items = tugasItems_(posts, m.Username, subs), sn = snaps.find(r => String(r.Username) === m.Username), rata = meanPc_(items), nd = items.filter(i => i.s === 'dinilai').length;
    return { Username: m.Username, Nama: m.Nama, Kelompok: m.Kelompok, LID: m.LID, items: items, rata: rata, dinilai: nd,
      kumpul: items.filter(i => i.s !== 'belum').length, belum: items.filter(i => i.s === 'belum').length, telat: items.filter(i => i.t).length,
      snap: sn ? { Rata: Number(sn.Rata), Dinilai: Number(sn.Dinilai), Waktu: String(sn.Waktu).slice(0, 16), basi: Number(sn.Rata) !== Number(rata) || Number(sn.Dinilai) !== nd || Number(sn.Total) !== items.length } : null };
  });
  const tugas = posts.map((x, i) => {
    const col = siswa.map(r => r.items[i]);
    return { ID: x.ID, Judul: x.Judul, Pertemuan: meetNumber_(x), Tenggat: x.Tenggat || '', Maks: Number(x.Maks) || 100,
      kumpul: col.filter(c => c.s !== 'belum').length, dinilai: col.filter(c => c.s === 'dinilai').length, belum: col.filter(c => c.s === 'belum').length, telat: col.filter(c => c.t).length, rata: meanPc_(col) };
  });
  const slot = siswa.length * posts.length, got = tugas.reduce((n, t) => n + t.kumpul, 0);
  return { k: kelasInfo_(k, pk_()), kkm: (pk_().find(x => x.ID === k.PaketID) || {}).KKM || 70, tugas: tugas, siswa: siswa,
    ringkas: { tugas: posts.length, siswa: siswa.length, pctKumpul: slot ? Math.round(got / slot * 100) : 0, rata: avg_(siswa.map(r => r.rata).filter(v => v != null)), masuk: siswa.filter(r => r.snap).length, lengkap: siswa.filter(r => posts.length && r.belum === 0).length } };
}

// Menyimpan rekap tugas siswa ke Catatan Progres (snapshot per siswa per kelas; dapat diperbarui kapan saja).
function saveRekapTugas_(p) {
  const k = read_('Kelas').find(x => x.ID === p.ID);
  if (!k) throw new Error('Grup kelas tidak ditemukan.');
  const posts = tugasPosts_(k.ID);
  if (!posts.length) throw new Error('Grup kelas ini belum memiliki tugas.');
  const want = Array.isArray(p.Usernames) && p.Usernames.length ? p.Usernames.map(String) : null;
  const subs = read_('LmsSub').filter(s => posts.some(x => x.ID === s.PostID)), snaps = read_('RekapTugas').filter(r => r.KelasID === k.ID), out = { disimpan: 0, kosong: 0 };
  kelasMembers_(k).filter(m => !want || want.indexOf(m.Username) >= 0).forEach(m => {
    const items = tugasItems_(posts, m.Username, subs), nd = items.filter(i => i.s === 'dinilai').length;
    if (!nd) { out.kosong++; return; }
    const ex = snaps.find(r => String(r.Username) === m.Username);
    write_('RekapTugas', ex ? ex._row : 0, { Key: k.ID + '|' + m.Username, KelasID: k.ID, Username: m.Username, LID: m.LID, Rata: meanPc_(items), Dinilai: nd, Total: items.length,
      Detail: JSON.stringify(items.map(i => ({ j: i.j, p: i.p, m: i.m, s: i.s, v: i.v, t: i.t }))), Waktu: now_() });
    out.disimpan++;
  });
  return out;
}

// Gabungan rekap tugas yang sudah masuk Catatan Progres untuk satu langganan (opsional dibatasi rentang pertemuan lo..hi).
function tugasOf_(lid, lo, hi, snaps) {
  const rows = (snaps || read_('RekapTugas')).filter(r => r.LID === lid);
  if (!rows.length) return null;
  const kelas = read_('Kelas');
  let items = [], waktu = '';
  rows.forEach(r => {
    const k = kelas.find(x => x.ID === r.KelasID);
    parse_(r.Detail, []).forEach(i => items.push(Object.assign({ kelas: k ? k.Nama : '' }, i)));
    if (String(r.Waktu) > waktu) waktu = String(r.Waktu);
  });
  if (lo != null) items = items.filter(i => Number(i.p) >= lo && Number(i.p) <= hi);
  const g = items.filter(i => i.s === 'dinilai' && i.v != null);
  return { rata: avg_(g.map(i => pct_(i.v, i.m))), dinilai: g.length, total: items.length, waktu: waktu.slice(0, 16),
    items: items.map(i => ({ kelas: i.kelas, j: i.j, p: i.p, m: i.m, s: i.s, v: i.v, t: i.t })) };
}

function tugasProg_(me, staff, p) {
  const lid = String(p.LID || ''), l = lview_().find(x => x.ID === lid);
  if (!l || (!staff && l.Username !== String(me.Username))) throw new Error('Data paket tidak ditemukan.');
  return tugasOf_(lid);
}

function doPost(e) {
  let out;
  try {
    const q = JSON.parse(e.postData.contents), F = { login: login, api: api, logout: logout, publicSettings: publicSettings };
    if (!F[q.fn]) throw new Error('Fungsi tidak dikenal.');
    out = F[q.fn].apply(null, q.a || []);
  } catch (er) { out = { ok: false, error: er.message }; }
  return ContentService.createTextOutput(JSON.stringify(out)).setMimeType(ContentService.MimeType.JSON);
}

// Mengisi pengaturan awal (termasuk GitHub dan TURN) sekali saja; kolom nilai dibuat bertipe teks agar angka 0 di depan tidak hilang.
function seedSettings_() {
  const p = PropertiesService.getScriptProperties();
  if (p.getProperty('SET_V') === '2') return;
  const st = ss_().getSheetByName('Settings');
  st.getRange('B:B').setNumberFormat('@');
  const rows = st.getLastRow() > 1 ? st.getRange(2, 1, st.getLastRow() - 1, 2).getValues() : [], has = {};
  rows.forEach((r, i) => has[r[0]] = i + 2);
  Object.keys(DEF).forEach(k => {
    if (!has[k]) st.appendRow([k, DEF[k]]);
    else if (['GithubURL', 'TurnURL', 'TurnUser', 'TurnPass'].indexOf(k) >= 0 && String(rows[has[k] - 2][1]) === '') st.getRange(has[k], 2).setValue(DEF[k]);
  });
  p.setProperty('SET_V', '2');
  inval_('Settings');
}

/* ---------- Foto pengguna (disimpan di sheet Foto agar daftar pengguna tetap ringan) ---------- */
function fotoOf_(un) { const r = read_('Foto').find(x => String(x.Username) === String(un)); return r ? String(r.Data) : ''; }

function saveFoto_(p) {
  const un = String(p.Username || ''), d = String(p.Data || '');
  if (!read_('Users').some(u => String(u.Username) === un)) throw new Error('Pengguna tidak ditemukan.');
  const ex = read_('Foto').find(x => String(x.Username) === un);
  if (!d) { if (ex) del_('Foto', ex._row); return true; }
  if (d.length > 48000 || !/^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+\/=]+$/.test(d)) throw new Error('Foto tidak valid atau terlalu besar. Pilih foto lain.');
  write_('Foto', ex ? ex._row : 0, { Username: un, Data: d });
  return true;
}

/* ---------- Zoom: kredensial dan data meeting tersimpan di Script Properties ---------- */
const ZOOM_KEYS_ = { accountId: 'ZOOM_ACCOUNT_ID', clientId: 'ZOOM_CLIENT_ID', clientSecret: 'ZOOM_CLIENT_SECRET', sdkClientId: 'ZOOM_SDK_CLIENT_ID', sdkClientSecret: 'ZOOM_SDK_CLIENT_SECRET', hostUserId: 'ZOOM_HOST_USER_ID' };
function zoomConfigStatus_() {
  const props = PropertiesService.getScriptProperties(), out = {};
  Object.keys(ZOOM_KEYS_).forEach(k => out[k + 'Set'] = !!props.getProperty(ZOOM_KEYS_[k]));
  return out;
}
function saveZoomConfig_(p) {
  const props = PropertiesService.getScriptProperties();
  const aliases = {sdkKey: 'sdkClientId', sdkSecret: 'sdkClientSecret', userId: 'hostUserId'};
  Object.keys(aliases).forEach(k => { if (p[k] !== undefined && p[aliases[k]] === undefined) p[aliases[k]] = p[k]; });
  Object.keys(ZOOM_KEYS_).forEach(k => {
    if (p[k] === undefined) return;
    if (typeof p[k] !== 'string' || p[k].length > 500 || /[\r\n]/.test(p[k])) throw new Error('Konfigurasi Zoom tidak valid: ' + k);
  });
  Object.keys(ZOOM_KEYS_).forEach(k => {
    if (p[k] === undefined) return;
    const v = p[k].trim();
    if (v) props.setProperty(ZOOM_KEYS_[k], v);
  });
  return zoomConfigStatus_();
}
function zoomConfig_() {
  const props = PropertiesService.getScriptProperties(), c = {};
  Object.keys(ZOOM_KEYS_).forEach(k => c[k] = props.getProperty(ZOOM_KEYS_[k]) || '');
  if (!c.accountId || !c.clientId || !c.clientSecret || !c.sdkClientId || !c.sdkClientSecret || !c.hostUserId) throw new Error('Konfigurasi Zoom belum lengkap.');
  return c;
}
function zoomFetch_(url, options) {
  let response;
  try { response = UrlFetchApp.fetch(url, Object.assign({ muteHttpExceptions: true }, options)); }
  catch (e) { throw new Error('Tidak dapat menghubungi Zoom.'); }
  const code = response.getResponseCode();
  if (code < 200 || code >= 300) throw new Error('Permintaan Zoom gagal (HTTP ' + code + '). Periksa konfigurasi, izin, dan akun host.');
  try { return JSON.parse(response.getContentText()); } catch (e) { throw new Error('Respons Zoom tidak valid.'); }
}
function zoomToken_(c) {
  const auth = Utilities.base64Encode(c.clientId + ':' + c.clientSecret, Utilities.Charset.UTF_8);
  const r = zoomFetch_('https://zoom.us/oauth/token?grant_type=account_credentials&account_id=' + encodeURIComponent(c.accountId), { method: 'post', headers: { Authorization: 'Basic ' + auth } });
  if (!r.access_token) throw new Error('Token Zoom tidak tersedia.');
  return r.access_token;
}
function testZoomConfig_() {
  const c = zoomConfig_(), token = zoomToken_(c);
  zoomFetch_('https://api.zoom.us/v2/users/' + encodeURIComponent(c.hostUserId), { method: 'get', headers: { Authorization: 'Bearer ' + token } });
  return { connected: true, sdkConfigured: true };
}
function zoomMeetingKey_(kelasId, n) {
  const bytes = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, ssId_() + '|' + JSON.stringify([String(kelasId), n]), Utilities.Charset.UTF_8);
  return 'ZOOM_MEETING_' + bytes.map(b => ('0' + (b & 255).toString(16)).slice(-2)).join('');
}
function zoomClassMeeting_(me, staff, p) {
  const k = kelasVisible_(me, staff, staff ? [] : lview_()).find(x => String(x.ID) === String(p.KelasID || ''));
  if (!k) throw new Error('Kelas tidak ditemukan atau akses ditolak.');
  const n = Number(p.Pertemuan), m = meetings_(k).find(x => x.Pertemuan === n);
  if (!Number.isInteger(n) || !m || (!staff && (!m.Visible || m.Locked))) throw new Error('Pertemuan tidak tersedia.');
  return { kelas: k, meeting: m, n: n, key: zoomMeetingKey_(k.ID, n) };
}
function createZoomMeeting_(p) {
  const target = zoomClassMeeting_({}, true, p), props = PropertiesService.getScriptProperties();
  const existing = props.getProperty(target.key);
  if (existing) { const r = parse_(existing, null); if (!r || !r.meetingNumber) throw new Error('Data meeting Zoom tidak valid.'); return { meetingNumber: r.meetingNumber, existing: true }; }
  const c = zoomConfig_(), token = zoomToken_(c);
  const r = zoomFetch_('https://api.zoom.us/v2/users/' + encodeURIComponent(c.hostUserId) + '/meetings', {
    method: 'post', contentType: 'application/json', headers: { Authorization: 'Bearer ' + token },
    payload: JSON.stringify({ topic: 'Pertemuan kelas ' + target.n, type: 2, settings: { join_before_host: false, waiting_room: true } })
  });
  const number = String(r.id || '');
  if (!/^\d+$/.test(number)) throw new Error('Zoom tidak mengembalikan nomor meeting valid.');
  props.setProperty(target.key, JSON.stringify({ meetingNumber: number, password: String(r.password || '') }));
  return { meetingNumber: number, existing: false };
}
function zoomSignature_(c, number, role) {
  const now = Math.floor(Date.now() / 1000), iat = now - 30, exp = now + 7200;
  const b64 = v => Utilities.base64EncodeWebSafe(v, Utilities.Charset.UTF_8).replace(/=+$/, '');
  const unsigned = b64(JSON.stringify({ alg: 'HS256', typ: 'JWT' })) + '.' + b64(JSON.stringify({ appKey: c.sdkClientId, mn: number, role: role, iat: iat, exp: exp, tokenExp: exp }));
  return unsigned + '.' + Utilities.base64EncodeWebSafe(Utilities.computeHmacSha256Signature(unsigned, c.sdkClientSecret, Utilities.Charset.UTF_8)).replace(/=+$/, '');
}
function joinZoomMeeting_(me, staff, p) {
  const target = zoomClassMeeting_(me, staff, p), c = zoomConfig_();
  const r = parse_(PropertiesService.getScriptProperties().getProperty(target.key), null);
  if (!r || !/^\d+$/.test(String(r.meetingNumber || ''))) throw new Error('Meeting Zoom belum dibuat.');
  const role = me.Role === 'admin' ? 1 : 0;
  const result = { sdkKey: c.sdkClientId, signature: zoomSignature_(c, String(r.meetingNumber), role), meetingNumber: String(r.meetingNumber), password: r.password || '', userName: String(me.Nama || me.Username), role: role };
  if (role === 1) {
    const token = zoomToken_(c);
    const zak = zoomFetch_('https://api.zoom.us/v2/users/' + encodeURIComponent(c.hostUserId) + '/token?type=zak', { method: 'get', headers: { Authorization: 'Bearer ' + token } });
    if (!zak.token || typeof zak.token !== 'string') throw new Error('Token host Zoom tidak tersedia.');
    result.zak = zak.token;
  }
  return result;
}
