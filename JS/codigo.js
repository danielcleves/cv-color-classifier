const video = document.getElementById('video');
const info = document.getElementById('info');

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

const canvasDominante = document.getElementById('canvasDominante');
const ctxDominante = canvasDominante.getContext('2d');

const canvasBinario = document.getElementById('canvasBinario');
const ctxBinario = canvasBinario.getContext('2d');

let model = null;

async function cargarModelo() {
    model = await tf.loadLayersModel('model.json');
    console.log("Modelo cargado");
}

cargarModelo();

// CHECKBOXES
const chkRojo = document.getElementById('chkRojo');
const chkVerde = document.getElementById('chkVerde');
const chkAzul = document.getElementById('chkAzul');
const chkNaranja = document.getElementById('chkNaranja');
const chkBlanco = document.getElementById('chkBlanco');
const chkNegro = document.getElementById('chkNegro');

// CONFIG
const getConfig = () => ({
    rMinRojo: +document.getElementById('rMinRojo').value,
    rDiffG: +document.getElementById('rDiffG').value,
    rDiffB: +document.getElementById('rDiffB').value,

    gMinVerde: +document.getElementById('gMinVerde').value,
    gDiffR: +document.getElementById('gDiffR').value,
    gDiffB: +document.getElementById('gDiffB').value,

    bMinAzul: +document.getElementById('bMinAzul').value,
    bDiffR: +document.getElementById('bDiffR').value,
    bDiffG: +document.getElementById('bDiffG').value,

    rMinNaranja: +document.getElementById('rMinNaranja').value,
    gMinNaranja: +document.getElementById('gMinNaranja').value,
    bMaxNaranja: +document.getElementById('bMaxNaranja').value,

    rMinBlanco: +document.getElementById('rMinBlanco').value,
    gMinBlanco: +document.getElementById('gMinBlanco').value,
    bMinBlanco: +document.getElementById('bMinBlanco').value,

    rMaxNegro: +document.getElementById('rMaxNegro').value,
    gMaxNegro: +document.getElementById('gMaxNegro').value,
    bMaxNegro: +document.getElementById('bMaxNegro').value
});

// Cámara
navigator.mediaDevices.getUserMedia({ video: true })
    .then(stream => video.srcObject = stream)
    .catch(() => info.textContent = "Verifica permisos de cámara");

// Esperar OpenCV
function opencvReady() {
    return typeof cv !== "undefined" && cv.imread;
}

video.addEventListener('play', procesarFrame);

function procesarFrame() {

    const config = getConfig();

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

    // 🔥 DETECCIÓN DE COLOR (tu lógica intacta)
    for (let i = 0; i < data.length; i += 4) {

        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        let detectado = false;

        if (chkBlanco.checked && r > config.rMinBlanco && g > config.gMinBlanco && b > config.bMinBlanco) {
            data[i] = 255; data[i + 1] = 255; data[i + 2] = 255;
            conteo.BLANCO++; detectado = true;
        }
        else if (chkNegro.checked && r < config.rMaxNegro && g < config.gMaxNegro && b < config.bMaxNegro) {
            data[i] = 0; data[i + 1] = 0; data[i + 2] = 0;
            conteo.NEGRO++; detectado = true;
        }
        else if (chkNaranja.checked && r > config.rMinNaranja && g > config.gMinNaranja && b < config.bMaxNaranja) {
            data[i] = 255; data[i + 1] = 165; data[i + 2] = 0;
            conteo.NARANJA++; detectado = true;
        }
        else if (chkRojo.checked && r > config.rMinRojo && r > g + config.rDiffG && r > b + config.rDiffB) {
            data[i] = 255; data[i + 1] = 0; data[i + 2] = 0;
            conteo.ROJO++; detectado = true;
        }
        else if (chkVerde.checked && g > config.gMinVerde && g > r + config.gDiffR && g > b + config.gDiffB) {
            data[i] = 0; data[i + 1] = 255; data[i + 2] = 0;
            conteo.VERDE++; detectado = true;
        }
        else if (chkAzul.checked && b > config.bMinAzul && b > r + config.bDiffR && b > g + config.bDiffG) {
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

    // 🔥 COLOR DOMINANTE
    let colorDominante = "NINGUNO";
    let max = 0;

    for (let color in conteo) {
        if (conteo[color] > max) {
            max = conteo[color];
            colorDominante = color;
        }
    }

    // 🔥 CANVAS DOMINANTE
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

    // 🔥 CANVAS BINARIO (blanco y negro)
    const frameBinario = ctxBinario.createImageData(canvas.width, canvas.height);
    const dataBinario = frameBinario.data;

    for (let i = 0; i < data.length; i += 4) {

        let coincide = false;

        if (colorDominante === "ROJO" && data[i] === 255 && data[i + 1] === 0 && data[i + 2] === 0) coincide = true;
        if (colorDominante === "VERDE" && data[i] === 0 && data[i + 1] === 255 && data[i + 2] === 0) coincide = true;
        if (colorDominante === "AZUL" && data[i] === 0 && data[i + 1] === 0 && data[i + 2] === 255) coincide = true;
        if (colorDominante === "NARANJA" && data[i] === 255 && data[i + 1] === 165 && data[i + 2] === 0) coincide = true;
        if (colorDominante === "BLANCO" && data[i] === 255 && data[i + 1] === 255 && data[i + 2] === 255) coincide = true;
        if (colorDominante === "NEGRO" && data[i] === 0 && data[i + 1] === 0 && data[i + 2] === 0) coincide = true;

        if (coincide) {
            // BLANCO (objeto)
            dataBinario[i] = 255;
            dataBinario[i + 1] = 255;
            dataBinario[i + 2] = 255;
            dataBinario[i + 3] = 255;
        } else {
            // NEGRO (fondo)
            dataBinario[i] = 0;
            dataBinario[i + 1] = 0;
            dataBinario[i + 2] = 0;
            dataBinario[i + 3] = 255;
        }
    }

    ctxBinario.putImageData(frameBinario, 0, 0);

    // 🔥 OPENCV (formas)
    let figura = "Ninguna";

    if (opencvReady()) {

        let src = cv.imread(canvasDominante);
        let gray = new cv.Mat();
        let blur = new cv.Mat();
        let thresh = new cv.Mat();
        let contours = new cv.MatVector();
        let hierarchy = new cv.Mat();

        cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY);
        cv.GaussianBlur(gray, blur, new cv.Size(5, 5), 0);
        cv.threshold(blur, thresh, 100, 255, cv.THRESH_BINARY);
        
        // 🔥 LIMPIEZA DE RUIDO (AQUÍ VA)
        let kernel = cv.Mat.ones(7, 7, cv.CV_8U);

        // Cierra huecos grandes (clave para triángulo)
        cv.morphologyEx(thresh, thresh, cv.MORPH_CLOSE, kernel);

        // Suaviza bordes
        cv.GaussianBlur(thresh, thresh, new cv.Size(5, 5), 0);

        kernel.delete();

        cv.findContours(thresh, contours, hierarchy, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE);

        for (let i = 0; i < contours.size(); i++) {

            let cnt = contours.get(i);
            let area = cv.contourArea(cnt);

            if (area < 1500) continue;

            let approx = new cv.Mat();
            let peri = cv.arcLength(cnt, true);

            cv.approxPolyDP(cnt, approx, 0.04 * peri, true);

            let vertices = approx.rows;

            if (vertices === 3) figura = "Triángulo";
            else if (vertices === 4) figura = "Rectángulo";
            else if (vertices > 4) figura = "Círculo";

            cv.drawContours(src, contours, i, [255, 0, 0, 255], 3);

            approx.delete();
        }

        cv.imshow(canvasDominante, src);

        src.delete();
        gray.delete();
        blur.delete();
        thresh.delete();
        contours.delete();
        hierarchy.delete();
    }

    info.textContent = `Color dominante: ${colorDominante} | Figura: ${figura}`;

    requestAnimationFrame(procesarFrame);
}