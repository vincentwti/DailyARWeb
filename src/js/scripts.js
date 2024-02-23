import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
//import {MindARThree} from 'mind-ar/dist/mindar-image-three.prod.js';

const gui = new dat.GUI()
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
const loader = new THREE.TextureLoader();
const targetInitialPos = new THREE.Vector3(-2, -0.7, 0);
const targetSpeed = 0.2;
const fps = 60;

let isPaused = false;

let tryCount = 0;
let width = window.innerWidth;
let height = window.innerHeight;
let targetDistance;
let score = 0;
let isResultScreenShown = false;

let itemParent = null;
let items = [];

scene.background = new THREE.Color('grey');
camera.position.set(0, 0, 2);

const color = 0xFFFFFF;
const intensity = 1;
const light = new THREE.AmbientLight(color, intensity);
scene.add(light);

const pointLight = new THREE.PointLight(color, intensity, 10);
pointLight.position.x = 0.1;
pointLight.position.y = -0.5;
pointLight.position.z = -0.2;
scene.add(pointLight);

const planeWidth = 1;
const planeHeight = 1;
const geometry = new THREE.PlaneGeometry(planeWidth, planeHeight);
const resultPanelGeometry = new THREE.PlaneGeometry(1.5, 1.9);
let resultPanelMesh = null;

const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.domElement.style.cssFloat = "right";

//document.body.appendChild( renderer.domElement );
const container = document.querySelector('#threejs-container');
const canvas = document.createElement('canvas');
let webcamCanvas = null;
let context = canvas.getContext('2d');


const outlineObj = makeInstance(geometry, 0, new THREE.Vector3(0, targetInitialPos.y, 0), 'images/CatOutline.png');
const targetObj = makeInstance(geometry,  0, targetInitialPos, 'images/Cat.png');

window.addEventListener('pointerdown', click);
window.addEventListener('resize', () => {
  width = window.innerWidth
  height = window.innerHeight
  camera.aspect = width / height
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
  renderer.render(scene, camera)
})

canvas.style.position = 'absolute';
canvas.style.zIndex = 1;
canvas.width = 512;
canvas.height = 256;
container.append(renderer.domElement)
renderer.render(scene, camera)

let scoreMesh = null;
let scoreTexture = null;
let scoreMaterial = null;

let webcamTexture = null;

//document.body.appendChild(canvas);
displayInterface();
createScoreMesh();
initWebcam();
init();
render();


function createScoreMesh() {
  scoreTexture = new THREE.Texture(canvas);
  scoreTexture.wrapS = scoreTexture.wrapT = THREE.RepeatWrapping;
  scoreMaterial = new THREE.MeshBasicMaterial({
    color: 'white',
    map: scoreTexture,
    opacity: 1,
    transparent: true,
    side: THREE.DoubleSide,
  });
  
  const scoreGeometry = new THREE.PlaneGeometry(1, 0.5, 1 );
  scoreMesh = new THREE.Mesh(scoreGeometry, scoreMaterial);
  scoreMesh.position.set(0, -0.65, 0.2);
  scene.add(scoreMesh);
  scoreMesh.parent = resultPanelMesh;
}

function render() {
  setTimeout( function() {
    requestAnimationFrame(render);
  }, 1000 / fps );

  scoreTexture.needsUpdate = true;
  webcamTexture.needsUpdate = true;
  displayInterface();
  rotateItem();
  renderer.render( scene, camera );

  if(!isPaused)
  {
    targetObj.position.x +=  targetSpeed;
    if(targetObj.position.x > -targetInitialPos.x)
    {
      targetObj.position.set(targetInitialPos.x, targetInitialPos.y, targetInitialPos.z);
    }
  }
}

function rotateItem() {
  if(itemParent !== null)
  {
    itemParent.rotation.y += 0.01;
  }
  else
  {
    console.log("parent not null");
  }
}

function showResultScreen() {
  resultPanelMesh.visible = true;
  itemParent.visible = true;
  scoreMesh.visible = true;
  for(let i = 0; i < items.length; i++)
  {
    items[i].visible = true;
  }
  isResultScreenShown = true;
}

function hideResultScreen() {
  resultPanelMesh.visible = false;
  itemParent.visible = false;
  scoreMesh.visible = false;
  for(let i = 0; i < items.length; i++)
  {

    items[i].visible = false;
  }
  isResultScreenShown = false;
}

function click(event){
  if(isResultScreenShown)
  {
    hideResultScreen();
    return; 
  }
  if(!isPaused)
  {
    tryCount += 1;
    displayInterface();
    targetDistance = Math.abs(targetObj.position.x - outlineObj.position.x);
    score = Math.round(100 - targetDistance * 50);
    if(score === 100)
    {
      score -= 0.41;
    }
    showResultScreen();
  }
  isPaused = !isPaused
}

function makeInstance(geometry, rotY, position, url) {
  const texture = loader.load(url, render);
  const material = new THREE.MeshBasicMaterial({
    color: 'white',
    map: texture,
    opacity: 1,
    transparent: true,
    side: THREE.DoubleSide,
  });
  const mesh = new THREE.Mesh(geometry, material); 

  scene.add(mesh);
  mesh.position.x = position.x;
  mesh.position.y = position.y;
  mesh.position.z = position.z;
  
  mesh.rotation.y = rotY;
  return mesh;
}

function displayInterface() {
  let fontSize = 80 + (score > 90 ? (score / 5) : 0);
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.font = fontSize + 'px dunkin';
  context.fillStyle = 'transparent';

  context.fillRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = 'white'
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.fillText(score, canvas.width / 2, canvas.height / 2);
}

// function deviceCamera() {
//   navigator.mediaDevices.getUserMedia({ video: true })
//   .then(stream => {
//       const video = document.getElementById('webcam-video');
//       video.srcObject = stream;
//   })
//   .catch(error => {
//       console.error('Error accessing webcam:', error);
//       // Handle error appropriately, e.g., display a message to the user
//   });

  function initWebcam() {
    const video = document.getElementById('video');

    navigator.mediaDevices.getUserMedia({ video: {
      facingMode: 'environment'
    }, audio: false })
      .then(function(stream) {
          video.srcObject = stream;
          video.play();
      })
      .catch(function(err) {
          console.log("An error occured! " + err);
      });
  }

  function init() {
    webcamCanvas = document.getElementById('video');
    webcamCanvas.background = new THREE.Color('grey');
    webcamTexture = new THREE.VideoTexture(webcamCanvas);
    webcamTexture.colorSpace = THREE.SRGBColorSpace;
    
    webcamTexture.minFilter = THREE.LinearFilter;
    webcamTexture.magFilter = THREE.LinearFilter;
    
    const movieGeometry = new THREE.PlaneGeometry(4, 6, 1);
    const movieMaterial = new THREE.MeshBasicMaterial({
      color: 'white',
      map: webcamTexture,
      opacity: 1,
      transparent: false,
      side: THREE.DoubleSide
    });
    const movieMesh = new THREE.Mesh(movieGeometry, movieMaterial);
    movieMesh.position.z = -1;
    scene.add(movieMesh);
    
    //renderer = new THREE.WebGLRenderer();
    //renderer.setSize( window.innerWidth, window.innerHeight);
    //renderer.domElement.style.cssFloat = "right";
    //document.body.appendChild( renderer.domElement );
    
    const emptyGeometry = new THREE.EdgesGeometry();
    const boxMaterial = new THREE.MeshBasicMaterial({
      color: 'white',
      opacity: 0,
      transparent: true
    });
    itemParent = new THREE.Mesh(emptyGeometry, boxMaterial);
    itemParent.position.z = 0.2;
    scene.add(itemParent);
    itemParent.parent = resultPanelMesh;
    const gltfLoader = new GLTFLoader();
    gltfLoader.load('Botol.glb', (gltf) => {
      scene.add(gltf.scene);
      gltf.scene.traverse((child) =>{
        child.parent = itemParent;
        child.scale.set(0.06, 0.06, 0.06);
        child.position.y = -0.1;
        items.push(child);
        child.visible = false;
      });
    }, undefined, (err) => console.log('err : ' + err));
    
    const resultPanelTexture = loader.load('Result Panel.png', render)
    const resultMaterial = new THREE.MeshBasicMaterial({
      color: 'white',
      map: resultPanelTexture,
      opacity: 1,
      transparent: true
    });
    resultPanelMesh = new THREE.Mesh(resultPanelGeometry, resultMaterial);
    resultPanelMesh.position.z = 0.1;
    scene.add(resultPanelMesh);
    hideResultScreen();
  }