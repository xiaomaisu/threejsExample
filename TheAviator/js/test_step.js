//COLORS,十六进制的color
var Colors = {
	red: 0xf25346,
	white: 0xd8d0d1,
	pink: 0xF5986E,
	brown: 0x59332e,
	brownDark: 0x23190f,
	blue: 0x68c3c0
};

//鼠标位置的记录
var mousePos = {
	x: 0,
	y: 0
};

var scene, renderer, container, camera, SCREEN_WIDTH, SCREEN_HEIGHT;
var sky, airplane;

function init() {
	// body...
	//场景
	createScene();
	//天空
	createSky();
	//飞机
	createAirplane();
	// //大海
	createSea();
	//光
	createLights();

	loop();

	//add the listener
	document.addEventListener('mousemove', handleMouseMove, false);

	//createPerson();
}

//创建场景
function createScene() {
	scene = new THREE.Scene();
	SCREEN_WIDTH = window.innerWidth;
	SCREEN_HEIGHT = window.innerHeight;
	var ASPECT = SCREEN_WIDTH / SCREEN_HEIGHT;
	var NEAR = 1;
	var FAR = 10000;
	//camera的各个参数很重要，试着更改参数查看效果
	camera = new THREE.PerspectiveCamera(60, ASPECT, NEAR, FAR);
	scene.add(camera);
	scene.fog = new THREE.Fog(0xf7d9aa, 100, 950); //雾化效果，在游戏中见到的烟雾、爆炸火焰以及白云等效果都是雾化的结果，可减少3d渲染工作量
	camera.position.set(0, 100, 200);
	renderer = new THREE.WebGLRenderer({
		alpha: true, //whether the canvas contains an alpha (transparency) buffer or not
		antialias: true
	});
	renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);
	//允许阴影出现，必须有,如果没有所有castShadow无效
	renderer.shadowMap.enabled = true;
	container = document.getElementById('world');
	container.appendChild(renderer.domElement);

	//resize屏幕时改变视角等
	window.addEventListener('resize', handleWindowResize, false);
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
		m.position.x = i * 15;
		m.position.y = Math.random() * 10;
		m.position.z = Math.random() * 10;
		m.rotation.x = Math.random() * Math.PI * 2;
		m.rotation.y = Math.random() * Math.PI * 2;
		var s = .1 + Math.random() * .9;
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

	// an ambient light modifies the global color of a scene and makes the shadows softer
	var ambientLight = new THREE.AmbientLight(0xdc8874, .5);
	scene.add(ambientLight);
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
		c.mesh.position.x = Math.sin(a) * h;
		c.mesh.position.y = Math.cos(a) * h;
		c.mesh.position.z = -400 - Math.random() * 400;
		c.mesh.rotation.z = a + Math.PI / 2;
		var s = Math.random() * 2 + 1;
		c.mesh.scale.set(s, s, s);
		this.mesh.add(c.mesh);
	}
}

function Sea() {
	// body...
	var geom = new THREE.CylinderGeometry(600, 600, 800, 40, 10);
	//旋转圆柱体
	geom.applyMatrix(new THREE.Matrix4().makeRotationX(-Math.PI / 2));

	//important: by merging vertices we ensure the continuity of the waves
	geom.mergeVertices();
	var l = geom.vertices.length;
	//waves的获取可修改为参数获取，这样如果有多个海则可根据参数修改
	this.waves = [];
	for (var i = 0; i < l; i++) {
		var v = geom.vertices[i];
		this.waves.push({
			y: v.y,
			x: v.x,
			z: v.z,
			ang: Math.random() * Math.PI * 2,
			amp: 5 + Math.random() * 15,
			speed: 0.016 + Math.random() * 0.032
		});
	};

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

Sea.prototype.moveWaves = function() {
	var verts = this.mesh.geometry.vertices;
	var l = verts.length;
	for (var i = 0; i < l; i++) {
		var v = verts[i];
		var vprops = this.waves[i];
		v.x = vprops.x + Math.cos(vprops.ang) * vprops.amp;
		v.y = vprops.y + Math.sin(vprops.ang) * vprops.amp;
		vprops.ang += vprops.speed;
	}
	this.mesh.geometry.verticesNeedUpdate = true;
	sea.mesh.rotation.z += .005;
}

function AirPlane() {
	// body...
	this.mesh = new THREE.Object3D();
	var geomCockpit = new THREE.BoxGeometry(65, 50, 50, 1, 1, 1);
	//we can access a specific vertex of a shape through 
	//the vertices array, and then move its x, y and z property
	geomCockpit.vertices[4].y -= 10;
	geomCockpit.vertices[4].z += 20;
	geomCockpit.vertices[5].y -= 10;
	geomCockpit.vertices[5].z -= 20;
	geomCockpit.vertices[6].y += 30;
	geomCockpit.vertices[6].z += 20;
	geomCockpit.vertices[7].y += 30;
	geomCockpit.vertices[7].z -= 20;
	var matCockpit = new THREE.MeshPhongMaterial({
		color: Colors.red,
		shading: THREE.FlatShading
	});
	var cockpit = new THREE.Mesh(geomCockpit, matCockpit);
	//cockpit.receiveShadow = true;
	cockpit.castShadow = true;
	this.mesh.add(cockpit);

	//前面白色那一块
	var geomEngine = new THREE.BoxGeometry(20, 50, 50, 1, 1, 1);
	var matEngine = new THREE.MeshPhongMaterial({
		color: Colors.white,
		shading: THREE.FlatShading
	});
	var engine = new THREE.Mesh(geomEngine, matEngine);
	engine.position.x = 40;
	//engine.receiveShadow = true;
	engine.castShadow = true;
	this.mesh.add(engine);

	//后面翘起来那个红色小角
	var geomTailPlane = new THREE.BoxGeometry(15, 20, 5, 1, 1, 1);
	var matTailPlane = new THREE.MeshPhongMaterial({
		color: Colors.red,
		shading: THREE.FlatShading
	});
	var tailPlane = new THREE.Mesh(geomTailPlane, matTailPlane);
	tailPlane.position.set(-35, 25, 0);
	tailPlane.castShadow = true;
	//tailPlane.receiveShadow = true;
	this.mesh.add(tailPlane);

	//侧翼
	var geomSideWing = new THREE.BoxGeometry(34, 8, 150, 1, 1, 1);
	var matSideWing = new THREE.MeshPhongMaterial({
		color: Colors.red,
		shading: THREE.FlatShading
	});
	var sideWing = new THREE.Mesh(geomSideWing, matSideWing);
	sideWing.position.set(0, 8, 0);
	sideWing.castShadow = true;
	//sideWing.receiveShadow = true;
	this.mesh.add(sideWing);

	//旋转的螺桨
	var geomPropeller = new THREE.BoxGeometry(20, 10, 10, 1, 1, 1);
	var matPropeller = new THREE.MeshPhongMaterial({
		color: Colors.brown,
		shading: THREE.FlatShading
	});
	this.propeller = new THREE.Mesh(geomPropeller, matPropeller);
	this.propeller.castShadow = true;
	//this.propeller.receiveShadow = true;

	var geomBlade = new THREE.BoxGeometry(1, 100, 20, 1, 1, 1);
	var matBlade = new THREE.MeshPhongMaterial({
		color: Colors.brownDark,
		shading: THREE.FlatShading
	});

	//需有两个交叉的螺桨，因此用到clone
	var blade = new THREE.Mesh(geomBlade, matBlade);
	blade.position.set(8, 0, 0);
	var blade2 = blade.clone();
	blade.castShadow = true;
	//blade.receiveShadow = true;
	blade2.rotation.x = Math.PI / 2;
	blade2.castShadow = true;
	//blade2.receiveShadow = true;
	this.propeller.add(blade);
	this.propeller.add(blade2);
	this.propeller.position.set(50, 0, 0);
	this.mesh.add(this.propeller);

	//使机身侧面形状从三角变成三角+正方形
	var wheelProtecGeom = new THREE.BoxGeometry(25, 15, 10, 1, 1, 1);
	var wheelProtecMat = new THREE.MeshPhongMaterial({
		color: Colors.red,
		shading: THREE.FlatShading
	});
	var wheelProtecR = new THREE.Mesh(wheelProtecGeom, wheelProtecMat);
	wheelProtecR.position.set(17, -20, 25);
	this.mesh.add(wheelProtecR);

	//最下面的灰色的底部
	var wheelTireGeom = new THREE.BoxGeometry(20, 20, 4);
	var wheelTireMat = new THREE.MeshPhongMaterial({
		color: Colors.brownDark,
		shading: THREE.FlatShading
	});
	var wheelTireR = new THREE.Mesh(wheelTireGeom, wheelTireMat);
	wheelTireR.position.set(17, -28, 25);
	var wheelAxisGeom = new THREE.BoxGeometry(6, 6, 6);
	var wheelAxisMat = new THREE.MeshPhongMaterial({
		color: Colors.brown,
		shading: THREE.FlatShading
	});
	var wheelAxis = new THREE.Mesh(wheelAxisGeom, wheelAxisMat);
	wheelTireR.add(wheelAxis);
	this.mesh.add(wheelTireR);

	//对称的部分
	var wheelProtecL = wheelProtecR.clone();
	wheelProtecL.position.z = -wheelProtecR.position.z;
	this.mesh.add(wheelProtecL);

	var wheelTireL = wheelTireR.clone();
	wheelTireL.position.z = -wheelTireR.position.z;
	this.mesh.add(wheelTireL);

	var wheelTireB = wheelTireR.clone();
	wheelTireB.scale.set(.5, .5, .5);
	wheelTireB.position.set(-30, -3, 0);
	this.mesh.add(wheelTireB);

	//连接最后面小黑的倾斜的红色长条
	var suspensionGeom = new THREE.BoxGeometry(4, 12, 4);
	suspensionGeom.applyMatrix(new THREE.Matrix4().makeTranslation(0, 10, 0))
	var suspensionMat = new THREE.MeshPhongMaterial({
		color: Colors.red,
		shading: THREE.FlatShading
	});
	var suspension = new THREE.Mesh(suspensionGeom, suspensionMat);
	suspension.position.set(-32, -8, 0);
	suspension.rotation.z = -.3;
	this.mesh.add(suspension);
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

function updateAirPlane() {
	// body...
	// let's move the airplane between -100 and 100 on the horizontal axis, 
	// and between 25 and 175 on the vertical axis,
	// depending on the mouse position which ranges between -1 and 1 on both axes;
	// to achieve that we use a normalize function (see below)

	var targetX = normalize(mousePos.x, -1, 1, -100, 100);
	var targetY = normalize(mousePos.y, -1, 1, 25, 175);

	// update the airplane's position
	airplane.mesh.position.y = targetY;
	airplane.mesh.position.x = targetX;
	airplane.propeller.rotation.x += .3;
}

function createAirplane() {
	// body...
	airplane = new AirPlane();
	airplane.mesh.position.y = 100;
	airplane.mesh.scale.set(.3, .3, .3, .3);
	scene.add(airplane.mesh);
}

function handleWindowResize() {
	// body...
	SCREEN_HEIGHT = window.innerHeight;
	SCREEN_WIDTH = window.innerWidth;
	renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);
	camera.aspect = SCREEN_WIDTH / SCREEN_HEIGHT;
	camera.updateProjectionMatrix();
}

function handleMouseMove(event) {
	// body...
	var tx = -1 + (event.clientX / SCREEN_WIDTH) * 2;
	var ty = 1 - (event.clientY / SCREEN_HEIGHT) * 2;
	mousePos = {
		x: tx,
		y: ty
	};
}

function normalize(v, vmin, vmax, tmin, tmax) {
	var nv = Math.max(Math.min(v, vmax), vmin);
	var dv = vmax - vmin;
	var pc = (nv - vmin) / dv;
	var dt = tmax - tmin;
	var tv = tmin + (pc * dt);
	return tv;
}

function loop() {
	// body...
	//renderer.render(scene, camera);
	sea.moveWaves();
	updateAirPlane();
	sea.mesh.rotation.z += .005;
	sky.mesh.rotation.z += .01;
	renderer.render(scene, camera);
	requestAnimationFrame(loop);
}

window.addEventListener('load', init, false);