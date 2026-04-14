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

// FUNCIÓN PARA LEER SLIDERS UNA VEZ POR FRAME
const getConfig = () => ({
    rMinRojo: parseInt(document.getElementById('rMinRojo').value),
    rDiffG: parseInt(document.getElementById('rDiffG').value),
    rDiffB: parseInt(document.getElementById('rDiffB').value),

    gMinVerde: parseInt(document.getElementById('gMinVerde').value),
    gDiffR: parseInt(document.getElementById('gDiffR').value),
    gDiffB: parseInt(document.getElementById('gDiffB').value),

    bMinAzul: parseInt(document.getElementById('bMinAzul').value),
    bDiffR: parseInt(document.getElementById('bDiffR').value),
    bDiffG: parseInt(document.getElementById('bDiffG').value),

    rMinNaranja: parseInt(document.getElementById('rMinNaranja').value),
    gMinNaranja: parseInt(document.getElementById('gMinNaranja').value),
    bMaxNaranja: parseInt(document.getElementById('bMaxNaranja').value),

    rMinBlanco: parseInt(document.getElementById('rMinBlanco').value),
    gMinBlanco: parseInt(document.getElementById('gMinBlanco').value),
    bMinBlanco: parseInt(document.getElementById('bMinBlanco').value),

    rMaxNegro: parseInt(document.getElementById('rMaxNegro').value),
    gMaxNegro: parseInt(document.getElementById('gMaxNegro').value),
    bMaxNegro: parseInt(document.getElementById('bMaxNegro').value)


});

// Cámara
navigator.mediaDevices.getUserMedia({ video: true })
    .then(stream => {
        video.srcObject = stream;
    })
    .catch(() => {
        info.textContent = "Verificar permisos de cámara";
    });

function procesarFrame() {


    const config = getConfig(); // 🔥 SOLO UNA VEZ POR FRAME

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

        if (
            chkBlanco.checked &&
            r > config.rMinBlanco &&
            g > config.gMinBlanco &&
            b > config.bMinBlanco
        ) {
            data[i] = 255; data[i + 1] = 255; data[i + 2] = 255;
            conteo.BLANCO++; detectado = true;
        }

        else if (
            chkNegro.checked &&
            r < config.rMaxNegro &&
            g < config.gMaxNegro &&
            b < config.bMaxNegro
        ) {
            data[i] = 0; data[i + 1] = 0; data[i + 2] = 0;
            conteo.NEGRO++; detectado = true;
        }

        else if (
            chkNaranja.checked &&
            r > config.rMinNaranja &&
            g > config.gMinNaranja &&
            b < config.bMaxNaranja
        ) {
            data[i] = 255; data[i + 1] = 165; data[i + 2] = 0;
            conteo.NARANJA++; detectado = true;
        }

        else if (
            chkRojo.checked &&
            r > config.rMinRojo &&
            r > g + config.rDiffG &&
            r > b + config.rDiffB
        ) {
            data[i] = 255; data[i + 1] = 0; data[i + 2] = 0;
            conteo.ROJO++; detectado = true;
        }

        else if (
            chkVerde.checked &&
            g > config.gMinVerde &&
            g > r + config.gDiffR &&
            g > b + config.gDiffB
        ) {
            data[i] = 0; data[i + 1] = 255; data[i + 2] = 0;
            conteo.VERDE++; detectado = true;
        }

        else if (
            chkAzul.checked &&
            b > config.bMinAzul &&
            b > r + config.bDiffR &&
            b > g + config.bDiffG
        ) {
            data[i] = 0; data[i + 1] = 0; data[i + 2] = 255;
            conteo.AZUL++; detectado = true;
        }

        if (!detectado) {
            data[i] = 255;
            data[i + 1] = 255;
            data[i + 2] = 0;
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
            dataDominante[i] = 255;
            dataDominante[i + 1] = 255;
            dataDominante[i + 2] = 0;
            dataDominante[i + 3] = 255;
        }
    }

    ctxDominante.putImageData(frameDominante, 0, 0);

    info.textContent = `Color dominante: ${colorDominante} `;

    requestAnimationFrame(procesarFrame);


}

video.addEventListener('play', procesarFrame);
