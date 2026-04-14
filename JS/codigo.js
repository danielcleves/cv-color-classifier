const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const canvasForma = document.getElementById('canvasForma');

const ctx = canvas.getContext('2d');
const ctxForma = canvasForma.getContext('2d');

const info = document.getElementById('info');

// Activar cámara
navigator.mediaDevices.getUserMedia({ video: true })
    .then(stream => {
        video.srcObject = stream;
        console.log("Camara activada correctamente");
    })
    .catch(error => {
        console.log("Error de dispositivo", error);
        info.textContent = "Verificar permisos";
    });

// Detección principal
function detectarColorYForma() {

    // Dibujar video en ambos canvas
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    ctxForma.drawImage(video, 0, 0, canvasForma.width, canvasForma.height);

    const frame = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = frame.data;

    let minX = canvas.width;
    let minY = canvas.height;
    let maxX = 0;
    let maxY = 0;

    let colorDetectado = null;

    // 🔴 DETECCIÓN DE COLOR
    for (let y = 0; y < canvas.height; y++) {
        for (let x = 0; x < canvas.width; x++) {

            const i = (y * canvas.width + x) * 4;
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];

            let esColor = false;

            if (r > 120 && r > g + 40 && r > b + 40) {
                colorDetectado = "ROJO";
                esColor = true;

            } else if (g > 120 && g > r + 40 && g > b + 40) {
                colorDetectado = "VERDE";
                esColor = true;

            } else if (b > 120 && b > r + 40 && b > g + 40) {
                colorDetectado = "AZUL";
                esColor = true;

                // 🟠 NARANJA
            } else if (r > 150 && g > 80 && b < 100) {
                colorDetectado = "NARANJA";
                esColor = true;

                // ⚪ BLANCO
            }

            if (esColor) {
                if (x < minX) minX = x;
                if (y < minY) minY = y;
                if (x > maxX) maxX = x;
                if (y > maxY) maxY = y;
            }
        }
    }

    let forma = "Ninguna";

    // 🟩 DETECCIÓN DE FORMA
    if (maxX > minX && maxY > minY) {

        const w = maxX - minX;
        const h = maxY - minY;

        // Dibujar bounding box en canvas original
        ctx.strokeStyle = "lime";
        ctx.lineWidth = 2;
        ctx.strokeRect(minX, minY, w, h);

        // 👉 Clasificación simple de forma
        const relacion = w / h;

        if (relacion > 0.8 && relacion < 1.2) {
            forma = "CIRCULO";
        } else {
            forma = "RECTANGULO";
        }

        // Dibujar en canvas de forma
        ctxForma.strokeStyle = "red";
        ctxForma.lineWidth = 3;
        ctxForma.strokeRect(minX, minY, w, h);

        ctxForma.font = "20px Arial";
        ctxForma.fillStyle = "yellow";
        ctxForma.fillText(forma, minX, minY - 10);

        info.textContent = `Color: ${colorDetectado} | Forma: ${forma}`;
    } else {
        info.textContent = "No se detecta objeto";
    }

    requestAnimationFrame(detectarColorYForma);
}

// Iniciar
video.addEventListener('play', () => {
    detectarColorYForma();
});