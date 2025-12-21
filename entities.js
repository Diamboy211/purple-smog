// [x0, y0,
// node end time, xn, yn, xn', yn', xn+1', yn+1',
// ...]
// next call t >= prev call t
function make_hermite_path(nodes)
{
	let last_t = 0;
	let curr_idx = 2;
	let last_x = nodes[0];
	let last_y = nodes[1];
	return t =>
	{
		while (curr_idx < nodes.length && t >= nodes[curr_idx])
		{
			last_t = nodes[curr_idx];
			last_x = nodes[curr_idx + 1];
			last_y = nodes[curr_idx + 2];
			curr_idx += 7;
		}
		if (curr_idx >= nodes.length) return [last_x, last_y];
		let ri = nodes[curr_idx] - last_t;
		let rt = (t - last_t) / ri;
		let bp1 = (2 * rt - 3) * rt * rt + 1;
		let bv1 = ((rt - 2) * rt + 1) * rt * ri;
		let bp2 = (-2 * rt + 3) * rt * rt;
		let bv2 = (rt - 1) * rt * rt * ri;
		let x = bp1 * last_x + bp2 * nodes[curr_idx + 1] + bv1 * nodes[curr_idx + 3] + bv2 * nodes[curr_idx + 5];
		let y = bp1 * last_y + bp2 * nodes[curr_idx + 2] + bv1 * nodes[curr_idx + 4] + bv2 * nodes[curr_idx + 6];
		return [x, y];
	};
}

function projectile_1(time, opt = {})
{
	const spd = opt.speed ? opt.speed : 1.5;
	return {
		rot: opt.rot ? [opt.rot[0], opt.rot[1]] : [0, 1],
		pos: opt.pos ? [opt.pos[0], opt.pos[1]] : [0.5, 0.5],
		size: opt.size ? opt.size : 1 / 32,
		enemy: !!opt.enemy,
		hitbox: !!opt.hitbox,
		shootable: false,
		sprite: opt.sprite ? opt.sprite : precomp.p_arrow,
		color: opt.color ? opt.color : "#F00",

		damage: opt.damage ? opt.damage : 1,
		last_tick: time,
		tick(game, time)
		{
			let dt = (time - this.last_tick) / 1000;
			this.last_tick = time;
			this.pos[0] += this.rot[0] * dt * spd;
			this.pos[1] += this.rot[1] * dt * spd;
			return Math.hypot(this.pos[0] - 0.5, this.pos[1] - 0.5) <= Math.SQRT1_2 + this.size;
		},
	};
}

function projectile_2(time, opt = {})
{
	const spd = opt.speed ? opt.speed : 0.5;
	const major = opt.major ? opt.major : 0.125;
	const minor = opt.minor ? opt.minor : 0.0625;
	const phase = opt.phase ? opt.phase : -Math.PI / 2;
	const omega = opt.omega ? opt.omega : -Math.PI * 4;
	return {
		rot: opt.rot ? [opt.rot[0], opt.rot[1]] : [0, 1],
		pos: opt.pos ? [opt.pos[0], opt.pos[1]] : [0.5, 0.5],
		size: opt.size ? opt.size : 1 / 32,
		enemy: !!opt.enemy,
		hitbox: !!opt.hitbox,
		shootable: false,
		sprite: opt.sprite ? opt.sprite : precomp.p_arrow,
		color: opt.color ? opt.color : "#F00",

		damage: opt.damage ? opt.damage : 1,
		last_tick: time,
		spawn_tick: time,
		center_pos: opt.pos ? [opt.pos[0], opt.pos[1]] : [0.5, 0.5],
		center_dir: opt.rot ? [opt.rot[0], opt.rot[1]] : [0, 1],
		tick(game, time)
		{
			let dt = (time - this.last_tick) / 1000;
			let t = (time - this.spawn_tick) / 1000;
			this.last_tick = time;
			this.center_pos[0] += this.center_dir[0] * dt * spd;
			this.center_pos[1] += this.center_dir[1] * dt * spd;
			let c = Math.cos(omega * t + phase);
			let s = Math.sin(omega * t + phase);
			this.pos[0] = this.center_pos[0] + c * major * this.center_dir[1] + s * minor * this.center_dir[0];
			this.pos[1] = this.center_pos[1] - c * major * this.center_dir[0] + s * minor * this.center_dir[1];
			let vx = this.center_dir[0] * spd + omega * (-s * major * this.center_dir[1] + c * minor * this.center_dir[0]);
			let vy = this.center_dir[1] * spd + omega * (s * major * this.center_dir[0] + c * minor * this.center_dir[1]);
			let vm = Math.hypot(vx, vy);
			if (vm > 0)
			{
				this.rot[0] = vx / vm;
				this.rot[1] = vy / vm;
			}
			return Math.hypot(this.center_pos[0] - 0.5, this.center_pos[1] - 0.5) <= Math.SQRT1_2 + this.size + Math.max(minor, major);
		},
	};
}

function projectile_3(time, opt = {})
{
	const spd = opt.speed ? opt.speed : 0.5;
	const ph = opt.rot ? Math.atan2(opt.rot[1], opt.rot[0]) : Math.PI / 2;
	const p = opt.pos ? [opt.pos[0], opt.pos[1]] : [0.5, 0.5];
	return {
		rot: opt.rot ? [opt.rot[0], opt.rot[1]] : [0, 1],
		pos: [p[0], p[1]],
		size: opt.size ? opt.size : 1 / 32,
		enemy: !!opt.enemy,
		hitbox: !!opt.hitbox,
		shootable: false,
		sprite: opt.sprite ? opt.sprite : precomp.p_arrow,
		color: opt.color ? opt.color : "#F00",

		damage: opt.damage ? opt.damage : 1,
		speed: spd,
		center: [p[0], p[1]],
		omega: opt.omega ? opt.omega : 0,
		phase: ph,
		start_tick: time,
		tick(game, time)
		{
			let t = (time - this.start_tick) / 1000;
			let c = Math.cos(this.omega * t + this.phase);
			let s = Math.sin(this.omega * t + this.phase);
			this.pos[0] = this.center[0] + this.speed * t * c;
			this.pos[1] = this.center[1] + this.speed * t * s;
			let dx = c - this.omega * t * s;
			let dy = s + this.omega * t * c;
			let d = Math.hypot(dx, dy);
			if (d != 0)
			{
				this.rot[0] = dx / d;
				this.rot[1] = dy / d;
			}
			return Math.hypot(this.pos[0] - 0.5, this.pos[1] - 0.5) <= Math.SQRT1_2 + this.size;
		},
	};
}

function power(time, opt = {})
{
	let o = opt.origin ? [opt.origin[0], opt.origin[1]] : [0.5, 0.5];
	let max_r = opt.radius ? opt.radius : 0;
	let a = Math.random() * Math.PI;
	let r = Math.random() + Math.random();
	if (r > 1) r = 2 - r;
	let val = opt.power ? opt.power : 1;
	let pos = [o[0] + r * max_r * Math.cos(a), o[1] + r * max_r * Math.sin(a)];
	pos[0] = Math.acos(Math.cos(Math.PI * pos[0])) / Math.PI;
	pos[1] = Math.acos(Math.cos(Math.PI * pos[1])) / Math.PI;

	return {
		rot: [1, 0],
		pos,
		size: Math.sqrt(val) * 0.05,
		enemy: false,
		hitbox: !!opt.hitbox,
		shootable: true,
		hp: opt.hp ? opt.hp : 0,
		sprite: opt.sprite ? opt.sprite : precomp.power,
		color: opt.color ? opt.color : "#F55",

		power: val,
		vel: opt.velocity ? [opt.velocity[0], opt.velocity[1]] : [0, 0],
		acc: opt.acceleration ? [opt.acceleration[0], opt.acceleration[1]] : [0, -0.125],
		last_tick: time,
		attract: false,
		tick(game, time)
		{
			let dt = (time - this.last_tick) / 1000;
			this.last_tick = time;
			let player = game.field.entities.get(game.player_id);
			if (player.pos[1] >= 0.8) this.attract = true;
			if (!this.attract)
			{
				this.pos[0] = this.pos[0] + dt * (this.vel[0] + 0.5 * dt * this.acc[0]);
				this.pos[1] = this.pos[1] + dt * (this.vel[1] + 0.5 * dt * this.acc[1]);
				this.vel[0] += dt * this.acc[0];
				this.vel[1] += dt * this.acc[1];
			}
			else
			{
				this.vel[0] = player.pos[0] - this.pos[0];
				this.vel[1] = player.pos[1] - this.pos[1];
				let d = Math.min(0.1, Math.hypot(this.vel[0], this.vel[1]));
				this.vel[0] = this.vel[0] / d * 2;
				this.vel[1] = this.vel[1] / d * 2;
				this.pos[0] += this.vel[0] * dt;
				this.pos[1] += this.vel[1] * dt;
			}
			return Math.hypot(this.pos[0] - 0.5, this.pos[1] - 0.5) <= Math.SQRT1_2 + this.size;
		}
	};
}

function power_spawner(time, opt = {})
{
	let big = opt.big ? opt.big : 0;
	let small = opt.small ? opt.small : 0;
	let oneup = opt.oneup ? opt.oneup : 0;

	return {
		rot: [1, 0],
		pos: [-2, -2],
		size: -1,
		enemy: false,
		hitbox: !!opt.hitbox,
		shootable: false,
		sprite: precomp.power,
		color: "#0000",

		tick(game, time)
		{
			for (let i = 0; i < big; i++)
			{
				let bigp = power(time, {
					origin: opt.origin,
					radius: opt.radius,
					power: 5,
					sprite: opt.sprite,
					color: opt.color,
					hitbox: opt.hitbox,
					velocity: opt.velocity,
					acceleration: opt.acceleration,
				});
				game.field.add(bigp);
			}
			for (let i = 0; i < small; i++)
			{
				let smallp = power(time, {
					origin: opt.origin,
					radius: opt.radius,
					power: 1,
					sprite: opt.sprite,
					color: opt.color,
					hitbox: opt.hitbox,
					velocity: opt.velocity,
					acceleration: opt.acceleration,
				});
				game.field.add(smallp);
			}
			for (let i = 0; i < oneup; i++)
			{
				let up = power(time, {
					origin: opt.origin,
					radius: opt.radius,
					power: 5,
					hp: 1,
					sprite: precomp.oneup,
					color: "#0B0",
					hitbox: opt.hitbox,
					velocity: opt.velocity,
					acceleration: opt.acceleration,
				});
				game.field.add(up);
			}
			return false;
		}
	};

}

function sprayer(time, path, opt = {}, opt2 = {})
{
	let cool = opt.cooldown ? opt.cooldown : 1000;
	let spd = opt2.speed ? opt2.speed : 0.125;
	let f = make_hermite_path(path);
	let dead = path.at(-7);
	return {
		rot: opt.rot ? [opt.rot[0], opt.rot[1]] : [0, 1],
		pos: [0.5, 0.5],
		size: opt.size ? opt.size : 1 / 16,
		enemy: !!opt.enemy,
		hitbox: !!opt.hitbox,
		shootable: true,
		sprite: opt.sprite ? opt.sprite : precomp.e_sprayer,
		color: opt.color ? opt.color : "#F0F",
		hp: opt.hp ? opt.hp : 20,
		bigp: opt.bigp,
		smallp: opt.smallp,
		radp: opt.radp,

		start_tick: time,
		spawn_tick: time,
		tick(game, time)
		{
			let t = (time - this.start_tick) / 1000;
			let p = f(t);
			this.pos[0] = p[0];
			this.pos[1] = p[1];
			if (time - this.spawn_tick >= cool)
			{
				this.spawn_tick = time;
				for (let i = 0; i < 8; i++)
				{
					let c = Math.cos(i * Math.PI / 4);
					let s = Math.sin(i * Math.PI / 4);
					let bullet = projectile_1(time, {
						enemy: !!opt.enemy,
						pos: [p[0], p[1]],
						rot: [c * this.rot[0] - s * this.rot[1], s * this.rot[0] + c * this.rot[1]],
						speed: spd,
						size: opt2.size ? opt2.size : 3 / 256,
						sprite: opt2.sprite ? opt2.sprite : precomp.bullet,
						color: opt2.color ? opt2.color : "#B0B",
					});
					game.field.add(bullet);
				}
			}
			return t < dead;
		},
	};
}

function aimer(time, path, id, opt = {}, opt2 = {})
{
	let cool = opt.cooldown ? opt.cooldown : 1000;
	let spd = opt2.speed ? opt2.speed : 0.125;
	let f = make_hermite_path(path);
	let dead = path.at(-7);
	return {
		rot: [0, 1],
		pos: [0.5, 0.5],
		size: opt.size ? opt.size : 1 / 16,
		enemy: !!opt.enemy,
		hitbox: !!opt.hitbox,
		shootable: true,
		sprite: opt.sprite ? opt.sprite : precomp.e_aimer,
		color: opt.color ? opt.color : "#F0F",
		hp: opt.hp ? opt.hp : 20,
		bigp: opt.bigp,
		smallp: opt.smallp,
		radp: opt.radp,

		start_tick: time,
		spawn_tick: time,
		tick(game, time)
		{
			let t = (time - this.start_tick) / 1000;
			let p = f(t);
			this.pos[0] = p[0];
			this.pos[1] = p[1];
			let target = game.field.entities.get(id).pos;
			let mag = Math.hypot(target[0] - p[0], target[1] - p[1]);
			if (mag > 0)
			{
				this.rot[0] = (target[0] - p[0]) / mag;
				this.rot[1] = (target[1] - p[1]) / mag;
			}
			if (time - this.spawn_tick >= cool)
			{
				this.spawn_tick = time;
				let bullet = projectile_1(time, {
					enemy: !!opt.enemy,
					pos: [p[0] + this.rot[0] * this.size, p[1] + this.rot[1] * this.size],
					rot: this.rot,
					speed: spd,
					size: opt2.size ? opt2.size : 3 / 256,
					sprite: opt2.sprite ? opt2.sprite : precomp.bullet,
					color: opt2.color ? opt2.color : "#B0B",
				});
				game.field.add(bullet);
			}
			return t < dead;
		},
	};
}

function random_sprayer(time, path, opt = {}, opt2 = {})
{
	let st = time + (opt.start_delay ? opt.start_delay : 0) * 1000;
	let cool = opt.cooldown ? opt.cooldown : 1000;
	let mult = opt.multiplier ? opt.multiplier : 1;
	let spd_a = opt2.min_speed ? opt2.min_speed : 0.125;
	let spd_b = opt2.max_speed ? opt2.max_speed : 0.25;
	let omega = opt.omega ? opt.omega : 0;
	let rot = opt.rot ? Math.atan2(opt.rot[1], opt.rot[0]) : Math.PI / 2;
	let f = make_hermite_path(path);
	let dead = path.at(-7);
	return {
		rot: opt.rot ? [opt.rot[0], opt.rot[1]] : [0, 1],
		pos: [0.5, 0.5],
		size: opt.size ? opt.size : 1 / 16,
		enemy: !!opt.enemy,
		hitbox: !!opt.hitbox,
		shootable: true,
		sprite: opt.sprite ? opt.sprite : precomp.e_sprayer,
		color: opt.color ? opt.color : "#F0F",
		hp: opt.hp ? opt.hp : 20,
		bigp: opt.bigp,
		smallp: opt.smallp,
		radp: opt.radp,

		start_tick: time,
		spawn_tick: st,
		tick(game, time)
		{
			let t = (time - this.start_tick) / 1000;
			let p = f(t);
			this.pos[0] = p[0];
			this.pos[1] = p[1];
			let r = rot + omega * t;
			this.rot[0] = Math.cos(r);
			this.rot[1] = Math.sin(r);
			if (time - this.spawn_tick >= cool)
			{
				this.spawn_tick = time;
				for (let i = 0; i < mult; i++)
				{
					let theta = Math.random() * Math.PI * 2;
					let spd = spd_a + Math.random() * (spd_b - spd_a);
					let c = Math.cos(theta);
					let s = Math.sin(theta);
					let bullet = projectile_1(time, {
						enemy: !!opt.enemy,
						pos: [p[0], p[1]],
						rot: [c, s],
						speed: spd,
						size: opt2.size ? opt2.size : 3 / 256,
						sprite: opt2.sprite ? opt2.sprite : precomp.bullet,
						color: opt2.color ? opt2.color : "#B0B",
					});
					game.field.add(bullet);
				}
			}
			return t < dead;
		},
	};
}

function uniform_sprayer(time, path, opt = {}, opt2 = {})
{
	let st = time + (opt.start_delay ? opt.start_delay : 0) * 1000;
	let end = time + (opt.end_delay ? opt.end_delay : Infinity) * 1000;
	let cool = opt.cooldown ? opt.cooldown : 1000;
	let mult = opt.multiplier ? opt.multiplier : 1;
	let spd = opt2.speed ? opt2.speed : 0.125;
	let omega = opt.omega ? opt.omega : 0;
	let rot = opt.rot ? Math.atan2(opt.rot[1], opt.rot[0]) : Math.PI / 2;
	let rotb = opt2.rot ? Math.atan2(opt2.rot[1], opt2.rot[0]) : -Math.PI / 2;
	let roti = opt2.rot_inc ? opt2.rot_inc : Math.PI * (Math.sqrt(5) - 1);
	let f = make_hermite_path(path);
	let dead = path.at(-7);
	return {
		rot: opt.rot ? [opt.rot[0], opt.rot[1]] : [0, 1],
		pos: [0.5, 0.5],
		size: opt.size ? opt.size : 1 / 16,
		enemy: !!opt.enemy,
		hitbox: !!opt.hitbox,
		shootable: true,
		sprite: opt.sprite ? opt.sprite : precomp.e_sprayer,
		color: opt.color ? opt.color : "#F0F",
		hp: opt.hp ? opt.hp : 20,
		bigp: opt.bigp,
		smallp: opt.smallp,
		radp: opt.radp,

		start_tick: time,
		spawn_tick: st,
		theta: rotb,
		tick(game, time)
		{
			let t = (time - this.start_tick) / 1000;
			let p = f(t);
			this.pos[0] = p[0];
			this.pos[1] = p[1];
			let r = rot + omega * t;
			this.rot[0] = Math.cos(r);
			this.rot[1] = Math.sin(r);
			if (time < end && time - this.spawn_tick >= cool)
			{
				this.spawn_tick = time;
				for (let i = 0; i < mult; i++)
				{
					let c = Math.cos(this.theta);
					let s = Math.sin(this.theta);
					this.theta += roti;
					let bullet = projectile_1(time, {
						enemy: !!opt.enemy,
						pos: [p[0], p[1]],
						rot: [c, s],
						speed: spd,
						size: opt2.size ? opt2.size : 3 / 256,
						sprite: opt2.sprite ? opt2.sprite : precomp.bullet,
						color: opt2.color ? opt2.color : "#B0B",
					});
					game.field.add(bullet);
				}
			}
			return t < dead;
		},
	};
}

function spiral_sprayer(time, path, opt = {}, opt2 = {})
{
	let st = time + (opt.start_delay ? opt.start_delay : 0) * 1000;
	let end = time + (opt.end_delay ? opt.end_delay : Infinity) * 1000;
	let cool = opt.cooldown ? opt.cooldown : 1000;
	let mult = opt.multiplier ? opt.multiplier : 1;
	let spd = opt2.speed ? opt2.speed : 0.125;
	let omega = opt.omega ? opt.omega : 0;
	let rot = opt.rot ? Math.atan2(opt.rot[1], opt.rot[0]) : Math.PI / 2;
	let rotb = opt2.rot ? Math.atan2(opt2.rot[1], opt2.rot[0]) : -Math.PI / 2;
	let roti = opt2.rot_inc ? opt2.rot_inc : Math.PI * (Math.sqrt(5) - 1);
	let omega2 = opt2.omega ? opt2.omega : 0;
	let f = make_hermite_path(path);
	let dead = path.at(-7);
	return {
		rot: opt.rot ? [opt.rot[0], opt.rot[1]] : [0, 1],
		pos: [0.5, 0.5],
		size: opt.size ? opt.size : 1 / 16,
		enemy: !!opt.enemy,
		hitbox: !!opt.hitbox,
		shootable: true,
		sprite: opt.sprite ? opt.sprite : precomp.e_spiral,
		color: opt.color ? opt.color : "#F0F",
		hp: opt.hp ? opt.hp : 20,
		bigp: opt.bigp,
		smallp: opt.smallp,
		oneup: opt.oneup,
		radp: opt.radp,

		start_tick: time,
		spawn_tick: st,
		theta: rotb,
		tick(game, time)
		{
			let t = (time - this.start_tick) / 1000;
			let p = f(t);
			this.pos[0] = p[0];
			this.pos[1] = p[1];
			let r = rot + omega * t;
			this.rot[0] = Math.cos(r);
			this.rot[1] = Math.sin(r);
			if (time < end && time - this.spawn_tick >= cool)
			{
				this.spawn_tick = time;
				for (let i = 0; i < mult; i++)
				{
					let th = this.theta;
					let c = Math.cos(th);
					let s = Math.sin(th);
					this.theta += roti;
					let bullet = projectile_3(time, {
						enemy: !!opt.enemy,
						pos: [p[0], p[1]],
						rot: [c, s],
						speed: spd,
						size: opt2.size ? opt2.size : 3 / 256,
						sprite: opt2.sprite ? opt2.sprite : precomp.bullet,
						color: opt2.color ? opt2.color : "#B0B",
						hitbox: false,
						shootable: false,
						omega: omega2,
					});
					game.field.add(bullet);
				}
			}
			return t < dead;
		},
	};
}

function midboss(time)
{
	let f = make_hermite_path([
		0.5, 1.25,
		5, 0.5, 0.875, 0, -0.125, 0.125, 0
	]);
	return {
		rot: [0, -1],
		pos: [0.5, 1.25],
		size: 1 / 4,
		enemy: true,
		hitbox: false,
		shootable: true,
		sprite: precomp.e_plane1,
		color: "#A5A",
		hp: 600,
		bigp: 7,
		smallp: 15,
		oneup: 1,
		radp: 0.1875,

		start_tick: time,
		curtain_spawn_tick: time + 5000,
		mob_spawn_tick: time + 10000,
		mob_spawned: 0,
		tick(game, time)
		{
			let stage = 0;
			if (this.hp <= 400) stage++;
			if (this.hp <= 200) stage++;
			this.sprite = precomp[`e_plane${stage + 1}`];
			let t = (time - this.start_tick) / 1000;
			if (t < 5)
			{
				let p = f(t);
				this.pos[0] = p[0];
				this.pos[1] = p[1];
			}
			else
			{
				this.pos[0] = Math.sin((t - 5) / 2) * 0.25 + 0.5;
				this.pos[1] = 0.875;
			}
			if (time - this.curtain_spawn_tick >= 300)
			{
				this.curtain_spawn_tick = time;
				for (let i = -2 + stage; i <= 2 - stage; i++)
				{
					let bullet = projectile_1(time, {
						enemy: true,
						pos: [this.pos[0] + 0.09375 * i, this.pos[1] - 0.1875],
						rot: [0, -1],
						speed: 0.25,
						size: 1 / 128,
						sprite: precomp.bullet,
						color: "#F5".concat("0369C"[i+2]),
					});
					game.field.add(bullet);
				}
			}
			if (time - this.mob_spawn_tick >= 4000 - stage * 1000)
			{
				this.mob_spawn_tick = time;
				this.mob_spawned++;
				let path1 = [
					this.pos[0], 0.9,
					1, 0.95, 0.9, -2 * (this.pos[0] - 0.95), -0.2, 0, -0.2,
					6, 0.95, -0.1, 0, -0.2, 0, -0.2,
				];
				let path2 = [
					this.pos[0], 0.9,
					1, 0.05, 0.9, -2 * (this.pos[0] - 0.05), -0.2, 0, -0.2,
					6, 0.05, -0.1, 0, -0.2, 0, -0.2,
				];
				let paths = [path1, path2];
				let theta = this.mob_spawned * Math.PI * (Math.sqrt(5) - 1);
				for (let i = 0; i < 2; i++)
				{
					let sub = uniform_sprayer(time, paths[i], {
						start_delay: 1,
						cooldown: 200,
						enemy: true,
						omega: Math.PI / 4,
						hp: 1000,
					}, {
						sprite: precomp.donut,
						size: 1 / 64,
						rot: [Math.cos(theta), Math.sin(theta)],
					});
					game.field.add(sub);
				}
			}
			return true;
		},
	};
}

function boss(time)
{
	let f = make_hermite_path([
		0.5, 1.25,
		2, 0.5, 1, 0, -0.125, 0, 0
	]);
	return {
		rot: [0, -1],
		pos: [0.5, 1.25],
		size: 1 / 4,
		enemy: true,
		hitbox: false,
		shootable: true,
		sprite: precomp.e_boss1,
		color: "#A5A",
		hp: 2800,

		start_tick: time,
		s0_ring_tick: time + 5000,
		s0_aim_tick: time + 10000,
		s1_spawn_tick: 0,
		s3_curtain_tick: 0,
		s3_aim_tick: 0,
		s5_spawn_tick: 0,
		last_stage: 0,

		tick(game, time)
		{
			let stage = Math.max(0, Math.min(Math.floor((2800 - this.hp) / 400), 5));
			this.sprite = precomp[`e_boss${stage + 1}`];
			let t = (time - this.start_tick) / 1000;
			if (stage != this.last_stage)
			{
				this.last_stage = stage;
				switch (stage)
				{
				case 1:
					this.s1_spawn_tick = time + 2000;
					break;
				case 3:
					this.s3_curtain_tick = time;
					this.s3_aim_tick = time + 5000;
					break;
				case 5:
					this.s5_spawn_tick = time + 2000;
					break;
				case 2:
				case 4:
					let pspawner = power_spawner(time, { origin: [0.5, 0.75], big: 7, radius: 0.125, });
					game.field.add(pspawner);
					this[`s${stage}_ring_tick`] = time + 2000;
					this[`s${stage}_aim_tick`] = time + 7000;
					break;
				default:
					break;
				}
			}
			if (t < 5)
			{
				let p = f(t);
				this.pos[0] = p[0];
				this.pos[1] = p[1];
			}
			else switch (stage)
			{
			case 0:
			case 2:
			case 4:
				this.pos[0] = 0.5;
				this.pos[1] = 1;
				if (time - this[`s${stage}_ring_tick`] >= 2000 - stage * 250)
				{
					this[`s${stage}_ring_tick`] = time;
					let rtheta = Math.random() * Math.PI;
					for (let i = -1; i <= 1; i += 2)
						for (let j = 0; j < 48; j++)
						{
							let theta = Math.PI / 24 * j + rtheta;
							let c = Math.cos(theta);
							let s = Math.sin(theta);
							let bullet = projectile_3(time, {
								enemy: true,
								pos: [0.5, 0.75],
								rot: [c, s],
								sprite: precomp.bullet,
								speed: 0.125,
								size: 1 / 128,
								color: i == 1 ? "#F0F" : "#F00",
								omega: i * Math.PI / 32,
							});
							game.field.add(bullet);
						}
				}
				if (time - this[`s${stage}_aim_tick`] >= 200 + stage * 50)
				{
					this[`s${stage}_aim_tick`] = time;
					let player = game.field.entities.get(game.player_id);
					let rot = [player.pos[0] - 0.5, player.pos[1] - 0.75];
					let d = Math.hypot(rot[0], rot[1]);
					let bullet = projectile_1(time, {
						enemy: true,
						pos: [0.5, 0.75],
						rot: [rot[0] / d, rot[1] / d],
						sprite: precomp.donut,
						speed: 0.25,
						size: 3 / 256,
						color: "#FF0",
					});
					game.field.add(bullet);
				}
				break;
			case 1:
				if (time - this.s1_spawn_tick >= 600)
				{
					this.s1_spawn_tick = time;
					let theta = -Math.random() * Math.PI;
					let bullet = {
						pos: [0.5, 1],
						rot: [1, 0],
						size: 0.03125,
						enemy: true,
						hitbox: false,
						shootable: false,
						sprite: precomp.donut,
						color: "#F0F",

						vel: [0.375 * Math.cos(theta), 0.375 * Math.sin(theta)],
						last_tick: time,
						spawn_tick: time,
						par: this,
						tick(game, time)
						{
							let dt = (time - this.last_tick) / 1000;
							this.last_tick = time;
							this.pos[0] += this.vel[0] * dt;
							this.pos[1] += this.vel[1] * dt;
							let t = (time - this.spawn_tick) / 1000;
							if (t > 10 || this.par.last_stage != 1) return Math.hypot(this.pos[0] - 0.5, this.pos[1] - 0.5) <= Math.SQRT1_2 + this.size;
							if (this.pos[0] < 0)
							{
								this.pos[0] *= -1;
								this.vel[0] *= -1;
							}
							if (this.pos[0] > 1)
							{
								this.pos[0] = 2 - this.pos[0];
								this.vel[0] *= -1;
							}
							if (this.pos[1] < 0)
							{
								this.pos[1] *= -1;
								this.vel[1] *= -1;
							}
							if (this.pos[1] > 1)
							{
								this.pos[1] = 2 - this.pos[1];
								this.vel[1] *= -1;
							}
							return true;
						},
					};
					game.field.add(bullet);
				}
				break;
			case 3:
				if (time - this.s3_curtain_tick >= 500)
				{
					this.s3_curtain_tick = time;
					for (let i = 0; i < 9; i++)
					{
						let bullet = projectile_1(time, {
							enemy: true,
							pos: [Math.random(), 1],
							rot: [0, -1],
							sprite: precomp.bullet,
							speed: 0.125,
							size: 1 / 128,
							color: "#909",
						});
						game.field.add(bullet);
					}
				}
				if (time - this.s3_aim_tick >= 160)
				{
					this.s3_aim_tick = time;
					let player = game.field.entities.get(game.player_id);
					let pos = [0.4375 + Math.random() * 0.125, 0.6875 + Math.random() * 0.125]
					let rot = [player.pos[0] - pos[0], player.pos[1] - pos[1]];
					let d = Math.hypot(rot[0], rot[1]);
					if (d != 0)
					{
						let bullet = projectile_1(time, {
							enemy: true,
							pos,
							rot: [rot[0] / d, rot[1] / d],
							sprite: precomp.donut,
							speed: 0.25,
							size: 1 / 128,
							color: "#FF0",
						});
						game.field.add(bullet);
					}
				}
				break;
			case 5:
				if (time - this.s5_spawn_tick >= 500)
				{
					this.s5_spawn_tick = time;
					let xo = Math.random();
					let yo = Math.random();
					for (let i = 0; i < 12; i++)
					{
						let bullet1 = projectile_1(time, {
							enemy: true,
							pos: [(xo + i) / 12, 1],
							rot: [0, -1],
							sprite: precomp.bullet,
							speed: 0.125,
							size: 1 / 128,
							color: "#F00",
						});
						game.field.add(bullet1);
						let bullet2 = projectile_1(time, {
							enemy: true,
							pos: [1, (xo + i) / 12],
							rot: [-1, 0],
							sprite: precomp.bullet,
							speed: 0.125,
							size: 1 / 128,
							color: "#FFF",
						});
						game.field.add(bullet2);
					}
				}
				break;
			default:
				break;
			}
			return true;
		},
	};
}

function boss_fall(time)
{
	return {
		rot: [0, -1],
		pos: [0.5, 1],
		size: 1 / 4,
		enemy: false,
		hitbox: false,
		shootable: false,
		sprite: precomp.e_boss6,
		color: "#A5A",

		start_tick: time,
		tick(game, time)
		{
			let t = (time - this.start_tick) / 1000;
			this.pos[1] = 1 - 0.0625 * t*t;
			this.rot[0] = Math.sin(t)
			this.rot[1] = -Math.cos(t)
			game.smog_clear_time = time;
			return t < 5;
		}
	};
}

function winner(time)
{
	return {
		rot: [1, 0],
		pos: [-1, -1],
		size: 1 / 128,
		enemy: false,
		hitbox: false,
		shootable: false,
		sprite: precomp.hitbox,
		color: "#0000",
		tick(game, time)
		{
			game.win_time = time;
			return false;
		}
	};
}

function make_player(time, gameplay_state)
{
	return {
		rot: [1, 0],
		pos: [0.5, 0.0625],
		size: 1 / 128,
		enemy: false,
		hitbox: false,
		shootable: false,
		sprite: precomp.ship,
		color: "#555F",

		last_shoot: 0,
		shoot_dir: -5 / 128,
		power: 0,
		tick(game, time)
		{
			if (game.death_timer <= 0 && gameplay_state.shoot && time - this.last_shoot >= 100)
			{
				let focus = 1 - gameplay_state.focus * 2;
				this.last_shoot = time;
				switch (Math.floor(this.power / 100))
				{
				default:
				case 4:
				let power4 = projectile_1(time, {
					pos: [this.pos[0] - this.shoot_dir * 0.5, this.pos[1]],
					damage: 1,
					rot: [0, 1],
					color: "#C6C7",
				});
				game.field.add(power4, [game.player_bullets]);
				case 3:
				let power3 = game.shot_type == 0 ? projectile_1(time, {
					pos: [this.pos[0] + this.shoot_dir, this.pos[1]],
					damage: 0.5,
					rot: [this.shoot_dir * (3 + focus), 1],
					color: "#5A57",
				}) : projectile_2(time, {
					pos: [this.pos[0] + this.shoot_dir, this.pos[1] + 0.0625],
					damage: 0.375,
					rot: [this.shoot_dir * (4 + focus), 1],
					color: "#5A57",
					omega: Math.sign(this.shoot_dir) * focus * 4 * Math.PI,
				});
				game.field.add(power3, [game.player_bullets]);
				case 2:
				let power2 = game.shot_type == 0 ? projectile_1(time, {
					pos: [this.pos[0] - this.shoot_dir, this.pos[1]],
					damage: 0.5,
					rot: [-this.shoot_dir * (1 + focus), 1],
					color: "#AA57",
				}) : projectile_2(time, {
					pos: [this.pos[0] - this.shoot_dir, this.pos[1] + 0.0625],
					damage: 0.375,
					rot: [-this.shoot_dir * (2 + focus), 1],
					color: "#AA57",
					omega: -Math.sign(this.shoot_dir) * focus * 3 * Math.PI,
				});
				game.field.add(power2, [game.player_bullets]);
				case 1:
				let power1 = game.shot_type == 0 ? projectile_1(time, {
					pos: [this.pos[0], this.pos[1]],
					damage: 0.5,
					color: "#F557",
				}) : projectile_2(time, {
					pos: [this.pos[0], this.pos[1] + 0.0625],
					damage: 0.375,
					omega: -Math.sign(this.shoot_dir) * focus * 6 * Math.PI,
					major: 0.0625,
					color: "#F557",
				});
				game.field.add(power1, [game.player_bullets]);
				case 0:
				let power0 = game.shot_type == 0 ? projectile_1(time, {
					pos: [this.pos[0] + this.shoot_dir, this.pos[1]],
					rot: focus == 1 ? [0, 1] : [-this.shoot_dir * 2, 1],
					color: "#F007",
				}) : projectile_2(time, {
					pos: [this.pos[0] + this.shoot_dir, this.pos[1] + 0.0625],
					omega: Math.sign(this.shoot_dir) * focus * 4 * Math.PI,
					color: "#F007",
				});
				game.field.add(power0, [game.player_bullets]);
				}
				this.shoot_dir *= -1;
			}
			return true;
		},
	};
}

function make_enemy(time)
{
	let enemy_list = [
	5, (g, t) => sprayer(t, [
			0.5, 1.25,
			2, 0.5, 0.75, 0, -0.25, 0, -0.25,
			4, 0.75, 0.5, 0, -0.25, 0.25, 0,
			6, 1.25, 0.5, 0.25, 0, 0.25, 0
		], {
			cooldown: 2000,
			enemy: true,
			rot: [Math.cos(Math.PI / 8), Math.sin(Math.PI / 8)],
			smallp: 3,
			radp: 0.125,
		}, {
			sprite: precomp.bullet,
		}),
	10, (g, t) => sprayer(t, [
			0.5, 1.25,
			2, 0.5, 0.75, 0, -0.25, 0, -0.25,
			4, 0.25, 0.5, 0, -0.25, -0.25, 0,
			6, -0.25, 0.5, -0.25, 0, -0.25, 0
		], {
			cooldown: 2000,
			enemy: true,
			smallp: 3,
			radp: 0.125,
			rot: [Math.cos(Math.PI / 8), Math.sin(Math.PI / 8)],
		}, {
			sprite: precomp.bullet,
		}),
	15, (g, t) => aimer(t, [
			1.25, 0.875,
			5, -0.25, 0.875, -0.3, 0, -0.3, 0,
		], g.player_id, {
			cooldown: 200,
			enemy: true,
			hp: 1,
			smallp: 3,
			radp: 0.125,
		}, {
			sprite: precomp.bullet,
			speed: 0.375,
		}),
	16, (g, t) => aimer(t, [
			-0.25, 0.875,
			5, 1.25, 0.875, 0.3, 0, 0.3, 0,
		], g.player_id, {
			cooldown: 200,
			enemy: true,
			hp: 1,
			smallp: 3,
			radp: 0.125,
		}, {
			sprite: precomp.bullet,
			speed: 0.375,
		}),
	20, (g, t) => sprayer(t, [
			0.5, 1.25,
			2, 0.5, 0.75, 0, -0.25, 0, -0.25,
			4, 0.25, 0.5, 0, -0.25, -0.25, 0,
			6, -0.25, 0.5, -0.25, 0, -0.25, 0
		], {
			cooldown: 1000,
			enemy: true,
			hp: 10,
			smallp: 3,
			radp: 0.125,
			rot: [1, 0],
		}, {
			sprite: precomp.bullet,
		}),
	20.25, (g, t) => sprayer(t, [
			0.4, 1.25,
			2, 0.4, 0.75, 0, -0.25, 0, -0.25,
			4, 0.15, 0.5, 0, -0.25, -0.25, 0,
			6, -0.35, 0.5, -0.25, 0, -0.25, 0
		], {
			cooldown: 1000,
			enemy: true,
			hp: 10,
			smallp: 3,
			radp: 0.125,
			rot: [1, 0],
		}, {
			sprite: precomp.bullet,
		}),
	20.5, (g, t) => sprayer(t, [
			0.6, 1.25,
			2, 0.6, 0.75, 0, -0.25, 0, -0.25,
			4, 0.85, 0.5, 0, -0.25, 0.25, 0,
			6, 1.35, 0.5, 0.25, 0, 0.25, 0
		], {
			cooldown: 1000,
			enemy: true,
			hp: 10,
			smallp: 3,
			radp: 0.125,
			rot: [1, 0],
		}, {
			sprite: precomp.bullet,
		}),
	20.75, (g, t) => sprayer(t, [
			0.3, 1.25,
			2, 0.3, 0.75, 0, -0.25, 0, -0.25,
			4, 0.05, 0.5, 0, -0.25, -0.25, 0,
			6, -0.45, 0.5, -0.25, 0, -0.25, 0
		], {
			cooldown: 1000,
			enemy: true,
			hp: 10,
			smallp: 3,
			radp: 0.125,
			rot: [1, 0],
		}, {
			sprite: precomp.bullet,
		}),
	21, (g, t) => sprayer(t, [
			0.7, 1.25,
			2, 0.7, 0.75, 0, -0.25, 0, -0.25,
			4, 0.95, 0.5, 0, -0.25, 0.25, 0,
			6, 1.45, 0.5, 0.25, 0, 0.25, 0
		], {
			cooldown: 1000,
			enemy: true,
			hp: 10,
			smallp: 3,
			radp: 0.125,
			rot: [1, 0],
		}, {
			sprite: precomp.bullet,
		}),
	23, (g, t) => aimer(t, [
			-0.25, 0.875,
			2, 0.75, 0.875, 0.5, 0, 0.5, 0,
			3, 0.75, 0.75, 0.5, 0, -0.5, 0,
			5, -0.25, 0.75, -0.5, 0, -0.5, 0,
		], g.player_id, {
			cooldown: 200,
			enemy: true,
			hp: 3,
			smallp: 3,
			radp: 0.125,
		}, {
			sprite: precomp.bullet,
			speed: 0.375,
		}),
	23.25, (g, t) => aimer(t, [
			-0.25, 0.875,
			2, 0.75, 0.875, 0.5, 0, 0.5, 0,
			3, 0.75, 0.75, 0.5, 0, -0.5, 0,
			5, -0.25, 0.75, -0.5, 0, -0.5, 0,
		], g.player_id, {
			cooldown: 200,
			enemy: true,
			hp: 3,
			smallp: 3,
			radp: 0.125,
		}, {
			sprite: precomp.bullet,
			speed: 0.375,
		}),
	23.5, (g, t) => aimer(t, [
			-0.25, 0.875,
			2, 0.75, 0.875, 0.5, 0, 0.5, 0,
			3, 0.75, 0.75, 0.5, 0, -0.5, 0,
			5, -0.25, 0.75, -0.5, 0, -0.5, 0,
		], g.player_id, {
			cooldown: 200,
			enemy: true,
			hp: 3,
			smallp: 3,
			radp: 0.125,
		}, {
			sprite: precomp.bullet,
			speed: 0.375,
		}),
	23.75, (g, t) => aimer(t, [
			-0.25, 0.875,
			2, 0.75, 0.875, 0.5, 0, 0.5, 0,
			3, 0.75, 0.75, 0.5, 0, -0.5, 0,
			5, -0.25, 0.75, -0.5, 0, -0.5, 0,
		], g.player_id, {
			cooldown: 200,
			enemy: true,
			hp: 3,
			smallp: 3,
			radp: 0.125,
		}, {
			sprite: precomp.bullet,
			speed: 0.375,
		}),
	24, (g, t) => aimer(t, [
			-0.25, 0.875,
			2, 0.75, 0.875, 0.5, 0, 0.5, 0,
			3, 0.75, 0.75, 0.5, 0, -0.5, 0,
			5, -0.25, 0.75, -0.5, 0, -0.5, 0,
		], g.player_id, {
			cooldown: 200,
			enemy: true,
			hp: 3,
			smallp: 3,
			radp: 0.125,
		}, {
			sprite: precomp.bullet,
			speed: 0.375,
		}),
	30, (g, t) => random_sprayer(t, [
			0.5, 1.25,
			1, 0.5, 0.875, 0, -1, 0, 0,
			16, 0.5, 0.875, 0, 0, 0, 0,
			17, 0.5, 1.25, 0, 0, 0, 1,
		], {
			start_delay: 1,
			cooldown: 250,
			multiplier: 16,
			enemy: true,
			omega: Math.PI / 2,
			hp: 100,
			smallp: 7,
			bigp: 1,
			radp: 0.125,
		}, {
			sprite: precomp.bullet,
		}),
	48, (g, t) => random_sprayer(t, [
			0.75, 1.25,
			1, 0.75, 0.875, 0, -1, 0, 0,
			16, 0.75, 0.875, 0, 0, 0, 0,
			17, 0.75, 1.25, 0, 0, 0, 1,
		], {
			start_delay: 1,
			cooldown: 250,
			multiplier: 9,
			enemy: true,
			omega: Math.PI / 2,
			hp: 50,
			smallp: 7,
			bigp: 1,
			radp: 0.125,
		}, {
			sprite: precomp.bullet,
		}),
	48, (g, t) => random_sprayer(t, [
			0.25, 1.25,
			1, 0.25, 0.875, 0, -1, 0, 0,
			16, 0.25, 0.875, 0, 0, 0, 0,
			17, 0.25, 1.25, 0, 0, 0, 1,
		], {
			start_delay: 1,
			cooldown: 250,
			multiplier: 9,
			enemy: true,
			omega: Math.PI / 2,
			hp: 50,
			smallp: 7,
			bigp: 1,
			radp: 0.125,
		}, {
			sprite: precomp.bullet,
		}),
	70, (g, t) => uniform_sprayer(t, [
			0.25, 1.25,
			24, 0.25, -0.25, 0, -0.0625, 0, -0.0625,
		], {
			start_delay: 1.5,
			cooldown: 2000,
			multiplier: 48,
			enemy: true,
			omega: Math.PI / 2,
			hp: 20,
			smallp: 7,
			bigp: 1,
			radp: 0.125,
		}, {
			sprite: precomp.bullet,
			size: 1 / 128,
			rot_inc: Math.PI / 24,
		}),
	74, (g, t) => uniform_sprayer(t, [
			0.75, 1.25,
			24, 0.75, -0.25, 0, -0.0625, 0, -0.0625,
		], {
			start_delay: 1.5,
			cooldown: 2000,
			multiplier: 48,
			enemy: true,
			omega: Math.PI / 2,
			hp: 20,
			smallp: 7,
			bigp: 1,
			radp: 0.125,
		}, {
			sprite: precomp.bullet,
			size: 1 / 128,
			rot_inc: Math.PI / 24,
		}),
	78, (g, t) => uniform_sprayer(t, [
			0.25, 1.25,
			24, 0.25, -0.25, 0, -0.0625, 0, -0.0625,
		], {
			start_delay: 1.5,
			cooldown: 2000,
			multiplier: 48,
			enemy: true,
			omega: Math.PI / 2,
			hp: 20,
			smallp: 7,
			bigp: 1,
			radp: 0.125,
		}, {
			sprite: precomp.bullet,
			size: 1 / 128,
			rot_inc: Math.PI / 24,
		}),
	82, (g, t) => uniform_sprayer(t, [
			0.75, 1.25,
			24, 0.75, -0.25, 0, -0.0625, 0, -0.0625,
		], {
			start_delay: 1.5,
			cooldown: 2000,
			multiplier: 48,
			enemy: true,
			omega: Math.PI / 2,
			hp: 20,
			smallp: 7,
			bigp: 1,
			radp: 0.125,
		}, {
			sprite: precomp.bullet,
			size: 1 / 128,
			rot_inc: Math.PI / 24,
		}),
	86, (g, t) => uniform_sprayer(t, [
			0.25, 1.25,
			24, 0.25, -0.25, 0, -0.0625, 0, -0.0625,
		], {
			start_delay: 1.5,
			cooldown: 2000,
			multiplier: 48,
			enemy: true,
			omega: Math.PI / 2,
			hp: 20,
			smallp: 7,
			bigp: 1,
			radp: 0.125,
		}, {
			sprite: precomp.bullet,
			size: 1 / 128,
			rot_inc: Math.PI / 24,
		}),
	90, (g, t) => uniform_sprayer(t, [
			0.75, 1.25,
			24, 0.75, -0.25, 0, -0.0625, 0, -0.0625,
		], {
			start_delay: 1.5,
			cooldown: 2000,
			multiplier: 48,
			enemy: true,
			omega: Math.PI / 2,
			hp: 20,
			smallp: 7,
			bigp: 1,
			radp: 0.125,
		}, {
			sprite: precomp.bullet,
			size: 1 / 128,
			rot_inc: Math.PI / 24,
		}),
	94, (g, t) => uniform_sprayer(t, [
			0.5, 1.25,
			24, 0.5, -0.25, 0, -0.0625, 0, -0.0625,
		], {
			start_delay: 1.5,
			cooldown: 2000,
			multiplier: 48,
			enemy: true,
			omega: Math.PI / 2,
			hp: 20,
			smallp: 7,
			bigp: 1,
			radp: 0.125,
		}, {
			sprite: precomp.bullet,
			size: 1 / 128,
			rot_inc: Math.PI / 24,
		}),
	94, null,
	5, (g, t) => uniform_sprayer(t, [
			1.25, 0.875,
			1, 0.5, 0.75, -0.75, 0, 0, 0,
			19, 0.5, 0.75, 0, 0, 0, 0,
			20, -0.25, 0.875, 0, 0, -0.75, 0,
		], {
			start_delay: 0,
			cooldown: 150,
			multiplier: 15,
			enemy: true,
			omega: Math.PI,
			hp: 100,
			smallp: 5,
			bigp: 3,
			radp: 0.125,
		}, {
			sprite: precomp.bullet,
			size: 1 / 128,
			speed: 0.25,
		}),
	5, null,
	5, (g, t) => midboss(t),
	5, null,
	];
	for (let i = 0; i < 8; i++)
	{
		for (let j = 0; j < 3; j++)
			enemy_list.push(
			5 + i*2 + j/3, (g, t) => uniform_sprayer(t, [
				1.25, 0.75,
				15, -0.25, 0.75, -0.1, 0, -0.1, 0
			], {
				start_delay: -j/2,
				cooldown: 1500,
				multiplier: 2,
				rot: [-1 / Math.sqrt(5), -2 / Math.sqrt(5)],
				sprite: precomp.e_aimer,
				enemy: true,
				hp: 6,
				smallp: 2,
				radp: 0.125,
			}, {
				sprite: precomp.bullet,
				rot: [-1 / Math.sqrt(5), -2 / Math.sqrt(5)],
				rot_inc: Math.PI,
			})
			);
		for (let j = 0; j < 3; j++)
			enemy_list.push(
			6 + i*2 + j/3, (g, t) => uniform_sprayer(t, [
				-0.25, 0.75,
				15, 1.25, 0.75, 0.1, 0, 0.1, 0
			], {
				start_delay: -j/2,
				cooldown: 1500,
				multiplier: 2,
				rot: [1 / Math.sqrt(5), -2 / Math.sqrt(5)],
				sprite: precomp.e_aimer,
				enemy: true,
				hp: 6,
				smallp: 2,
				radp: 0.125,
			}, {
				sprite: precomp.bullet,
				rot: [1 / Math.sqrt(5), -2 / Math.sqrt(5)],
				rot_inc: Math.PI,
				speed: 0.1875,
			})
			);
	}
	for (let i = 0; i < 10; i++)
		enemy_list.push(
		35 + i/2, (g, t) => aimer(t, [
			0.125, -0.25,
			2, 0.3125, 0.875, 0, 1, 0.25, 0,
			4, 0.5, 0.625, 0.25, 0, 0, -0.125,
			6, -0.25, 0.5, 0, -0.125, -1, 0,
		], g.player_id, {
			cooldown: 500,
			enemy: true,
			hp: 2,
			smallp: 3,
			radp: 0.125,
		}, {
			speed: 0.25,
		}),
		35 + i/2, (g, t) => aimer(t, [
			0.875, -0.25,
			2, 0.6875, 0.875, 0, 1, -0.25, 0,
			4, 0.5, 0.625, -0.25, 0, 0, -0.125,
			6, 1.25, 0.5, 0, -0.125, 1, 0,
		], g.player_id, {
			cooldown: 500,
			enemy: true,
			hp: 2,
			smallp: 3,
			radp: 0.125,
		}, {
			speed: 0.25,
		})
		);
	for (let i = 0; i < 10; i++)
		enemy_list.push(
		48 + i/5, (g, t) => uniform_sprayer(t, [
			-0.5, 0.875,
			1, 0.5, 0.875, 1, 0, 1, 0,
			1.59, 0.875, 0.5, 1, 0, 0, -1,
			2.18, 0.5, 0.125, 0, -1, -1, 0,
			2.77, 0.125, 0.5, -1, 0, 0, 1,
			3.36, 0.5, 0.875, 0, 1, 1, 0,
			4.36, 1.5, 0.875, 1, 0, 1, 0,
		], {
			start_delay: i / 10,
			cooldown: 600,
			multiplier: 8,
			enemy: true,
			hp: 4,
			rot: [Math.cos(Math.PI / 8), Math.sin(Math.PI / 8)],
			bigp: 1,
			radp: 0.125,
		}, {
			sprite: precomp.bullet,
			size: 1 / 128,
			rot: [Math.cos(Math.PI / 8), Math.sin(Math.PI / 8)],
			rot_inc: Math.PI / 4,
		})
		);
	enemy_list.push(
	58, (g, t) => random_sprayer(t, [
			0.5, 1.25,
			1, 0.5, 0.875, 0, -1, 0, 0,
			31, 0.5, 0.875, 0, 0, 0, 0,
			32, 0.5, 1.25, 0, 0, 0, 1,
		], {
			start_delay: 1,
			cooldown: 250,
			multiplier: 9,
			enemy: true,
			omega: Math.PI / 2,
			hp: 70,
			smallp: 2,
			bigp: 3,
			radp: 0.125,
		}, {
			sprite: precomp.bullet,
			size: 1 / 128,
			color: "#A5A",
			max_speed: 0.125,
		}),
	58, (g, t) => uniform_sprayer(t, [
			0.5, 1.25,
			2, 0.5, 0.25, 0, -1, 0, 0,
			31, 0.5, 0.25, 0, 0, 0, 0,
			33, 0.5, 1.25, 0, 0, 0, 1,
		], {
			start_delay: 2,
			end_delay: 30,
			cooldown: 150,
			multiplier: 8,
			enemy: true,
			omega: -Math.PI / 2,
			hp: 70,
			rot: [Math.cos(Math.PI / 8), Math.sin(Math.PI / 8)],
			smallp: 2,
			bigp: 3,
			radp: 0.125,
		}, {
			sprite: precomp.bullet,
			speed: 0.5,
			size: 1 / 128,
			rot: [Math.cos(Math.PI / 8), Math.sin(Math.PI / 8)],
			rot_inc: Math.PI / 4 + 0.005,
		}),
	94, (g, t) => spiral_sprayer(t, [
			0.5, 1.25,
			1, 0.5, 0.75, 0, -1, 0, 0,
			16, 0.5, 0.75, 0, 0, 0, 0,
			17, 0.5, 1.25, 0, 0, 0, 1,
		], {
			start_delay: 1,
			end_delay: 16,
			cooldown: 500,
			multiplier: 24,
			enemy: true,
			omega: -Math.PI / 2,
			hp: 100,
			smallp: 2,
			bigp: 3,
			radp: 0.125,
		}, {
			speed: 0.25,
			omega: 0.2,
			rot_inc: Math.PI / 12 + 0.001,
		}),
	94, null,
	5, (g, t) => spiral_sprayer(t, [
			0.5, 1.25,
			1, 0.5, 0.75, 0, -1, 0, 0,
			26, 0.5, 0.75, 0, 0, 0, 0,
			27, 0.5, 1.25, 0, 0, 0, 1,
		], {
			start_delay: 1,
			end_delay: 26,
			cooldown: 500,
			multiplier: 24,
			enemy: true,
			omega: -Math.PI / 2,
			hp: 100,
			smallp: 2,
			bigp: 3,
			radp: 0.125,
		}, {
			speed: 0.1875,
			omega: 0.2,
			rot_inc: Math.PI / 12 + 0.001,
		}),
	5, (g, t) => spiral_sprayer(t, [
			0.5, 1.25,
			1, 0.5, 0.75, 0, -1, 0, 0,
			26, 0.5, 0.75, 0, 0, 0, 0,
			27, 0.5, 1.25, 0, 0, 0, 1,
		], {
			start_delay: 1,
			end_delay: 26,
			cooldown: 500,
			multiplier: 24,
			enemy: true,
			omega: Math.PI / 2,
			hp: 100,
			smallp: 2,
			bigp: 3,
			radp: 0.125,
		}, {
			speed: 0.1875,
			omega: -0.2,
			rot_inc: Math.PI / 12 - 0.001,
		}),
	30, (g, t) => spiral_sprayer(t, [
			0.25, 1.25,
			1, 0.25, 0.75, 0, -1, 0, 0,
			31, 0.25, 0.75, 0, 0, 0, 0,
			32, 0.25, 1.25, 0, 0, 0, 1,
		], {
			start_delay: 1,
			end_delay: 31,
			cooldown: 500,
			multiplier: 24,
			enemy: true,
			omega: -Math.PI / 2,
			hp: 100,
			smallp: 2,
			bigp: 3,
			radp: 0.125,
		}, {
			size: 1 / 128,
			omega: 0.2,
			rot_inc: Math.PI / 12 + 0.001,
		}),
	30, (g, t) => spiral_sprayer(t, [
			0.75, 1.25,
			1, 0.75, 0.75, 0, -1, 0, 0,
			31, 0.75, 0.75, 0, 0, 0, 0,
			32, 0.75, 1.25, 0, 0, 0, 1,
		], {
			start_delay: 1,
			end_delay: 31,
			cooldown: 500,
			multiplier: 24,
			enemy: true,
			omega: Math.PI / 2,
			hp: 100,
			smallp: 2,
			bigp: 3,
			radp: 0.125,
		}, {
			size: 1 / 128,
			omega: -0.2,
			rot_inc: Math.PI / 12 - 0.001,
		}),
	);
	for (let i = 0; i < 15; i++)
		enemy_list.push(
		65 + i/2, (g, t) => aimer(t, [
			-0.5, 0.875,
			2, 0.5, 0.875, 0.5, 0, 0.5, 0,
			3.18, 0.875, 0.5, 0.5, 0, 0, -0.5,
			4.36, 0.5, 0.125, 0, -0.5, -0.5, 0,
			5.54, 0.125, 0.5, -0.5, 0, 0, 0.5,
			6.72, 0.5, 0.875, 0, 0.5, 0.5, 0,
			8.72, 1.5, 0.875, 0.5, 0, 0.5, 0,
		], g.player_id, {
			cooldown: 250,
			enemy: true,
			hp: 10,
			bigp: 1,
			radp: 0.125,
		}, {
			speed: 0.25,
		}),
		);
	enemy_list.push(
		82, (g, t) => spiral_sprayer(t, [
			0.5, 1.25,
			1, 0.5, 0.75, 0, -1, 0, 0,
			31, 0.5, 0.75, 0, 0, 0, 0,
			32, 0.5, 1.25, 0, 0, 0, 1,
		], {
			start_delay: 1,
			end_delay: 31,
			cooldown: 500,
			multiplier: 24,
			enemy: true,
			omega: Math.PI,
			hp: 200,
			bigp: 6,
			oneup: 1,
			radp: 0.125,
		}, {
			size: 1 / 128,
			omega: -0.3,
		}),
		82, null,
		5, (g, t) => boss(t),
		5, null,
		0, (g, t) => boss_fall(t),
		5, (g, t) => winner(t),
	);
	let idx = 0;
	let skip = 0;
	return {
		rot: [1, 0],
		pos: [-1, -1],
		size: 1 / 4,
		enemy: false,
		hitbox: false,
		shootable: false,
		sprite: precomp.e_boss1,
		color: "#555",
		hp: 12000,

		start_tick: time - skip * 1000,
		waiting: false,
		waiting_entity: new Set,
		tick(game, time)
		{
			let t = (time - this.start_tick) / 1000;
			let last_id = null;
			while (!this.waiting && idx < enemy_list.length && t >= enemy_list[idx])
			{
				if (enemy_list[idx + 1] == null)
				{
					game.field.entities.get(last_id).ref.push(this.waiting_entity);
					this.waiting_entity.add(last_id);
					this.waiting = true;
				}
				else last_id = game.field.add(enemy_list[idx + 1](game, time), [game.enemies]);
				idx += 2;
			}
			if (this.waiting && this.waiting_entity.size == 0)
			{
				this.waiting = false;
				this.start_tick = time;
			}
			return true;
		},
	};
}
