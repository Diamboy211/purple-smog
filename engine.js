let re_rect = e => { return { x: e.pos[0] - e.size, y: e.pos[1] - e.size, w: e.size * 2, h: e.size * 2 }; };

function hashgrid_new()
{
	const DIV = 16;
	let glob_id = 0;
	let s = {
		grid: Array.from(new Array(DIV * DIV), _ => new Set),
		entities: new Map,
		add(entity, ref = [])
		{
			entity.ref = ref;
			for (let i = 0; i < ref.length; i++) ref[i].add(glob_id);
			let x = entity.x = entity.pos[0] - entity.size;
			let y = entity.y = entity.pos[1] - entity.size;
			let w = entity.w = entity.size * 2;
			let h = entity.h = entity.size * 2;
			let x2 = x + w;
			let y2 = y + h;
			let sx = Math.max(Math.floor(x * DIV), 0);
			let ex = Math.min(Math.ceil(x2 * DIV), DIV);
			let sy = Math.max(Math.floor(y * DIV), 0);
			let ey = Math.min(Math.ceil(y2 * DIV), DIV);
			for (let y = sy; y < ey; y++)
				for (let x = sx; x < ex; x++)
					s.grid[y * DIV + x].add(glob_id);
			s.entities.set(glob_id, entity);
			return glob_id++;
		},
		remove(id)
		{
			let entity = s.entities.get(id);
			if (entity == undefined) return null;
			let x = entity.x, y = entity.y, w = entity.w, h = entity.h;
			let x2 = x + w;
			let y2 = y + h;
			let sx = Math.max(Math.floor(x * DIV), 0);
			let ex = Math.min(Math.ceil(x2 * DIV), DIV);
			let sy = Math.max(Math.floor(y * DIV), 0);
			let ey = Math.min(Math.ceil(y2 * DIV), DIV);
			for (let y = sy; y < ey; y++)
				for (let x = sx; x < ex; x++)
					s.grid[y * DIV + x].delete(id);
			for (let i = 0; i < entity.ref.length; i++) entity.ref[i].delete(id);
			s.entities.delete(id);
			return entity;
		},
		move(id)
		{
			let entity = s.entities.get(id);
			if (entity == undefined) return;
			let x = entity.x, y = entity.y, w = entity.w, h = entity.h;
			let x2 = x + w;
			let y2 = y + h;
			let sx = Math.max(Math.floor(x * DIV), 0);
			let ex = Math.min(Math.ceil(x2 * DIV), DIV);
			let sy = Math.max(Math.floor(y * DIV), 0);
			let ey = Math.min(Math.ceil(y2 * DIV), DIV);
			let prev_idx = new Set;
			for (let y = sy; y < ey; y++)
				for (let x = sx; x < ex; x++)
					prev_idx.add(y * DIV + x);
			x = entity.x = entity.pos[0] - entity.size;
			y = entity.y = entity.pos[1] - entity.size;
			w = entity.w = entity.size * 2;
			h = entity.h = entity.size * 2;
			x2 = x + w;
			y2 = y + h;
			sx = Math.max(Math.floor(x * DIV), 0);
			ex = Math.min(Math.ceil(x2 * DIV), DIV);
			sy = Math.max(Math.floor(y * DIV), 0);
			ey = Math.min(Math.ceil(y2 * DIV), DIV);
			let next_idx = new Set;
			for (let y = sy; y < ey; y++)
				for (let x = sx; x < ex; x++)
					next_idx.add(y * DIV + x);
			let del_idx = prev_idx.difference(next_idx);
			for (let i of del_idx) s.grid[i].delete(id);
			let add_idx = next_idx.difference(prev_idx);
			for (let i of add_idx) s.grid[i].add(id);
		},
		get(rect)
		{
			let { x, y, w, h } = rect;
			let x2 = x + w;
			let y2 = y + h;
			let sx = Math.max(Math.floor(x * DIV), 0);
			let ex = Math.min(Math.ceil(x2 * DIV), DIV);
			let sy = Math.max(Math.floor(y * DIV), 0);
			let ey = Math.min(Math.ceil(y2 * DIV), DIV);
			let entities = new Set;
			for (let i = sy; i < ey; i++)
				for (let j = sx; j < ex; j++)
					for (let id of s.grid[i * DIV + j])
					{
						let { x: x3, y: y3, w, h } = s.entities.get(id);
						let x4 = x3 + w;
						let y4 = y3 + h;
						if (x < x4 && x2 > x3 && y < y4 && y2 > y3)
							entities.add(id);
					}
			return entities;
		},
		get_coarse(rect)
		{
			let { x, y, w, h } = rect;
			let x2 = x + w;
			let y2 = y + h;
			let sx = Math.max(Math.floor(x * DIV), 0);
			let ex = Math.min(Math.ceil(x2 * DIV), DIV);
			let sy = Math.max(Math.floor(y * DIV), 0);
			let ey = Math.min(Math.ceil(y2 * DIV), DIV);
			let entities = new Set;
			for (let i = sy; i < ey; i++)
				for (let j = sx; j < ex; j++)
					entities = entities.union(s.grid[i * DIV + j]);
			return entities;
		},
	};
	return s;
}
