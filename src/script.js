import "./style.css";
import * as THREE from "three";
import * as CANNON from "cannon-es";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader";
import { MeshSurfaceSampler } from "three/examples/jsm/math/MeshSurfaceSampler";
import gsap from "gsap";
import vShader from "./shaders/vertex.glsl";
import fShader from "./shaders/fragment.glsl";
import * as dat from "dat.gui";

const canvas = document.getElementById("game-surface");

// RubiksCube Class

class RubiksCube {
  constructor(model, mixer, animationsMap, orbitControl, thirdPersonCam) {
      this.model = model;
      this.mixer = mixer;
      this.animationsMap = animationsMap;
      this.orbitControl = orbitControl;
      this.camera = thirdPersonCam;
      this.currentAction = 'Idle';
     
      this.moveDirection = new THREE.Vector3();
      this.rotateAngle = new THREE.Vector3(0,1,0);
      this.rotateQuaternion = new THREE.Quaternion();
      this.cameraTarget = new THREE.Vector3();

      // constants
      this.fadeDuration = 0.2;
      this.runVelocity = 10;
      this.walkVelocity = 5;

  }

  moveForward(distance) {
    // Move the Rubik's cube forward
  }

  moveBackward(distance) {
    // Move the Rubik's cube backward
  }

  moveLeft(distance) {
    // Move the Rubik's cube to the left
  }

  moveRight(distance) {
    // Move the Rubik's cube to the right
  }

  jump(){

  }

  rotateCamera(deltaX, deltaY) {
    // Rotate the camera based on mouse movement
  }

  boost() {
    // Implement logic for boosting the Rubik's cube
  }

  update(frameTime, keysPressed, delta) {
    // Update the Rubik's cube's state, animation, and progression toward the solution
    const directions = ['w','a','s','d'];
    const directionPressed = directions.some(key => keysPressed[key] == true);
    
    var play = 'Idle';
    if(directionPressed){
      play = 'MoveForward';
    } 

    if(this.currentAction != play){
      // console.log("animations map: ");
      // console.log(this.animationsMap);
      // console.log("current action: " + this.currentAction);
      const toPlay = this.animationsMap.get(play);
      const current = this.animationsMap.get(this.currentAction);
      // console.log(current);

      current.fadeOut(this.fadeDuration);
      toPlay.reset().fadeIn(this.fadeDuration).play();

      this.currentAction = play;
    }

    this.mixer.update(frameTime);

    if(this.currentAction == 'MoveForward'){
      // calculate towards camera direction
      // angle between the camera view and the character
      var angleYCameraDirection = Math.atan2(
        (this.camera.position.x - this.model.position.x),
        (this.camera.position.z - this.model.position.z)
      );

      console.log("keys pressed:");
      console.log(keysPressed);
      // diagonal movement angle offset
      var directionOffset = this.directionOffset(keysPressed);
      
      // rotate model
      // make the model rotate towards that direction stepwise
      this.rotateQuaternion.setFromAxisAngle(this.rotateAngle, angleYCameraDirection + directionOffset);
      this.model.quaternion.rotateTowards(this.rotateQuaternion, 0.2);
        
      // calculate direction
      // based on the previously calculated angles, we calculated the vector which represents the direction into which the model must move
      this.camera.getWorldDirection(this.moveDirection)
      this.moveDirection.y = 0;
      this.moveDirection.normalize();
      this.moveDirection.applyAxisAngle(this.rotateAngle,directionOffset);

      // boost/normal velocity 
      const velocity = this.currentAction == 'Boost' ? this.runVelocity : this.walkVelocity;

      // move model & camera
      const moveX = this.moveDirection.x * velocity * frameTime;
      const moveZ = this.moveDirection.z * velocity * frameTime;
      this.model.position.x += moveX;
      this.model.position.z += moveZ;
      this.updateCameraTarget(moveX, moveZ);
    }

  }

  updateCameraTarget(moveX, moveZ) {
    // move camera
    this.camera.position.x += moveX;
    this.camera.position.z += moveZ;

    // update camera target
    this.cameraTarget.x = this.model.position.x;
    this.cameraTarget.y = this.model.position.y + 1;
    this.cameraTarget.z = this.model.position.z;
    this.orbitControl.target = this.cameraTarget;

  }


  directionOffset(keysPressed){
    var directionOffset = 0; // w

    if(keysPressed.w){
      if (keysPressed.a){
        directionOffset = Math.PI / 4 // w + a
      } else if (keysPressed.d){
        directionOffset = - Math.PI / 4 // w + d
      }
    } else if (keysPressed.s){
      if (keysPressed.a){
        directionOffset = Math.PI / 4 + Math.PI / 2 // s + a
      } else if(keysPressed.d) {
        directionOffset = -Math.PI / 4 - Math.PI / 2 // s + d
      } else {
        directionOffset = Math.PI // s
      }
    } else if (keysPressed.a) {
      directionOffset = Math.PI / 2 // a
    } else if (keysPressed.d) {
      directionOffset = - Math.PI/2; // d
    }
    
    return directionOffset;
  
  }

  collideWith(evilCube) {
    // Handle collision between the Rubik's cube and an evil cube
    const damage = calculateDamage(); // Implement a function to calculate damage
    evilCube.receiveDamage(damage);
    this.points += calculatePoints(); // Implement a function to calculate points
    this.progressTowardsSolution();
  }

  progressTowardsSolution() {
    // Move the Rubik's cube toward the solution based on the current points
    // Implement animation logic for face movements
  }

  // Add other methods as needed
}

function initializeRubiksCube(model, mixer, animationsMap, orbitControl, thirdPersonCam){
  return new RubiksCube(model, mixer, animationsMap, orbitControl, thirdPersonCam);
}

// CONTROL KEYS
const keysPressed = { };
document.addEventListener('keydown',(e)=>{
  keysPressed[e.key.toLowerCase()] = true;
}, false);

document.addEventListener('keyup',(e)=>{
  keysPressed[e.key.toLowerCase()] = false;
}, false);



// THREE.JS
//GLTFLoader
const gltfLoader = new GLTFLoader();
//DRACOLoader
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath("/draco/");
gltfLoader.setDRACOLoader(dracoLoader);

//GUI
const gui = new dat.GUI();

//Scene
const scene = new THREE.Scene();

//Environment Map
const cubeTextureLoader = new THREE.CubeTextureLoader();
const envTexture = cubeTextureLoader.load([
  "/assets/skybox/px.png",
  "/assets/skybox/nx.png",
  "/assets/skybox/py.png",
  "/assets/skybox/ny.png",
  "/assets/skybox/pz.png",
  "/assets/skybox/nz.png"
]);
scene.background = envTexture;

// Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
const directionalLight = new THREE.DirectionalLight(0xffffff, 0.7);
directionalLight.position.set(0, 4, 2);
directionalLight.castShadow = true;
// Optimize ShadowMap Size
directionalLight.shadow.mapSize.width = 1024; // default is 512, value should be divisible by 2
directionalLight.shadow.mapSize.height = 1024;
scene.add(ambientLight, directionalLight);



// Create the Physics World
const physicsWorld = new CANNON.World({
  gravity: new CANNON.Vec3(0, -9.81, 0)
}); 
const timeStep = 1 / 60;

// Ground Mesh
const groundGeo = new THREE.PlaneGeometry(300,300);
const groundMat = new THREE.MeshBasicMaterial({
  color: 0xcff2f2,
  side: THREE.DoubleSide,
});
const groundMesh = new THREE.Mesh(groundGeo,groundMat);
groundMesh.receiveShadow = true;
scene.add(groundMesh);

// Ground Rigid Body
const groundBody = new CANNON.Body({
  shape: new CANNON.Plane(), // infinite plane in the ground
  type: CANNON.Body.STATIC // mass = 0
});
physicsWorld.addBody(groundBody);
groundBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0);
groundBody.position.set(0,-2,0);

// Box Mesh
const boxGeo = new THREE.BoxGeometry(2,2,2);
const boxMat = new THREE.MeshBasicMaterial({
  color: 0x00ff00,
  wireframe:true
});
const boxMesh = new THREE.Mesh(boxGeo,boxMat);
scene.add(boxMesh);

// Box Rigid Body
const boxBody = new CANNON.Body({
  mass: 1,
  shape: new CANNON.Box(new CANNON.Vec3(1,1,1)), 
  position: new CANNON.Vec3(1,20,0)
});
physicsWorld.addBody(boxBody);


//Camera
const aspect = {
  width: window.innerWidth,
  height: window.innerHeight,
};
const camera = new THREE.PerspectiveCamera(
  75,
  aspect.width / aspect.height,
);
camera.position.y = 5;
camera.position.z = 10;
scene.add(camera);

//OrbitControl
const orbitControls = new OrbitControls(camera, canvas);
orbitControls.enableDamping = true;


//Renderer
const renderer = new THREE.WebGLRenderer({
  canvas,
});
renderer.setClearColor("#27282c", 1.0);
renderer.setSize(aspect.width, aspect.height);
// tell the renderer to render shadow map
renderer.shadowMap.enabled = true;


//Resizing
window.addEventListener("resize", () => {
  //Update Size
  aspect.width = window.innerWidth;
  aspect.height = window.innerHeight;

  //New Aspect Ratio
  camera.aspect = aspect.width / aspect.height;
  camera.updateProjectionMatrix();

  //New RendererSize
  renderer.setSize(aspect.width, aspect.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});


//Loading Models
//1) Rubiks Cube
let animationMixer;
var rubiksCube = null;
gltfLoader.load("/assets/rubikscube7.glb", (gltf) => {


  const rubiksCubeModel = gltf.scene;
  rubiksCubeModel.traverse(function (object){
    if (object.isMesh) object.castShadow = true;
  });
  scene.add(rubiksCubeModel);
  animationMixer = new THREE.AnimationMixer(rubiksCubeModel);
  const clips = gltf.animations;
  const animationsMap = new Map();
  clips.forEach((clip)=>{
    animationsMap.set(clip.name, animationMixer.clipAction(clip))
  });

  const clip = THREE.AnimationClip.findByName(clips, 'Jump');

  const action = animationMixer.clipAction(clip);
  // console.log(action);
  // console.log("rubikscubemodel: ");
  // console.log(rubiksCubeModel);
  //action.play();

  rubiksCube = initializeRubiksCube(gltf.scene,animationMixer,animationsMap,orbitControls,camera);
  
},(xhr)=> { 
  console.log( (xhr.loaded / xhr.total * 100) + '%loaded');
},
// called when loading has errors
(error)=>{
  // TO LOAD A COMPRESSED MODEL, YOU NEED TO USE THE DRACOLOADER
  console.log('An error happened while loading the model: ' + error);
});
console.log("hey:");
console.log(rubiksCube);

// Box Rigid Body
/*
const rubiksCubeBody = new CANNON.Body({
  mass: 3,
  shape: new CANNON.Box(new CANNON.Vec3(2,2,2)), 
  position: new CANNON.Vec3(0,0,0)
});
physicsWorld.addBody(rubiksCubeBody);
*/

/*
gltfLoader.load("/models/1.glb", (glb) => {
  //increasing the number of vertices
  const samplerMesh = new MeshSurfaceSampler(glb.scene.children[0]).build();
  const particlesNumber = 25000;
  const particlesGeometry = new THREE.BufferGeometry();
  const particlesArray = new Float32Array(particlesNumber * 3);
  for (let i = 0; i < particlesNumber; i++) {
    const particlePosition = new THREE.Vector3();
    samplerMesh.sample(particlePosition);
    particlesArray.set(
      [particlePosition.x, particlePosition.y, particlePosition.z],
      i * 3
    );
  }
  particlesGeometry.setAttribute(
    "position",
    new THREE.BufferAttribute(particlesArray, 3)
  );

  //changing model into particles
  glb.scene.children[0] = new THREE.Points(
    particlesGeometry,
    new THREE.RawShaderMaterial({
      vertexShader: vShader,
      fragmentShader: fShader,
      uniforms: {
        u_color_1: { value: new THREE.Color(`${firstModelColor1}`) },
        u_color_2: { value: new THREE.Color(`${firstModelColor2}`) },
        u_scale: { value: 0 },
      },
      depthTest: false,
      blending: THREE.AdditiveBlending,
    })
  );

  glb.scene.children[0].scale.set(0.7, 0.7, 0.7);
  glb.scene.children[0].position.x = 0.5;
  glb.scene.children[0].rotation.y = Math.PI * 0.5;
  modelArray[0] = glb.scene;
});
*/



//Clock Class
const clock = new THREE.Clock();
let previousTime = 0;
const animate = () => {
  //getElapsedTime
  const elapsedTime = clock.getElapsedTime();
  let mixerUpdateDelta = clock.getDelta();
  // time moving from the previous frame to the current frame
  const frameTime = elapsedTime - previousTime; // 0.004 - 0.002 = 0.002
  previousTime = elapsedTime; // previousTime = 0.004
  // Update AnimationMixer
  
  /*
  if(animationMixer){
    animationMixer.update(frameTime);
  }
  */
  
  
  if(rubiksCube){
    rubiksCube.update(frameTime,keysPressed,mixerUpdateDelta);
  }
  

  //Update Controls
  orbitControls.update();

  // Physics World
  physicsWorld.step(timeStep);

  // Ground Mesh
  groundMesh.position.copy(groundBody.position);
  groundMesh.quaternion.copy(groundBody.quaternion);

  // Box Mesh
  boxMesh.position.copy(boxBody.position);
  boxMesh.quaternion.copy(boxBody.quaternion);

  // Rubiks Cube
  // rubiksCubeModel.position.copy(rubiksCubeBody.position);
  // rubiksCubeModel.quaternion.copy(rubiksCubeBody.quaternion);

  //Renderer
  renderer.render(scene, camera);

  //RequestAnimationFrame
  window.requestAnimationFrame(animate);
};
animate();
