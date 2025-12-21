function make_path(x, y)
{
	let p = new Path2D();
	let m = true;
	for (let i = 0; i < x.length; i++)
		if (x[i] == null) m = true;
		else if (m) p.moveTo(x[i], y[i]), m = false;
		else p.lineTo(x[i], y[i]);
	p.closePath();
	return p;
}

let precomp = {
	ship: make_path(
		[0,2,4,5,6,6,4,4,-4,-4,-6,-6,-5,-4,-2],
		[8,1,1,4,1,-3,-3,-2,-2,-3,-3,1,4,1,1]
	),
	bullet: make_path(
		[2,1,0,-1.5,-1.5,0,1],
		[0,-3,-5,-5,5,5,3].map(e=>e/4)
	),
	/*
	arrowhead: make_path(
		[12,10,6,0,-12,0,6,9,10,8,6,0,-6,-8,-6,0,6,8,10,9,6,0,-12,0,6,10].map(e=>e/8),
		[0,-5,-10,-12,-12,-10,-8,-4,-1,0,-6,-8,-6,0,6,8,6,0,1,4,8,10,12,12,10,5].map(e=>e/8)
	),*/
	arrowhead: (() =>
	{
		let r = new Path2D;
		r.arc(0, 0, 1, 0, 2 * Math.PI);
		const a1 = Math.atan2(0.9, Math.sqrt(4.0741));
		const a2 = Math.atan2(Math.sqrt(4.8741), 0.1);
		const a3 = Math.atan2(Math.sqrt(4.8741), -0.1);
		r.moveTo(-0.7, 0.9 - Math.sqrt(4.8741));
		r.arc(-0.6, 0.9, 2.21, -a3, -a1);
		r.arc(-0.6, -0.9, 2.21, a1, a3);
		r.arc(-0.8, -0.9, 2.21, a2, a1, true);
		r.arc(-0.8, 0.9, 2.21, -a1, -a2, true);
		return r;
	})(),
	donut: (() =>
	{
		let r = new Path2D;
		r.arc(0, 0, 0.75, 0, 2 * Math.PI, true);
		r.arc(0, 0, 1.25, 0, 2 * Math.PI, false);
		return r;
	})(),
	p_arrow: make_path(
		[8,4,4,5,-4,-7,-7,-5,-7,-7,-4,5,4,4].map(e=>e/8),
		[0,-4,-2,-1,-1,-4,-2,0,2,4,1,1,2,4].map(e=>e/8)
	),
	p_curved: make_path(
		[6,6,5,5,0,-2,-6,-6,-3,-6,-5,-2,-2,-1,-1,0,4,1,1].map(e=>e/8),
		[-3,2,2,-1,4,2,2,1,1,-2,-3,0,-3,-3,1,2,-2,-2,-3].map(e=>e/8)
	),
	hitbox: (() =>
	{
		let p = new Path2D;
		p.arc(0, 0, 1, 0, 2 * Math.PI);
		return p;
	})(),
	power: make_path(
		[-3,3,3,-3,-3,null,-2,-2,2,2,-1,-1,-2,null,-1,-1,1,1,-1,null,-3].map(e=>e/8),
		[-3,-3,3,3,-3,null,-2,2,2,-1,-1,-2,-2,null,0,1,1,0,0,null,-3].map(e=>e/8)
	),
	oneup: make_path(
		[-3,-3,3,3,-3,null,-1,1,1,2,2,1,1,-1,-1,-2,-2,-1,-1,null,-3].map(e=>e/8),
		[-3,3,3,-3,-3,null,-2,-2,-1,-1,1,1,2,2,1,1,-1,-1,-2,null,-3].map(e=>e/8)
	),
	e_sprayer: (() =>
	{
		let p = new Path2D;
		for (let i = 0; i < 8; i++)
		{
			p.arc(0, 0, 1, Math.PI / 8 * (2 * i - 0.5), Math.PI / 8 * (2 * i + 0.5));
			p.arc(0, 0, 0.5, Math.PI / 8 * (2 * i + 0.5), Math.PI / 8 * (2 * i + 1.5));
		}
		return p;
	})(),
	e_aimer: make_path([-0.875, 1, -0.875, -0.25], [0.5, 0, -0.5, 0]),
	e_plane1: make_path(
		[4,2,2,3,2,2,3,2,1,1,0,-1,-1,0,1,1,2,3,2,2,3,2,2].map(e=>e/4),
		[0,1,2,3,4,5,6,7,7,1,1,2,-2,-1,-1,-7,-7,-6,-5,-4,-3,-2,-1].map(e=>e/8)
	),
	e_plane2: make_path(
		[4,2,2,3,2,2,1,1,0,-1,-1,0,1,1,2,2,3,2,2].map(e=>e/4),
		[0,1,2,3,4,7,7,1,1,2,-2,-1,-1,-7,-7,-4,-3,-2,-1].map(e=>e/8)
	),
	e_plane3: make_path(
		[4,2,2,1,1,0,-1,-1,0,1,1,2,2].map(e=>e/4),
		[0,1,7,7,1,1,2,-2,-1,-1,-7,-7,-1].map(e=>e/8)
	),
	e_spiral: make_path(
		[8,0,-6,0,4,0,-2,0,0,1,0,-3,0,5,0,-7,0].map(e=>e/8),
		[0,7,0,-5,0,3,0,-1,0,-1,-2,0,4,0,-6,0,8].map(e=>e/8)
	),
};

for (let i = 1; i <= 6; i++)
	precomp[`e_boss${i}`] = (() =>
	{
		let p = new Path2D;
		const S2_1 = Math.SQRT2 - 1;
		const S2_2 = Math.SQRT2 - 2;
		const OPEN_ANGLE = Math.PI * i / 12;
		p.moveTo(0, -S2_1);
		p.arc(-S2_1, -S2_1, S2_1, 0, Math.PI / 2, true);
		p.arc(-S2_1, S2_1, S2_1, -Math.PI / 2, 0, true);
		p.lineTo(-S2_2, S2_1);
		p.arc(-S2_2, 0, S2_1, Math.PI / 2, OPEN_ANGLE, true);
		p.lineTo(-S2_2, 0);
		p.lineTo(-S2_2 + S2_1 * Math.cos(OPEN_ANGLE), -S2_1 * Math.sin(OPEN_ANGLE));
		p.arc(-S2_2, 0, S2_1, -OPEN_ANGLE, -Math.PI / 2, true);
		return p;
	})();
