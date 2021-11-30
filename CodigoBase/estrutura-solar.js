
// import * as THREE from '../resources/threejs/build/three.module.js';
import { OrbitControls } from "../resources/threejs/examples/jsm/controls/OrbitControls.js";

var renderer;
var scene;
var camera;
var cameraControl;
var source;
var markerGroup;
var controllerAR;
var speedFactor = 0.005;
var distanceFactor = 0.005;
var planets = [];

let terraData;
let solData;
let luaData;

// Função que retorna os dados de um corpo celeste

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

// Função que usa o getPlanetData para criar guardar os dados dos corpos celestes nas variáveis terraData, solData e luaData

function refreshPlanetData() {
  terraData = getPlanetData(
    0 * speedFactor,
    -1 * speedFactor,
    200 * 2,
    "Terra",
    "resources/Textures/earthmap1k.jpg",
    50,
    360
  );

  solData = getPlanetData(
    (1 / 365.2564) * speedFactor,
    0.0009 * speedFactor,
    149600 * distanceFactor,
    "Sol",
    "resources/Images/sunmap.jpg",
    90,
    360
  );

  luaData = getPlanetData(
    (1 / 29.7) * speedFactor,
    (-1 / 29.7) * speedFactor,
    38440 * distanceFactor,
    "Lua",
    "resources/Textures/moonmap1k.jpg",
    25,
    360
  );
}

refreshPlanetData();

// Array resposável por guardar as informações de posição de cada fase da lua

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

// Para o melhor carregamento das texturas, já que são relativamente pesadas, utilizamos funções assincronas

// Função para inicializar o marker

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

// Função de carregar texturas

async function loadTexture(textureUrl) {
  var textureLoader = new THREE.TextureLoader();

  return new Promise((resolve) => {
    var texture = textureLoader.load(textureUrl, function (texture) {
      texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    });

    resolve(texture);
  });
}

// Função responsável pelo carregamento do Mesh do Sol

async function loadSun() {
  var texture = await loadTexture("resources/Textures/sunmap.jpg");

  var material = new THREE.MeshPhongMaterial({
    map: texture,
    lightMap: texture,
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

  const sunLight = new THREE.PointLight(0xffdcb4, 3.5);
  sun.add(sunLight);
  sun.position.set(solData.distanceFromAxis, 0, 0);

  sun.castShadow = false;
  sun.name = "Sol";

  var data = [sun, solData];
  planets.push(data);

  markerGroup.add(sun);
}

// Função responsável pelo carregamento do Mesh da Terra

async function loadEarth() {
  var texture = await loadTexture("resources/Images/earthtexture.jpg");

  var material = new THREE.MeshPhongMaterial({
    map: texture,
    lightMap: texture,
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

  var data = [terra, terraData];
  planets.push(data);

  markerGroup.add(terra);
}

// Função responsável pelo carregamento do Mesh da Lua

async function loadMoon() {
	var texture = await loadTexture("resources/Textures/moonmap1k.jpg");

  var material = new THREE.MeshPhongMaterial({
    map: texture,
    lightMap: texture,
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

	markerGroup.add(lua);
}

// Onde criamos as primeiras configurações sobre o Scene AR e movimentação de câmera

async function main() {
  scene = new THREE.Scene();
  renderer = new THREE.WebGLRenderer({ alpha: true });

  renderer.setClearColor(new THREE.Color("lightgrey"), 0);
  renderer.setPixelRatio(2);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.domElement.style.top = "0px";
  renderer.domElement.style.left = "0px";
  document.getElementById("WebGL-output").appendChild(renderer.domElement);

  camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerWidth,
    0.1,
    10000
  );

  cameraControl = new OrbitControls(camera, renderer.domElement);
  source = new THREEAR.Source({ renderer, camera });

  markerGroup = new THREE.Group();
  scene.add(markerGroup);

  await loadEarth();
  await loadMoon();
  await loadSun();

  await initializeAR(markerGroup);

	camera.far = 100000
	camera.updateProjectionMatrix()

  animateFrame(cameraControl);

  var terra = scene.getObjectByName("Terra");
  moveCamera(terra);
  camera.lookAt(scene.position);
}

let count = 0;
let isrunning = true;
let pausetime = 0;
let pauseoffset = 0;

// Funções para controle da animação de rotação e translação

function pauseTime() {
  pausetime = count;
  isrunning = false;
  ismoving = false;
}

function resumeTime() {
  pauseoffset = pauseoffset + (count - pausetime);
  isrunning = true;
}

function animateFrame(cameraControl) {
  requestAnimationFrame(function animate() {
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

// Função de inicialização da primeira posição da câmera, apontando para a Terra

function moveCamera(terra) {
  camera.position.x = terra.position.x + 0;
  camera.position.y = terra.position.y + 400;
  camera.position.z = terra.position.z + 1800;
  camera.rotation.z = 90 * Math.PI /180
  camera.updateProjectionMatrix()
  cameraControl.update();
  camera.lookAt(terra.position);
}

// Função responsável por lidar com a translação e rotação da Lua, que se move em função do tempo em um formato circular

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

// Funções de estilo do botão

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

// Função para executar o pause

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

const buttonpause = document.getElementById("pause");
const button0moon = document.getElementById("0moon");
const button25moon = document.getElementById("25moon");
const button50moon = document.getElementById("50moon");
const button75moon = document.getElementById("75moon");


// Função que usa o Tween.Js para realizar as animações dos 4 botões de posição da Lua

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
    lua.position.set(position.x, 0, position.z);
    if (isrunning) {
      pauseRotation();
    }
  });

  tween.start();

  requestAnimationFrame(function animate() {
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