var scene, camera, renderer, hemisphereLight, shadowLight;
var colors = {
	white: 0xffffff,
	brown: 0xffa221,
	yellow: 0xffee7d,
	black: 0x000000
}
function init() {
	createScene();
	createLights();
	createGugu();
	animate();
}

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

function createLights() {

	hemisphereLight = new THREE.HemisphereLight(0xffffff, 0xffffff, .6)
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

function createGugu() {
	var headGeo = new THREE.SphereGeometry(40,32,32,0,Math.PI*2,0,2);
	var material = new THREE.MeshLambertMaterial({
		color: colors.yellow,
		shading: THREE.FlatShading
	});
	var boxHeadGeo = new THREE.SphereGeometry(30,32,32,0,Math.PI*2,0,2);
	var whiteMaterial = new THREE.MeshLambertMaterial({
		color: colors.white,
		shading: THREE.FlatShading
	});
	var head = new THREE.Mesh(headGeo, material);
	var boxHead = new THREE.Mesh(boxHeadGeo, whiteMaterial);
	head.position.z = 10;
	// head.rotation.z = -Math.PI/2;
	head.rotation.x = Math.PI/2;
	boxHead.rotation.x = Math.PI/2;
	// boxHead.rotation.y = -Math.PI/2;
	boxHead.position.z = 25;
	scene.add(head);
	scene.add(boxHead);
}

function animate() {
	requestAnimationFrame(animate);
	renderer.render(scene, camera);
}
window.onload = function() {
	init()
}