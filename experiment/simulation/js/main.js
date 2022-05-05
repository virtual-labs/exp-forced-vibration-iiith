'use strict';

document.addEventListener('DOMContentLoaded', function(){

	const playButton = document.getElementById('play');
	const pauseButton = document.getElementById('pause');
	const restartButton = document.getElementById('restart');

	pauseButton.addEventListener('click', function() { window.clearTimeout(tmHandle); });
	playButton.addEventListener('click', function() { window.clearTimeout(tmHandle); tmHandle = setTimeout(draw, 1000 / fps); });
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

	function drawGraph(Xaxis, Yaxis, id, Xlabel, color) {
		try {
			// render the plot using plotly
			const trace1 = {
				x: Xaxis,
				y: Yaxis,
				type: 'scatter',
				mode: 'lines+markers',
				marker: {
					color: color
				}
			};

			const layout = {
				width: 450,
				height: 450,
				xaxis: {
					title: {
						text: Xlabel,
						font: {
							family: 'Courier New, monospace',
							size: 18,
							color: '#000000'
						}
					},
				},
				yaxis: {
					title: {
						text: 'Maximum Displacement',
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
	const ctx = canvas.getContext("2d");

	const fill = "#A9A9A9", border = "black", lineWidth = 1.5, fps = 15;
	const P0 = 10000000, height = 180, startx = 594, endx = 600, margin = 150, starty = 220, endy = starty + height, change = 1; 

	// Input Parameters 
	let mass = 100000, stiff = 30000000, wbar = 5, etta = 0.05, u_max;
	let dirn, rod, ground, radius; 
	init();

	function updatePos(ent, dirn, change, flag=0)
	{
		ent.forEach(function(val, index){
			if (flag === 1 && index < 2)
			{
				ent[index][0] -= dirn * change;
			}
			else{
				ent[index][0] += dirn * change;
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
		let ratio = [], max_disp = [], color = [];
		const Wn = Math.sqrt(stiff / mass), Tn = 2 * Math.PI / Wn;

		for(let beta = 0; beta <= 1; beta += 0.01)
		{
			beta = parseFloat(beta.toFixed(2));
			ratio.push(beta);
			max_disp.push((P0 / stiff) * (1 / (Math.sqrt(Math.pow(1 - Math.pow(beta, 2), 2) + Math.pow((2 * etta * beta), 2)))));

			if(etta === 0)
			{
				max_disp[max_disp.length - 1] = (P0 / stiff); 
			}

			if(beta === parseFloat((wbar / Wn).toFixed(2)))
			{
				u_max = max_disp[max_disp.length - 1];
				color.push("red");
			}
			else
			{
				color.push("blue");
			}
		}

		drawGraph(ratio, max_disp, 'freqGraph', 'Frequency Ratio', color);

		let time = [];
		max_disp = [];
		color = [];
		for(let period = 0.1; period <= 4; period += 0.1)
		{
			time.push(period);
			const omega = 2 * Math.PI / period, beta = wbar / omega;
			max_disp.push((P0 / stiff) * (1 / (Math.sqrt(Math.pow(1 - Math.pow(beta, 2), 2) + Math.pow((2 * etta * beta), 2)))));

			if(etta === 0)
			{
				max_disp[max_disp.length - 1] = (P0 / stiff); 
			}

			if(period === parseFloat(Tn.toFixed(1)))
			{
				color.push("red");
			}
			else
			{
				color.push("blue");
			}
		}

		drawGraph(time, max_disp, 'timeGraph', 'Time Period', color);
	}

	main();
	let tmHandle = window.setTimeout(draw, 1000 / fps);
})
