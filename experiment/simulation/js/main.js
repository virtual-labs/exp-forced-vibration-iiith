'use strict';

document.addEventListener('DOMContentLoaded', function(){

	const playButton = document.getElementById('play');
	const pauseButton = document.getElementById('pause');
	const restartButton = document.getElementById('restart');

	pauseButton.addEventListener('click', function() { window.clearTimeout(tmHandle); });
	playButton.addEventListener('click', function() {  window.clearTimeout(tmHandle); tmHandle = setTimeout(draw, 1000 / fps); });
	restartButton.addEventListener('click', function() {restart();});

	function init()
	{
		rod = [[startx, endy - height], [endx, endy - height], [endx, endy], [startx, endy]];

		ground = [
			[startx - margin, starty + height + 40],
			[startx - margin, starty + height],
			[endx + margin, starty + height],
			[endx + margin, starty + height + 40],
		];

		radius = mass / 5000;
		dirn = 1;
	}

	function restart() 
	{ 
		window.clearTimeout(tmHandle); 
		init();
		main();
		tmHandle = window.setTimeout(draw, 1000 / fps); 
	}

	const sliders = ["mass", "stiff", "wbar", "etta"];
	sliders.forEach(function(elem, ind) {
		const slider = document.getElementById(elem);
		const output = document.getElementById("demo_" + elem);
		output.innerHTML = slider.value; // Display the default slider value

		slider.oninput = function() {
			output.innerHTML = this.value;

			if(ind === 0)
			{
				mass = Number(document.getElementById(elem).value);
			}

			else if(ind === 1)
			{
				stiff = Number(document.getElementById(elem).value);
			}

			else if(ind === 2)
			{
				wbar = Number(document.getElementById(elem).value);
			}

			else
			{
				etta = Number(document.getElementById(elem).value) / 100;
			}

			restart();
		};
	});

	function logic(obj)
	{
		const Wn = Math.sqrt(obj.stiffness / obj.mass), Tn = 2 * Math.PI / Wn;
		const beta = obj.wbar / Wn;
		const u_max = (obj.P0 / obj.stiffness)*(1 / (Math.sqrt(Math.pow(1 - Math.pow(beta, 2), 2) + Math.pow((2 * obj.etta * beta), 2))));
		return u_max;
	}

	function drawGraph(Xaxis, Yaxis, title, id) {
		try {
			// render the plot using plotly
			const trace1 = {
				x: Xaxis,
				y: Yaxis,
				type: 'scatter'
			};

			const layout = {
				title: {
					text: title,
					font: {
						family: 'Courier New, monospace',
						size: 24
					},
				},
				width: 450,
				height: 450,
				xaxis: {
					title: {
						text: 'Time',
						font: {
							family: 'Courier New, monospace',
							size: 18,
							color: '#000000'
						}
					},
				},
				yaxis: {
					title: {
						text: 'Displacement',
						font: {
							family: 'Courier New, monospace',
							size: 18,
							color: '#000000'
						}
					}
				}
			};

			const config = {responsive: true};
			const data = [trace1];
			Plotly.newPlot(id, data, layout, config);
		}

		catch (err) {
			console.error(err);
			alert(err);
		}
	}

	const canvas = document.getElementById("main");
	canvas.width = 1200;
	canvas.height = 600;
	canvas.style = "border:3px solid";
	const ctx = canvas.getContext("2d");

	const fill = "#A9A9A9", border = "black", lineWidth = 1.5, fps = 15;
	const P0 = 10, scale = 1000000, height = 180, startx = 594, endx = 600, margin = 150, starty = 220, endy = starty + height, change = 2; 

	// Input Parameters 
	let mass = 100000, stiff = 3000000, wbar = 5, etta = 0.05, u_max;
	let dirn, rod, ground, radius; 
	init();

	function updatePos(ent, dirn, change, flag=0)
	{
		ent.forEach(function(val, index){
			if (flag === 1 && index < 2)
			{
				ent[index][0] -= dirn*change;
			}
			else{
				ent[index][0] += dirn*change;
			}
		});
	}

	function drawGround(ctx, ground)
	{
		ctx.save();
		ctx.fillStyle = "pink";
		ctx.beginPath();
		ctx.moveTo(ground[0][0], ground[0][1]);

		ground.forEach(function(g, index){
			const next = (index + 1) % ground.length;
			ctx.lineTo(ground[next][0], ground[next][1]);
		});
		ctx.closePath();
		ctx.fill();
		ctx.stroke();
		ctx.restore();
	}

	function draw()
	{
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		ctx.fillStyle = fill;
		ctx.lineWidth = lineWidth;
		ctx.lineCap = "round";
		ctx.lineJoin = "round";

		updatePos(ground, dirn, change);
		drawGround(ctx, ground);

		updatePos(rod, dirn, change, 1);
		if (rod[0][0] <= startx - u_max || rod[1][0] >= endx + u_max)
		{
			dirn *= -1;
		}

		ctx.beginPath();
		ctx.moveTo(rod[0][0], rod[0][1]);
		ctx.lineTo(rod[1][0], rod[1][1]);
		ctx.lineTo(rod[2][0], rod[2][1]);
		ctx.lineTo(rod[3][0], rod[3][1]);
		ctx.lineTo(rod[0][0], rod[0][1]);

		ctx.closePath();
		ctx.fill();
		ctx.stroke();

		ctx.beginPath();
		ctx.arc((rod[0][0] + rod[1][0]) / 2, rod[0][1] - radius / 2, radius, 0, 2 * Math.PI);
		ctx.closePath();
		ctx.fill();
		ctx.stroke();

		tmHandle = window.setTimeout(draw, 1000 / fps);
	}

	function main()
	{
		let obj = {
			'stiffness': stiff,
			'mass': mass,
			'P0' : P0,
			'etta': etta,
			'wbar' : wbar	
		};
		u_max = logic(obj) * scale;
		console.log(u_max)
		// const plotTitle = 'Time Period = ' + Tn.toFixed(3).toString();
		// drawGraph(time, obj.disp, plotTitle, 'disB' + (index + 1).toString() + 'Plot');
	}

	main();
	let tmHandle = window.setTimeout(draw, 1000 / fps);
})
