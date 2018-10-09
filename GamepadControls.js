function GamepadControls(gamepad, config) {
	config = config || {};
	
	const MAX_ROT_RADIANS = config.MAX_ROT_RADIANS || Math.PI / 360;
	const FLY_SPEED = config.FLY_SPEED || 1;

	const RADIANS_90_DEGREES = Math.PI / 2;
	const MIN_AXIS_MOVEMENT = 0.1;
	
	const XAxisRotation = new THREE.Vector3(1, 0, 0);
	const YAxisRotation = new THREE.Vector3(0, 1, 0);
	const ZAxisRotation = new THREE.Vector3(0, 0, 1);
	let tempQuaternion = new THREE.Quaternion();
	let tempVector3 = new THREE.Vector3();
	let tempMatrix4 = new THREE.Matrix4();
	const X90AxisQuaternion = new THREE.Quaternion();
	X90AxisQuaternion.setFromAxisAngle(XAxisRotation, RADIANS_90_DEGREES);
	const Y90AxisQuaternion = new THREE.Quaternion();
	Y90AxisQuaternion.setFromAxisAngle(YAxisRotation, RADIANS_90_DEGREES);
	const Z90AxisQuaternion = new THREE.Quaternion();
	Z90AxisQuaternion.setFromAxisAngle(ZAxisRotation, RADIANS_90_DEGREES);
	
	let initialAxes = gamepad.axes.slice();
	
	this.buttons = gamepad.buttons;
	this.axes = gamepad.axes;
	
	this.update = function(player, camera) {
		let s = '';
		gamepad.axes.forEach((a, i) => {
			if (Math.abs(a - initialAxes[i]) >= MIN_AXIS_MOVEMENT) {
				switch (i) {
					case 0: //	left Horiz
						player.translateX(FLY_SPEED * a * (gamepad.buttons[1].pressed ? 2 : 1));
						break;
					case 1: //	left Vert
						player.translateZ(FLY_SPEED * a * (gamepad.buttons[1].pressed ? 2 : 1));
						break;
					case 2: //	right Horiz
						camera.getWorldQuaternion(tempQuaternion);
						tempQuaternion.multiply(Y90AxisQuaternion);
						tempMatrix4.makeRotationFromQuaternion(tempQuaternion);
						tempVector3.setFromMatrixColumn(tempMatrix4, 1);
						player.rotateOnWorldAxis(tempVector3, -MAX_ROT_RADIANS * a);
						break;
					case 5: //	right Vert
						camera.getWorldQuaternion(tempQuaternion);
						tempQuaternion.multiply(Z90AxisQuaternion);
						tempMatrix4.makeRotationFromQuaternion(tempQuaternion);
						tempVector3.setFromMatrixColumn(tempMatrix4, 1);
						player.rotateOnWorldAxis(tempVector3, -MAX_ROT_RADIANS * a);
						break;
					default:
						break;
				}
			}
		});
			
		gamepad.buttons.forEach((b, i) => {
			if (b.pressed) {
				switch (i) {
					case 0:	//	square
						break;
					case 1:	//	x
						//if (b.pressed) {
						//	camera.getWorldDirection(tempVector3);
						//	player.position.add(tempVector3.multiplyScalar(FLY_SPEED * 2));
						//}
						break;
					case 2:	//	circle
						break;
					case 3:	//	triangle
						break;
					case 4:	//	left 2
						camera.getWorldQuaternion(tempQuaternion);
						tempQuaternion.multiply(X90AxisQuaternion);
						tempMatrix4.makeRotationFromQuaternion(tempQuaternion);
						tempVector3.setFromMatrixColumn(tempMatrix4, 1);
						player.rotateOnWorldAxis(tempVector3, -MAX_ROT_RADIANS);
						break;
					case 5:	//	right 2
						camera.getWorldQuaternion(tempQuaternion);
						tempQuaternion.multiply(X90AxisQuaternion);
						tempMatrix4.makeRotationFromQuaternion(tempQuaternion);
						tempVector3.setFromMatrixColumn(tempMatrix4, 1);
						player.rotateOnWorldAxis(tempVector3, MAX_ROT_RADIANS);
						break;
					case 6:	//	left trigger
						break;
					case 7:	//	right trigger
					default:
						break;
				}
			}
		});
	};
}
