/* global Raphael */

window.onload = function () {
	var r = Raphael("holder", 640, 480);
	var startAffinity = 1.0, 
		kCat = 0.3,
		endAffinity = 1.0,
		affinityRange = 50,
		segWidth = 50,
		freeEnergy = 70;
	function getTubePathString() {
		return "M100," + (100 - affinityRange*startAffinity) + 
		" h" + segWidth + " V" + kCat*affinityRange + " h" + segWidth + 
		" v" + (freeEnergy + 100 - affinityRange*endAffinity) + " h" + segWidth + "";
	}
	var easingx = document.getElementById("easingx"),
		runButton = document.getElementById("run"),
		blankets = r.set(),
		startDrag = null,
		p2 = r.path("m5,5 v100 a50,20 180 0,0 100,0 v-100").attr({stroke: "#666", opacity: 1.0, "stroke-width": 10, fill: "90-#00f:5-#eb2:100"}),
		p3 = p2.clone(),
		p = r.path(getTubePathString()).attr({stroke: "#0a0", opacity: 1.0, "stroke-width": 10, "stroke-linejoin": "round"}),
		len = p.getTotalLength(),
		e = r.ellipse(0, 0, 10, 5).attr({stroke: "none", fill: "#fff"}).onAnimation(function () {
			var t = this.attr("transform");
		});
		
	p3.attr({fill: "90-#00f:65-#eb2:100"});
	p3.transform("t240," + freeEnergy);
	p2.attr({fill: "#00f"});
	//interaction
	p.click(function () {
		//p.animate({stroke: Raphael.getColor()}, 1e3);
	});
	var blanket1 = r.rect(100, (95 - affinityRange*startAffinity), segWidth, 10).attr(
            {stroke: "none", fill: "#fff", opacity: 0.0}
     ).mouseover(function () {
		this.animate({opacity: 0.6}, 300);
	}).mouseout(function () {
		this.animate({opacity: 0.0}, 300);
	}).drag(function (dx, dy) {
		var start = this.startDrag;
		if (start) {
			var newY = Math.max(Math.min(start.y + dy, 95 - affinityRange*0), 95 - affinityRange);
			start && blanket1.attr({y: newY}); 
			startAffinity = (95 - (newY)) / affinityRange;
			p.attr({path: getTubePathString()});
		}
	}, function (x, y) {
		this.startDrag = {y: (95 - affinityRange*startAffinity), p: this};
	});

	var myP = p2;
	r.customAttributes.along = function (v) {
		var point = myP.getPointAtLength(v * len);
		var wobble = Math.sin(v*len / 10.0) * 0.3 + 1.0;
		return {
			transform: "t" + [point.x, point.y] + "r" + point.alpha + "S" + [1.0, wobble]
		};
	};
	e.attr({along: 0});

	function run() {
		e.animate({along: 1}, 3e3, function () {
			e.attr({along: 0});
			setTimeout(run);
			myP = myP === p ? p2 : p;
		});
	}
	run();


	// logo
	// HIDDEN
	var fade = function (id) {};
	var logo = r.set(
	//r.rect(13, 13, 116, 116, 30).attr({stroke: "none", fill: "#fff", transform: "r45", opacity: .2}),

	r.circle(71, 32, 19).attr({stroke: "none", fill: "#39f", opacity: .5}));
	logo.transform("t345,177");
	runButton.onclick = function () {
			var ex = easingx.value;
			var anim = Raphael.animation({
				"33%": {transform: "T345,177S1.2,0.8", easing: ex},
				"66%": {transform: "T345,177S0.8,1.2", easing: ex},
				"100%": {transform: "T345,177S1.0,1.0", easing: ex}
			}, 2000);
			logo.stop().animate(anim.repeat(Infinity));
	};
	//logo.hide();
	// logo end
};
