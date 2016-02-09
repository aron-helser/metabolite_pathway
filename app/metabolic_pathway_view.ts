/// <reference path="../typings/tsd.d.ts"/>
/// <reference path='substrate_view.ts' />
/// <reference path='reaction_view.ts' />

// Visualize the metabolic pathway.
class MetabolicPathwayView {
    // list of tanks and tubes. 
    public tanks : SubstrateView[];
    public tubes : ReactionView[];
    public blobs : BlobView[];
    //fps = 60;
    //interval = 1000 / this.fps;
    public time: number;
    
	constructor(public path : MetabolicPathway, public paper : RaphaelPaper)
    {
        this.tanks = new Array(0);
        this.tubes = new Array(0);
        this.blobs = new Array(0);
        // Magic number: we know the first tank is 100 high above it's starting point.
        var origin : Point = { "x": 10, "y": 140 };
        // traverse the path and construct views of each piece of the path. 
        //console.log(path.complexList);
        for (var i = 1, j = 0; i < path.complexList.length; i+=2, j++) {
            var es_complex: ESComplex = path.complexList[i-1];
            var ep_complex: ESComplex = path.complexList[i];
            var substrate_view = new SubstrateView( es_complex.substrate, origin, paper);
            this.tanks.push(substrate_view);
            // some blobs per tank. TODO base on concentration
            for (var k = 0; k < 5; k++) {
                var blob_view = new BlobView(substrate_view,origin, j, paper);
                this.blobs.push(blob_view);
            }
            origin = substrate_view.getEnd();

            var reaction_view = new ReactionView( es_complex, ep_complex, origin, paper);
            this.tubes.push(reaction_view);
            origin = reaction_view.getEnd();
           
            //console.log("complex: " + es_complex.name + " " + ep_complex.name);
        }
        // add last tank
        var ep_complex: ESComplex = path.complexList[path.complexList.length -1];
        var substrate_view = new SubstrateView(ep_complex.substrate, origin, paper);
        this.tanks.push(substrate_view);
        // blobs...
        var blob_view = new BlobView(substrate_view,origin, j, paper);
        this.blobs.push(blob_view);
        origin = substrate_view.getEnd();
    }


    // Animation Logic ________________________________________

    draw = () => {
        var mpv = this;
        window.requestAnimationFrame(this.draw);
        var now = new Date().getTime(),
            dt = now - (mpv.time || now);
        // dt now has number of milliseconds that have passed. 

        mpv.time = now;
        // make 'now' be in seconds
        now /= 1000.0;

        for (var blob in mpv.blobs) {
            //console.log(blob);
            mpv.blobs[blob].draw(now);
            if (mpv.blobs[blob].transition()) {
                var curr_stage = mpv.blobs[blob].currStage, 
                    next_stage  = curr_stage + 1;
                if (next_stage === this.tanks.length) {
                    next_stage = 0;
                }
                var reaction_view = (curr_stage === this.tubes.length ? null : this.tubes[curr_stage]);
                var substrate_view = this.tanks[next_stage];
                mpv.blobs[blob].incrStage(substrate_view, reaction_view, this.tanks[next_stage].origin, next_stage, now);
            }
        }
        
    }

}

// For Phenylalanine, PheA appears twice - changing the concentration in one place should change it in both. 
//