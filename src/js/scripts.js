import * as THREE from 'three';
//import {MindARThree} from 'mind-ar/dist/mindar-image-three.prod.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
const loader = new THREE.TextureLoader();
let isPaused = false;
const targetInitialPos = new THREE.Vector3(-2, 0, 0);
const targetSpeed = 0.1;
const fps = 30;

camera.position.set(0, 0, 2);

// const renderer = new THREE.WebGLRenderer();
// renderer.setSize( window.innerWidth, window.innerHeight );
// document.body.appendChild( renderer.domElement );

// const geometry = new THREE.BoxGeometry( 1, 1, 1 );
// const material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
// const cube = new THREE.Mesh( geometry, material );
// scene.add( cube );

// camera.position.z = 5;

// function animate() {
  // 	requestAnimationFrame( animate );
  // 	renderer.render( scene, camera );
  //     cube.rotation.x += 0.01;
//     cube.rotation.y += 0.01;
// }
// animate();

const color = 0xFFFFFF;
const intensity = 1;
const light = new THREE.AmbientLight(color, intensity);
scene.add(light);

const planeWidth = 1;
const planeHeight = 1;
const geometry = new THREE.PlaneGeometry(planeWidth, planeHeight);

const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

const outlineObj = makeInstance(geometry, 0, new THREE.Vector3(0, 0, 0), 'images/CatOutline.png');
const targetObj = makeInstance(geometry,  0, targetInitialPos, 'images/Cat.png');

window.addEventListener('pointerdown', click);

function render() {
  setTimeout( function() {
    
    requestAnimationFrame(render);
  }, 1000 / fps );

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
  isPaused = !isPaused
}

render();

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