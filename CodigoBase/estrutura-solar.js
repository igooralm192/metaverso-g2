// Mapeamento de Texturas 

import * as THREE 			from '../resources/threejs/build/three.module.js';
import { OrbitControls }	from '../resources/threejs/examples/jsm/controls/OrbitControls.js';

var renderer;
var scene;
var camera;
var cameraControl;

var terraData = getPlanetData(365.2564, 0.024, 1500*2, "Terra", "../resources/Textures/earthmap1k.jpg", 100, 48);
var solData = getPlanetData(0, 0.0009, 0, "Sol", "../resources/Images/sunmap.jpg", 500, 48);
var luaData = getPlanetData(29.7, 0.052, 1000/3.85, "Lua", "../resources/Textures/moonmap1k.jpg", 30, 48 )

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

	camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100000);

	camera.position.x = -480;
	camera.position.y = 4800;
	camera.position.z = 3200;
	camera.lookAt(scene.position);

	cameraControl = new OrbitControls(camera, renderer.domElement);
	loadMesh(solData);
	loadMesh(terraData);
	update(cameraControl);
}

function update(cameraControl) {
    cameraControl.update();

    var time = Date.now();
	planets.forEach(element => {
		movePlanet(element, time);
	});
	var lua = scene.getObjectByName("Lua");
    moveMoon(lua, luaData, time);
    renderer.render(scene, camera);
    requestAnimationFrame(function () {
        update(cameraControl);
    });
}

function movePlanet(myPlanet, myTime) {
	myPlanet[0].rotateY(myPlanet[1].rotationRate);
	if(myPlanet[0].name != 'Sol') {
		myPlanet[0].position.x = Math.cos(myTime 
			* (1.0 / (myPlanet[1].orbitRate * 200)) + 10.0) 
			* myPlanet[1].distanceFromAxis;
		myPlanet[0].position.z = Math.sin(myTime 
			* (1.0 / (myPlanet[1].orbitRate * 200)) + 10.0) 
			* myPlanet[1].distanceFromAxis;
	}	
}

function moveMoon(satelite, sateliteData, myTime){
	satelite.position.x = Math.cos(myTime * (1.0/(sateliteData.orbitRate * 15 )) + 15.0) * sateliteData.distanceFromAxis
	satelite.position.z = Math.sin(myTime * (1.0/(sateliteData.orbitRate * 15 )) + 15.0) * sateliteData.distanceFromAxis
	angleMoonEarth();
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
            shading: THREE.SmoothShading
		});
		texture.wrapS = THREE.ClampToEdgeWrapping;
    	texture.wrapT = THREE.ClampToEdgeWrapping;
    	texture.minFilter = THREE.NearestFilter;
	}
	else {
		material = new THREE.MeshPhongMaterial({	
			map: texture
		});
	}

	const geometry = new THREE.SphereGeometry( planetData.size, planetData.size, planetData.size );
	var planet = new THREE.Mesh( geometry, material );
	planet.position.set(planetData.distanceFromAxis, 0, 0);
	planet.castShadow = false;
	planet.name = planetData.name;

	if(planet.name == "Sol") {
		let spriteMaterial = new THREE.SpriteMaterial(
			{
				map: new THREE.ImageUtils.loadTexture("../resources/Images/glow.png"),
				useScreenCoordinates: false,
				color: 0xffffee,
				transparent: true,
				blending: THREE.AdditiveBlending
			});
		const sunLight = new THREE.PointLight(0xffdcb4, 2.0);
		let sprite = new THREE.Sprite(spriteMaterial);
		sprite.scale.set(1800, 1800, 1.0);
		planet.add(sunLight);
		planet.add(sprite);
	} else{
		console.log(luaData.distanceFromAxis);
		texture = textureLoader.load(luaData.texture, function ( texture ) {
			texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
		});
		var moon = new THREE.Mesh(new THREE.SphereGeometry(luaData.size, luaData.size, luaData.size), new THREE.MeshPhongMaterial({map: texture}));
		moon.position.set(luaData.distanceFromAxis, 22.741, planet.position.z);
		moon.name = luaData.name;
		
		planet.add(moon);
		console.log(planet);
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

main();
