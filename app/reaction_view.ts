/// <reference path="../typings/tsd.d.ts"/>
///<reference path='substance_view.ts' />

// utility class for drag targets that manipulate a ReactionView's tube
class DragTarget extends SubstanceView {
     startDrag : any;
     constructor(public esComplex: ESComplex, public epComplex: ESComplex, 
                public setResult: (r:number) => void,
                public getResult: () => number,
                public getOffsetY: () => number,
                public seg : number,
                public reaction_view : ReactionView,
                origin: Point, paper: RaphaelPaper) {
         super(origin, paper);
         var that = this;
         var tube_width = ReactionView.tubeWidthScale * this.esComplex.enzyme.concentration;
         var half_tube_width = tube_width * 0.5;
         this.p[0] = paper.rect(seg * ReactionView.segWidth, this.getStartY(), ReactionView.segWidth, tube_width);

         // share an origin with ReactionView, so we share the same coords. 
         this.p[0].transform("T" + this.origin.x + "," + this.origin.y);
         this.p[0].attr(
             { stroke: "none", fill: "#fff", opacity: 0.0 }
         );
         this.p[0].mouseover(function() {
             var tube_width = ReactionView.tubeWidthScale * that.esComplex.enzyme.concentration;
             that.p[0].attr({ height: tube_width, y: that.getStartY() });
             that.reaction_view.p[0].animate({stroke:ReactionView.moveColor}, 300);
             //this.animate({ opacity: 0.6 }, 300);
         });
         this.p[0].mouseout(function() {
             that.reaction_view.p[0].animate({stroke:ReactionView.baseColor}, 300);
             //this.animate({ opacity: 0.0 }, 300);
         });
         this.p[0].drag(
             function(dx: number, dy: number): {} {
                 var tube_width = ReactionView.tubeWidthScale * this.esComplex.enzyme.concentration;
                 var half_tube_width = tube_width * 0.5;
                 var start = this.startDrag;
                 if (start) {
                     var newY = Math.max(Math.min(start.y + dy - this.getOffsetY(), -half_tube_width), -half_tube_width - ReactionView.affinityRange);
                     start && this.p[0].attr({ y: (newY + this.getOffsetY()) });
                     this.setResult((-half_tube_width - newY) / ReactionView.affinityRange);
                     reaction_view.update();
                 }
                 return {};
             }, 
             function(x: number, y: number) {
                 this.startDrag = { y: this.getStartY() };
                 return {};
             }, 
             function(event: any) { this.startDrag = null; return {}; }, 
             this, this, this
        );

         // fade out drag targets. 
         //this.p[0].animate({ opacity: 0.0 }, 1500);
     }
     
     getStartY(): number {
         var tube_width = ReactionView.tubeWidthScale * this.esComplex.enzyme.concentration;
         var half_tube_width = tube_width * 0.5;
         return (-half_tube_width + this.getOffsetY() - ReactionView.affinityRange * this.getResult());
     }
}

// utility class for drag targets that manipulate a ReactionView's tube
class DragTargetHandle extends SubstanceView implements UpdateInterface {
     startDrag : any;
     constructor(public esComplex: ESComplex,  
                public setResult: (r:number) => void,
                public getResult: () => number,
                public getOffsetY: () => number,
                public reaction_view : ReactionView,
                origin: Point, paper: RaphaelPaper) {
         super(origin, paper);
         var that = this;
         var tube_width = ReactionView.tubeWidthScale * this.esComplex.enzyme.concentration;
         var half_tube_width = tube_width * 0.5;
         //this.p[0] = paper.path("m-5,0 v15 a10,10 320 1,0 10,0 v-15 z");
         // thermometer bulb hanging off the tube:
         if (0) {
             var r = 7;
             this.p[0] = paper.path("m-" + (r / 2) + ",0 v" + (r * 1.5) + " a" + r + "," + r + " 320 1,0 " + r + ",0 v-" + (r * 1.5) + " z");
             this.p[0].attr(
                 { stroke: "none", fill: "#5f5", opacity: 1.0 }
             );
         } else {
             // center area rect, behind the tube, transparent. 
             var r = ReactionView.segWidth;
             this.p[0] = paper.path("m-" + (r / 2) + ",0 v" + (r * 0.25) + " a" + (r / 2) + "," + (r / 2) + " 180 1,0 " + r + ",0 v-" + (r * 0.25) + " z");
             this.p[0].attr(
                 { stroke: "none", fill: "#5f5", opacity: 0.0 }
             );
             this.p[0].toBack();
         }
         // set transform
         this.update();
         // notify us if enzyme concentration changes, or esComplex.reactRate
         this.esComplex.enzyme.addSubscriber(this);
         this.esComplex.addSubscriber(this);
         
         this.p[0].mouseover(function() {
             this.animate({ opacity: 0.2 }, 300);
             that.reaction_view.p[0].animate({stroke:ReactionView.moveColor}, 300);
         });
         this.p[0].mouseout(function() {
             this.animate({ opacity: 0.0 }, 300);
             that.reaction_view.p[0].animate({stroke:ReactionView.baseColor}, 300);
         });
         this.p[0].drag(
             function(dx: number, dy: number): {} {
                 var start = this.startDrag;
                 if (start) {
                     // TODO magic number - 5 is min tube width of 10. 
                     var newY = Math.min(Math.max(start.y + dy - this.getOffsetY(), 5), ReactionView.reactRange);
                     this.setResult(newY);
                     this.p[0].transform("T" + (this.origin.x + 1.5 * ReactionView.segWidth) + "," + (this.origin.y + this.getStartY()));
                     reaction_view.update();
                 }
                 return {};
             }, 
             function(x: number, y: number) {
                 this.startDrag = { y: this.getStartY() };
                 return {};
             }, 
             function(event: any) { this.startDrag = null; return {}; }, 
             this, this, this
        );

     }
     
     getStartY(): number {
         var half_tube_width = this.getResult();
         return (half_tube_width + this.getOffsetY() );
     }

    // change our transform based on enzyme concentration.     
     update() {
         // share an origin with ReactionView, so we share the same coords. 
         this.p[0].transform("T" + (this.origin.x + 1.5 * ReactionView.segWidth) + "," + (this.origin.y + this.getStartY()));
     }
}

// View of a reaction is a tube that shows concentration, energy barrier, affinities, etc.  
class ReactionView extends SubstanceView implements UpdateInterface {
    //startAffinity = 1.0;
    kCat = 0.3;
    endAffinity = 1.0;
    draggers: DragTarget[] = new Array(0);
    handles: DragTargetHandle[] = new Array(0);
    static tubeWidthScale = 1;
    static affinityRange = 50;
    static reactRange = 20;
    static segWidth = 50;
    static reactScale = 200;
    static baseColor = "#0a0";
    static moveColor = "#0f0";
    //freeEnergy = 70;
    constructor(public esComplex: ESComplex, public epComplex: ESComplex, 
                origin: Point, paper: RaphaelPaper) {
        super(origin, paper);
        var tube_width = ReactionView.tubeWidthScale * this.esComplex.enzyme.concentration;
        this.p[0] = paper.path(this.getTubePathString()).attr({
            stroke: "#0a0", opacity: 1.0, 
            "stroke-width": tube_width, 
            "stroke-linejoin": "round"});
        this.offset.x = 3*ReactionView.segWidth;
        this.offset.y = this.esComplex.freeEnergyDelta;
        this.p[0].transform("T" + this.origin.x +"," + this.origin.y);
        
        // make sure we get notified if the ESComplex is changed another way
        esComplex.enzyme.addSubscriber(this);
        
        // drag targets, sub-class
        var setResult = [(r:number) => { this.esComplex.bindRate = r; },
                         (r:number) => { this.esComplex.setReactRate( r / ReactionView.reactScale); },
                         (r:number) => { this.epComplex.bindRate = r; } ];
        var getResult = [() : number => { return this.esComplex.bindRate; }, 
                         () : number => { return this.esComplex.reactRate * ReactionView.reactScale; }, 
                         () : number => { return this.epComplex.bindRate; } ];
        var getOffsetY = [() : number => { return 0; //-ReactionView.affinityRange * this.esComplex.bindRate; 
            }, 
                         () : number => { return -ReactionView.affinityRange; // -ReactionView.affinityRange * ( 1.0 + this.esComplex.reactRate * ReactionView.reactScale); 
                             }, 
                         () : number => { return this.esComplex.freeEnergyDelta; //this.esComplex.freeEnergyDelta - ReactionView.affinityRange * this.epComplex.bindRate; 
                             } ];
        for (var i = 0; i < 3; i++) {
            var blanket1 = new DragTarget(esComplex, epComplex, setResult[i], getResult[i], getOffsetY[i], i, this, this.origin, this.paper);
            this.draggers.push(blanket1);
        }
        var handle1 = new DragTargetHandle(esComplex, 
                (r:number) => { 
                    this.esComplex.enzyme.setConcentration( 2*r/ReactionView.tubeWidthScale); 
                },
                () : number => { 
                    var half_tube_width = 0.5 * ReactionView.tubeWidthScale * this.esComplex.enzyme.concentration;
                    return half_tube_width;
                }, 
                () : number => { 
                    return -ReactionView.affinityRange*(1.0 + this.esComplex.reactRate * ReactionView.reactScale);
                },
                this, this.origin, this.paper);
        this.handles.push(handle1);
        
        // label the enzyme for this tube
        this.p.push(paper.text(ReactionView.segWidth, -2 * ReactionView.affinityRange - ReactionView.reactRange - 5, this.esComplex.enzyme.name).attr({ font: "16px Helvetica", opacity: 1.0, "text-anchor": "start", fill: "#7f7" }));
        this.p[1].transform("T" + this.origin.x + "," + this.origin.y);
        this.p[1].node.setAttribute("class", "nohighlight");
    }
    getTubePathString() {
        // Get values from ESComplex
	   var startAffinity = this.esComplex.bindRate, 
		kCat = this.esComplex.reactRate * ReactionView.reactScale,
		endAffinity = this.epComplex.bindRate,
		ar = ReactionView.affinityRange,
		sw = ReactionView.segWidth,
		freeEnergy = this.esComplex.freeEnergyDelta;
		return "m0," + (-ar*startAffinity) + 
		" h" + sw + " v" + (ar*startAffinity -ar *(1.0 + kCat)) + " h" + sw + 
		" v" + ( (1.0 + kCat)*ar +freeEnergy - ar*endAffinity) + " h" + sw + "";
	}
    getTubeStart(p:Point) : void {
        p.x = 0;
        p.y = -ReactionView.affinityRange*this.esComplex.bindRate;
    }
    getTubeEnd(p:Point) : void {
        p.x = this.offset.x;
        p.y = -ReactionView.affinityRange*this.epComplex.bindRate + this.esComplex.freeEnergyDelta;
    }
    // update everything that can change when something is dragged. 
    update() : void {
        var tube_width = ReactionView.tubeWidthScale * this.esComplex.enzyme.concentration;
        this.p[0].attr({ "stroke-width": tube_width, 
                          path: this.getTubePathString()  });
    }
}