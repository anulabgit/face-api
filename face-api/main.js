const video = document.getElementById('video');
const p_canvas = document.getElementById('p_canvas');
const captureBtn = document.getElementById('capture-btn');
const detectionBtn = document.getElementById('detection-btn');
let faceIndex = 1; // 인식된 얼굴 수
let c_dataUrl;
let i_file;
let context;

Promise.all([
  faceapi.nets.faceRecognitionNet.loadFromUri('./models'),
  faceapi.nets.faceLandmark68Net.loadFromUri('./models'),
  faceapi.nets.ssdMobilenetv1.loadFromUri('./models')
]).then(start);

function start() {
  captureBtn.addEventListener('click', function() {
    context = p_canvas.getContext('2d');
    context.drawImage(video, 0, 0, p_canvas.width, p_canvas.height);
    console.log('1')
    c_dataUrl = p_canvas.toDataURL();
    i_file = dataURLtoFile(c_dataUrl, "capture.png");
    console.log('2')
    video.remove();
    p_canvas.remove();
  });

  detectionBtn.addEventListener('click', async () => {
    const container = document.createElement('div');
    container.style.position = 'absolute';
    container.style.top = 0;
    container.style.left = 0;
    document.body.append(container);
    document.body.append('Loaded');
    console.log('3')
    const image = await faceapi.bufferToImage(i_file);
    container.append(image);
    const canvas = faceapi.createCanvasFromMedia(image);
    container.append(canvas);
    const displaySize = { width: image.width, height: image.height };
    faceapi.matchDimensions(canvas, displaySize);
    const detections = await faceapi.detectAllFaces(image)
      .withFaceLandmarks()
      .withFaceDescriptors();
      const resizedDetections = faceapi.resizeResults(detections, displaySize);
      resizedDetections.forEach(async (detection) => {
        const box = detection.detection.box;
        const faceCanvas = document.createElement('canvas');
        const faceContext = faceCanvas.getContext('2d');
        faceCanvas.width = box.width;
        faceCanvas.height = box.height;
        faceContext.drawImage(image, box.x, box.y, box.width, box.height, 0, 0, box.width, box.height);
        const dataUrl = faceCanvas.toDataURL();
        const linkContainer = document.createElement('div');
        linkContainer.style.position = 'absolute';
        linkContainer.style.top = `${box.y + box.height}px`;
        linkContainer.style.left = `${box.x}px`;
        linkContainer.style.display = 'flex';
        linkContainer.style.flexDirection = 'column';
        linkContainer.style.alignItems = 'center';
        const link = document.createElement('a');
        link.href = dataUrl;
        link.download = `face${faceIndex}.png`;
        link.innerHTML = `Download face${faceIndex} image`;
        const img = document.createElement('img');
        img.src = dataUrl;
        img.style.maxWidth = '100%';
        linkContainer.append(link);
        linkContainer.append(img);
        container.append(linkContainer);
        faceIndex++;
        const drawBox = new faceapi.draw.DrawBox(box, { label: 'Face' });
        drawBox.draw(canvas);
    });
  });
}

function dataURLtoFile(dataurl, filename) {
  var arr = dataurl.split(','),
    mime = arr[0].match(/:(.*?);/)[1],
    bstr = atob(arr[1]),
    n = bstr.length,
    u8arr = new Uint8Array(n);
    while(n--){
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, {type:mime});
}
