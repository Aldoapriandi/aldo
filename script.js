document.addEventListener('DOMContentLoaded', () => {
    const profileCard = document.getElementById('profileCard');
    const layers = document.querySelectorAll('.layer');

    const movementLimit = 15; // Batas pergerakan elemen dalam piksel

    const isTouchDevice = window.matchMedia("(hover: none) and (pointer: coarse)").matches;

    function moveLayers(e) {
        if (isTouchDevice) {
            return;
        }

        const rect = profileCard.getBoundingClientRect(); // Dapatkan ukuran dan posisi kartu
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        // Hitung posisi kursor relatif terhadap tengah kartu
        // mouseX: positif kalau kursor di kanan, negatif kalau di kiri
        // mouseY: positif kalau kursor di bawah, negatif kalau di atas
        const mouseX = e.clientX - centerX;
        const mouseY = e.clientY - centerY;

        layers.forEach(layer => {
            const speed = parseFloat(layer.getAttribute('data-speed'));

            // INI PENTING UNTUK EFEK PARALLAX "NORMAL" (Layer bergerak BERLAWANAN arah kursor)
            // Jika kursor ke kanan (mouseX positif), objek bergerak ke KIRI (offsetX negatif)
            // Jika kursor ke bawah (mouseY positif), objek bergerak ke ATAS (offsetY negatif)
            // Makanya dikalikan dengan -1
            const offsetX = (mouseX / speed) * +1; // <-- Perhatikan * -1 di sini
            const offsetY = (mouseY / speed) * +1; // <-- Perhatikan * -1 di sini

            const limitedOffsetX = Math.max(-movementLimit, Math.min(movementLimit, offsetX));
            const limitedOffsetY = Math.max(-movementLimit, Math.min(movementLimit, offsetY));

            layer.style.transform = `translate(${limitedOffsetX}px, ${limitedOffsetY}px)`;
        });

        // Efek rotasi ringan pada kartu itu sendiri
        // ROTASI KARTU AKAN MENGIKUTI ARAH KURSOR (MENGHADAP KE ARAH KURSOR)
        // rotateX: positif -> miring ke bawah, negatif -> miring ke atas
        // rotateY: positif -> miring ke kanan, negatif -> miring ke kiri
        const rotateX = (mouseY / rect.height) * -20; // Jika kursor ke bawah (mouseY positif), rotateX positif -> miring ke bawah
        const rotateY = (mouseX / rect.width) * +20;  // Jika kursor ke kanan (mouseX positif), rotateY positif -> miring ke kanan

        // Aplikasi rotasi kartu:
        // Karena perhitungan rotateX dan rotateY sudah menghasilkan nilai positif/negatif yang sesuai
        // dengan arah kursor, kita gunakan nilai tersebut secara langsung.
        profileCard.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`; // <-- Perhatikan tidak ada * -1 di sini
    }

    // Fungsi untuk mengembalikan posisi elemen ke semula saat kursor meninggalkan kartu
    function resetLayers() {
        if (isTouchDevice) {
            return;
        }

        layers.forEach(layer => {
            layer.style.transform = `translate(0px, 0px)`; // Kembali ke posisi awal
        });
        profileCard.style.transform = `rotateX(0deg) rotateY(0deg)`; // Kembalikan rotasi kartu
    }

    // Tambahkan event listener hanya jika bukan perangkat sentuh
    if (!isTouchDevice) {
        profileCard.addEventListener('mousemove', moveLayers);
        profileCard.addEventListener('mouseleave', resetLayers);
    } else {
        console.log("Efek parallax dinonaktifkan untuk perangkat sentuh.");
    }
});