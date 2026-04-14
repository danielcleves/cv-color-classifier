const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d')
const info = document.getElementById('info');

// Activar camara
navigator.mediaDevices.getUserMedia({ video: true })
    .then(stream => {
        video.srcObject = stream;
        console.log("Camara activada correctamente")
    }).catch(error => {
        console.log("Error de dispositivo", error);
        info.textContent = "Verificar permisos";
    })

// Detección de colores por reglas heuristicas
function detectarColor() {
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

    // Obtener datos por pixel
    const frame = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = frame.data;

    // Variables para el area del objeto
    let minX = canvas.width;
    let minY = canvas.height;
    let maxX = 0;
    let maxY = 0;

    let colorDetectado = null;

    //Recorrer los pixeles del 2 canva
    for (let y = 0; y < canvas.height; y++) {
        for (let x = 0; x < canvas.width; x++) {
            const i = (y * canvas.width + x) * 4;
            const r = data[i]
            const g = data[i + 1]
            const b = data[i + 2]

            // Clasificaciones
            if (r > 120 && r > g + 40 && r > b + 40) {
                colorDetectado = "ROJO"
            } else if (g > 120 && g > r + 40 && g > b + 40) {
                colorDetectado = "VERDE"
            } else if (b > 120 && b > r + 40 && b > g + 40) {
                colorDetectado = "AZUL"
            }

            //Actualizar limites de las areas
            if (colorDetectado) {
                if (x < minX) minX = x;
                if (y < minY) minY = y;
                if (x > maxX) maxX = x;
                if (y > maxY) maxY = y;
            }
        }
    }

    //Dibujar el rectangulo de captura
    if (maxX > minX && maxY > minY) {
        const w = maxX - minX; // Ancho del rectángulo
        const h = maxY - minY; // Alto del rectángulo
        ctx.strokeStyle = "lime"; // Color del borde del rectángulo
        ctx.lineWidth = 2; // Grosor del borde
        ctx.strokeRect(minX, minY, w, h); // Dibujar rectángulo
        info.textContent = `Color: ${ colorDetectado } | X:${ minX } Y:${ minY } W:${ w } H:${ h }`;
    } else {
        info.textContent = "No se detecta objeto"; // Mensaje si no se detecta nada
    }

    // Volver a ejecutar la función en el siguiente fotograma
    requestAnimationFrame(detectarColor);
}

// Iniciar detección cuando el vídeo comience a reproducirse
video.addEventListener('play', () => {
    detectarColor();
});