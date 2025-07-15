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

document.addEventListener('DOMContentLoaded', () => {
    // ... (kode lainnya tetap sama) ...

    const permissionButton = document.createElement('button');
    // ... (styling tombol izin) ...
    document.body.appendChild(permissionButton);

    let usingGyro = false; // Flag untuk menandai apakah gyro sedang digunakan

    // ... (fungsi applyTransforms, resetTransforms) ...

    // Fungsi utama untuk menangani data gyro
    function handleDeviceOrientation(event) {
        // ... (perhitungan gyroOffsetX, gyroOffsetY, gyroRotateX, gyroRotateY) ...
        applyTransforms(gyroOffsetX, gyroOffsetY, gyroRotateX, gyroRotateY);
    }

    // Fungsi untuk meminta izin gyro dan mengaktifkannya
    function requestGyroPermission() {
        if (typeof DeviceOrientationEvent.requestPermission === 'function') {
            DeviceOrientationEvent.requestPermission()
                .then(permissionState => {
                    if (permissionState === 'granted') {
                        window.addEventListener('deviceorientation', handleDeviceOrientation);
                        usingGyro = true; // Set flag
                        profileCard.removeEventListener('mousemove', handleMouseMove); // Hapus listener mouse
                        profileCard.removeEventListener('mouseleave', handleMouseLeave);
                        permissionButton.style.display = 'none';
                        console.log("Akses Gyroscope diberikan. Efek 3D aktif.");
                    } else {
                        console.warn('Akses Gyroscope ditolak.');
                        setupMouseEventListeners(); // Fallback ke mouse
                    }
                })
                .catch(error => {
                    console.error('Gagal meminta izin Gyroscope:', error);
                    setupMouseEventListeners(); // Fallback ke mouse
                });
        } else {
            // Untuk browser yang tidak memerlukan izin eksplisit (kebanyakan Android/Desktop)
            window.addEventListener('deviceorientation', handleDeviceOrientation);
            usingGyro = true; // Set flag
            profileCard.removeEventListener('mousemove', handleMouseMove); // Hapus listener mouse
            profileCard.removeEventListener('mouseleave', handleMouseLeave);
            permissionButton.style.display = 'none';
            console.log("Device Orientation API didukung tanpa izin eksplisit. Efek 3D aktif.");
        }
    }

    // Fungsi untuk menangani event mouse
    function handleMouseMove(e) {
        if (usingGyro) return; // Penting: Jangan jalankan jika gyro sudah aktif
        // ... (perhitungan mouseX, mouseY, rotateX, rotateY) ...
        applyTransforms(mouseX, mouseY, rotateX, rotateY);
    }

    function handleMouseLeave() {
        if (usingGyro) return; // Penting: Jangan jalankan jika gyro sudah aktif
        resetTransforms();
    }

    // Fungsi untuk mengatur listener mouse
    function setupMouseEventListeners() {
        profileCard.addEventListener('mousemove', handleMouseMove);
        profileCard.addEventListener('mouseleave', handleMouseLeave);
        console.log("Menggunakan efek mouse.");
    }

    // --- LOGIKA UTAMA INISIALISASI ---
    // Deteksi apakah perangkat ini kemungkinan mobile (touch-enabled, no hover)
    const isMobileDevice = window.matchMedia("(hover: none) and (pointer: coarse)").matches;

    if (isMobileDevice) {
        // Jika ini perangkat mobile, coba aktifkan GYRO
        if (window.DeviceOrientationEvent) {
            if (typeof DeviceOrientationEvent.requestPermission === 'function') {
                permissionButton.style.display = 'block'; // Tampilkan tombol untuk izin
                permissionButton.addEventListener('click', requestGyroPermission);
                console.log("Menunggu izin Gyroscope di perangkat mobile...");
            } else {
                // Langsung aktifkan gyro jika tidak butuh izin eksplisit (misal beberapa Android)
                requestGyroPermission();
            }
        } else {
            // Jika perangkat mobile tapi tidak ada dukungan gyro, fallback ke mouse
            setupMouseEventListeners();
            console.log("Perangkat mobile tidak mendukung Gyroscope. Menggunakan efek mouse.");
        }
    } else {
        // Jika ini bukan perangkat mobile (desktop/laptop), langsung aktifkan MOUSE
        setupMouseEventListeners();
        console.log("Perangkat desktop terdeteksi. Menggunakan efek mouse.");
    }

    // Reset transform saat orientasi atau ukuran jendela berubah
    window.addEventListener('orientationchange', resetTransforms);
    window.addEventListener('resize', resetTransforms);
});
