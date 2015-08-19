// custom javascript

$(function() {
	// createForceClusters();
	// createAudioVisualizerCharge();
	// createAudioVisualizer();
	svgTsvBarChart();
});

function basicBarChart() {
	var data = [4, 8, 15, 16, 23, 42];

	var x = d3.scale.linear()
		.domain([0, d3.max(data)])
		.range([0, 420]);

	d3.select("#chart")
		.selectAll("div")
			.data(data)
		.enter().append("div")
			.style("width", function(d) { return x(d) + "px"; })
			.style("background-color", "steelblue")
			.style("text-align", "right")
			.style("padding", "3px")
			.style("margin", "1px")
			.style("color", "white")
			.text(function(d) { return d; });
}

function svgBarChart() {
	var data = [4, 8, 15, 16, 23, 42];

	var width = 420,
		barHeight = 20;

	var x = d3.scale.linear()
		.domain([0, d3.max(data)])
		.range([0, width]);

	var chart = d3.select(".chart")
		.attr("width", width)
		.attr("height", barHeight * data.length);

	var bar = chart.selectAll("g")
			.data(data)
		.enter().append("g")
			.attr("transform", function(d, i) { return "translate(0," + i * barHeight + ")"; });

	bar.append("rect")
		.attr("width", x)
		.attr("height", barHeight - 1);

	bar.append("text")
		.attr("x", function(d) { return x(d) - 3})
		.attr("y", barHeight / 2)
		.attr("dy", ".35em")
		.text(function(d) { return d; });
}

function svgTsvBarChart() {

	var width = 420,
		barHeight = 20;

	var x = d3.scale.linear()
		.range([0, width]);

	var chart = d3.select(".chart")
		.attr("width", width);

	d3.tsv("static/data.tsv", type, function(error, data) {
		console.log(data);
		x.domain([0, d3.max(data, function(d) { return d.value; })]);

		chart.attr("height", barHeight * data.length);

		var bar = chart.selectAll("g")
			.data(data)
		.enter().append("g")
			.attr("transform", function(d, i) { return "translate(0," + i * barHeight + ")"; });

		bar.append("rect")
			.attr("width", function(d) { return x(d.value); })
			.attr("height", barHeight - 1);;

		bar.append("text")
			.attr("x", function(d) { return x(d.value) - 3; })
			.attr("y", barHeight / 2)
			.attr("dy", ".35em")
			.text(function(d) { return d.name; });
	});
	
	function type(d) {
		d.value = +d.value; // coerce to number
		return d;
	}

}

function createForceClusters() {

	var width = 960,
	height = 700;

	var fill = d3.scale.category10();

	var nodes = d3.range(100).map(function(i) {
		return {index: i};
	});

	console.log(nodes);

	var force = d3.layout.force()
		.nodes(nodes)
		.size([width, height])
		.on("tick", tick)
		.start();

	var svg = d3.select("#chart").append("svg")
		.attr("class", "svg-chart")
		.attr("width", width)
		.attr("height", height);

	var node = svg.selectAll(".node")
			.data(nodes)
		.enter().append("circle")
			.attr("class", "node")
			.attr("cx", function(d) { return d.x; })
			.attr("cy", function(d) { return d.y; })
			.attr("r", 8)
			.style("fill", function(d, i) { return fill(i & 3); })
			.style("stroke", function(d, i) { return d3.rgb(fill(i & 3)).darker(2); })
			.call(force.drag)
			.on("mousedown", function() { d3.event.stopPropagation(); });

	svg.style("opacity", 1e-6)
	.transition()
	.duration(1000)
	.style("opacity", 1);

	d3.select("body")
	.on("mousedown", mousedown);

	function tick(e) {
		
		var k = 6 * e.alpha;
		nodes.forEach(function(o, i) {
			o.y += i & 1 ? k : -k;
			o.x += i & 2 ? k : -k;
		});

		node.attr("cx", function(d) { return d.x; })
		.attr("cy", function(d) { return d.y; });
	}

	function mousedown() {
		nodes.forEach(function(o, i) {
			o.x += (Math.random() - .5) * 40;
			o.y += (Math.random() - .5) * 40;
		});
		force.resume();
	}
}

function createAudioVisualizer() {

	var audioCtx = new (window.AudioContext || window.webkitAudioContext)();
	var audioElement = document.getElementById('audioElement');
	var audioSrc = audioCtx.createMediaElementSource(audioElement);
	var analyser = audioCtx.createAnalyser();

  // Bind our analyser to the media element source.
  audioSrc.connect(analyser);
  audioSrc.connect(audioCtx.destination);

 //  	var color = d3.scale.category20();
	// var scale = d3.scale.linear();

	var color = d3.scale.linear()
		.domain(d3.range(7))
		.range(["red", "orange", "yellow", "green", "blue", "indigo", "violet"]);


  //var frequencyData = new Uint8Array(analyser.frequencyBinCount);
  var frequencyData = new Uint8Array(200);

  var svgHeight = '300';
  var svgWidth = '700';
  var barPadding = '1';

  function createSvg(parent, height, width) {
  	return d3.select(parent).append('svg').attr('height', height).attr('width', width);
  }

  var svg = createSvg('#chart', svgHeight, svgWidth);

  // Create our initial D3 chart.
  svg.selectAll('rect')
  .data(frequencyData)
  .enter()
  .append('rect')
  .attr('x', function (d, i) {
  	return i * (svgWidth / frequencyData.length);
  })
  .attr('width', svgWidth / frequencyData.length - barPadding);

  // Continuously loop and update chart with frequency data.
  function renderChart() {
  	requestAnimationFrame(renderChart);

     // Copy frequency data to frequencyData array.
     analyser.getByteFrequencyData(frequencyData);

     // Update d3 chart with new data.
     svg.selectAll('rect')
     .data(frequencyData)
     .attr('y', function(d) {
     	return svgHeight - d;
     })
     .attr('height', function(d) {
     	return d;
     })
     .attr('fill', function(d) {
     	return 'rgb(0,' + d + ',0)';
     });

 }

  // Run the loop
  renderChart();

}

function createAudioVisualizerCharge() {

	var audioCtxt = new (window.AudioContext || window.webkitAudioContext)();
	var audioElement = document.getElementById('audioElement');
	var audioSrc = audioCtxt.createMediaElementSource(audioElement);
	var analyser = audioCtxt.createAnalyser();

	audioSrc.connect(analyser);
	audioSrc.connect(audioCtxt.destination);

	var charge = d3.scale.linear()
		.domain(d3.range(255))
		.range([-30, 30])
	
	var frequencyData = new Uint8Array(200);

	var nodes = d3.range(10).map(function(i) {
		console.log("node index: " + i);
		return {index: i};
	});

	console.log(nodes);

	var svgHeight = '700';
	var svgWidth = '1200';

	var svg = createSvg('#chart', svgHeight, svgWidth);

	function renderChart() {
		requestAnimationFrame(renderChart);

		analyser.getByteFrequencyData(frequencyData);

		// console.log("reading frequency data... ");

		svg.selectAll('node')
			.data(frequencyData)
			.charge(function(d) { 
				console.log(d);
				return -d; 
			})
			.attr('fill', function(d) { return 'rgb(0,0,' + d + ')'; });
	}




	var force = d3.layout.force()
		.nodes(nodes)
		.size([svgWidth, svgHeight])
		.start();

	var svg = d3.select("#chart").append("svg")
		.attr("class", "svg-chart")
		.attr("width", svgWidth)
		.attr("height", svgHeight);

	var node = svg.selectAll(".node")
			.data(nodes)
		.enter().append("circle")
			.attr("class", "node")
		.attr("cx", function(d) { return d.x; })
		.attr("cy", function(d) { return d.y; })
		.attr("r", 8)
		.call(force.drag);
		// .on("mousedown", function() { d3.event.stopPropagation(); });

	svg.style("opacity", 1e-6)
		.transition()
		.duration(1000)
		.style("opacity", 1);


}



function createSvg(parent, height, width) {
	var svg = d3.select(parent).append('svg')
	.attr('height', height)
	.attr('width', width);

	return svg;
}



