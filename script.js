// Referensi Elemen DOM
const containerPortofolio = document.querySelector("#container-portofolio");
const loadingIndicator = document.querySelector("#loading");
const btnTema = document.querySelector("#btn-tema");
const btnInfo = document.querySelector("#btn-info");
const kotakAside = document.querySelector("aside");
const formKomentar = document.querySelector("#form-komentar");
const daftarKomentar = document.querySelector("#daftar-komentar");
const pesanError = document.querySelector("#pesan-error");
const btnHapusSemua = document.querySelector("#btn-hapus-semua");
const inputNama = document.querySelector("#input-nama");
const inputPesan = document.querySelector("#input-pesan");

/* -------------------------------------------------------------
   1. INISIALISASI & MANAJEMEN TEMA (Modul 6)
------------------------------------------------------------- */
function inisialisasiDataAwal() {
    if (!localStorage.getItem("tema")) {
        localStorage.setItem("tema", "light");
    }
}
inisialisasiDataAwal();

function toggleTema() {
    document.body.classList.toggle("dark-mode");
    const temaSekarang = document.body.classList.contains("dark-mode") ? "dark" : "light";
    localStorage.setItem("tema", temaSekarang);
    if (btnTema) {
        btnTema.textContent = temaSekarang === "dark" ? "Mode Terang" : "Mode Gelap";
    }
}

function muatPreferensiTema() {
    const tema = localStorage.getItem("tema");
    if (tema === "dark") {
        document.body.classList.add("dark-mode");
        if (btnTema) btnTema.textContent = "Mode Terang";
    } else {
        document.body.classList.remove("dark-mode");
        if (btnTema) btnTema.textContent = "Mode Gelap";
    }
}

if (btnTema) btnTema.addEventListener("click", toggleTema);

document.addEventListener("keydown", (e) => {
    const activeTag = document.activeElement.tagName;
    if (activeTag === "INPUT" || activeTag === "TEXTAREA") return;
    if (e.key.toLowerCase() === "d") toggleTema();
});

function muatStatusAside() {
    const statusAside = localStorage.getItem("statusAside");
    if (statusAside === "tersembunyi" && kotakAside) {
        kotakAside.classList.add("tersembunyi");
    }
}

if (btnInfo && kotakAside) {
    btnInfo.addEventListener("click", () => {
        kotakAside.classList.toggle("tersembunyi");
        const isHidden = kotakAside.classList.contains("tersembunyi");
        localStorage.setItem("statusAside", isHidden ? "tersembunyi" : "tampil");
    });
}

/* -------------------------------------------------------------
   2. FETCH API: AMBIL PORTOFOLIO DARI JSONPLACEHOLDER (Modul 8 - Langkah 2-4)
------------------------------------------------------------- */
function simpanLike(judulArtikel, jumlah) {
    const semuaLike = JSON.parse(localStorage.getItem("semuaLike")) || {};
    semuaLike[judulArtikel] = jumlah;
    localStorage.setItem("semuaLike", JSON.stringify(localStorage.getItem("semuaLike") ? semuaLike : semuaLike));
}

function renderItemPortofolio(item) {
    const article = document.createElement("article");

    const judul = document.createElement("h3");
    judul.textContent = item.judul;

    const waktu = document.createElement("p");
    waktu.innerHTML = `<time>${item.waktu}</time>`;

    const deskripsi = document.createElement("p");
    deskripsi.textContent = item.deskripsi;

    // Ambil data like dari localStorage
    const semuaLike = JSON.parse(localStorage.getItem("semuaLike")) || {};
    let jumlahLike = semuaLike[item.judul] || 0;

    const tombolLike = document.createElement("button");
    tombolLike.textContent = `Like (${jumlahLike})`;
    tombolLike.dataset.like = jumlahLike;
    tombolLike.style.marginRight = "8px";

    const tombolHapus = document.createElement("button");
    tombolHapus.textContent = "Hapus Item";
    tombolHapus.classList.add("btn-danger");

    article.appendChild(judul);
    article.appendChild(waktu);
    article.appendChild(deskripsi);
    article.appendChild(tombolLike);
    article.appendChild(tombolHapus);

    containerPortofolio.appendChild(article);
}

async function muatPortofolioDariAPI() {
    if (!containerPortofolio) return;
    
    // Indikator loading aktif (Modul 8 - Langkah 3)
    if (loadingIndicator) loadingIndicator.classList.remove("tersembunyi");

    try {
        const response = await fetch("https://jsonplaceholder.typicode.com/posts?_limit=4");
        
        // Cek status ok (Modul 8 - Langkah 4)
        if (!response.ok) {
            throw new Error(`Status HTTP: ${response.status}`);
        }

        const dataPosts = await response.json();
        containerPortofolio.innerHTML = "";

        // Render data dari API publik
        dataPosts.forEach((post) => {
            renderItemPortofolio({
                judul: post.title,
                waktu: `Proyek #${post.id}`,
                deskripsi: post.body
            });
        });

    } catch (error) {
        // Penanganan error (Modul 8 - Langkah 4)
        containerPortofolio.innerHTML = "<p class='error-msg'>Gagal memuat artikel, silakan coba lagi nanti.</p>";
        console.error("Gagal mengambil data:", error);
    } finally {
        // Sembunyikan loading (Modul 8 - Langkah 4)
        if (loadingIndicator) loadingIndicator.classList.add("tersembunyi");
    }
}

if (containerPortofolio) {
    containerPortofolio.addEventListener("mouseover", (e) => {
        const article = e.target.closest("article");
        if (article) article.classList.add("artikel-hover");
    });

    containerPortofolio.addEventListener("mouseout", (e) => {
        const article = e.target.closest("article");
        if (article) article.classList.remove("artikel-hover");
    });

    containerPortofolio.addEventListener("click", (e) => {
        if (e.target.tagName === "BUTTON" && e.target.textContent === "Hapus Item") {
            e.target.closest("article").remove();
        }

        if (e.target.tagName === "BUTTON" && e.target.textContent.startsWith("Like")) {
            const article = e.target.closest("article");
            const judul = article.querySelector("h3").textContent;
            
            let jumlah = parseInt(e.target.dataset.like || 0);
            jumlah++;
            e.target.dataset.like = jumlah;
            e.target.textContent = `Like (${jumlah})`;

            simpanLike(judul, jumlah);
        }
    });
}

const formPortofolio = document.querySelector("#form-portofolio");
if (formPortofolio) {
    formPortofolio.addEventListener("submit", (e) => {
        e.preventDefault();

        const judul = document.querySelector("#input-judul-porto").value.trim();
        const waktu = document.querySelector("#input-waktu-porto").value.trim();
        const deskripsi = document.querySelector("#input-deskripsi-porto").value.trim();

        if (judul && waktu && deskripsi) {
            renderItemPortofolio({ judul, waktu, deskripsi });
            formPortofolio.reset();
        }
    });
}

/* -------------------------------------------------------------
   3. FETCH API: DATAPENGGUNA UNTUK ASIDE (Modul 8 - Langkah 5)
------------------------------------------------------------- */
async function muatProfilPenulis() {
    try {
        const response = await fetch("https://jsonplaceholder.typicode.com/users/1");
        if (!response.ok) throw new Error("Status: " + response.status);
        
        const user = await response.json();
        
        const namaPenulis = document.querySelector("#nama-penulis");
        const emailPenulis = document.querySelector("#email-penulis");

        if (namaPenulis) namaPenulis.textContent = user.name;
        if (emailPenulis) {
            emailPenulis.textContent = user.email;
            emailPenulis.href = `mailto:${user.email}`;
        }
    } catch (error) {
        console.error("Gagal memuat profil penulis:", error);
    }
}

/* -------------------------------------------------------------
   4. FETCH API: KOMENTAR SUNGGUHAN DARI API (Modul 8 - Tugas Mandiri)
------------------------------------------------------------- */
function simpanKomentar(nama, pesan) {
    const daftar = JSON.parse(localStorage.getItem("komentar")) || [];
    daftar.push({ id: Date.now(), nama, pesan });
    localStorage.setItem("komentar", JSON.stringify(daftar));
}

function hapusKomentarDariStorage(id) {
    let daftar = JSON.parse(localStorage.getItem("komentar")) || [];
    daftar = daftar.filter(item => item.id !== id);
    localStorage.setItem("komentar", JSON.stringify(daftar));
}

async function muatKomentar() {
    if (!daftarKomentar) return;
    daftarKomentar.innerHTML = "";

    let daftar = JSON.parse(localStorage.getItem("komentar"));

    // Jika belum ada komentar di localStorage, fetch dari /posts/1/comments
    if (!daftar) {
        try {
            const response = await fetch("https://jsonplaceholder.typicode.com/posts/1/comments?_limit=3");
            if (!response.ok) throw new Error("Gagal memuat komentar API");
            
            const commentsAPI = await response.json();
            daftar = commentsAPI.map(c => ({
                id: c.id,
                nama: c.email.split('@')[0],
                pesan: c.body
            }));
            
            localStorage.setItem("komentar", JSON.stringify(daftar));
        } catch (error) {
            console.error("Gagal memuat komentar awal:", error);
            daftar = [{ id: Date.now(), nama: "Sistem", pesan: "Selamat datang di portofolio ini!" }];
        }
    }

    daftar.forEach((k) => {
        const li = document.createElement("li");
        li.dataset.id = k.id;
        li.style.marginBottom = "8px";

        const teksKomentar = document.createElement("span");
        teksKomentar.textContent = `${k.nama}: ${k.pesan}`;

        const btnHapusKomentar = document.createElement("button");
        btnHapusKomentar.textContent = "Hapus";
        btnHapusKomentar.classList.add("btn-danger");
        btnHapusKomentar.style.marginLeft = "10px";

        li.appendChild(teksKomentar);
        li.appendChild(btnHapusKomentar);
        daftarKomentar.appendChild(li);
    });
}

if (formKomentar) {
    formKomentar.addEventListener("submit", (e) => {
        e.preventDefault();

        const nama = inputNama.value.trim();
        const pesan = inputPesan.value.trim();

        if (nama === "" || pesan.length < 5) {
            if (pesanError) {
                pesanError.textContent = "Nama wajib diisi dan komentar minimal 5 karakter!";
                pesanError.classList.remove("tersembunyi");
            }
            return;
        }

        if (pesanError) pesanError.classList.add("tersembunyi");

        simpanKomentar(nama, pesan);
        muatKomentar();

        sessionStorage.removeItem("drafNama");
        sessionStorage.removeItem("drafPesan");
        formKomentar.reset();
    });
}

if (daftarKomentar) {
    daftarKomentar.addEventListener("click", (e) => {
        if (e.target.tagName === "BUTTON" && e.target.textContent === "Hapus") {
            const li = e.target.closest("li");
            const id = parseInt(li.dataset.id);
            
            hapusKomentarDariStorage(id);
            li.remove();
        }
    });
}

if (btnHapusSemua && daftarKomentar) {
    btnHapusSemua.addEventListener("click", () => {
        localStorage.removeItem("komentar");
        daftarKomentar.innerHTML = "";
    });
}

if (inputNama && inputPesan) {
    inputNama.value = sessionStorage.getItem("drafNama") || "";
    inputPesan.value = sessionStorage.getItem("drafPesan") || "";

    inputNama.addEventListener("input", () => {
        sessionStorage.setItem("drafNama", inputNama.value);
    });

    inputPesan.addEventListener("input", () => {
        sessionStorage.setItem("drafPesan", inputPesan.value);
    });
}

/* -------------------------------------------------------------
   5. RESET & INTI ESEKUSI
------------------------------------------------------------- */
const btnReset = document.querySelector("#btn-reset");
if (btnReset) {
    btnReset.addEventListener("click", () => {
        const konfirmasi = confirm("Hapus semua data tersimpan (tema, like, komentar, & status aside)?");
        if (konfirmasi) {
            localStorage.clear();
            sessionStorage.clear();
            location.reload();
        }
    });
}

// Inisialisasi Eksekusi
muatPreferensiTema();
muatStatusAside();
muatPortofolioDariAPI();
muatProfilPenulis();
muatKomentar();