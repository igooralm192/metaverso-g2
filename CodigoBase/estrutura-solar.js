// Mapeamento de Texturas 

import * as THREE 			from '../resources/threejs/build/three.module.js';
import { OrbitControls }	from '../resources/threejs/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader }   from '../resources/threejs/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader }  from '../resources/threejs/examples/jsm/loaders/DRACOLoader.js';

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
function refreshPlanetData() {
    terraData = getPlanetData(0 * speedFactor, 1 * speedFactor, 200*2, "Terra", "../resources/Textures/earthmap1k.jpg", 100, 48);

    solData = getPlanetData((1/365.2564) * speedFactor, 0.0009 * speedFactor, 1496000*distanceFactor, "Sol", "../resources/Images/sunmap.jpg", 500, 48);

    luaData = getPlanetData(-(1/29.7) * speedFactor, (1/29.7) * speedFactor, 384400*distanceFactor, "Lua", "../resources/Textures/moonmap1k.jpg", 50, 48)
}

// 開始の時惑星ロードする
refreshPlanetData();

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

function main() {

	scene = new THREE.Scene();
	renderer = new THREE.WebGLRenderer({ antialias: true });

	renderer.setClearColor(new THREE.Color(0.0, 0.0, 0.0));
	renderer.setSize(window.innerWidth, window.innerHeight);
	document.getElementById("WebGL-output").appendChild(renderer.domElement);
	const ambLight 			= new THREE.AmbientLight( 0xFFFFFF, 0.25 ); 
	ambLight.name 			= "ambLight";
	ambLight.visible 		= true;
	scene.add(ambLight)

	camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100000);
	cameraControl = new OrbitControls(camera, renderer.domElement);
	loadMesh(solData);
	loadMesh(terraData);
	loadMesh(luaData)
	loadEarth();
	update(cameraControl);
	var terra = scene.getObjectByName("Terra");
	moveCamera(terra)
	camera.lookAt(scene.position);
}


// 開始時刻
let count = 0;

// 停止期間
let isrunning = true;
let pausetime = 0;
let pauseoffset = 0; 

function pauseTime() {
    pausetime = count
    isrunning = false;
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

function update(cameraControl) {
    if (isrunning) count = count+20
	cameraControl.update();
    console.log("count=%d",count)

	planets.forEach(element => {
		movePlanet(element, count);
	});
    renderer.render(scene, camera);
    requestAnimationFrame(function () {
        update(cameraControl);
    });
}

function moveCamera(terra) {
	camera.position.x = terra.position.x + 0;
	camera.position.y = terra.position.y + 50;
	camera.position.z = terra.position.z + 900;
	camera.lookAt(terra.position);
  }

function movePlanet(myPlanet, myTime) {
        if(myPlanet[0].name == 'Sol') {

        }else if (myPlanet[0].name == 'Lua'){
            myPlanet[0].position.x = Math.cos(myTime 
                * ((myPlanet[1].orbitRate ))) 
                * myPlanet[1].distanceFromAxis;

            myPlanet[0].position.z = Math.sin(myTime 
                * ((myPlanet[1].orbitRate )) ) 
                * myPlanet[1].distanceFromAxis;
            myPlanet[0].lookAt(new THREE.Vector3(0,0,0))
        }else{
            if (isrunning) myPlanet[0].rotateY(myPlanet[1].rotationRate);
        }
}

function loadEarth() {
	const textureLoader = new THREE.TextureLoader();
	const gltfLoader = new GLTFLoader();
	const dracoLoader = new DRACOLoader();
	const earthSceneUrl = '../resources/GLTF/earth/scene.gltf';

	dracoLoader.setDecoderPath('../resources/threejs/examples/js/libs/draco');
	gltfLoader.setDRACOLoader(dracoLoader);


	gltfLoader.load(earthSceneUrl, (gltf) => {
		const root = gltf.scene;

		root.name = "Earth"
		root.position.set(terraData.myDistanceFromAxis, 0, 0);
		root.scale.set(500, 500, 500);

		var texture = textureLoader.load("../resources/Textures/moonmap1k.jpg", function ( texture ) {
			texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
		}, undefined, function(err) {
			console.error("Erro ao carregar textura da lua.");
		});

		var data = [root, terraData];
		planets.push(data);

		scene.add(root);
	}, undefined, function(error) {
		console.log("Erro ao carregar modelo da terra")
	});
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
	// else if (planetData.name == "Terra"){
	// 	material = new THREE.MeshLambertMaterial({	
	// 		map: texture
	// 	});
	// } else{
	// 	material = new THREE.MeshPhongMaterial({map: texture})
	// }

	const geometry = new THREE.SphereGeometry( planetData.size, planetData.size, planetData.size );
	var planet = new THREE.Mesh( geometry, material );
	
	planet.castShadow = false;
	planet.name = planetData.name;

	if(planet.name == "Sol") {	
		const sunLight = new THREE.PointLight(0xffdcb4, 2.0);
		planet.position.set(planetData.distanceFromAxis, 0, 0);
		planet.add(sunLight);
	} //else if (planet.name == "Terra"){
	// 	planet.position.set(0, 0, 0);
	// 	planet.rotation.set(0, 0.453786, 0)
	// 	const axis = new THREE.AxesHelper(1000 );
	// 	planet.add(axis)
	// 	console.log(planet);
	// }else if (planet.name == "Lua"){
	// 	var terra = scene.getObjectByName("Terra");
	// 	planet.position.set(luaData.distanceFromAxis,0, 0);
	// 	planet.name = luaData.name;
	// 	const axii = new THREE.AxesHelper(1000);
	// 	planet.add(axii)
	// }
	var data = [planet, planetData];
	planets.push(data);
	scene.add( planet );

	renderer.clear();
}

function angleMoonEarth(){
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

function pauseRotation(){
    if(isrunning) {
        pauseTime()
    }
    else {
        resumeTime()
    }
}

function setMoonPos(cyclePart) {
    // 月のサイクルの位置の設定ファンクション
    // cyclePartとはパーセントで言って
    // 有効の数字は0,25,50,75しかない
    if (cyclePart == 0) {
        console.log("月は新月になる")
        // ここで月の位置を設定
        setCount(780)
    }
    else if (cyclePart == 25) {
        console.log("月は上弦になる")
        // ここで月の位置を設定
        setCount(9800)
    }
    else if (cyclePart == 50) {
        console.log("月は満月になる")
        // ここで月の位置を設定
        setCount(19520)
    }
    else if (cyclePart == 75) {
        console.log("月は下弦になる")
        // ここで月の位置を設定
        setCount(29640)
    }
    else {
        console.log("cyclePartの数字とは無効だ！")
    }
}

// ボタン
const buttonpause = document.getElementById('pause')
const button0moon = document.getElementById('0moon')
const button25moon = document.getElementById('25moon')
const button50moon = document.getElementById('50moon')
const button75moon = document.getElementById('75moon')

// ボタンのイベント
let func;
buttonpause.addEventListener(`click`, func = () => {pauseRotation();});
button0moon.addEventListener(`click`, func = () => {setMoonPos(0);});
button25moon.addEventListener(`click`, func = () => {setMoonPos(25);});
button50moon.addEventListener(`click`, func = () => {setMoonPos(50);});
button75moon.addEventListener(`click`, func = () => {setMoonPos(75);});

main();
