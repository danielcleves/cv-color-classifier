const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const canvasForma = document.getElementById('canvasForma');

const ctx = canvas.getContext('2d');
const ctxForma = canvasForma.getContext('2d');

const info = document.getElementById('info');

// ✅ CHECKBOXES
const chkRojo = document.getElementById('chkRojo');
const chkVerde = document.getElementById('chkVerde');
const chkAzul = document.getElementById('chkAzul');
const chkNaranja = document.getElementById('chkNaranja');
const chkBlanco = document.getElementById('chkBlanco');
const chkNegro = document.getElementById('chkNegro');

// 🎥 Cámara
navigator.mediaDevices.getUserMedia({ video: true })
    .then(stream => {
        video.srcObject = stream;
    })
    .catch(error => {
        info.textContent = "Verificar permisos";
    });

function procesarFrame() {

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const frame = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = frame.data;

    let conteo = {
        ROJO: 0,
        VERDE: 0,
        AZUL: 0,
        NARANJA: 0,
        BLANCO: 0,
        NEGRO: 0
    };

    for (let i = 0; i < data.length; i += 4) {

        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        let detectado = false;

        // 🔴 ROJO
        if (chkRojo.checked && r > 120 && r > g + 40 && r > b + 40) {
            data[i] = 255; data[i + 1] = 0; data[i + 2] = 0;
            conteo.ROJO++;
            detectado = true;

            // 🟢 VERDE
        } else if (chkVerde.checked && g > 120 && g > r + 40 && g > b + 40) {
            data[i] = 0; data[i + 1] = 255; data[i + 2] = 0;
            conteo.VERDE++;
            detectado = true;

            // 🔵 AZUL
        } else if (chkAzul.checked && b > 120 && b > r + 40 && b > g + 40) {
            data[i] = 0; data[i + 1] = 0; data[i + 2] = 255;
            conteo.AZUL++;
            detectado = true;

            // 🟠 NARANJA
        } else if (chkNaranja.checked && r > 150 && g > 80 && b < 100) {
            data[i] = 255; data[i + 1] = 165; data[i + 2] = 0;
            conteo.NARANJA++;
            detectado = true;

            // ⚪ BLANCO
        } else if (chkBlanco.checked && r > 200 && g > 200 && b > 200) {
            data[i] = 255; data[i + 1] = 255; data[i + 2] = 255;
            conteo.BLANCO++;
            detectado = true;

            // ⚫ NEGRO
        } else if (chkNegro.checked && r < 50 && g < 50 && b < 50) {
            data[i] = 0; data[i + 1] = 0; data[i + 2] = 0;
            conteo.NEGRO++;
            detectado = true;
        }

        // 🟡 NO DETECTADO
        if (!detectado) {
            data[i] = 255; data[i + 1] = 255; data[i + 2] = 0;
        }
    }

    ctxForma.putImageData(frame, 0, 0);

    // 🔍 Color dominante (sin amarillo)
    let colorDominante = "NINGUNO";
    let max = 0;

    for (let color in conteo) {
        if (conteo[color] > max) {
            max = conteo[color];
            colorDominante = color;
        }
    }

    info.textContent = `Color dominante: ${colorDominante}`;

    requestAnimationFrame(procesarFrame);
}

video.addEventListener('play', () => {
    procesarFrame();
});