// Mapeamento de Texturas 

import * as THREE from '../resources/threejs/build/three.module.js';
import { OrbitControls } from '../resources/threejs/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from '../resources/threejs/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from '../resources/threejs/examples/jsm/loaders/DRACOLoader.js';

var renderer;
var scene;
var camera;
var cameraControl;
var speedFactor = 0.005
var distanceFactor = 0.005

// グロバール変数が要る
let terraData;
let solData;
let luaData;

// 速度が変化する為に惑星のデータを更新する
// 
function refreshPlanetData() {
	terraData = getPlanetData(0 * speedFactor, -1 * speedFactor, 200 * 2, "Terra", "../resources/Textures/earthmap1k.jpg", 50, 48);

	solData = getPlanetData((1 / 365.2564) * speedFactor, 0.0009 * speedFactor, 1496000 * distanceFactor, "Sol", "../resources/Images/sunmap.jpg", 500, 48);

	luaData = getPlanetData((1 / 29.7) * speedFactor, (-1 / 29.7) * speedFactor, 384400 * distanceFactor, "Lua", "../resources/Textures/moonmap1k.jpg", 250, 48)
}

// 開始の時惑星ロードする
refreshPlanetData();

const luaFases = [
	// Crescente
	{
		x: 0,
		boundx: 200,
		z: -luaData.distanceFromAxis,
		boundz: -luaData.distanceFromAxis + 200
	},
	// Minguante
	{
		x: 0,
		boundx: 200,
		z: luaData.distanceFromAxis,
		boundz: luaData.distanceFromAxis - 200
	},
	// Nova
	{
		x: luaData.distanceFromAxis,
		boundx: luaData.distanceFromAxis - 200,
		z: 0,
		boundz: 200
	},
	// Cheia
	{
		x: -luaData.distanceFromAxis,
		boundx: -luaData.distanceFromAxis + 200,
		z: 0,
		boundz: 200
	}
]

var planets = [];

function getPlanetData(myOrbitRate, myRotationRate, myDistanceFromAxis, myName, myTexture, mySize, mySegments) {
	return {
		orbitRate: myOrbitRate
		, rotationRate: myRotationRate
		, distanceFromAxis: myDistanceFromAxis
		, name: myName
		, texture: myTexture
		, size: mySize
		, segments: mySegments
	};
}

async function loadGLTF(sceneUrl) {
	const gltfLoader = new GLTFLoader();
	const dracoLoader = new DRACOLoader();

	dracoLoader.setDecoderPath('../resources/threejs/examples/js/libs/draco');
	gltfLoader.setDRACOLoader(dracoLoader);

	return new Promise((resolve, reject) => {
		gltfLoader.load(sceneUrl, (gltf) => {
			resolve(gltf)
		}, undefined, function (error) {
			reject("Erro ao carregar modelo da terra")
		});
	})
}

async function loadTexture(textureUrl) {
	var textureLoader = new THREE.TextureLoader();

	return new Promise((resolve) => {
		var texture = textureLoader.load(textureUrl, function (texture) {
			texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
		});

		resolve(texture)
	})
}

async function loadSun() {
	var texture = await loadTexture("../resources/Images/sunmap.jpg")

	var material = new THREE.MeshPhongMaterial({
		map: texture,
		lightMap: texture,
		transparent: true,
		opacity: 0.8,
		flatShading: THREE.SmoothShading
	});

	texture.wrapS = THREE.ClampToEdgeWrapping;
	texture.wrapT = THREE.ClampToEdgeWrapping;
	texture.minFilter = THREE.NearestFilter;

	const geometry = new THREE.SphereGeometry(solData.size, solData.size, solData.size);
	var sun = new THREE.Mesh(geometry, material);

	const sunLight = new THREE.PointLight(0xffdcb4, 2.5);
	sun.add(sunLight)
	sun.position.set(solData.distanceFromAxis, 0, 0)

	sun.castShadow = false;
	sun.name = "Sol";
	console.log("Sol: ", sun)

	var data = [sun, solData];
	planets.push(data);
	scene.add(sun);

	renderer.clear()
}

async function loadEarth() {
	const earthSceneUrl = '../resources/GLTF/earth/scene.gltf';

	const gltf = await loadGLTF(earthSceneUrl)

	const root = gltf.scene;
	root.name = "Terra";
	root.position.set(0, 0, 0);
	root.scale.set(terraData.size, terraData.size, terraData.size);

	var data = [root, terraData];
	planets.push(data);

	scene.add(root);
	renderer.clear()
}

async function loadMoon() {
	const moonSceneUrl = '../resources/GLTF/moon/scene.gltf';

	const gltf = await loadGLTF(moonSceneUrl)

	const root = gltf.scene;
	root.name = "Lua";
	root.position.set(luaData.distanceFromAxis, 0, 0);
	root.scale.set(luaData.size, luaData.size, luaData.size)

	var data = [root, luaData];
	planets.push(data);
	console.log('LUA', root)

	scene.add(root);
	renderer.clear()
}

async function main() {

	scene = new THREE.Scene();
	renderer = new THREE.WebGLRenderer({ antialias: true });

	renderer.setClearColor(new THREE.Color(0.0, 0.0, 0.0));
	renderer.setSize(window.innerWidth, window.innerHeight);
	document.getElementById("WebGL-output").appendChild(renderer.domElement);
	const ambLight = new THREE.AmbientLight(0xFFFFFF, 0.25);
	ambLight.name = "ambLight";
	ambLight.visible = true;
	scene.add(ambLight)

	camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100000);
	cameraControl = new OrbitControls(camera, renderer.domElement);

	await loadEarth();
	await loadMoon();
	await loadSun();

	//loadMesh(terraData);
	//loadMesh(luaData);
	animateFrame(cameraControl);
	var terra = scene.getObjectByName("Terra")
	console.log(terra)
	moveCamera(terra)
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
	pausetime = count
	isrunning = false;
	ismoving = false;
}

function resumeTime() {
	pauseoffset = pauseoffset + (count - pausetime)
	isrunning = true;
}

function setCount(offset) {
	count = offset
	pauseoffset = 0
	pausetime = offset
	isrunning = false
}

function animateFrame(cameraControl) {

	requestAnimationFrame(function animate(nowMsec) {
		if (isrunning) count = count + 20
		// keep looping
		requestAnimationFrame(animate);

		cameraControl.update();

		planets.forEach(element => {
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
	if (myPlanet[0].name == 'Sol') {

	} else if (myPlanet[0].name == 'Lua' && isrunning) {
		myPlanet[0].lookAt(new THREE.Vector3(0, 0, 0))

		myPlanet[0].position.x = Math.cos(myTime
			* ((myPlanet[1].orbitRate)))
			* myPlanet[1].distanceFromAxis;

		myPlanet[0].position.z = Math.sin(myTime
			* ((myPlanet[1].orbitRate)))
			* myPlanet[1].distanceFromAxis;

	} else {
		// myPlanet[0].rotateY(myPlanet[1].rotationRate);
		if (isrunning) myPlanet[0].rotateY(myPlanet[1].rotationRate);
	}
}

function setButtonStyle(button, oldClass, newClass, newText) {
	document.getElementById(button).classList.remove(oldClass)
	document.getElementById(button).classList.add(newClass)
	if (newText) document.getElementById(button).textContent = newText
}

function resetAllMoonButtonStyles() {
	setButtonStyle("0moon", "w3-deep-orange", "w3-light-grey")
	setButtonStyle("25moon", "w3-deep-orange", "w3-grey")
	setButtonStyle("50moon", "w3-deep-orange", "w3-blue-grey")
	setButtonStyle("75moon", "w3-deep-orange", "w3-dark-grey")
}

function pauseRotation() {
	if (isrunning) {
		pauseTime()
		setButtonStyle("pause", "w3-sand", "w3-deep-orange", "Play")
		resetAllMoonButtonStyles()
	}
	else {
		resumeTime()
		setButtonStyle("pause", "w3-deep-orange", "w3-sand", "Pause")
		resetAllMoonButtonStyles()
	}
}

function setMoonPos(cyclePart) {
	// 月のサイクルの位置の設定ファンクション
	// cyclePartとはパーセントで言って
	// 有効の数字は0,25,50,75しかない
	if (cyclePart == 0) {
		console.log("月は新月になる");
		// ここで月の位置を設定
		setCount(780);
	}
	else if (cyclePart == 25) {
		console.log("月は上弦になる");
		// ここで月の位置を設定
		setCount(9800);
	}
	else if (cyclePart == 50) {
		console.log("月は満月になる");
		// ここで月の位置を設定
		setCount(19520);
	}
	else if (cyclePart == 75) {
		console.log("月は下弦になる");
		// ここで月の位置を設定
		setCount(29640);
	}
	else {
		console.log("cyclePartの数字とは無効だ！");
	}
}

// ボタン
const buttonpause = document.getElementById('pause');
const button0moon = document.getElementById('0moon');
const button25moon = document.getElementById('25moon');
const button50moon = document.getElementById('50moon');
const button75moon = document.getElementById('75moon');

function setMoonPosition(phase) {
	let index;

	switch (phase) {
		case "Minguante":
			index = 0;
			setButtonStyle("pause", "w3-sand", "w3-deep-orange", "Play")
			resetAllMoonButtonStyles()
			setButtonStyle("75moon", "w3-dark-grey", "w3-deep-orange")
			break;
		case "Crescente":
			index = 1;
			setButtonStyle("pause", "w3-sand", "w3-deep-orange", "Play")
			resetAllMoonButtonStyles()
			setButtonStyle("25moon", "w3-grey", "w3-deep-orange")
			break;
		case "Nova":
			index = 2;
			setButtonStyle("pause", "w3-sand", "w3-deep-orange", "Play")
			resetAllMoonButtonStyles()
			setButtonStyle("0moon", "w3-light-grey", "w3-deep-orange")
			break;
		case "Cheia":
			index = 3;
			setButtonStyle("pause", "w3-sand", "w3-deep-orange", "Play")
			resetAllMoonButtonStyles()
			setButtonStyle("50moon", "w3-blue-grey", "w3-deep-orange")
			break;
	}

	const pos = luaFases[index];

	var lua = scene.getObjectByName("Lua");
	var position = { x: lua.position.x, z: lua.position.z };
	var target = { x: pos.x, z: pos.z };
	var tween = new TWEEN.Tween(position).to(target, 2000);

	tween.onUpdate(function (obj) {
		console.log(obj)
		lua.position.set(position.x, 0, position.z)
		if (isrunning) {
			pauseRotation();
		}

	});

	tween.start();

	requestAnimationFrame(function animate(nowMsec) {
		// var lua = scene.getObjectByName("Lua");
		// console.log('Posição da lua x: '+lua.position.x);
		// console.log('Posição alvo x: '+ pos.x);
		// console.log('Posição da lua z: '+lua.position.z);
		// console.log('Posição alvo z: '+ pos.z);
		// if((Math.round(lua.position.x) < pos.x && Math.round(lua.position.x) > pos.boundx) &&
		//  (Math.round(lua.position.z) < pos.z && Math.round(lua.position.z) > pos.boundz)) {
		// 	console.log("ENTROU AQUI!!!!!!!!!!!!!!!!!!!!!!!");
		// 	pauseRotation();
		// 	return
		// }

		TWEEN.update();

		requestAnimationFrame(animate);

		cameraControl.update();

		renderer.render(scene, camera);
	});
	// lua.position.set(pos.x, 0, pos.z);

	//ismoving = true;
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


/*function angleMoonEarth() {
	var y = 0;
	var terra = scene.getObjectByName("Terra")
	var lua = scene.getObjectByName("Lua")

	var terrap = Math.pow(terra.position.x, 2) + Math.pow(terra.position.y, 2) + Math.pow(terra.position.z, 2)
	var luap = Math.pow(lua.position.x, 2) + Math.pow(lua.position.y, 2) + Math.pow(lua.position.z, 2)
	var a = Math.acos(
		(lua.position.x * terra.position.x +
			lua.position.y * terra.position.y +
			lua.position.z * terra.position.z)
		/ (Math.sqrt(terrap) * Math.sqrt(luap)));
	//console.log(a);
}
function loadMesh(planetData) {

	var textureLoader 	= new THREE.TextureLoader();
	console.log(planetData);
	var texture 		= textureLoader.load(planetData.texture, function ( texture ) {
		texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
	});

	var material;
	if(planetData.name == "Sol") {
		material = new THREE.MeshPhongMaterial({
			map: texture,
						lightMap: texture,
						transparent: true,
						opacity: 0.8,
						flatShading: THREE.SmoothShading
		});
		texture.wrapS = THREE.ClampToEdgeWrapping;
			texture.wrapT = THREE.ClampToEdgeWrapping;
			texture.minFilter = THREE.NearestFilter;
	}
	else if (planetData.name == "Terra"){
		material = new THREE.MeshLambertMaterial({
			map: texture
		});
	} else{
		material = new THREE.MeshPhongMaterial({map: texture})
	}

	const geometry = new THREE.SphereGeometry( planetData.size, planetData.size, planetData.size );
	var planet = new THREE.Mesh( geometry, material );

	planet.castShadow = false;
	planet.name = planetData.name;

	if(planet.name == "Sol") {
		let spriteMaterial = new THREE.SpriteMaterial(
			{
				map: new THREE.ImageUtils.loadTexture("../resources/Images/glow.png"),
				color: 0xffffee,
				transparent: true,
				blending: THREE.AdditiveBlending
			});
		const sunLight = new THREE.PointLight(0xffdcb4, 2.0);
		let sprite = new THREE.Sprite(spriteMaterial);
		sprite.scale.set(1800, 1800, 1.0);
		planet.position.set(planetData.distanceFromAxis, 0, 0);
		planet.add(sunLight);
		planet.add(sprite);
	} else if (planet.name == "Terra"){
		planet.position.set(0, 0, 0);
		planet.rotation.set(0, 0.453786, 0)
		const axis = new THREE.AxesHelper(1000 );
		planet.add(axis)
		console.log(planet);
	}else if (planet.name == "Lua"){
		var terra = scene.getObjectByName("Terra");
		planet.position.set(luaData.distanceFromAxis,0, 0);
		planet.name = luaData.name;
		const axii = new THREE.AxesHelper(1000);
		planet.add(axii)
	}
	var data = [planet, planetData];
	planets.push(data);
	scene.add( planet );

	renderer.clear();
}
*/