function HUD() {
	const FONT_SIZE = 12;
	const MAX_TEXT_LINES = 10;
	const text = [];
	
	let lastNow = performance.now();
	let lastFps = 0;
	let duration = 0;
	let fps = 0;
	
	let canvas = document.createElement('canvas');
	canvas.width = 1024;
	canvas.height = 512;
	let context = canvas.getContext('2d');
	let texture = new THREE.Texture(canvas);
	let material = new THREE.MeshBasicMaterial({ map: texture, depthTest: false, transparent: true });
	let geometry = new THREE.PlaneGeometry(1, 1, 1, 1);
	this.plane = new THREE.Mesh(geometry, material);
	
	const MAX_LABELS = 20;
	
	const blast = new THREE.Sphere();
	const MAX_DIST = 50;
	const BOX_PADDING = 10;
	const MAX_FONT_HEIGHT = 24;
	
	this.update = function() {
		redraw();
	};
	
	let frustum = new THREE.Frustum();
	let m4 = new THREE.Matrix4();
	let v3 = new THREE.Vector3();
	
	function PointLabel() {
		this.ix = 0;
		this.dist = 0;
		this.v3 = new THREE.Vector3();
		this.fontHeight = 0;
		this.box = new THREE.Box2();
		this.txtPos = new THREE.Vector2();
		this.txt = '';
	}
	
	function redraw() {
		let now = performance.now();
		duration += (now - lastNow);
		lastNow = now;
		
		
		++fps;
		if (duration > 1000) {
			duration = 0;
			lastFps = fps;
			fps = 0;
			
		}
		
		frustum.setFromMatrix( m4.multiplyMatrices( camera.projectionMatrix, camera.matrixWorldInverse ) );
		let labelsList = [];
		for (let ix = 0; ix < W2VDATA.length; ix++) {
			v3.set(positions[ix * 3], positions[ix * 3 + 1], positions[ix * 3 + 2]);
			if (frustum.containsPoint(v3)) {
				let dist = player.position.distanceTo(v3);
				if (dist < MAX_DIST) {
					let pl = new PointLabel();
					pl.ix = ix;
					pl.dist = dist;
					pl.v3.copy(v3);
					labelsList.push(pl);
				}
			}
		}
		
		labelsList.sort((a, b) => {
			return a.dist > b.dist;
		});
		
		context.clearRect(0, 0, canvas.width, canvas.height);
		context.fillStyle = "rgba(0, 0, 80, 0.3)";
		context.fillRect(0, 0, canvas.width, canvas.height);
		context.strokeStyle = "#ff0000";
		context.strokeRect(0, 0, canvas.width, canvas.height);
		
		context.font = "12pt Calibri";
		context.fillStyle = "#aaaaaa";
		context.fillStyle = 'rgba(200, 200, 200, 1)';
		text.forEach((t, i) => {
			context.fillText(t, 1, ++i * FONT_SIZE);
		});
		context.fillText(lastFps, 990, FONT_SIZE);
		
		if (labelsList.length) {
			let winners = [];
			labelsList.forEach((pl) => {
				let d = pl.dist;
				d = d / MAX_DIST;
				d = 1 - d;
				let v2 = pl.v3.project(camera);
				pl.txtPos.set((v2.x + 1) / 2 * canvas.width, -(v2.y - 1) / 2 * canvas.height);
				pl.fontHeight = MAX_FONT_HEIGHT * d;
				
				pl.txt = W2VDATA[pl.ix][0] + ' (' + pl.dist.toFixed(2) + ')';
				context.font = pl.fontHeight.toFixed(2) + "px Calibri";
				let tm = context.measureText(pl.txt);
				
				pl.box.min.set(pl.txtPos.x - BOX_PADDING, pl.txtPos.y - BOX_PADDING - pl.fontHeight * 0.7);
				pl.box.max.set(pl.txtPos.x + tm.width + BOX_PADDING, pl.txtPos.y + BOX_PADDING + pl.fontHeight * 0.3);
				
				if (!winners.find((e) => {
					return pl.box.intersectsBox(e.box);
				})) {
					winners.push(pl);
				}
			});
			
			let v2 = new THREE.Vector2();
			context.fillStyle = 'rgba(200, 200, 200, 1)';
			winners.forEach((pl) => {
				context.font = pl.fontHeight.toFixed(2) + "px Calibri";
				//context.fillStyle = "rgba(0, 0, 80, 0.3)";
				//pl.box.getSize(v2);
				//context.fillRect(pl.box.min.x, pl.box.min.y, v2.x, v2.y);
				context.fillText(pl.txt, pl.txtPos.x, pl.txtPos.y);
			});
		}
		
		texture.needsUpdate = true;
	};
}
