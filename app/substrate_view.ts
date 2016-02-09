/// <reference path="../typings/tsd.d.ts"/>
/// <reference path='substance_view.ts' />

// View of a substrate is a tank that shows concentration.  
class SubstrateView extends SubstanceView {
    static concentrationRange = 100;

    constructor(public substrate: Substrate, origin: Point, public paper: RaphaelPaper) {
        super(origin, paper);
        var conc = this.substrate.concentration;
        var inv_conc = 100 - conc;
        var tank_attr = { stroke: "#666", opacity: 1.0, "stroke-width": 10 };
        // TODO the 'v100' should be broken into two, so the bottom half of the tank gets filled.
        this.p[0] = paper.path("m-5," + (-conc) + " v" + conc + " a50,20 180 0,0 100,0 v-" + conc + " m0," + conc)
                        .attr(tank_attr).attr({ fill: "90-#00f:5-#eb2:100" });
        this.p[0].attr({fill: "#00f"});
        this.p[0].transform("T" + this.origin.x +"," + this.origin.y);
        // tubes display on-top of tanks
        //this.p[0].toBack();
        this.p.push(paper.path("m-5,-100 v" + inv_conc + " m100,0 v-" + inv_conc + " m0," + inv_conc)
                        .attr(tank_attr));      
        this.p[1].transform("T" + this.origin.x +"," + this.origin.y);
        this.p.push(paper.text(0, 40, this.substrate.name).attr({font: "16px Helvetica", opacity: 1.0, "text-anchor":"start", fill:"#aaf"}));
        this.p[2].transform("T" + this.origin.x +"," + this.origin.y);
        this.p[2].node.setAttribute("class", "nohighlight");
        // The walls of the tank are ignored in the size, so arc-width 100 - stroke-width 10 = 90
        this.offset.x = 90;
        this.offset.y = 0;
    }
    getHeight() {
        return this.substrate.concentration;
    }
}