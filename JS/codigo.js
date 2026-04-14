const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const canvasForma = document.getElementById('canvasForma');

const ctx = canvas.getContext('2d');
const ctxForma = canvasForma.getContext('2d');

const info = document.getElementById('info');

// 🎥 Activar cámara
navigator.mediaDevices.getUserMedia({ video: true })
    .then(stream => {
        video.srcObject = stream;
        console.log("Camara activada correctamente");
    })
    .catch(error => {
        console.log("Error de dispositivo", error);
        info.textContent = "Verificar permisos";
    });


// 🔥 FUNCIÓN PRINCIPAL
function procesarFrame() {

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const frame = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = frame.data;

    // 🔢 CONTADORES
    let conteo = {
        ROJO: 0,
        VERDE: 0,
        AZUL: 0,
        NARANJA: 0,
        BLANCO: 0,
        NEGRO: 0,
        AMARILLO: 0
    };

    // Recorrer píxeles
    for (let i = 0; i < data.length; i += 4) {

        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        // 🔴 ROJO
        if (r > 120 && r > g + 40 && r > b + 40) {
            data[i] = 255; data[i + 1] = 0; data[i + 2] = 0;
            conteo.ROJO++;

            // 🟢 VERDE
        } else if (g > 120 && g > r + 40 && g > b + 40) {
            data[i] = 0; data[i + 1] = 255; data[i + 2] = 0;
            conteo.VERDE++;

            // 🔵 AZUL
        } else if (b > 120 && b > r + 40 && b > g + 40) {
            data[i] = 0; data[i + 1] = 0; data[i + 2] = 255;
            conteo.AZUL++;

            // 🟠 NARANJA
        } else if (r > 150 && g > 80 && b < 100) {
            data[i] = 255; data[i + 1] = 165; data[i + 2] = 0;
            conteo.NARANJA++;

            // ⚪ BLANCO
        } else if (r > 200 && g > 200 && b > 200) {
            data[i] = 255; data[i + 1] = 255; data[i + 2] = 255;
            conteo.BLANCO++;

            // ⚫ NEGRO
        } else if (r < 50 && g < 50 && b < 50) {
            data[i] = 0; data[i + 1] = 0; data[i + 2] = 0;
            conteo.NEGRO++;

            // 🟡 OTROS
        } else {
            data[i] = 255; data[i + 1] = 255; data[i + 2] = 0;
            conteo.AMARILLO++;
        }
    }

    // Dibujar imagen procesada
    ctxForma.putImageData(frame, 0, 0);

    // 🧠 Encontrar color dominante
    let colorDominante = "NINGUNO";
    let max = 0;

    for (let color in conteo) {

        // 🚫 Ignorar amarillo
        if (color === "AMARILLO") continue;

        if (conteo[color] > max) {
            max = conteo[color];
            colorDominante = color;
        }
    }

    // Mostrar resultado
    info.textContent = `Color dominante: ${colorDominante}`;

    requestAnimationFrame(procesarFrame);
}


// ▶️ Iniciar
video.addEventListener('play', () => {
    procesarFrame();
});