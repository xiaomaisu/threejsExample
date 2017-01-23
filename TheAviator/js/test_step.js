//COLORS,十六进制的color
var Colors = {
	red: 0xf25346,
	white: 0xd8d0d1,
	pink: 0xF5986E,
	brown: 0x59332e,
	brownDark: 0x23190f,
	blue: 0x68c3c0
};

var scene, renderer, container,camera;
var sky;

function init() {
	// body...
	//场景
	createScene();
	//天空
	createSky();
	//飞机
	// createAirplane();
	// //大海
	createSea();
	//光
	createLights();

	loop();

	//createPerson();
}

//创建场景
function createScene() {
	scene = new THREE.Scene();
	var SCREEN_WIDTH = window.innerWidth;
	var SCREEN_HEIGHT = window.innerHeight;
	var ASPECT = SCREEN_WIDTH / SCREEN_HEIGHT;
	var NEAR = 1;
	var FAR = 10000;
	//camera的各个参数很重要，试着更改参数查看效果
	camera = new THREE.PerspectiveCamera(60, ASPECT, NEAR, FAR);
	scene.add(camera);
	scene.fog = new THREE.Fog(0xf7d9aa, 100,950);//雾化效果，在游戏中见到的烟雾、爆炸火焰以及白云等效果都是雾化的结果，可减少3d渲染工作量
	camera.position.set(0, 100, 200);
	renderer = new THREE.WebGLRenderer({
		alpha: true, //whether the canvas contains an alpha (transparency) buffer or not
		antialias: true
	});
	renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);
	container = document.getElementById('world');
	container.appendChild(renderer.domElement);
	//window.addEventListener('resize', handleWindowResize, false);
}

//云朵创建
function Cloud() {
	// body...
	this.mesh = new THREE.Object3D();
	var geom = new THREE.CubeGeometry(20, 20, 20);
	var mat = new THREE.MeshPhongMaterial({
		color: Colors.white,
	});
	//一片云由随机的几个立方体构成
	var nBlocks = 3 + Math.floor(5 * Math.random());
	for (var i = 0; i < nBlocks; i++) {
		var m = new THREE.Mesh(geom.clone(), mat);
		//位置相邻，进行部分旋转及缩放
		m.position.x = i*15;
		m.position.y = Math.random() * 10;
		m.position.z = Math.random() * 10;
		m.rotation.x = Math.random() * Math.PI * 2;
		m.rotation.y = Math.random() * Math.PI * 2;
		var s = .1 + Math.random()*.9;
		m.scale.set(s, s, s);
		m.castShadow = true;
		m.receiveShadow = true;
		this.mesh.add(m);
	}
}
//创建光，如果没有光则会一片黑，类似的实例可见<https://threejs.org/examples/#webgl_lights_hemisphere>
function createLights() {
	//A light source positioned directly above the scene, with color fading from the sky color to the ground color,it can not be used to cast shadows
	var hemisphereLight = new THREE.HemisphereLight(0xaaaaaa, 0x000000, .9);
	// the rays produced from it are all parallel,The reason for this is to allow the light to cast shadows - the shadow camera needs a position to calculate shadows from
	var shadowLight = new THREE.DirectionalLight(0xffffff, .9);
	shadowLight.position.set(150, 350, 350);
	//设置directionLightShadow
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

function Sky() {

	this.mesh = new THREE.Object3D();
	this.nClouds = 20;
	var stepAngle = Math.PI * 2 / this.nClouds;
	for (var i = 0; i < this.nClouds; i++) {
		var c = new Cloud();
		var a = stepAngle * i;
		var h = 750 + 200 * Math.random();
		c.mesh.position.x = Math.sin(a)*h;
		c.mesh.position.y = Math.cos(a)*h;
		c.mesh.position.z = -400-Math.random()*400;
		c.mesh.rotation.z = a + Math.PI/2;
		var s = Math.random() * 2 + 1;
		c.mesh.scale.set(s, s, s);
		this.mesh.add(c.mesh);
	}
}

function Sea() {
	// body...
	var geom = new THREE.CylinderGeometry(600, 600, 800, 40, 10);
	//旋转圆柱体
	geom.applyMatrix(new THREE.Matrix4().makeRotationX(-Math.PI/2));
	var material = new THREE.MeshPhongMaterial({
		color: Colors.blue,
		transparent: true,
		opacity: .6,
		shading: THREE.FlatShading,
	});
	this.mesh = new THREE.Mesh(geom, material);
	this.mesh.receiveShadow = true;
	// scene.add(mesh);
}

function createSea() {
  sea = new Sea();
  sea.mesh.position.y = -600;
  scene.add(sea.mesh);
}

function createSky() {
	// 构建函数的形式，此时this.mesh就是Sky函数的mesh
	sky = new Sky();
	sky.mesh.position.y = -600;
	scene.add(sky.mesh);
}

function loop() {
	// body...
	//renderer.render(scene, camera);
	sea.mesh.rotation.z += .005;
  	sky.mesh.rotation.z += .01;
  	renderer.render(scene, camera);
  	requestAnimationFrame(loop);
}

window.addEventListener('load', init, false);