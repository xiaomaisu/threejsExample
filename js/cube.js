var colors = ['0xffffff', '0x0000fe', '0xff7e06', '0x00ff04', '0xfd0004', '0xfeff01'];

function Cube(size, gap) {
	this.type = 'CUBE';
	this.groupX1 = [];
	this.groupX2 = [];
	this.groupX3 = [];
	this.groupY1 = [];
	this.groupY2 = [];
	this.groupY3 = [];
	this.rotation = {
		y: Math.PI * 0.25
	};
	this.init(size, gap);
}

Cube.prototype = {
	constructor: Cube,
	init: function(size, gap) {
		this.mesh = new THREE.Object3D();
		for (var x = 0; x <= 2; x++) {
			for (var y = 0; y <= 2; y++) {
				for (var z = 0; z <= 2; z++) {
					var geometry = new THREE.BoxGeometry(size, size, size);
					for (var i = 0; i < geometry.faces.length; i += 2) {
						var hex = colors[i / 2];
						geometry.faces[i].color.setHex(hex);
						geometry.faces[i + 1].color.setHex(hex);

					}
					var material = new THREE.MeshBasicMaterial({
						vertexColors: THREE.FaceColors,
						overdraw: 0.5
					});

					littleCube = new THREE.Mesh(geometry, material);
					// group 的中心应该是 axishelper 的原点，而原点为 (0,0,0)
					littleCube.position.x = (size + gap) * (x - 1);
					littleCube.position.y = (size + gap) * (y - 1);
					littleCube.position.z = (size + gap) * (z - 1);
					this.mesh.add(littleCube);
					switch (x) {
						case 0:
							this.groupX1.push(littleCube);
							break;
						case 1:
							this.groupX2.push(littleCube);
							break;
						case 2:
							this.groupX3.push(littleCube);
					}
					switch (y) {
						case 0:
							this.groupY1.push(littleCube);
							break;
						case 1:
							this.groupY2.push(littleCube);
							break;
						case 2:
							this.groupY3.push(littleCube);
					}
				}
			}
		}
		this.mesh.rotation.y = this.rotation.y; //放置角度
	},
	rotateY: function() {
		var quaternion = new THREE.Quaternion();
		return function rotateY(group, speed) {
			quaternion.setFromAxisAngle(new THREE.Vector3(0, 1, 0), speed);
			for (var i = 0, len = group.length; i < len; i++) {
				var x0 = group[i].position.x;
				var z0 = group[i].position.z;
				group[i].applyQuaternion(quaternion);
				group[i].position.x = Math.cos(speed) * x0 + Math.sin(speed) * z0;
				group[i].position.z = Math.cos(speed) * z0 - Math.sin(speed) * x0;
			}
		}
	}(),
	// 采用闭包形式防止多次定义 quaternion，如果魔方全部速度一致，那么setFromAxis 也可以放置闭包外 
	rotateX: function() {
		var quaternion = new THREE.Quaternion();
		return function rotateX(group, speed) {
			quaternion.setFromAxisAngle(new THREE.Vector3(1, 0, 0), speed);
			for (var i = 0, len = group.length; i < len; i++) {
				var y0 = group[i].position.y;
				var z0 = group[i].position.z;
				group[i].applyQuaternion(quaternion);
				group[i].position.y = Math.cos(speed) * y0 - Math.sin(speed) * z0;
				group[i].position.z = Math.cos(speed) * z0 + Math.sin(speed) * y0;
			}
		}
	}(),
	rotateZ: function() {
		var quaternion = new THREE.Quaternion();
		return function rotateZ(group, speed) {
			quaternion.setFromAxisAngle(new THREE.Vector3(0, 0, 1), speed);
			var x0 = group[i].position.x;
			var y0 = group[i].position.y;
			group[i].applyQuaternion(quaternion);
			group[i].position.x = Math.cos(speed) * x0 - Math.sin(speed) * y0;
			group[i].position.y = Math.cos(speed) * y0 + Math.sin(speed) * x0;
		}
	}()
}