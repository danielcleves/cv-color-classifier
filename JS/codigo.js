const video = document.getElementById('video');
const info = document.getElementById('info');

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

const canvasDominante = document.getElementById('canvasDominante');
const ctxDominante = canvasDominante.getContext('2d');

// CHECKBOXES
const chkRojo = document.getElementById('chkRojo');
const chkVerde = document.getElementById('chkVerde');
const chkAzul = document.getElementById('chkAzul');
const chkNaranja = document.getElementById('chkNaranja');
const chkBlanco = document.getElementById('chkBlanco');
const chkNegro = document.getElementById('chkNegro');

// Cámara
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

    // SEGMENTACIÓN
    for (let i = 0; i < data.length; i += 4) {

        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        let detectado = false;

        // ⚠️ COLORES MÁS ESPECÍFICOS PRIMERO

        if (chkBlanco.checked && r > 200 && g > 200 && b > 200) {
            data[i] = 255; data[i + 1] = 255; data[i + 2] = 255;
            conteo.BLANCO++; detectado = true;

        } else if (chkNegro.checked && r < 50 && g < 50 && b < 50) {
            data[i] = 0; data[i + 1] = 0; data[i + 2] = 0;
            conteo.NEGRO++; detectado = true;

        } else if (chkNaranja.checked && r > 150 && g > 80 && b < 100) {
            data[i] = 255; data[i + 1] = 165; data[i + 2] = 0;
            conteo.NARANJA++; detectado = true;

            // 🔻 PRIMARIOS AL FINAL (como querías)

        } else if (chkRojo.checked && r > 120 && r > g + 40 && r > b + 40) {
            data[i] = 255; data[i + 1] = 0; data[i + 2] = 0;
            conteo.ROJO++; detectado = true;

        } else if (chkVerde.checked && g > 120 && g > r + 40 && g > b + 40) {
            data[i] = 0; data[i + 1] = 255; data[i + 2] = 0;
            conteo.VERDE++; detectado = true;

        } else if (chkAzul.checked && b > 120 && b > r + 40 && b > g + 40) {
            data[i] = 0; data[i + 1] = 0; data[i + 2] = 255;
            conteo.AZUL++; detectado = true;
        }

        // Fondo amarillo
        if (!detectado) {
            data[i] = 255; data[i + 1] = 255; data[i + 2] = 0;
        }
    }

    ctx.putImageData(frame, 0, 0);

    // COLOR DOMINANTE
    let colorDominante = "NINGUNO";
    let max = 0;

    for (let color in conteo) {
        if (conteo[color] > max) {
            max = conteo[color];
            colorDominante = color;
        }
    }

    // CANVAS SOLO COLOR DOMINANTE
    ctxDominante.clearRect(0, 0, canvasDominante.width, canvasDominante.height);

    const frameDominante = ctxDominante.createImageData(canvas.width, canvas.height);
    const dataDominante = frameDominante.data;

    for (let i = 0; i < data.length; i += 4) {

        let coincide = false;

        if (colorDominante === "ROJO" && data[i] === 255 && data[i + 1] === 0 && data[i + 2] === 0) coincide = true;
        if (colorDominante === "VERDE" && data[i] === 0 && data[i + 1] === 255 && data[i + 2] === 0) coincide = true;
        if (colorDominante === "AZUL" && data[i] === 0 && data[i + 1] === 0 && data[i + 2] === 255) coincide = true;
        if (colorDominante === "NARANJA" && data[i] === 255 && data[i + 1] === 165 && data[i + 2] === 0) coincide = true;
        if (colorDominante === "BLANCO" && data[i] === 255 && data[i + 1] === 255 && data[i + 2] === 255) coincide = true;
        if (colorDominante === "NEGRO" && data[i] === 0 && data[i + 1] === 0 && data[i + 2] === 0) coincide = true;

        if (coincide) {
            dataDominante[i] = data[i];
            dataDominante[i + 1] = data[i + 1];
            dataDominante[i + 2] = data[i + 2];
            dataDominante[i + 3] = 255;
        } else {
            // 🟡 Fondo amarillo (lo que pediste)
            dataDominante[i] = 255;
            dataDominante[i + 1] = 255;
            dataDominante[i + 2] = 0;
            dataDominante[i + 3] = 255;
        }
    }

    ctxDominante.putImageData(frameDominante, 0, 0);

    info.textContent = `Color dominante: ${colorDominante}`;

    requestAnimationFrame(procesarFrame);
}

video.addEventListener('play', () => {
    procesarFrame();
});