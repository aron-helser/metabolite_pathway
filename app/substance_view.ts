/// <reference path="../typings/tsd.d.ts"/>

interface Point {
    x: number;
    y: number;
}

class CPoint implements Point {
    constructor( public x: number, public y: number) {}
    
    copy  (p: Point) : Point
    {
        this.x = p.x;
        this.y = p.y;
        return this;
    }
}

// Each container or interactive thing on the canvas
class SubstanceView {
    // list of RaphaelJS objects/paths that we draw
    public p: RaphaelElement[] = new Array(1);
    public origin : CPoint = new CPoint(0,0);
    public offset: CPoint = new CPoint(0,0);

    constructor(in_origin: Point, public paper: RaphaelPaper) {
        this.origin.copy(in_origin);
    }

    getEnd() : Point {
        return { "x": this.origin.x + this.offset.x, 
                 "y": this.origin.y + this.offset.y };
    }
}