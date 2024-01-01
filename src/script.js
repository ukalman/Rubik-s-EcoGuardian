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
import * as SkeletonUtils from 'three/examples/jsm/utils/SkeletonUtils';
import CannonDebugger from 'cannon-es-debugger';

document.getElementById('quitButton').addEventListener('click', function() {
  // Kullanıcıya oyundan çıkması için bir mesaj göster
  var exit = confirm('Are you sure you want to quit the game?');
  if (exit) {
    // Kullanıcı evet dediyse, sayfayı kapatmaya çalış
    window.close();
    // Eğer tarayıcı yeni sekme kapatmayı engellerse, kullanıcıyı ana sayfaya yönlendir
    if (!window.closed) {
      window.location.href = 'about:blank'; // veya kullanıcıyı başka bir sayfaya yönlendirin
    }
  }
});

document.getElementById('playButton').addEventListener('click', function() {
  // Oyun başlatma işlevleri burada yer alacak
  console.log('Oyun başlatıldı');
  // Örnek olarak, menüyü gizleyebilirsiniz
  document.getElementById('mainMenu').style.display = 'none';
});

document.getElementById('optionsButton').addEventListener('click', function() {
  const optionsMenu = document.getElementById('optionsMenu');

  document.getElementById('playButton').style.display = 'none';
  document.getElementById('quitButton').style.display = 'none';
  document.getElementById('title').style.display = 'none';
  // Eğer başka butonlar da varsa, onları da gizleyin
  // document.getElementById('anotherButton').style.display = 'none';

  // Options butonunu deaktif hale getir (veya gizle)
  this.style.display = 'none';
  if (optionsMenu.style.display === 'none') {
    optionsMenu.style.display = 'block';
  } else {
    optionsMenu.style.display = 'none';

  }
});

document.querySelectorAll('.difficulty-button').forEach(button => {
  button.addEventListener('click', function() {
    const difficulty = this.getAttribute('data-difficulty');
    console.log('Seçilen zorluk: ' + difficulty);
    // Zorluğa göre oyun ayarlarınızı burada yapabilirsiniz
  });
});
document.getElementById('backButton').addEventListener('click', function() {
  // Options menüsünü gizle
  document.getElementById('optionsMenu').style.display = 'none';


  document.getElementById('title').style.display = 'block';
  document.getElementById('playButton').style.display = 'block';
  document.getElementById('optionsButton').style.display = 'block';
  document.getElementById('quitButton').style.display = 'block';
  // Diğer ana menü butonlarınız varsa, onları da burada tekrar gösterin
});

let isGamePaused = false;



// Oyunu duraklatma ve devam ettirme işlevleri
function pauseGame() {
  isGamePaused = true;
  // Oyunu duraklatma işlemleri burada yer alacak
  document.getElementById('pause').style.display = 'block';

}

function resumeGame() {
  isGamePaused = false;
  // Oyunu devam ettirme işlemleri burada yer alacak
  document.getElementById('pause').style.display = 'none';

}

// Klavye olayını dinleme
document.addEventListener('keydown', function(event) {
  if (event.key === 'Escape') {
    if (!isGamePaused) {
      pauseGame();
    } else {
      resumeGame();
    }
  }
});

console.log(SkeletonUtils);

const canvas = document.getElementById("game-surface");

// Create the Physics World
const physicsWorld = new CANNON.World({
  gravity: new CANNON.Vec3(0, -9.81, 0)
}); 
const timeStep = 1 / 60;

// Scene
const scene = new THREE.Scene();

// CannonDebugger
const cannonDebugger = new CannonDebugger(scene,physicsWorld);

var evilCubes = new Map();

// RubiksCube Class

class RubiksCube {
  constructor(model, mixer, animationsMap, orbitControl, thirdPersonCam) {
      this.model = model;
      this.mixer = mixer;
      this.animationsMap = animationsMap;
      this.orbitControl = orbitControl;
      this.camera = thirdPersonCam;
      this.currentAction = 'Idle';
      this.isBoosted = 'false';
     
      this.moveDirection = new THREE.Vector3();
      this.rotateAngle = new THREE.Vector3(0,1,0);
      this.rotateQuaternion = new THREE.Quaternion();
      this.cameraTarget = new THREE.Vector3();

      // constants
      this.fadeDuration = 0.2;
      this.runVelocity = 50;
      this.walkVelocity = 20;

      // rigidbody
      const rubiksCubeBody = new CANNON.Body({
        mass: 5,
        shape: new CANNON.Box(new CANNON.Vec3(2,2,2)), 
        position: new CANNON.Vec3(0,0,0)
      });
      this.rigidbody = rubiksCubeBody;
      physicsWorld.addBody(rubiksCubeBody);

      this.rigidbody.addEventListener('collide',(e)=>{
        if(e.body.id != 0){
          if(e.body.mass === 1){
            console.log("Collision with an evil cube!");
            //this.collideWith(e.body);
            console.log(e.body);
            // console.log(e.body.id);
            // console.log("evilCubes[e.body.id]");
            // console.log(evilCubes.get(e.body.id));

            this.collideWith(evilCubes.get(e.body.id));
          }
          

        }
   
      });

  }




  boost() {
    // Implement logic for boosting the Rubik's cube
  }

  update(frameTime, keysPressed, delta) {

    if(isGamePaused!==true){


      // Update the Rubik's cube's state, animation, and progression toward the solution
      const directions = ['w','a','s','d'];
      const space = [' '];
      const shiftKey = ['shift'];
      const directionPressed = directions.some(key => keysPressed[key] == true);
      const spacePressed = space.some(key => keysPressed[key] == true);
      const shiftPressed = shiftKey.some(key => keysPressed[key] == true);

      var play = 'Idle';
      if(directionPressed){
        play = 'MoveForward';
        if(shiftPressed){
          play = 'MoveForwardBoosted';
          this.isBoosted = true;
        }
        else {
          play = 'MoveForward';
          this.isBoosted = false;
        }
      }

      if(spacePressed){
        play = 'Jump';
        if(directionPressed){
          play = 'JumpWhileMove';
        }
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

      if(this.currentAction == 'MoveForward' || this.currentAction == 'JumpWhileMove' || this.currentAction == 'MoveForwardBoosted'){
        // calculate towards camera direction
        // angle between the camera view and the character
        var angleYCameraDirection = Math.atan2(
            (this.camera.position.x - this.model.position.x),
            (this.camera.position.z - this.model.position.z)
        );

        // diagonal movement angle offset
        var directionOffset = this.directionOffset(keysPressed);

        // rotate model
        // make the model rotate towards that direction stepwise
        this.rotateQuaternion.setFromAxisAngle(this.rotateAngle, angleYCameraDirection + directionOffset);
        this.model.quaternion.rotateTowards(this.rotateQuaternion, 0.2);
        // This part is important, just trying something
        this.rigidbody.quaternion.copy(this.model.quaternion);

        // calculate direction
        // based on the previously calculated angles, we calculated the vector which represents the direction into which the model must move
        this.camera.getWorldDirection(this.moveDirection)
        this.moveDirection.y = 0;
        this.moveDirection.normalize();
        this.moveDirection.applyAxisAngle(this.rotateAngle,directionOffset);


        // boost/normal velocity
        const velocity = this.isBoosted ? this.runVelocity : this.walkVelocity;

        // move model & camera
        const moveX = this.moveDirection.x * velocity * frameTime;
        const moveZ = this.moveDirection.z * velocity * frameTime;
        // this.model.position.x += moveX;
        // this.model.position.z += moveZ;
        this.rigidbody.position.x += moveX;
        this.rigidbody.position.z += moveZ;

        if(this.currentAction === 'JumpWhileMove'){
          const moveY = new THREE.Vector3(0.0,1.0,0.0).y * frameTime * velocity;
          // console.log("move x: ");
          // console.log(moveX);
          // console.log("move z: ");
          // console.log(moveZ);
          // console.log("move y: ");
          // console.log(moveY);
          this.rigidbody.position.y += moveY;
        }


        this.updateModelPosition();
        this.updateCameraTarget(moveX, moveZ);



    }

    }

  }

  updateCameraTarget(moveX, moveZ) {

    if(isGamePaused!==true){

      // move camera
      this.camera.position.x += moveX;
      this.camera.position.z += moveZ;

      // update camera target
      this.cameraTarget.x = this.model.position.x;
      this.cameraTarget.y = this.model.position.y + 1;
      this.cameraTarget.z = this.model.position.z;
      this.orbitControl.target = this.cameraTarget;

    }

  }

  updateModelPosition(){
    if(isGamePaused!==true){
    this.model.position.copy(this.rigidbody.position);
    this.model.quaternion.copy(this.rigidbody.quaternion);
    }
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
    // console.log("fonksiyona gelen evil cube: ");
    // console.log(evilCube);
    // Handle collision between the Rubik's cube and an evil cube
    const velocity = this.isBoosted ? this.runVelocity : this.walkVelocity;
    const momentum = this.rigidbody.mass * velocity; // Implement a function to calculate damage
    if(momentum > 100){
      evilCube.receiveDamage(momentum);
    }
    
    //this.points += calculatePoints(); // Implement a function to calculate points
    //this.progressTowardsSolution();
  }

  progressTowardsSolution() {
    // Move the Rubik's cube toward the solution based on the current points
    // Implement animation logic for face movements
  }

  // Add other methods as needed
  static initializeRubiksCube(model, mixer, animationsMap, orbitControl, thirdPersonCam){
    return new RubiksCube(model, mixer, animationsMap, orbitControl, thirdPersonCam);
  }
  
}


// CubeGraph Class
class CubeGraph {
  constructor(cubes, playerCube, scene) {
    this.cubes = cubes; // All evil cubes
    this.playerCube = playerCube; // The player cube
    this.scene = scene; // Reference to the Three.js scene
    this.arrowHelper = this.createArrowHelper();
    this.scene.add(this.arrowHelper);
  }

  createArrowHelper() {
    // Create an ArrowHelper with an initial dummy direction and add it to the scene
    const arrowDir = new THREE.Vector3(0, 1, 0);
    const arrowPos = this.playerCube.model.position;
    const arrowColor = 0xff0000;
    const arrowLength = 4;
    return new THREE.ArrowHelper(arrowDir, arrowPos, arrowLength, arrowColor);
  }


  findNearestCube() {
    let nearestCube = null;
    let minDistance = Infinity;

    this.cubes.forEach((evilCube) => {
      const distance = this.playerCube.model.position.distanceTo(evilCube.model.position);
      if (distance < minDistance) {
        minDistance = distance;
        nearestCube = evilCube;
      }
    });

    return nearestCube;
  }

  updateArrowDirection() {
    const nearestCube = this.findNearestCube();
    if (nearestCube) {
      const direction = new THREE.Vector3().subVectors(nearestCube.model.position, this.playerCube.model.position).normalize();
      const arrowPosition = this.playerCube.model.position.clone();

      // Arrow'un yüksekliğini artır
      arrowPosition.y += 2; // Örnek olarak, yüksekliği 2 birim yukarı çıkarın

      this.arrowHelper.position.copy(arrowPosition);
      this.arrowHelper.setDirection(direction);

      // Okun boyunu ve baş kısmını daha büyük yaparak kalın bir görünüm verin
      const arrowLength = this.playerCube.model.position.distanceTo(nearestCube.model.position)/2;
      const headLength = arrowLength * 0.2; // Ok başının boyunu toplam boyun %20'si yapın
      const headWidth = headLength * 0.6; // Ok başının genişliğini boyun %60'ı yapın

      this.arrowHelper.setLength(arrowLength, headLength, headWidth); // Update the arrow length dynamically
    }
  }

  // ... other methods ...
}




// Evil Cube Class
class EvilCube {
  constructor(model) {
    this.model = model;
    // this.mixer = mixer;
    // this.animationsMap = animationsMap;
    this.currentAction = 'Idle';
    this.tag = 'EvilCube';
    this.health = 100;
    this.isDead = false;
   
    this.moveDirection = new THREE.Vector3();
    this.rotateAngle = new THREE.Vector3(0,1,0);
    this.rotateQuaternion = new THREE.Quaternion();
    this.cameraTarget = new THREE.Vector3();

    // constants
    this.fadeDuration = 0.2;
    this.runVelocity = 30;
    this.walkVelocity = 20;

    // rigidbody
    const evilCubeBody = new CANNON.Body({
      mass: 1,
      shape: new CANNON.Box(new CANNON.Vec3(1,1,1)), 
      position: new CANNON.Vec3(Math.random() * 200 - 100,0,Math.random() * 200 - 100)

    });
    this.rigidbody = evilCubeBody;
    physicsWorld.addBody(evilCubeBody);

    evilCubes.set(this.rigidbody.id, this);

  }




  receiveDamage(momentum) {
    console.log("Gelen momentum: ");
    console.log(momentum);
    // Calculate damage based on collision momentum
    //const impactSpeed = momentum.length(); // Magnitude of the collision speed

    // Adjust this factor based on gameplay testing
    const damageFactor = 0.065; // You may need to fine-tune this value

    // Calculate damage based on impact speed and a scaling factor
    // const damage = Math.floor(impactSpeed * damageFactor);
    const damage = Math.floor(momentum * damageFactor);

    // Inflict damage on the evil cube
    this.health -= damage;

    // Ensure that health doesn't go below zero
    this.health = Math.max(0, this.health);

    console.log("Received damage, damage is: " + damage);
    console.log("New value of health: " + this.health);

    // Handle any additional logic related to receiving damage
  }

  update(frameTime){
    if(isGamePaused!==true) {
      this.updateModelPosition();
      if (this.health <= 0) {
        this.destroyEvilCube();
        evilCubes.delete(this.rigidbody.id);
      }
    }
  }

  updateModelPosition(){
    if(isGamePaused!==true){
    this.model.position.copy(this.rigidbody.position);
    this.model.quaternion.copy(this.rigidbody.quaternion);
    }
  }

  static initializeEvilCube(model){
    return new EvilCube(model);
  }

  destroyEvilCube(){
    physicsWorld.removeBody(this.rigidbody);
    scene.remove(this.model);
  
  }

}

// CONTROL KEYS
const keysPressed = { };
document.addEventListener('keydown',(e)=>{
  keysPressed[e.key.toLowerCase()] = true;
}, false);

document.addEventListener('keyup',(e)=>{
  keysPressed[e.key.toLowerCase()] = false;
}, false);

// LoadingManager, put it in the textureloader
const loadingManager = new THREE.LoadingManager();
loadingManager.onStart = () => {
  console.log("Start");
}
loadingManager.onLoad = () => {
  console.log("Loading...");
}
loadingManager.onProgress = () => {
  console.log("Progress");
}

loadingManager.onError = () => {
  console.log("Error!");
}

const textureLoader = new THREE.TextureLoader(loadingManager);
const colorTexture = textureLoader.load("/texture/groundTexture.jpg");

// console.log(colorTexture);


// THREE.JS
//GLTFLoader
const gltfLoader = new GLTFLoader();
//DRACOLoader
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath("/draco/");
gltfLoader.setDRACOLoader(dracoLoader);

//GUI
const gui = new dat.GUI();

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
const city_envTexture = textureLoader.load("/assets/skybox/spherical_skybox.jpg");
//scene.background = city_envTexture;

var geometry = new THREE.SphereGeometry( 1000, 500, 40 );
geometry.scale( - 1, 1, 1 );

var material = new THREE.MeshBasicMaterial( {
  map: city_envTexture
} );

const mesh = new THREE.Mesh( geometry, material );

scene.add( mesh );

/*
"/assets/skybox/px.png",
"/assets/skybox/nx.png",
"/assets/skybox/py.png",
"/assets/skybox/ny.png",
"/assets/skybox/pz.png",
"/assets/skybox/nz.png"
*/

// Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
const directionalLight = new THREE.DirectionalLight(0xffffff, 0.7);
directionalLight.position.set(30, 300, 2);
directionalLight.castShadow = true;
// Optimize ShadowMap Size
directionalLight.shadow.mapSize.width = 1024; // default is 512, value should be divisible by 2
directionalLight.shadow.mapSize.height = 1024;
scene.add(ambientLight);
scene.add(directionalLight);
const directionalLightHelper = new THREE.DirectionalLightHelper(
  directionalLight
);
scene.add(directionalLightHelper)

gui.add(directionalLight,"intensity").min(0).max(1).step(0.01).name("Intensity Direct");
gui.add(directionalLight.position,"x").min(-10).max(10).step(0.01).name("X Dir Direct");
gui.add(directionalLight.position,"y").min(-10).max(10).step(0.01).name("Y Dir Direct");
// gui.add(directionalLight.shadow.mapSize,"width").min(512).max(4096).step(512).name("Shadow Map Width");
// gui.add(directionalLight.shadow.mapSize,"height").min(512).max(4096).step(512).name("Shadow Map Height");


// Ground Mesh
const groundGeo = new THREE.PlaneGeometry(300,300);
const groundMat = new THREE.MeshStandardMaterial({
  color: 0xcff2f2,
  transparent: true,
  opacity: 0.1,
  side: THREE.DoubleSide,
  //map: colorTexture
});
groundMat.transparent = true;
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
const boxMat = new THREE.MeshStandardMaterial({
  color: 0x00ff00,
  //wireframe:true
});
const boxMesh = new THREE.Mesh(boxGeo,boxMat);
boxMesh.castShadow = true;
scene.add(boxMesh);

// Box Rigid Body
const boxBody = new CANNON.Body({
  mass: 1.5,
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
//renderer.setClearColor("#27282c", 1.0);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.setSize(aspect.width, aspect.height);
// tell the renderer to render shadow map



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

let cubeGraph;
gltfLoader.load("/assets/rubikscube10.glb", (gltf) => {

  const rubiksCubeModel = gltf.scene;
  rubiksCubeModel.traverse(function (object){
    if (object.isMesh){ 
      object.castShadow = true;
    }
  });
  scene.add(rubiksCubeModel);
  animationMixer = new THREE.AnimationMixer(rubiksCubeModel);
  const clips = gltf.animations;
  const animationsMap = new Map();
  clips.forEach((clip)=>{
    animationsMap.set(clip.name, animationMixer.clipAction(clip))
  });
  // console.log(clips);
  // const clip = THREE.AnimationClip.findByName(clips, 'MoveForwardBoosted');
  // console.log("clip: ");
  // console.log(clip);

  // const action = animationMixer.clipAction(clip);
  // console.log(action);
  // console.log("rubikscubemodel: ");
  // console.log(rubiksCubeModel);
  // action.play();

  rubiksCube = RubiksCube.initializeRubiksCube(gltf.scene,animationMixer,animationsMap,orbitControls,camera);

  cubeGraph = new CubeGraph(evilCubes, rubiksCube, scene);
  
},(xhr)=> { 
  console.log( (xhr.loaded / xhr.total * 100) + '%loaded');
},
// called when loading has errors
(error)=>{
  // TO LOAD A COMPRESSED MODEL, YOU NEED TO USE THE DRACOLOADER
  console.log("An error happened while loading the Rubik's Cube Model: " + error);
});

var evilCube = null;
// Evil Cube
gltfLoader.load("/assets/evilcube.glb", (gltf) => {
  const evilCubeModel = gltf.scene;
  // console.log("evil cube model: ");
  // console.log(evilCubeModel);
  evilCubeModel.traverse(function (object){
    if (object.isMesh){ 
      object.castShadow = true;
    }
  });
  for(let i = 0; i < 20; i++){
    const evilCubeClone = SkeletonUtils.clone(evilCubeModel);
    // evilCubeClone.matrixAutoUpdate = false;
    console.log("clone: ");
    console.log(evilCubeClone);
    scene.add(evilCubeClone);
    
    EvilCube.initializeEvilCube(evilCubeClone);

  }
  //evilCubeModel.position.set(5,2,4);
  //scene.add(evilCubeModel);

  //evilCube = EvilCube.initializeEvilCube(gltf.scene);



  //***************************************
  //***************************************





//****************************************************
      //****************************************************
      //****************************************************
  
},(xhr)=> { 
  console.log( (xhr.loaded / xhr.total * 100) + '%loaded');
},
// called when loading has errors
(error)=>{
  // TO LOAD A COMPRESSED MODEL, YOU NEED TO USE THE DRACOLOADER
  console.log("An error happened while loading Evil Cube Model: " + error);
});


var city = null;
gltfLoader.load("/assets/city/city.glb", (gltf) => {
  city = gltf.scene;
  city.traverse(function (object){
    if (object.isMesh){ 
      object.castShadow = true;
    }
  });
  city.position.set(0,-12,0);

  scene.add(city);

  
  
},(xhr)=> { 
  console.log( (xhr.loaded / xhr.total * 100) + '%loaded');
},
// called when loading has errors
(error)=>{
  // TO LOAD A COMPRESSED MODEL, YOU NEED TO USE THE DRACOLOADER
  console.log("An error happened while loading City Model: " + error);
});


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
  // cannon debugger
  cannonDebugger.update();
  
  if(rubiksCube){
    rubiksCube.update(frameTime,keysPressed,mixerUpdateDelta);
  }

  evilCubes.forEach((evilCube,evilCubeId) => {
    if(evilCube){
      if(!evilCube.isDead){
        evilCube.update(frameTime);
      }
    }
  });

  /*
  if(evilCube){
    
  }
  */
  

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


  if (cubeGraph && !isGamePaused) {
    cubeGraph.updateArrowDirection();
  }
  //Renderer
  if(isGamePaused!==true){
    renderer.render(scene, camera);
  }





  //RequestAnimationFrame
  window.requestAnimationFrame(animate);
};
animate();
