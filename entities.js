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
					game.field.add(bullet, re_rect(bullet));
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
				game.field.add(bullet, re_rect(bullet));
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
					game.field.add(bullet, re_rect(bullet));
				}
			}
			return t < dead;
		},
	};
}

function uniform_sprayer(time, path, opt = {}, opt2 = {})
{
	let st = time + (opt.start_delay ? opt.start_delay : 0) * 1000;
	let cool = opt.cooldown ? opt.cooldown : 1000;
	let mult = opt.multiplier ? opt.multiplier : 1;
	let spd = opt2.speed ? opt2.speed : 0.125;
	let omega = opt.omega ? opt.omega : 0;
	let rot = opt.rot ? Math.atan2(opt.rot[1], opt.rot[0]) : Math.PI / 2;
	let rotb = opt2.rot ? Math.atan2(opt.rot[1], opt.rot[0]) : -Math.PI / 2;
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
			if (time - this.spawn_tick >= cool)
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
					game.field.add(bullet, re_rect(bullet));
				}
			}
			return t < dead;
		},
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
					damage: 0.875,
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
	100, (g, t) => uniform_sprayer(t, [
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
	];
	let idx = 0;
	let skip = 0;
	while (enemy_list[idx] < skip) idx += 2;
	return {
		rot: [1, 0],
		pos: [-1, -1],
		size: 1 / 4,
		enemy: false,
		hitbox: false,
		shootable: false,
		sprite: precomp.boss,
		color: "#555",
		hp: 12000,

		start_tick: time - skip * 1000,
		tick(game, time)
		{
			let t = (time - this.start_tick) / 1000;
			while (idx < enemy_list.length && t >= enemy_list[idx])
			{
				game.field.add(enemy_list[idx + 1](game, time), [game.enemies]);
				idx += 2;
			}
			return true;
		},
	};
}
