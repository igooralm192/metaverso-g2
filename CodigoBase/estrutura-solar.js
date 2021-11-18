// Mapeamento de Texturas 

import * as THREE 			from '../resources/threejs/build/three.module.js';
import { OrbitControls }	from '../resources/threejs/examples/jsm/controls/OrbitControls.js';

var renderer;
var scene;
var camera;
var cameraControl;

var terraData = getPlanetData(365.2564, 0.015, 400, "Terra", "../resources/Textures/Wood.jpg", 1, 48);

var sol;
var terra;  

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
	renderer = new THREE.WebGLRenderer();

	renderer.setClearColor(new THREE.Color(0.0, 0.0, 0.0));
	renderer.setSize(window.innerWidth*0.7, window.innerHeight*0.7);
	document.getElementById("WebGL-output").appendChild(renderer.domElement);

	camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);

	camera.position.x = -60;
	camera.position.y = 600;
	camera.position.z = 400;
	camera.lookAt(scene.position);

	cameraControl = new OrbitControls(camera, renderer.domElement);

	const ptLight 			= new THREE.PointLight( 0xffffff, 0.8 );
	ptLight.name 			= "pntLight";
	ptLight.position.set( 0, 0, 0);
	ptLight.visible 		= true;
	scene.add( ptLight );

	const ptLightHelper 	= new THREE.PointLightHelper( ptLight, 4.0 );
	ptLightHelper.name 		= "pntLightHlpr";
	ptLightHelper.visible 	= true;
	scene.add( ptLightHelper );

	const ambLight 			= new THREE.AmbientLight( 0xFFFFFF, 0.5 ); 
	ambLight.name 			= "ambLight";
	ambLight.visible 		= true;
	scene.add( ambLight );
	loadMesh();
	update(cameraControl);
}

function update(cameraControl) {
    cameraControl.update();

    var time = Date.now();

    movePlanet(terra, time, terraData);

    renderer.render(scene, camera);
    requestAnimationFrame(function () {
        update(cameraControl);
    });
}

function movePlanet(myPlanet, myTime, myData) {
	myPlanet.position.x = Math.cos(myTime 
		* (1.0 / (myData.orbitRate * 200)) + 10.0) 
		* myData.distanceFromAxis;
	myPlanet.position.z = Math.sin(myTime 
		* (1.0 / (myData.orbitRate * 200)) + 10.0) 
		* myData.distanceFromAxis;
}

function loadMesh() {

	var textureLoader 	= new THREE.TextureLoader();
	var texture 		= textureLoader.load("../resources/Textures/Wood.jpg", function ( texture ) {
		texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
		texture.offset.set( 1.0, 1.0 );
		texture.repeat.set( 5, 5 );
	});

	var material		= new THREE.MeshPhongMaterial({	
		color		: 0xBA8C63,
		map         : texture,
		specular 	: 0xFFFFFF,
		reflectivity: 0.5,
		shininess 	: 80.0  
	});

	// Sol
	const geometrySol = new THREE.SphereGeometry( 100, 100, 100 );
	sol = new THREE.Mesh( geometrySol, material );
	sol.position.set(0, 0, 0);
	sol.name = "Sol";

	const geometryTerra = new THREE.SphereGeometry( 20, 20, 20);                 
	terra = new THREE.Mesh( geometryTerra, material );
	terra.position.set(300, 0, 0);
	terra.name = "Terra";

	scene.add( sol );
	scene.add( terra );

	renderer.clear();

	// Terra
	/*sphereGeometry = new THREE.SphereGeometry( 0.1, 10, 10);                 
	var terra = new THREE.Mesh( sphereGeometry, material );
	terra.name = "Terra";

	// Lua
	sphereGeometry = new THREE.SphereGeometry( 0.03, 5, 5 );                 
	var lua = new THREE.Mesh( sphereGeometry, material );
	lua.name = "Lua";*/
}


main();
