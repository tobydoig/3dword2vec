function Bomb(target, radius, id) {
	const ANIMATION_TIME = 3000;
	const blast = new THREE.Sphere();
	const vec3 = new THREE.Vector3();
	const bodies = [];
	const startTime = performance.now();
	const col = points.geometry.getAttribute('color');
	const edge = radius * 0.25;
	
	blast.set(target, radius);
	
	for (let ix = 0; ix < W2VDATA.length; ix++) {
		vec3.set(positions[ix * 3], positions[ix * 3 + 1], positions[ix * 3 + 2]);
		dist = blast.distanceToPoint(vec3);
		if (dist < 0) {
			bodies.push(ix);
		}
		col.setXYZ(ix, 0, 0, 0);
	}
	col.needsUpdate = true;
	console.log('found ' + bodies.length);
	
	this.update = function() {
		let delta = performance.now() - startTime;
		let maxColor = Math.min(delta / ANIMATION_TIME, 1.0);
		blast.radius = (radius + edge) * maxColor;
		
		bodies.forEach((ix) => {
			vec3.set(positions[ix * 3], positions[ix * 3 + 1], positions[ix * 3 + 2])
			let dist = blast.distanceToPoint(vec3);
			
			let r = 0;
			let g = 0;
			
			if (dist > 0 && dist < edge) {
				//	leading edge
				r = (edge - dist) / edge;
				g = 0;
			} else if (dist < 0 && dist >= -edge) {
				//	trailing edge
				r = (edge + dist) / edge;
				g = 0.0;
			}
			
			dist = radius + dist;
			dist = dist / radius;
			
			if (ix === id) {
				console.log('dist = ' + dist + ', maxColor=' + maxColor);
			}
			col.setXYZ(ix, r, g, 0);
		});
		col.needsUpdate = true;
		
		return delta >= ANIMATION_TIME;
	};
}
