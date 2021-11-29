// Mapeamento de Texturas

// import * as THREE from '../resources/threejs/build/three.module.js';
import { OrbitControls } from "../resources/threejs/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "../resources/threejs/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "../resources/threejs/examples/jsm/loaders/DRACOLoader.js";

var renderer;
var scene;
var camera;
var cameraControl;
var source;
var markerGroup;
var controllerAR;
var speedFactor = 0.005;
var distanceFactor = 0.005;

// グロバール変数が要る
let terraData;
let solData;
let luaData;

// 速度が変化する為に惑星のデータを更新する
//
function refreshPlanetData() {
  terraData = getPlanetData(
    0 * speedFactor,
    -1 * speedFactor,
    200 * 2,
    "Terra",
    "../resources/Textures/earthmap1k.jpg",
    50,
    360
  );

  solData = getPlanetData(
    (1 / 365.2564) * speedFactor,
    0.0009 * speedFactor,
    149600 * distanceFactor,
    "Sol",
    "../resources/Images/sunmap.jpg",
    90,
    360
  );

  luaData = getPlanetData(
    (1 / 29.7) * speedFactor,
    (-1 / 29.7) * speedFactor,
    38440 * distanceFactor,
    "Lua",
    "../resources/Textures/moonmap1k.jpg",
    25,
    360
  );
}

// 開始の時惑星ロードする
refreshPlanetData();

const luaFases = [
  // Crescente
  {
    x: 0,
    boundx: 200,
    z: -luaData.distanceFromAxis,
    boundz: -luaData.distanceFromAxis + 200,
  },
  // Minguante
  {
    x: 0,
    boundx: 200,
    z: luaData.distanceFromAxis,
    boundz: luaData.distanceFromAxis - 200,
  },
  // Nova
  {
    x: luaData.distanceFromAxis,
    boundx: luaData.distanceFromAxis - 200,
    z: 0,
    boundz: 200,
  },
  // Cheia
  {
    x: -luaData.distanceFromAxis,
    boundx: -luaData.distanceFromAxis + 200,
    z: 0,
    boundz: 200,
  },
];

var planets = [];

function getPlanetData(
  myOrbitRate,
  myRotationRate,
  myDistanceFromAxis,
  myName,
  myTexture,
  mySize,
  mySegments
) {
  return {
    orbitRate: myOrbitRate,
    rotationRate: myRotationRate,
    distanceFromAxis: myDistanceFromAxis,
    name: myName,
    texture: myTexture,
    size: mySize,
    segments: mySegments,
  };
}

async function initializeAR(marker) {
  controllerAR = await THREEAR.initialize({
    source,
    changeMatrixMode: "cameraTransformMatrix",
    maxDetectionRate: 120,
		canvasWidth: window.innerWidth, 
		canvasHeight: window.innerHeight,
  });

  var patternMarker = new THREEAR.PatternMarker({
    patternUrl: "./patt.hiro",
    markerObject: marker,
  });

  controllerAR.trackMarker(patternMarker);
}

async function loadTexture(textureUrl) {
  var textureLoader = new THREE.TextureLoader();

  return new Promise((resolve) => {
    var texture = textureLoader.load(textureUrl, function (texture) {
      texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    });

    resolve(texture);
  });
}

async function loadSun() {
  var texture = await loadTexture("../resources/Textures/sunmap.jpg");

  var material = new THREE.MeshPhongMaterial({
    map: texture,
    lightMap: texture,
    transparent: true,
    opacity: 0.8,
    flatShading: THREE.SmoothShading,
  });

  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.minFilter = THREE.NearestFilter;

  const geometry = new THREE.SphereGeometry(
    solData.size,
    solData.size,
    solData.size
  );
  var sun = new THREE.Mesh(geometry, material);

  const sunLight = new THREE.PointLight(0xffdcb4, 2.5);
  sun.add(sunLight);
  sun.position.set(solData.distanceFromAxis, 0, 0);

  sun.castShadow = false;
  sun.name = "Sol";
  var axisHelper = new THREE.AxesHelper(500);
  sun.add(axisHelper);
  console.log("Sol: ", sun);

  var data = [sun, solData];
  planets.push(data);
  markerGroup.add(sun);
}

async function loadEarth() {
  var texture = await loadTexture("../resources/Images/earthtexture.jpg");

  var material = new THREE.MeshPhongMaterial({
    map: texture,
    lightMap: texture,
    transparent: true,
  });

  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.minFilter = THREE.NearestFilter;

  const geometry = new THREE.SphereGeometry(
    terraData.size,
    terraData.size,
    terraData.size
  );
  var terra = new THREE.Mesh(geometry, material);

  terra.name = "Terra";
  terra.position.set(0, 0, 0);

  var axisHelper = new THREE.AxesHelper(500);
  terra.add(axisHelper);

  var data = [terra, terraData];
  planets.push(data);

  markerGroup.add(terra);
}

async function loadMoon() {
	var texture = await loadTexture("../resources/Textures/moonmap1k.jpg");

  var material = new THREE.MeshPhongMaterial({
    map: texture,
    lightMap: texture,
    transparent: true,
  });

  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.minFilter = THREE.NearestFilter;

  const geometry = new THREE.SphereGeometry(
    luaData.size,
    luaData.size,
    luaData.size
  );
  var lua = new THREE.Mesh(geometry, material);

  lua.name = "Lua";
  lua.position.set(luaData.distanceFromAxis, 0, 0);

  var data = [lua, luaData];
  planets.push(data);
  console.log("LUA", lua);

	markerGroup.add(lua);
}

async function main() {
  scene = new THREE.Scene();
  renderer = new THREE.WebGLRenderer({ alpha: true });

  renderer.setClearColor(new THREE.Color("lightgrey"), 0);
  renderer.setPixelRatio(2);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.domElement.style.top = "0px";
  renderer.domElement.style.left = "0px";
  document.getElementById("WebGL-output").appendChild(renderer.domElement);
  const ambLight = new THREE.AmbientLight(0xffffff, 0.1);
  ambLight.name = "ambLight";
  ambLight.visible = true;
  scene.add(ambLight);

  camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    0.1,
    10000
  );

  cameraControl = new OrbitControls(camera, renderer.domElement);

  // Create THREEAR source
  source = new THREEAR.Source({ renderer, camera });

  markerGroup = new THREE.Group();
  scene.add(markerGroup);

  await loadEarth();
  await loadMoon();
  await loadSun();

  await initializeAR(markerGroup);

	camera.far = 100000
	camera.updateProjectionMatrix()

  //loadMesh(terraData);
  //loadMesh(luaData);
  animateFrame(cameraControl);
  var terra = scene.getObjectByName("Terra");
  console.log(terra);
  moveCamera(terra);
  //var terra = planets[1];
  camera.lookAt(scene.position);
}

// 開始時刻
let count = 0;

// 停止期間
let isrunning = true;
let pausetime = 0;
let pauseoffset = 0;
let ismoving = false;
let currentPhase = null;

function pauseTime() {
  pausetime = count;
  isrunning = false;
  ismoving = false;
}

function resumeTime() {
  pauseoffset = pauseoffset + (count - pausetime);
  isrunning = true;
}

function setCount(offset) {
  count = offset;
  pauseoffset = 0;
  pausetime = offset;
  isrunning = false;
}

function animateFrame(cameraControl) {
  requestAnimationFrame(function animate(nowMsec) {
    controllerAR.update(source.domElement);

    if (isrunning) count = count + 20;
    // keep looping
    requestAnimationFrame(animate);

    cameraControl.update();

    planets.forEach((element) => {
      movePlanet(element, count);
    });

    renderer.render(scene, camera);
  });
}

function moveCamera(terra) {
  camera.position.x = terra.position.x + 0;
  camera.position.y = terra.position.y + 400;
  camera.position.z = terra.position.z + 1800;
  camera.lookAt(terra.position);
}

function movePlanet(myPlanet, myTime) {
  if (myPlanet[0].name == "Sol") {
  } else if (myPlanet[0].name == "Lua" && isrunning) {
    myPlanet[0].lookAt(new THREE.Vector3(0, 0, 0));

    myPlanet[0].position.x =
      Math.cos(myTime * myPlanet[1].orbitRate) * myPlanet[1].distanceFromAxis;

    myPlanet[0].position.z =
      Math.sin(myTime * myPlanet[1].orbitRate) * myPlanet[1].distanceFromAxis;
  } else {
    if (isrunning) myPlanet[0].rotateY(myPlanet[1].rotationRate);
  }
}

function setButtonStyle(button, oldClass, newClass, newText) {
  document.getElementById(button).classList.remove(oldClass);
  document.getElementById(button).classList.add(newClass);
  if (newText) document.getElementById(button).textContent = newText;
}

function resetAllMoonButtonStyles() {
  setButtonStyle("0moon", "w3-deep-orange", "w3-light-grey");
  setButtonStyle("25moon", "w3-deep-orange", "w3-grey");
  setButtonStyle("50moon", "w3-deep-orange", "w3-blue-grey");
  setButtonStyle("75moon", "w3-deep-orange", "w3-dark-grey");
}

function pauseRotation() {
  if (isrunning) {
    pauseTime();
    setButtonStyle("pause", "w3-sand", "w3-deep-orange", "Play");
    resetAllMoonButtonStyles();
  } else {
    resumeTime();
    setButtonStyle("pause", "w3-deep-orange", "w3-sand", "Pause");
    resetAllMoonButtonStyles();
  }
}

// ボタン
const buttonpause = document.getElementById("pause");
const button0moon = document.getElementById("0moon");
const button25moon = document.getElementById("25moon");
const button50moon = document.getElementById("50moon");
const button75moon = document.getElementById("75moon");

function setMoonPosition(phase) {
  let index;

  switch (phase) {
    case "Minguante":
      index = 0;
      setButtonStyle("pause", "w3-sand", "w3-deep-orange", "Play");
      resetAllMoonButtonStyles();
      setButtonStyle("75moon", "w3-dark-grey", "w3-deep-orange");
      break;
    case "Crescente":
      index = 1;
      setButtonStyle("pause", "w3-sand", "w3-deep-orange", "Play");
      resetAllMoonButtonStyles();
      setButtonStyle("25moon", "w3-grey", "w3-deep-orange");
      break;
    case "Nova":
      index = 2;
      setButtonStyle("pause", "w3-sand", "w3-deep-orange", "Play");
      resetAllMoonButtonStyles();
      setButtonStyle("0moon", "w3-light-grey", "w3-deep-orange");
      break;
    case "Cheia":
      index = 3;
      setButtonStyle("pause", "w3-sand", "w3-deep-orange", "Play");
      resetAllMoonButtonStyles();
      setButtonStyle("50moon", "w3-blue-grey", "w3-deep-orange");
      break;
  }

  const pos = luaFases[index];

  var lua = scene.getObjectByName("Lua");
  var position = { x: lua.position.x, z: lua.position.z };
  var target = { x: pos.x, z: pos.z };
  var tween = new TWEEN.Tween(position).to(target, 2000);

  tween.onUpdate(function (obj) {
    console.log(obj);
    lua.position.set(position.x, 0, position.z);
    if (isrunning) {
      pauseRotation();
    }
  });

  tween.start();

  requestAnimationFrame(function animate(nowMsec) {


    TWEEN.update();

    requestAnimationFrame(animate);

    cameraControl.update();

    renderer.render(scene, camera);
  });
}

buttonpause.addEventListener(`click`, () => { pauseRotation(); });
button0moon.addEventListener(`click`, () => {
	setMoonPosition("Nova");
});
button25moon.addEventListener(`click`, () => {
	setMoonPosition("Crescente");
});
button50moon.addEventListener(`click`, () => {
	setMoonPosition("Cheia");
});
button75moon.addEventListener(`click`, () => {
	setMoonPosition("Minguante");
});

main();