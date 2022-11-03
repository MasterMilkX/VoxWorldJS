const fs = require('fs');
const THREE = require('three');
const GIFEncoder = require('gifencoder');
const {createCanvas} = require('../js/node-canvas-webgl');
const loadImage = require('canvas').loadImage;

const width = 512,
  height = 512;

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
const canvas = createCanvas(width, height);
const renderer = new THREE.WebGLRenderer({
  canvas:canvas, antialias: false, preserveDrawingBuffer: true 
});

//basic green cube
const geometry = new THREE.BoxGeometry(1, 1, 1);
// const material = new THREE.MeshBasicMaterial({color: 0x00ff00});

//custom material from an image's data
let cube = null;
let filename = "./textures/bookshelf.png";
loadImage(filename).then((image) => {
  //fake mini canvas for the imported images
  const img_canvas = createCanvas(image.width, image.height)
  const itx = img_canvas.getContext('2d')

  //draw onto mini canvas
  itx.drawImage(image, 0, 0, img_canvas.width, img_canvas.height);

  //add to the scene
  const texture = new THREE.CanvasTexture(img_canvas);
  const material = new THREE.MeshBasicMaterial({map: texture});
  cube = new THREE.Mesh(geometry, material);
  scene.add(cube);

  //start recording
  encoder.start();
  encoder.setRepeat(0); // 0 for repeat, -1 for no-repeat
  encoder.setDelay(16); // frame delay in ms
  encoder.setQuality(10); // image quality. 10 is default.
  update(16);
})

camera.position.z = 5;

//setup gif
const encoder = new GIFEncoder(width, height);
encoder.createReadStream().pipe(fs.createWriteStream('./threejs-cube.gif'));
// encoder.start();
// encoder.setRepeat(0); // 0 for repeat, -1 for no-repeat
// encoder.setDelay(16); // frame delay in ms
// encoder.setQuality(10); // image quality. 10 is default.


//make a gif of the rotating cube
let idx = 0;
function update(maxFrames = 60) {
  cube.rotation.x += 0.05;
  cube.rotation.y += 0.05;
  renderer.render(scene, camera);
  if(idx > 0) {
    console.log(canvas.__ctx__);
    encoder.addFrame(canvas.__ctx__);
    // console.log(`add frame ${idx}`);
  }
  idx++;
  if(idx < maxFrames) {
    setTimeout(update, 16);
  }else{
    encoder.finish();
    console.log("Finished!");
  }
}
// update();