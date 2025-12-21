var ev_handlers = {
	mousedown: null,
	mouseup: null,
	mousemove: null,
	keydown: null,
	keyup: null,
};

function ev_handlers_update(new_handlers)
{
	for (let i of ["mousedown", "mouseup", "mousemove", "keydown", "keyup"])
		ev_handlers[i] = new_handlers[i] ? new_handlers[i] : null;
}

function fill_text(ctx, str, x, y, s)
{
	ctx.save();
	ctx.transform(s, 0, 0, -s, x, y);
	ctx.fillText(str, 0, 0);
	ctx.restore();
}

function title_bg(time)
{
	ctx.fillStyle = "#000";
	ctx.fillRect(0, 0, 1, 1);
	ctx.fillStyle = "#555";
	let theta = time / 1000;
	ctx.save();
	ctx.transform(Math.cos(theta) / 16, Math.sin(theta) / 16, -Math.sin(theta) / 16, Math.cos(theta) / 16, 0.5, 0.5);
	ctx.fill(precomp.ship);
	ctx.restore();
}

let title_state = {
	select: -1,
	clicked: false,
};

function title(game, time)
{
	ev_handlers_update({
		mousemove(e)
		{
			let { x, y, width, height } = canvas.getBoundingClientRect();
			let u = (e.clientX - x) / width;
			let v = (height - e.clientY + y - 1) / height;
			if (u < 0 || u >= 1) title_state.select = -1;
			else if (v >= 0.375 && v < 0.5) title_state.select = 1;
			else if (v >= 0.5 && v < 0.625) title_state.select = 0;
			else title_state.select = -1;
		},
		mouseup(e)
		{
			title_state.clicked = true;
		},
		keydown(e)
		{
			switch (e.code)
			{
			case "ArrowDown":
			case "KeyJ":
			case "KeyS":
				title_state.select++;
				break;
			case "ArrowUp":
			case "KeyK":
			case "KeyW":
				title_state.select--;
				break;
			case "Enter":
			case "Space":
				title_state.clicked = true;
				return;
			default:
				return;
			}
			if (title_state.select < 0) title_state.select = 0;
			if (title_state.select > 1) title_state.select = 1;
		},
	});
	title_bg(time);
	ctx.fillStyle = "#00A";
	if (title_state.select == 0) ctx.fillRect(0, 0.5, 1, 0.125);
	if (title_state.select == 1) ctx.fillRect(0, 0.375, 1, 0.125);

	ctx.fillStyle = "#FFF";
	ctx.font = "1px monospace";
	ctx.textAlign = "center";
	ctx.textBaseline = "middle";
	fill_text(ctx, "start", 0.5, 0.5 + 1/16, 1/16);
	fill_text(ctx, "credits", 0.5, 0.5 - 1/16, 1/16);

	if (title_state.clicked)
	{
		title_state.clicked = false;
		if (title_state.select == 0)
		{
			title_state.select = -1;
			char_select_state.transition = false;
			char_select_state.clicked = false;
			return char_select;
		}
		if (title_state.select == 1)
		{
			title_state.select = -1;
			credits_state.enter_time = time;
			return credits;
		}
	}
	return title;
}

let credits_state = {
	clicked: false,
	enter_time: 0,
};

function credits(game, time)
{
	ev_handlers_update({
		mouseup(e)
		{
			credits_state.clicked = true;
		},
		keydown(e)
		{
			credits_state.clicked = true;
		},
	});
	title_bg(time);
	const credit_lines = [
		"director: diamboy",
		"producer: diamboy",
		"game design: diamboy",
		"level design: diamboy",
		"programming: diamboy",
		"game engine: diamboy",
		"sprite artist: diamboy",
		"background artist: diamboy",
		"animator: diamboy",
		"tester: diamboy",
		"thank you for playing!",
		"click or press any key",
	];
	ctx.font = "1px monospace";
	ctx.textAlign = "center";
	ctx.textBaseline = "middle";
	let t = (time - credits_state.enter_time) / 1000;
	let phase = Math.floor(t);
	let subphase = t - phase;

	if (phase == 0)
	{
		ctx.fillStyle = `rgba(255, 255, 255, ${subphase})`;
		fill_text(ctx, credit_lines[0], 0.5, 0.5, 1/16);
	}
	else if (phase >= credit_lines.length * 2 - 1)
	{
		ctx.fillStyle = "#FFF";
		fill_text(ctx, credit_lines.at(-1), 0.5, 0.5, 1/16);
	}
	else if (phase % 2 == 1)
	{
		ctx.fillStyle = "#FFF";
		fill_text(ctx, credit_lines[(phase - 1) / 2], 0.5, 0.5, 1/16);
	}
	else
	{
		ctx.fillStyle = "#FFF";
		let i = phase / 2 - 1;
		fill_text(ctx, credit_lines[i], 0.5, 0.5 + subphase, 1/16);
		fill_text(ctx, credit_lines[i+1], 0.5, -0.5 + subphase, 1/16);
	}

	if (credits_state.clicked)
	{
		credits_state.clicked = false;
		return title;
	}
	return credits;
}

let char_select_state = {
	select: -1,
	clicked: false,
	transition_start: 0,
	transition: false,
};

function char_select(game, time)
{
	if (!char_select_state.transition) ev_handlers_update({
		mousemove(e)
		{
			let { x, y, width, height } = canvas.getBoundingClientRect();
			let u = (e.clientX - x) / width;
			let v = (height - e.clientY + y - 1) / height;
			if (u < 0 || u >= 1 || v < 0 || v >= 1) char_select_state.select = -1;
			else if (v < 0.25) char_select_state.select = 2;
			else if (u >= 0.5) char_select_state.select = 1;
			else if (u < 0.5) char_select_state.select = 0;
			else char_select_state.select = -1;
		},
		mouseup(e)
		{
			char_select_state.clicked = true;
		},
		keydown(e)
		{
			switch (e.code)
			{
			case "ArrowDown":
			case "KeyJ":
			case "KeyS":
				char_select_state.select = 2;
				break;
			case "ArrowUp":
			case "KeyK":
			case "KeyW":
			case "ArrowLeft":
			case "KeyH":
			case "KeyA":
				char_select_state.select = 0;
				break;
			case "ArrowRight":
			case "KeyL":
			case "KeyD":
				char_select_state.select = 1;
				break;
			case "Enter":
			case "Space":
				char_select_state.clicked = true;
				return;
			default:
				return;
			}
			if (char_select_state.select < 0) char_select_state.select = 0;
			if (char_select_state.select > 2) char_select_state.select = 2;
		},
	});
	else ev_handlers_update({});
	title_bg(time);
	ctx.fillStyle = "#00A";
	if (char_select_state.select == 0) ctx.fillRect(0, 0.25, 0.5, 0.75);
	if (char_select_state.select == 1) ctx.fillRect(0.5, 0.25, 0.5, 0.75);
	if (char_select_state.select == 2) ctx.fillRect(0, 0, 1, 0.25);
	ctx.font = "1px monospace";
	ctx.textAlign = "center";
	ctx.textBaseline = "middle";
	ctx.fillStyle = "#FFF";
	fill_text(ctx, "straight shot", 0.25, 0.875, 1/16);
	fill_text(ctx, "helical shot", 0.75, 0.875, 1/16);
	fill_text(ctx, "title screen", 0.5, 0.125, 1/16);
	ctx.fillStyle = "#0F0";
	fill_text(ctx, "high damage", 0.25, 0.625, 1/16);
	fill_text(ctx, "high spread", 0.75, 0.375, 1/16);
	ctx.fillStyle = "#F00";
	fill_text(ctx, "low spread", 0.25, 0.375, 1/16);
	fill_text(ctx, "low damage", 0.75, 0.625, 1/16);

	if (char_select_state.transition)
	{
		let t = (time - char_select_state.transition_start) / 1000;
		ctx.fillStyle = "#777";
		ctx.fillRect(0, 1 - t, 1, t);
		if (t >= 1)
		{
			gameplay_state.transition_left = 1;
			gameplay_state.left = false;
			gameplay_state.right = false;
			gameplay_state.up = false;
			gameplay_state.down = false;
			gameplay_state.focus = false;
			gameplay_state.shoot = false;
			gameplay_state.pausing = false;
			gameplay_state.real_time = time;
			gameplay_state.slow_time = time;
			game_init(game, time);
			return gameplay;
		}
		return char_select;
	}

	if (char_select_state.clicked)
	{
		char_select_state.clicked = false;
		if (char_select_state.select == 0 || char_select_state.select == 1)
		{
			game.shot_type = char_select_state.select;
			char_select_state.select = -1;
			char_select_state.transition_start = time;
			char_select_state.transition = true;
			return char_select;
		}
		if (char_select_state.select == 2)
		{
			char_select_state.select = -1;
			return title;
		}
	}
	return char_select;
}

let gameplay_state = {
	up: false,
	down: false,
	left: false,
	right: false,
	focus: false,
	shoot: false,
	pausing: false,
	real_time: 0,
	slow_time: 0,
	last_dt: 16,
	transition_left: 1,
}

function game_death_rad(game)
{
	if (game.death_timer >= 1 || game.death_timer <= 0) return -1;
	let t = 1 - game.death_timer;
	let r = 0.0078125 + t*t*t * 1.9931875;
	return r;
}

let bg_state = new Set;

function draw_bg(ctx, dt, clr)
{
	for (let e of bg_state)
	{
		e.y -= e.s * dt;
		if (e.y + e.h < 0) bg_state.delete(e);
	}
	while (bg_state.size < 32)
	{
		let x1 = Math.random() * 2 - 0.5;
		let x2 = Math.random() * 2 - 0.5;
		let y1 = Math.random() * 2 + 1;
		let y2 = Math.random() * 2 + 1;
		let s = Math.random() * 0.0625 + 0.0625;
		if (x1 > x2) [x1, x2] = [x2, x1];
		if (y1 > y2) [y1, y2] = [y2, y1];
		if (x1 == x2 || y1 == y2 || x2 <= 0 || x1 >= 1) continue;
		bg_state.add({ x: x1, y: y1, w: x2-x1, h: y2-y1, s });
	}
	ctx.fillStyle = "#000";
	ctx.fillRect(0, 0, 1, 1);
	ctx.fillStyle = "#221122".concat(Math.floor(Math.max(0, Math.min(34 - clr / 100, 34))).toString(16).padStart(2, '0'));
	for (let e of bg_state)
	{
		if (e.y > 1) continue;
		ctx.beginPath();
		ctx.ellipse(e.x + e.w * 0.5, e.y + e.h * 0.5, e.w * 0.5, e.h * 0.5, 0, 0, 2 * Math.PI);
		ctx.fill();
	}
}

function gameplay(game, time)
{
	ev_handlers_update({
		keydown(e)
		{
			switch (e.code)
			{
			case "ArrowUp":
			case "KeyK":
			case "KeyW":
				gameplay_state.up = true;
				break;
			case "ArrowDown":
			case "KeyJ":
			case "KeyS":
				gameplay_state.down = true;
				break;
			case "ArrowLeft":
			case "KeyH":
			case "KeyA":
				gameplay_state.left = true;
				break;
			case "ArrowRight":
			case "KeyL":
			case "KeyD":
				gameplay_state.right = true;
				break;
			case "ShiftLeft":
			case "ShiftRight":
				gameplay_state.focus = true;
				break;
			case "KeyZ":
			case "Space":
				gameplay_state.shoot = true;
				break;
			case "Escape":
				gameplay_state.pausing = !gameplay_state.pausing;
				break;
			default:
				break;
			}
		},
		keyup(e)
		{
			switch (e.code)
			{
			case "ArrowUp":
			case "KeyK":
			case "KeyW":
				gameplay_state.up = false;
				break;
			case "ArrowDown":
			case "KeyJ":
			case "KeyS":
				gameplay_state.down = false;
				break;
			case "ArrowLeft":
			case "KeyH":
			case "KeyA":
				gameplay_state.left = false;
				break;
			case "ArrowRight":
			case "KeyL":
			case "KeyD":
				gameplay_state.right = false;
				break;
			case "ShiftLeft":
			case "ShiftRight":
				gameplay_state.focus = false;
				break;
			case "KeyZ":
			case "Space":
				gameplay_state.shoot = false;
				break;
			default:
				break;
			}
		},
	});

	let real_dt = time - gameplay_state.real_time;
	let dt = Math.min(real_dt, 50);
	if (!gameplay_state.pausing) gameplay_state.slow_time += dt;
	else dt = 0;
	gameplay_state.real_time = time;
	time = gameplay_state.slow_time;
	dt /= 1000;
	game.last_tick = time;
	gameplay_state.transition_left = Math.max(0, gameplay_state.transition_left - dt);

	let player = game.field.entities.get(game.player_id);
	if (game.death_timer <= 0)
	{
		let vx = gameplay_state.right - gameplay_state.left;
		let vy = gameplay_state.up - gameplay_state.down;
		let vm = Math.hypot(vx, vy);
		if (vm > 0) vx /= vm, vy /= vm;
		let vel = gameplay_state.focus ? 0.25 : 0.5;
		player.pos[0] += vx * vel * dt;
		player.pos[1] += vy * vel * dt;
		player.pos[0] = Math.max(player.size, Math.min(1 - player.size, player.pos[0]));
		player.pos[1] = Math.max(player.size, Math.min(1 - player.size, player.pos[1]));
		player.hitbox = gameplay_state.focus;
	}
	if (game.death_timer > 0) player.color = "#0000";
	else if (game.invincible_timer > 0) player.color = "#555".concat("0123456789ABCDEF"[(Math.random() * 16) | 0]);
	else player.color = "#555F";
	draw_bg(ctx, dt, time - game.smog_clear_time);
	let death_fx_r = game_death_rad(game);
	if (death_fx_r >= 0)
	{
		ctx.fillStyle = "#F00";
		ctx.beginPath();
		ctx.arc(game.death_center[0], game.death_center[1], death_fx_r, 0, 2 * Math.PI);
		ctx.arc(game.death_center[0], game.death_center[1], death_fx_r - 1/128, 2 * Math.PI, 0, true);
		ctx.closePath();
		ctx.fill();
	}

	for (let [ id, e ] of game.field.entities)
	{
		if (!e.tick(game, time))
		{
			game.field.remove(id);
			continue;
		}
		if (e.enemy && e.shootable && e.hp <= 0)
		{
			let pspawner = power_spawner(time, { origin: e.pos, big: e.bigp, small: e.smallp, oneup: e.oneup, radius: e.radp, });
			game.field.add(pspawner);
			game.field.remove(id);
			continue;
		}
		if (e.enemy && !e.shootable)
		{
			if (Math.hypot(game.death_center[0] - e.pos[0], game.death_center[1] - e.pos[1]) < death_fx_r)
			{
				game.field.remove(id);
				continue;
			}
		}
		game.field.move(id);
	}
	for (let id of game.player_bullets)
	{
		let bullet = game.field.entities.get(id);
		let c = game.field.get_coarse(bullet);
		for (let id2 of c)
		{
			if (!game.enemies.has(id2)) continue;
			let e = game.field.entities.get(id2);
			if (Math.hypot(e.pos[0] - bullet.pos[0], e.pos[1] - bullet.pos[1]) < e.size + bullet.size)
			{
				e.hp -= bullet.damage;
				game.field.remove(id);
				break;
			}
		}
	}
	let prev_transform = ctx.getTransform();
	for (let [ id, e ] of game.field.entities)
	{
		ctx.fillStyle = e.color;
		ctx.transform(e.rot[0] * e.size, e.rot[1] * e.size, -e.rot[1] * e.size, e.rot[0] * e.size, e.pos[0], e.pos[1]);
		ctx.beginPath();
		ctx.fill(e.sprite);
		if (e.hitbox)
		{
			ctx.fillStyle = `#FFF${e.color.at(-1)}`;
			ctx.fill(precomp.hitbox);
		}
		ctx.setTransform(prev_transform);
	}
	if (game.death_timer <= 0)
	{
		for (let id of game.field.get_coarse(player))
		{
			let e = game.field.entities.get(id);
			if (game.invincible_timer <= 0 && e.enemy
				&& Math.hypot(e.pos[0] - player.pos[0], e.pos[1] - player.pos[1]) < e.size + player.size)
			{
				game.death_timer = 1;
				game.invincible_timer = 3;
				game.lives--;
				game.death_center[0] = player.pos[0];
				game.death_center[1] = player.pos[1];
				player.pos[0] = 0.5;
				player.pos[1] = 0.0625;

				let drop_p = Math.max(10, player.power - 50);
				player.power = 0;
				let pspawner = power_spawner(time, { origin: game.death_center, big: Math.floor(drop_p / 5), small: drop_p % 5, radius: 0.125, velocity: [0, 0.125] });
				game.field.add(pspawner);
			}
			if (!e.enemy && e.shootable
				&& Math.hypot(e.pos[0] - player.pos[0], e.pos[1] - player.pos[1]) < e.size + player.size)
			{
				if (e.hp == 0) player.power = Math.min(500, player.power + e.power);
				else game.lives++;
				game.field.remove(id);
			}
		}
	}
	game.death_timer = Math.max(0, game.death_timer - dt);
	game.invincible_timer = Math.max(0, game.invincible_timer - dt);
	ctx.font = "1px monospace";
	ctx.textAlign = "left";
	ctx.textBaseline = "top";
	ctx.fillStyle = "#F5F7";
	fill_text(ctx, `lives: ${Math.max(game.lives, 0)}`, 0, 1, 0.0625);
	ctx.textAlign = "right";
	ctx.fillStyle = "#F557";
	fill_text(ctx, `power: ${(player.power / 100).toFixed(2)}`, 1, 1, 0.0625);
	ctx.textBaseline = "bottom";
	ctx.fillStyle = "#7777";
	gameplay_state.last_dt = gameplay_state.last_dt * 0.9375 + real_dt * 0.0625;
	fill_text(ctx, `${(1000 / gameplay_state.last_dt).toFixed(2)} fps`, 1, 0, 0.0625);

	if (gameplay_state.transition_left > 0)
	{
		ctx.fillStyle = "#777";
		ctx.fillRect(0, 0, 1, gameplay_state.transition_left);
	}

	if (gameplay_state.pausing)
	{
		ctx.fillStyle = "#000A";
		ctx.fillRect(0, 0, 1, 1);
		ctx.fillStyle = "#FFF";
		ctx.textBaseline = "middle";
		ctx.textAlign = "center";
		fill_text(ctx, "pause", 0.5, 0.5, 0.125);
	}

	if (game.lives < 0 && game.death_timer <= 0)
	{
		game_over_state.cont = false;
		return game_over;
	}
	if (game.win_time <= time)
	{
		win_screen_state.cont = false;
		win_screen_state.rot = [0.03125, 0];
		return win_screen;
	}
	return gameplay;
}

let game_over_state = {
};

function game_over(game, time)
{
	ev_handlers_update({
		keyup(e)
		{
			game_over_state.cont = true;
		},
		mouseup(e)
		{
			game_over_state.cont = true;
		},
	});

	ctx.fillStyle = "#525";
	ctx.fillRect(0, 0, 1, 1);
	ctx.font = "1px monospace";
	ctx.textAlign = "center";
	ctx.textBaseline = "middle";
	ctx.fillStyle = "#FFF";
	fill_text(ctx, "game over", 0.5, 0.5625, 0.0625);
	fill_text(ctx, "press any key", 0.5, 0.4375, 0.0625);

	if (game_over_state.cont) return title;
	return game_over;
}

let win_screen_state = {
	rot: [0.03125, 0],
};

function win_screen(game, time)
{
	ev_handlers_update({
		keyup(e)
		{
			win_screen_state.cont = true;
		},
		mouseup(e)
		{
			win_screen_state.cont = true;
		},
	});

	ctx.fillStyle = "#050";
	ctx.fillRect(0, 0, 1, 1);

	const mx = Math.cos(Math.PI * (Math.sqrt(5) - 1)) * 1.0004;
	const my = Math.sin(Math.PI * (Math.sqrt(5) - 1)) * 1.0004;
	win_screen_state.rot = [
		win_screen_state.rot[0] * mx - win_screen_state.rot[1] * my,
		win_screen_state.rot[0] * my + win_screen_state.rot[1] * mx
	];

	ctx.fillStyle = "#555";
	ctx.save();
	ctx.transform(win_screen_state.rot[0], -win_screen_state.rot[1], win_screen_state.rot[1], win_screen_state.rot[0], 0.5, 0.5);
	ctx.fill(precomp.ship);
	ctx.restore();
	ctx.font = "1px monospace";
	ctx.textAlign = "center";
	ctx.textBaseline = "middle";
	ctx.fillStyle = "#FFF";
	fill_text(ctx, "you win!!!", 0.5, 0.5625, 0.0625);
	fill_text(ctx, "press any key", 0.5, 0.4375, 0.0625);

	if (win_screen_state.cont) return title;
	return win_screen;
}

function game_init(game, time)
{
	game.last_tick = time;
	game.start = time;
	game.field = hashgrid_new();
	game.lives = 3;
	game.death_timer = 0;
	game.invincible_timer = 0;
	game.smog_clear_time = Infinity;
	game.win_time = Infinity;
	game.death_center = [0.5, 0.0625];
	game.player_bullets = new Set;
	game.enemies = new Set;

	let player = make_player(time, gameplay_state);
	game.player_id = game.field.add(player);

	let enemy = make_enemy(time);
	game.field.add(enemy, [game.enemies]);
}

let game = {
	last_tick: 0,
};

let canvas = document.getElementById("canvas");
let ctx = canvas.getContext("2d");
let next_func = title;

for (let i of Object.keys(ev_handlers))
	document.addEventListener(i, e => ev_handlers[i] && ev_handlers[i](e));

function loop(time)
{
	let size = Math.min(document.body.clientWidth, document.body.clientHeight);
	canvas.width = size;
	canvas.height = size;
	ctx.setTransform(size, 0, 0, -size, 0, size);
	next_func = next_func(game, time);
	requestAnimationFrame(loop);
}

requestAnimationFrame(loop);
