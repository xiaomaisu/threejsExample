var scene, camera, renderer, home;
var mousePos = {
	x: 0,
	y: 0
}
var initPos = 0.1;

function init() {
	// body...
	createScene();
	createLights();
	createSky();
	createTree();
	//createGugu();
	//createAvatar();
	createHome();
	createFan();
	handleMove();
	//renderer.render(scene,camera);
}
//照相机
function createScene() {
	// body...
	scene = new THREE.Scene();
	scene.fog = new THREE.Fog(0xffffff, 1, 5000);
	scene.fog.color.setHSL(0.6, 0, 1);
	//照相机
	camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
	camera.position.set(0, 0, 300);
	//renderer
	renderer = new THREE.WebGLRenderer({
		alpha: true,
		antialias: true
	});
	renderer.setSize(window.innerWidth, window.innerHeight);
	document.body.appendChild(renderer.domElement);
}

function handleWindowResize() {
	HEIGHT = window.innerHeight;
	WIDTH = window.innerWidth;
	renderer.setSize(WIDTH, HEIGHT);
	camera.aspect = WIDTH / HEIGHT;
	camera.updateProjectionMatrix();
}
var ambientLight, hemisphereLight, shadowLight;

function createLights() {

	hemisphereLight = new THREE.HemisphereLight(0xaaaaaa, 0x000000, .6)
	shadowLight = new THREE.DirectionalLight(0xffffff, .9);
	shadowLight.position.set(150, 350, 350);
	shadowLight.castShadow = true;
	shadowLight.shadow.camera.left = -400;
	shadowLight.shadow.camera.right = 400;
	shadowLight.shadow.camera.top = 400;
	shadowLight.shadow.camera.bottom = -400;
	shadowLight.shadow.camera.near = 1;
	shadowLight.shadow.camera.far = 1000;
	shadowLight.shadow.mapSize.width = 2048;
	shadowLight.shadow.mapSize.height = 2048;

	scene.add(hemisphereLight);
	scene.add(shadowLight);
}

function createSky() {
	var vertexShader = document.getElementById('vertexShader').textContent;
	var fragmentShader = document.getElementById('fragmentShader').textContent;
	var uniforms = {
		topColor: {
			value: new THREE.Color(0xe8ded4)
		},
		bottomColor: {
			value: new THREE.Color(0xfbf2e9)
		},
		offset: {
			value: 33
		},
		exponent: {
			value: 0.6
		}
	}
	var groundUniforms = {
		topColor: {
			value: new THREE.Color(0xfbf2e9)
		},
		bottomColor: {
			value: new THREE.Color(0xddd3c9)
		},
		offset: {
			value: 33
		},
		exponent: {
			value: 0.6
		}
	}
	var skyGeo = new THREE.SphereGeometry(400, 32, 15);
	var skyMat = new THREE.ShaderMaterial({
		vertexShader: vertexShader,
		fragmentShader: fragmentShader,
		uniforms: uniforms,
		side: THREE.BackSide
	});
	var sky = new THREE.Mesh(skyGeo, skyMat);
	scene.add(sky);

	var groundGeo = new THREE.PlaneBufferGeometry(10000, 10000);
	var groundMat = new THREE.ShaderMaterial({
		vertexShader: vertexShader,
		fragmentShader: fragmentShader,
		uniforms: groundUniforms,
		side: THREE.BackSide
	});
	// groundMat.receiveShadow = true;
	var ground = new THREE.Mesh(groundGeo, groundMat);
	ground.rotation.x = -Math.PI / 2;
	ground.position.y = -33;
	ground.receiveShadow = true;
	scene.add(ground);
	ground.receiveShadow = true;
}

var Tree = function() {
	// body...
	this.mesh = new THREE.Object3D();
	var geometry = new THREE.ConeGeometry(20, 30, 5);
	var mediumgGometry = new THREE.ConeGeometry(30, 30, 5);
	var biggGometry = new THREE.ConeGeometry(40, 30, 5);
	var material = new THREE.MeshLambertMaterial({
		color: 0xc0c739
	});
	// material.castShadow = true;
	var cone = new THREE.Mesh(geometry, material);
	var mediumCone = new THREE.Mesh(mediumgGometry, material);
	var bigCone = new THREE.Mesh(biggGometry, material);
	cone.rotation.z = Math.PI / 20;
	mediumCone.position.y = -20;
	bigCone.position.y = -40;
	cone.castShadow = true;
	mediumCone.castShadow = true;
	bigCone.castShadow = true;
	this.mesh.add(cone);
	this.mesh.add(mediumCone);
	this.mesh.add(bigCone);

	var stumpGeometry = new THREE.CylinderGeometry(2, 8, 15, 32);
	var stumpMaterial = new THREE.MeshLambertMaterial({
		color: 0x6e4f32
	});
	//stumpMaterial.castShadow = true;
	var stump = new THREE.Mesh(stumpGeometry, stumpMaterial);
	stump.position.y = -65;
	stump.castShadow = true;
	stump.receiveShadow = true;
	this.mesh.add(stump);
	this.mesh.position.y = 65;
	this.mesh.position.x = 35;
	this.mesh.scale.set(.5, .5, .5);
	//scene.add(tree);
}

var Fan = function() {
	
	var whiteMat = new THREE.MeshLambertMaterial({
		color: 0xF47983,
		shading: THREE.FlatShading
	});

	var sphereGeom = new THREE.BoxGeometry(10, 10, 3);
	var propGeom = new THREE.BoxGeometry(10, 30, 2);
	propGeom.applyMatrix(new THREE.Matrix4().makeTranslation(0, 25, 0));

	// propellers
	var prop1 = new THREE.Mesh(propGeom, whiteMat);
	prop1.position.z = 2;
	var prop2 = prop1.clone();
	prop2.rotation.z = Math.PI / 3;
	var prop3 = prop1.clone();
	prop3.rotation.z = Math.PI * 2 / 3;
	var prop4 = prop1.clone();
	prop4.rotation.z = -Math.PI / 3;
	var prop5 = prop1.clone();
	prop5.rotation.z = -Math.PI * 2 / 3;
	var prop6 = prop1.clone();
	prop6.rotation.z = -Math.PI;

	this.sphere = new THREE.Mesh(sphereGeom, whiteMat);
	this.sphere.position.z = 2;

	this.propeller = new THREE.Group();
	this.propeller.add(prop1);
	this.propeller.add(prop2);
	this.propeller.add(prop3);
	this.propeller.add(prop4);
	this.propeller.add(prop5);
	this.propeller.add(prop6);

	this.threegroup = new THREE.Group();
	this.threegroup.add(this.propeller);
	this.threegroup.add(this.sphere);
}


function createGugu() {
	var loader = new THREE.OBJLoader();
	loader.load(
		// resource URL
		'model/gugu.obj',
		// Function when resource is loaded
		function(object) {
			// console.log(object)
			// //object.scale.set(100,100,100);
			scene.add(object);
		}
	);
}

function createAvatar() {
	var loader = new THREE.JSONLoader();
	loader.load(
		// resource URL
		'model/model-threejs.json',
		// Function when resource is loaded
		function(geometry, materials) {
			var material = materials[0];
			var object = new THREE.Mesh(geometry, material);
			object.castShadow = true;
			scene.add(object);
		}
	);
}

function createTree() {
	var tree = new Tree();
	scene.add(tree.mesh)
}

function createHome() {
	var mtlLoader = new THREE.MTLLoader();
	mtlLoader.setPath('model/');
	mtlLoader.setCrossOrigin('anonymous');
	mtlLoader.load('home.mtl', function(materials) {
		materials.preload();
		// 和objloader 2 略有区别
		var loader = new THREE.OBJLoader();
		loader.setMaterials(materials);
		loader.load(
			'model/home.obj',
			// Function when resource is loaded
			function(male) {
				// obj 并不需要盲目放大，而是和camera 的设置有关系
				home = male;

				//male.scale.set(.1,.1,.1);
				scene.add(male);
				// mixer = new THREE.AnimationMixer( male );
				// mixer.clipAction( male.animations[ 0 ] ).play();
				animate();
			}
		);
	})
}

function createFan() {
	this.fans = [];
	this.nfans = 20;
	var stepAngle = Math.PI*2 / this.nfans;
	for (var i = 0; i < this.nfans; i++) {
		var fan = new Fan();
		this.fans.push(fan.threegroup);
		var angle = stepAngle * i;
		var h = 120+Math.random()*30;
		var s = .1+ Math.random()*.1;
		fan.threegroup.position.x = Math.cos(angle) * h;
		fan.threegroup.position.y = Math.sin(angle) * h;
		fan.threegroup.rotation.z = i + Math.random() * Math.PI;
		fan.threegroup.scale.set(s, s, s);
		fan.threegroup.position.z = 50;
		scene.add(fan.threegroup);
	}
}

function animate() {
	requestAnimationFrame(animate);
	render();
}

function render() {
	// var init = 0.1;
	home.position.x = mousePos.x / 1000;
	home.position.y = mousePos.y / 1000;
	for(var i=0;i<nfans;i++) {
		var fan = fans[i];
		fan.rotation.z +=Math.random() * .02;
		fan.rotation.y +=Math.random() * .02;
		fan.position.z -= Math.random();
		// fan.position.x += Math.random() * .02;
		// fan.position.y += Math.random() * .02;
		//fan.rotation.z +=Math.random() * .02;
	}
	//initPos += .001;
	//home.rotation.x += .01;
	//home.scale.set(initPos, initPos, initPos)
	renderer.render(scene, camera);
}

function handleMove() {
	document.addEventListener('mousemove', function(e) {
		mousePos = {
			x: e.clientX,
			y: e.clientY
		}
	})
}
window.onload = function() {
	init();
};