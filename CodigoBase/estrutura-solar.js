// Mapeamento de Texturas 

import * as THREE 			from '../resources/threejs/build/three.module.js';
import { OrbitControls }	from '../resources/threejs/examples/jsm/controls/OrbitControls.js';

var renderer;
var scene;
var camera;
var cameraControl;

var terraData = getPlanetData(365.2564, 0.024, 1500*2, "Terra", "../resources/Textures/earthmap1k.jpg", 100, 48);
var solData = getPlanetData(0, 0.0009, 0, "Sol", "../resources/Textures/sunmap.jpg", 500, 48);

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

	const ptLight 			= new THREE.PointLight( 0xffdcb4, 2 );
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
			color: '0xffffff'
		});
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
		let sprite = new THREE.Sprite(spriteMaterial);
		sprite.scale.set(1800, 1800, 1.0);
		planet.add(sprite);
	}
	var data = [planet, planetData];
	planets.push(data);
	scene.add( planet );

	renderer.clear();
}


main();
