// Mapeamento de Texturas 

import * as THREE 			from '../resources/threejs/build/three.module.js';
import { OrbitControls }	from '../resources/threejs/examples/jsm/controls/OrbitControls.js';

var renderer;
var scene;
var camera;
var cameraControl;
var speedPause = 1
var speedFactor = 0.005 * speedPause
var distanceFactor = 0.005

var terraData = getPlanetData(0 * speedFactor, 1 * speedFactor, 200*2, "Terra", "../resources/Textures/earthmap1k.jpg", 100, 48);

var solData = getPlanetData((1/365.2564) * speedFactor, 0.0009 * speedFactor, 1496000*distanceFactor, "Sol", "../resources/Images/sunmap.jpg", 500, 48);

var luaData = getPlanetData(-(1/29.7) * speedFactor, (1/29.7) * speedFactor, 384400*distanceFactor, "Lua", "../resources/Textures/moonmap1k.jpg", 50, 48)

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
	update(cameraControl);
	var terra = scene.getObjectByName("Terra");
	moveCamera(terra)
	camera.lookAt(scene.position);
}

function update(cameraControl) {
	cameraControl.update();

    var time = Date.now();
	planets.forEach(element => {
		movePlanet(element, time);
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
		myPlanet[0].lookAt(new THREE.Vector3(0,0,0))
		myPlanet[0].position.x = Math.cos(myTime 
			* ((myPlanet[1].orbitRate ))) 
			* myPlanet[1].distanceFromAxis;

		myPlanet[0].position.z = Math.sin(myTime 
			* ((myPlanet[1].orbitRate )) ) 
			* myPlanet[1].distanceFromAxis;
	}else{
		myPlanet[0].rotateY(myPlanet[1].rotationRate);
	}

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
	if (speedPause == 1){
		speedPause = 0;
	}
	else{
		speedPause = 1;
	}
}

main();
