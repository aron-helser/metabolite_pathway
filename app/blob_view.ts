/// <reference path="../typings/tsd.d.ts"/>
/// <reference path='substance_view.ts' />

// animation states
enum AnimState {
    Tank, StartTube, Tube, EndTube
}

// Blob illustrates that substrates are moving, but don't represent
// specific values in the reaction
class BlobView extends SubstanceView {
    
    public point = {"x" : 25 + Math.random() * 50, "y" : -(25 + Math.random() * 50), "alpha": 0.0};
    public lastPoint = {"x" : 25 + Math.random() * 50, "y" : -(25 + Math.random() * 50), "alpha": 0.0};
    //public size: { width: number, height: number };
    public wobPerSec = 2;
    public animState = AnimState.Tank;
    public wobbleOffset = 0;
    // check for state change
    public lastCheck = 0;
    static checkInverval = 1.0; 
    private currT = 1.0;
    public tubeView : ReactionView;

    constructor(public tankView : SubstrateView, origin: Point, public currStage: number, public paper: RaphaelPaper) {
        super(origin, paper);
        this.p[0] = paper.ellipse(0, 0, 5, 4).attr({stroke: "none", fill: "#fff"});
        this.wobbleOffset = Math.random();
    }
    
    draw( time: number) {
        var dt = time - this.lastCheck;
        // make size scale vary by 0.3 about 1.0. 
		var wobble = Math.sin((time + this.wobbleOffset) * this.wobPerSec * (Math.PI * 2)) * 0.3 + 1.0;
		var wobble2 = Math.sin((time + this.wobbleOffset) * 1.17 * this.wobPerSec * (Math.PI * 2)) * 0.2 + 1.0;
        if (this.animState === AnimState.Tank) {
            // move randomly about the tank. 
            if (this.currT >= 1.0 && dt > BlobView.checkInverval) {
                this.lastCheck = time;
                if (Math.random() < 0.3) {
                    this.currT = 0.0;
                    // calc new point
                    this.lastPoint.x = this.point.x;
                    this.lastPoint.y = this.point.y;
                    this.point.x = Math.random() * 80;
                    this.point.y = Math.random() * -this.getTankHeight();
                } 
            } else if (this.currT < 1.0) {
                this.currT = Math.min(1.0, dt * 0.2);
            }
        } else if (this.animState === AnimState.StartTube) {
            if (this.currT < 1.0) {
                this.currT = Math.min(1.0, dt * 0.5);
            } else {
                // transition to tube
                this.animState = AnimState.Tube;
                this.currT = 0;
                this.lastCheck = time;
                this.origin.x = this.tubeView.origin.x;
                this.origin.y = this.tubeView.origin.y;
                this.tubeView.getTubeStart(this.lastPoint);
                this.tubeView.getTubeEnd(this.point);
            }
        } else if (this.animState === AnimState.Tube) {
            // transition in incrStage()...
            if (true || this.currT < 1.0) {
                this.currT = Math.min(1.0, dt * 0.2);
            }
        } else if (this.animState === AnimState.EndTube) {
            if (this.currT < 1.0) {
                this.currT = Math.min(1.0, dt * 0.5);
            } else {
                // transition to Tank
                this.animState = AnimState.Tank;
                this.currT = 0;
                this.lastCheck = time;
                this.lastPoint.x = this.point.x;
                this.lastPoint.y = this.point.y;
                //this.point.x = Math.random() * 80;
                //this.point.y = Math.random() * -this.getTankHeight();
                this.tubeView = null;
            }
        }
        var invT = 1.0 - this.currT;
        var pt_x = 0, pt_y = 0, alpha = this.point.alpha;
        if (this.animState === AnimState.Tube) {
            // evil up-cast because we 'know' it's a path.
            var tube_path: RaphaelPath = <RaphaelPath>this.tubeView.p[0];
            var len = tube_path.getTotalLength();
            var point = tube_path.getPointAtLength(this.currT * len);
            pt_x = point.x; 
            pt_y = point.y; 
            alpha = point.alpha;
        } else {
            pt_x = this.lastPoint.x * invT + this.point.x * this.currT;
            pt_y = this.lastPoint.y * invT + this.point.y * this.currT;
        }
		this.p[0].transform("t" + [pt_x + this.origin.x, pt_y + this.origin.y] + 
            "r" + alpha + "S" + [wobble2, wobble]);
    }

    transition () : boolean { 
        if (this.animState === AnimState.Tank) {
            // checked ~60x/sec. 
            if ( Math.random() < 0.002) return true;
        } else if (this.animState === AnimState.Tube) {
            // if we're done with traversing a tube...
            if ( this.currT >= 1.0) return true;
        }
        
        return false;
    }
    
    incrStage(substrate_view: SubstrateView, reaction_view : ReactionView, tank_origin : Point, next_stage: number, time: number) {
        this.tankView = substrate_view;
        //console.log(reaction_view + " " + tank_origin.x + " " + next_stage + " " +this.animState + " " +this.tubeView);
        if (this.animState === AnimState.Tank) {
            if (!this.tubeView && reaction_view) {
                // blobs are on top of everything.
                this.p[0].toFront();
                // same stage, move through a tube. 
                this.tubeView = reaction_view;
                var invT = 1.0 - this.currT;
                this.lastPoint.x = this.lastPoint.x * invT + this.point.x * this.currT;
                this.lastPoint.y = this.lastPoint.y * invT + this.point.y * this.currT;
                this.currT = 0.0;
                // Start of the tube is moveable. 
                this.tubeView.getTubeStart(this.point);
                // make tube start relative to our current origin (the tank's origin)
                this.point.x += reaction_view.origin.x - this.origin.x;
                this.point.y += reaction_view.origin.y - this.origin.y;
                this.animState = AnimState.StartTube;
                this.lastCheck = time;
            } else {
                // last tank transition, I think. 
                this.origin.x = tank_origin.x;
                this.origin.y = tank_origin.y;
                this.lastPoint.x = this.point.x = Math.random() * 80;
                this.lastPoint.y = this.point.y = Math.random() * -this.getTankHeight();;
                this.currT = 0.0;
                this.lastCheck = time;
                // Stage wraps to zero 
                this.currStage = next_stage;
            }
        } else if  (this.animState === AnimState.Tube) {
            // transition to tubeEnd
            this.animState = AnimState.EndTube;
            // relative to the new origin.
            this.lastPoint.x = this.point.x + this.origin.x - tank_origin.x;
            this.lastPoint.y = this.point.y + this.origin.y - tank_origin.y;
            this.point.x = Math.random() * 80;
            this.point.y = Math.random() * -this.getTankHeight();;
            this.origin.x = tank_origin.x;
            this.origin.y = tank_origin.y;
            this.currT = 0.0;
            this.lastCheck = time;
            this.currStage = next_stage;
        } else {
            assert(0 && "No");
        }
    }
    getTankHeight() {
        return this.tankView.getHeight();
    }
}