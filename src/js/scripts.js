import * as THREE from 'three';
//import {MindARThree} from 'mind-ar/dist/mindar-image-three.prod.js';

const gui = new dat.GUI()
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
const loader = new THREE.TextureLoader();
const targetInitialPos = new THREE.Vector3(-2, 0, 0);
const targetSpeed = 0.2;
const fps = 30;

let isPaused = false;

let tryCount = 0;
let width = window.innerWidth;
let height = window.innerHeight;

scene.background = new THREE.Color(0x262626);
camera.position.set(0, 0, 2);

const color = 0xFFFFFF;
const intensity = 1;
const light = new THREE.AmbientLight(color, intensity);
scene.add(light);

const planeWidth = 1;
const planeHeight = 1;
const geometry = new THREE.PlaneGeometry(planeWidth, planeHeight);

const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

//document.body.appendChild( renderer.domElement );
const container = document.querySelector('#threejs-container');
const canvas = document.createElement('canvas');
let context = canvas.getContext('2d');


const outlineObj = makeInstance(geometry, 0, new THREE.Vector3(0, 0, 0), 'images/CatOutline.png');
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
canvas.width = width / 2;
canvas.height = 100;
container.append(renderer.domElement)
renderer.render(scene, camera)

let scoreMesh = null;
let scoreTexture = null;
let scoreMaterial = null;

//document.body.appendChild(canvas);


//document.body.appendChild(canvas);

displayInterface();
createScoreMesh();
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
  const scoreGeometry = new THREE.PlaneGeometry(1, 0.25, 1 );
  scoreMesh = new THREE.Mesh(scoreGeometry, scoreMaterial);
  scoreMesh.position.set(0, -1, 0);
  scene.add(scoreMesh);
}

function render() {
  setTimeout( function() {
    requestAnimationFrame(render);
  }, 1000 / fps );

  scoreTexture.needsUpdate = true;
  displayInterface();
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
  
function click(event){
  if(!isPaused)
  {
    tryCount += 1;
    displayInterface();
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
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.font = '42px sans-serif';
  context.fillStyle = 'transparent';

  context.fillRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = 'white'
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.fillText('Try Count : ' + tryCount, canvas.width / 2, canvas.height / 2);
}