/// <reference path="../typings/tsd.d.ts"/>
var CPoint = (function () {
    function CPoint(x, y) {
        this.x = x;
        this.y = y;
    }
    CPoint.prototype.copy = function (p) {
        this.x = p.x;
        this.y = p.y;
        return this;
    };
    return CPoint;
})();
// Each container or interactive thing on the canvas
var SubstanceView = (function () {
    function SubstanceView(in_origin, paper) {
        this.paper = paper;
        // list of RaphaelJS objects/paths that we draw
        this.p = new Array(1);
        this.origin = new CPoint(0, 0);
        this.offset = new CPoint(0, 0);
        this.origin.copy(in_origin);
    }
    SubstanceView.prototype.getEnd = function () {
        return { "x": this.origin.x + this.offset.x,
            "y": this.origin.y + this.offset.y };
    };
    return SubstanceView;
})();
/// <reference path="../typings/tsd.d.ts"/>
/// <reference path='substance_view.ts' />
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
// animation states
var AnimState;
(function (AnimState) {
    AnimState[AnimState["Tank"] = 0] = "Tank";
    AnimState[AnimState["StartTube"] = 1] = "StartTube";
    AnimState[AnimState["Tube"] = 2] = "Tube";
    AnimState[AnimState["EndTube"] = 3] = "EndTube";
})(AnimState || (AnimState = {}));
// Blob illustrates that substrates are moving, but don't represent
// specific values in the reaction
var BlobView = (function (_super) {
    __extends(BlobView, _super);
    function BlobView(tankView, origin, currStage, paper) {
        _super.call(this, origin, paper);
        this.tankView = tankView;
        this.currStage = currStage;
        this.paper = paper;
        this.point = { "x": 25 + Math.random() * 50, "y": -(25 + Math.random() * 50), "alpha": 0.0 };
        this.lastPoint = { "x": 25 + Math.random() * 50, "y": -(25 + Math.random() * 50), "alpha": 0.0 };
        //public size: { width: number, height: number };
        this.wobPerSec = 2;
        this.animState = AnimState.Tank;
        this.wobbleOffset = 0;
        // check for state change
        this.lastCheck = 0;
        this.currT = 1.0;
        this.p[0] = paper.ellipse(0, 0, 5, 4).attr({ stroke: "none", fill: "#fff" });
        this.wobbleOffset = Math.random();
    }
    BlobView.prototype.draw = function (time) {
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
            }
            else if (this.currT < 1.0) {
                this.currT = Math.min(1.0, dt * 0.2);
            }
        }
        else if (this.animState === AnimState.StartTube) {
            if (this.currT < 1.0) {
                this.currT = Math.min(1.0, dt * 0.5);
            }
            else {
                // transition to tube
                this.animState = AnimState.Tube;
                this.currT = 0;
                this.lastCheck = time;
                this.origin.x = this.tubeView.origin.x;
                this.origin.y = this.tubeView.origin.y;
                this.tubeView.getTubeStart(this.lastPoint);
                this.tubeView.getTubeEnd(this.point);
            }
        }
        else if (this.animState === AnimState.Tube) {
            // transition in incrStage()...
            if (true || this.currT < 1.0) {
                this.currT = Math.min(1.0, dt * 0.2);
            }
        }
        else if (this.animState === AnimState.EndTube) {
            if (this.currT < 1.0) {
                this.currT = Math.min(1.0, dt * 0.5);
            }
            else {
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
            var tube_path = this.tubeView.p[0];
            var len = tube_path.getTotalLength();
            var point = tube_path.getPointAtLength(this.currT * len);
            pt_x = point.x;
            pt_y = point.y;
            alpha = point.alpha;
        }
        else {
            pt_x = this.lastPoint.x * invT + this.point.x * this.currT;
            pt_y = this.lastPoint.y * invT + this.point.y * this.currT;
        }
        this.p[0].transform("t" + [pt_x + this.origin.x, pt_y + this.origin.y] +
            "r" + alpha + "S" + [wobble2, wobble]);
    };
    BlobView.prototype.transition = function () {
        if (this.animState === AnimState.Tank) {
            // checked ~60x/sec. 
            if (Math.random() < 0.002)
                return true;
        }
        else if (this.animState === AnimState.Tube) {
            // if we're done with traversing a tube...
            if (this.currT >= 1.0)
                return true;
        }
        return false;
    };
    BlobView.prototype.incrStage = function (substrate_view, reaction_view, tank_origin, next_stage, time) {
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
            }
            else {
                // last tank transition, I think. 
                this.origin.x = tank_origin.x;
                this.origin.y = tank_origin.y;
                this.lastPoint.x = this.point.x = Math.random() * 80;
                this.lastPoint.y = this.point.y = Math.random() * -this.getTankHeight();
                ;
                this.currT = 0.0;
                this.lastCheck = time;
                // Stage wraps to zero 
                this.currStage = next_stage;
            }
        }
        else if (this.animState === AnimState.Tube) {
            // transition to tubeEnd
            this.animState = AnimState.EndTube;
            // relative to the new origin.
            this.lastPoint.x = this.point.x + this.origin.x - tank_origin.x;
            this.lastPoint.y = this.point.y + this.origin.y - tank_origin.y;
            this.point.x = Math.random() * 80;
            this.point.y = Math.random() * -this.getTankHeight();
            ;
            this.origin.x = tank_origin.x;
            this.origin.y = tank_origin.y;
            this.currT = 0.0;
            this.lastCheck = time;
            this.currStage = next_stage;
        }
        else {
            assert(0 && "No");
        }
    };
    BlobView.prototype.getTankHeight = function () {
        return this.tankView.getHeight();
    };
    BlobView.checkInverval = 1.0;
    return BlobView;
})(SubstanceView);
// Mixin: notify our subscribers when they need to update.
var Updater = (function () {
    function Updater() {
    }
    Updater.prototype.addSubscriber = function (thing) {
        this.subscribers.push(thing);
    };
    Updater.prototype.removeSubscriber = function (thing) {
        for (var i = 0; i < this.subscribers.length; i++) {
            if (this.subscribers[i] === thing) {
                this.subscribers.splice(i, 1);
                break;
            }
        }
    };
    Updater.prototype.notify = function () {
        for (var i = 0; i < this.subscribers.length; i++) {
            this.subscribers[i].update();
        }
    };
    return Updater;
})();
// from typescript handbook, http://www.typescriptlang.org/Handbook#mixins 
function applyMixins(derivedCtor, baseCtors) {
    baseCtors.forEach(function (baseCtor) {
        Object.getOwnPropertyNames(baseCtor.prototype).forEach(function (name) {
            derivedCtor.prototype[name] = baseCtor.prototype[name];
        });
    });
}
// base class for metabolites/substrates, enzymes, and enzyme-substrate complexes
var Substance = (function () {
    function Substance(name) {
        this.name = name;
        // everything has a current amount or concentration
        this.concentration = 10;
        // Initial metabolite will usually have non-zero supplyRate
        this.supplyRate = 0.0;
    }
    ;
    // One time-step, binding and reactions result in changing concentration
    Substance.prototype.react = function () { };
    ;
    return Substance;
})();
///<reference path='substance.ts' />
// Enzymes are not consumed in reactions. They bind into complexes to speed up reactions.
var Enzyme = (function (_super) {
    __extends(Enzyme, _super);
    function Enzyme() {
        _super.apply(this, arguments);
        // Updater mixin
        this.subscribers = new Array;
    }
    Enzyme.prototype.setConcentration = function (new_concentration) {
        this.concentration = new_concentration;
        this.notify();
    };
    return Enzyme;
})(Substance);
applyMixins(Enzyme, [Updater]);
///<reference path='substance.ts' />
// substrate or metabolite, transformed into another substrate or product during a reaction. 
var Substrate = (function (_super) {
    __extends(Substrate, _super);
    function Substrate() {
        _super.apply(this, arguments);
        // Updater mixin
        this.subscribers = new Array;
    }
    Substrate.prototype.setConcentration = function (new_concentration) {
        this.concentration = new_concentration;
        this.notify();
    };
    return Substrate;
})(Substance);
applyMixins(Substrate, [Updater]);
///<reference path='substrate.ts' />
///<reference path='enzyme.ts' />
// A single enzyme and substrate combine into a complex, to produce a new substance.
var ESComplex = (function (_super) {
    __extends(ESComplex, _super);
    // Product might be a substrate or an escomplex, so needs to be type Substance
    function ESComplex(enzyme, substrate, product) {
        if (product === void 0) { product = null; }
        _super.call(this, "[" + enzyme.name + " " + substrate.name + "]");
        this.enzyme = enzyme;
        this.substrate = substrate;
        this.product = product;
        // rates of binding and reaction, in units/step:
        this.bindRate = 0.5;
        this.unbindRate = 0.05;
        // Assume catalysis rate is 100x slower than binding rate. 
        this.reactRate = this.bindRate * 0.01;
        this.reverseRate = this.unbindRate * 0.01;
        // TODO Km supposedly sets the ratio of bind/unbind and react/reverse, 
        // which should be the same. Might set Km and calculate reverse, unbind. 
        // change in free energy between input substrate and output product
        // Units are either kJ/mol or multiples of the substrate tank height.
        this.freeEnergyDelta = 70;
        // Updater mixin
        this.subscribers = new Array;
    }
    ;
    // reactRate affects some of our viewers. 
    ESComplex.prototype.setReactRate = function (new_rate) {
        this.reactRate = new_rate;
        this.notify();
    };
    return ESComplex;
})(Substance);
applyMixins(ESComplex, [Updater]);
///<reference path='substrate.ts' />
///<reference path='es_complex.ts' />
// Substrates are converted to products using enzymes. 
var MetabolicPathway = (function () {
    function MetabolicPathway() {
        // Total energy change from all reactions. Helpful for sizing the viz.     
        this.totalEnergyChange = 0.0;
    }
    MetabolicPathway.prototype.applyComplexList = function (newComplexList) {
        this.complexList = newComplexList;
        this.totalEnergyChange = 0.0;
        this.source = this.complexList[0].substrate;
        this.product = this.complexList[this.complexList.length - 1].substrate;
        for (var complex in this.complexList) {
            this.totalEnergyChange += complex.freeEnergyDelta;
        }
    };
    ;
    MetabolicPathway.prototype.getEnergy = function () { return this.totalEnergyChange; };
    ;
    MetabolicPathway.prototype.applyJSONProps = function (json, obj) {
        // loop over json props. 
        for (var prop in json) {
            if (!json.hasOwnProperty(prop) || !obj.hasOwnProperty(prop)) {
                continue;
            }
            //console.log("   " + prop);
            // skip objects
            if (typeof json[prop] !== 'object') {
                obj[prop] = json[prop];
            }
        }
    };
    MetabolicPathway.prototype.loadFromJSON = function (json) {
        var substrates = {};
        var enzymes = {};
        var complexes = {};
        var new_complexList = new Array();
        for (var i in json["Substrates"]) {
            var substrate_json = json["Substrates"][i];
            //console.log(substrate_json["name"]);
            substrates[substrate_json["name"]] = new Substrate(substrate_json["name"]);
            this.applyJSONProps(substrate_json, substrates[substrate_json["name"]]);
        }
        for (var i in json["Enzymes"]) {
            var enzyme_json = json["Enzymes"][i];
            //console.log(enzyme_json["name"]);
            enzymes[enzyme_json["name"]] = new Enzyme(enzyme_json["name"]);
            this.applyJSONProps(enzyme_json, enzymes[enzyme_json["name"]]);
        }
        for (var j = json["ESComplexes"].length - 1; j >= 0; j--) {
            var complex_json = json["ESComplexes"][j];
            //console.log(complex_json["name"]);
            // find the enzyme, substrate and product this complex uses. 
            // reverse order ensures the product complex is available. 
            var complex_enzyme = enzymes[complex_json["enzyme_name"]];
            var complex_substrate = substrates[complex_json["substrate_name"]];
            var complex_product = null;
            if (complexes["product_name"] != undefined) {
                complex_product = complexes[complexes["product_name"]];
            }
            var cmpl = new ESComplex(complex_enzyme, complex_substrate, complex_product);
            complexes[complex_json["name"]] = cmpl;
            this.applyJSONProps(complex_json, cmpl);
            new_complexList.push(cmpl);
        }
        // put complexes back in the right order. 
        new_complexList.reverse();
        this.applyComplexList(new_complexList);
    };
    return MetabolicPathway;
})();
/// <reference path="../typings/tsd.d.ts"/>
/// <reference path='substance_view.ts' />
// View of a substrate is a tank that shows concentration.  
var SubstrateView = (function (_super) {
    __extends(SubstrateView, _super);
    function SubstrateView(substrate, origin, paper) {
        _super.call(this, origin, paper);
        this.substrate = substrate;
        this.paper = paper;
        var conc = this.substrate.concentration;
        var inv_conc = 100 - conc;
        var tank_attr = { stroke: "#666", opacity: 1.0, "stroke-width": 10 };
        // TODO the 'v100' should be broken into two, so the bottom half of the tank gets filled.
        this.p[0] = paper.path("m-5," + (-conc) + " v" + conc + " a50,20 180 0,0 100,0 v-" + conc + " m0," + conc)
            .attr(tank_attr).attr({ fill: "90-#00f:5-#eb2:100" });
        this.p[0].attr({ fill: "#00f" });
        this.p[0].transform("T" + this.origin.x + "," + this.origin.y);
        // tubes display on-top of tanks
        //this.p[0].toBack();
        this.p.push(paper.path("m-5,-100 v" + inv_conc + " m100,0 v-" + inv_conc + " m0," + inv_conc)
            .attr(tank_attr));
        this.p[1].transform("T" + this.origin.x + "," + this.origin.y);
        this.p.push(paper.text(0, 40, this.substrate.name).attr({ font: "16px Helvetica", opacity: 1.0, "text-anchor": "start", fill: "#aaf" }));
        this.p[2].transform("T" + this.origin.x + "," + this.origin.y);
        this.p[2].node.setAttribute("class", "nohighlight");
        // The walls of the tank are ignored in the size, so arc-width 100 - stroke-width 10 = 90
        this.offset.x = 90;
        this.offset.y = 0;
    }
    SubstrateView.prototype.getHeight = function () {
        return this.substrate.concentration;
    };
    SubstrateView.concentrationRange = 100;
    return SubstrateView;
})(SubstanceView);
/// <reference path="../typings/tsd.d.ts"/>
///<reference path='substance_view.ts' />
// utility class for drag targets that manipulate a ReactionView's tube
var DragTarget = (function (_super) {
    __extends(DragTarget, _super);
    function DragTarget(esComplex, epComplex, setResult, getResult, getOffsetY, seg, reaction_view, origin, paper) {
        _super.call(this, origin, paper);
        this.esComplex = esComplex;
        this.epComplex = epComplex;
        this.setResult = setResult;
        this.getResult = getResult;
        this.getOffsetY = getOffsetY;
        this.seg = seg;
        this.reaction_view = reaction_view;
        var that = this;
        var tube_width = ReactionView.tubeWidthScale * this.esComplex.enzyme.concentration;
        var half_tube_width = tube_width * 0.5;
        this.p[0] = paper.rect(seg * ReactionView.segWidth, this.getStartY(), ReactionView.segWidth, tube_width);
        // share an origin with ReactionView, so we share the same coords. 
        this.p[0].transform("T" + this.origin.x + "," + this.origin.y);
        this.p[0].attr({ stroke: "none", fill: "#fff", opacity: 0.0 });
        this.p[0].mouseover(function () {
            var tube_width = ReactionView.tubeWidthScale * that.esComplex.enzyme.concentration;
            that.p[0].attr({ height: tube_width, y: that.getStartY() });
            that.reaction_view.p[0].animate({ stroke: ReactionView.moveColor }, 300);
            //this.animate({ opacity: 0.6 }, 300);
        });
        this.p[0].mouseout(function () {
            that.reaction_view.p[0].animate({ stroke: ReactionView.baseColor }, 300);
            //this.animate({ opacity: 0.0 }, 300);
        });
        this.p[0].drag(function (dx, dy) {
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
        }, function (x, y) {
            this.startDrag = { y: this.getStartY() };
            return {};
        }, function (event) { this.startDrag = null; return {}; }, this, this, this);
        // fade out drag targets. 
        //this.p[0].animate({ opacity: 0.0 }, 1500);
    }
    DragTarget.prototype.getStartY = function () {
        var tube_width = ReactionView.tubeWidthScale * this.esComplex.enzyme.concentration;
        var half_tube_width = tube_width * 0.5;
        return (-half_tube_width + this.getOffsetY() - ReactionView.affinityRange * this.getResult());
    };
    return DragTarget;
})(SubstanceView);
// utility class for drag targets that manipulate a ReactionView's tube
var DragTargetHandle = (function (_super) {
    __extends(DragTargetHandle, _super);
    function DragTargetHandle(esComplex, setResult, getResult, getOffsetY, reaction_view, origin, paper) {
        _super.call(this, origin, paper);
        this.esComplex = esComplex;
        this.setResult = setResult;
        this.getResult = getResult;
        this.getOffsetY = getOffsetY;
        this.reaction_view = reaction_view;
        var that = this;
        var tube_width = ReactionView.tubeWidthScale * this.esComplex.enzyme.concentration;
        var half_tube_width = tube_width * 0.5;
        //this.p[0] = paper.path("m-5,0 v15 a10,10 320 1,0 10,0 v-15 z");
        // thermometer bulb hanging off the tube:
        if (0) {
            var r = 7;
            this.p[0] = paper.path("m-" + (r / 2) + ",0 v" + (r * 1.5) + " a" + r + "," + r + " 320 1,0 " + r + ",0 v-" + (r * 1.5) + " z");
            this.p[0].attr({ stroke: "none", fill: "#5f5", opacity: 1.0 });
        }
        else {
            // center area rect, behind the tube, transparent. 
            var r = ReactionView.segWidth;
            this.p[0] = paper.path("m-" + (r / 2) + ",0 v" + (r * 0.25) + " a" + (r / 2) + "," + (r / 2) + " 180 1,0 " + r + ",0 v-" + (r * 0.25) + " z");
            this.p[0].attr({ stroke: "none", fill: "#5f5", opacity: 0.0 });
            this.p[0].toBack();
        }
        // set transform
        this.update();
        // notify us if enzyme concentration changes, or esComplex.reactRate
        this.esComplex.enzyme.addSubscriber(this);
        this.esComplex.addSubscriber(this);
        this.p[0].mouseover(function () {
            this.animate({ opacity: 0.2 }, 300);
            that.reaction_view.p[0].animate({ stroke: ReactionView.moveColor }, 300);
        });
        this.p[0].mouseout(function () {
            this.animate({ opacity: 0.0 }, 300);
            that.reaction_view.p[0].animate({ stroke: ReactionView.baseColor }, 300);
        });
        this.p[0].drag(function (dx, dy) {
            var start = this.startDrag;
            if (start) {
                // TODO magic number - 5 is min tube width of 10. 
                var newY = Math.min(Math.max(start.y + dy - this.getOffsetY(), 5), ReactionView.reactRange);
                this.setResult(newY);
                this.p[0].transform("T" + (this.origin.x + 1.5 * ReactionView.segWidth) + "," + (this.origin.y + this.getStartY()));
                reaction_view.update();
            }
            return {};
        }, function (x, y) {
            this.startDrag = { y: this.getStartY() };
            return {};
        }, function (event) { this.startDrag = null; return {}; }, this, this, this);
    }
    DragTargetHandle.prototype.getStartY = function () {
        var half_tube_width = this.getResult();
        return (half_tube_width + this.getOffsetY());
    };
    // change our transform based on enzyme concentration.     
    DragTargetHandle.prototype.update = function () {
        // share an origin with ReactionView, so we share the same coords. 
        this.p[0].transform("T" + (this.origin.x + 1.5 * ReactionView.segWidth) + "," + (this.origin.y + this.getStartY()));
    };
    return DragTargetHandle;
})(SubstanceView);
// View of a reaction is a tube that shows concentration, energy barrier, affinities, etc.  
var ReactionView = (function (_super) {
    __extends(ReactionView, _super);
    //freeEnergy = 70;
    function ReactionView(esComplex, epComplex, origin, paper) {
        var _this = this;
        _super.call(this, origin, paper);
        this.esComplex = esComplex;
        this.epComplex = epComplex;
        //startAffinity = 1.0;
        this.kCat = 0.3;
        this.endAffinity = 1.0;
        this.draggers = new Array(0);
        this.handles = new Array(0);
        var tube_width = ReactionView.tubeWidthScale * this.esComplex.enzyme.concentration;
        this.p[0] = paper.path(this.getTubePathString()).attr({
            stroke: "#0a0", opacity: 1.0,
            "stroke-width": tube_width,
            "stroke-linejoin": "round" });
        this.offset.x = 3 * ReactionView.segWidth;
        this.offset.y = this.esComplex.freeEnergyDelta;
        this.p[0].transform("T" + this.origin.x + "," + this.origin.y);
        // make sure we get notified if the ESComplex is changed another way
        esComplex.enzyme.addSubscriber(this);
        // drag targets, sub-class
        var setResult = [function (r) { _this.esComplex.bindRate = r; },
            function (r) { _this.esComplex.setReactRate(r / ReactionView.reactScale); },
            function (r) { _this.epComplex.bindRate = r; }];
        var getResult = [function () { return _this.esComplex.bindRate; },
            function () { return _this.esComplex.reactRate * ReactionView.reactScale; },
            function () { return _this.epComplex.bindRate; }];
        var getOffsetY = [function () {
                return 0; //-ReactionView.affinityRange * this.esComplex.bindRate; 
            },
            function () {
                return -ReactionView.affinityRange; // -ReactionView.affinityRange * ( 1.0 + this.esComplex.reactRate * ReactionView.reactScale); 
            },
            function () {
                return _this.esComplex.freeEnergyDelta; //this.esComplex.freeEnergyDelta - ReactionView.affinityRange * this.epComplex.bindRate; 
            }];
        for (var i = 0; i < 3; i++) {
            var blanket1 = new DragTarget(esComplex, epComplex, setResult[i], getResult[i], getOffsetY[i], i, this, this.origin, this.paper);
            this.draggers.push(blanket1);
        }
        var handle1 = new DragTargetHandle(esComplex, function (r) {
            _this.esComplex.enzyme.setConcentration(2 * r / ReactionView.tubeWidthScale);
        }, function () {
            var half_tube_width = 0.5 * ReactionView.tubeWidthScale * _this.esComplex.enzyme.concentration;
            return half_tube_width;
        }, function () {
            return -ReactionView.affinityRange * (1.0 + _this.esComplex.reactRate * ReactionView.reactScale);
        }, this, this.origin, this.paper);
        this.handles.push(handle1);
        // label the enzyme for this tube
        this.p.push(paper.text(ReactionView.segWidth, -2 * ReactionView.affinityRange - ReactionView.reactRange - 5, this.esComplex.enzyme.name).attr({ font: "16px Helvetica", opacity: 1.0, "text-anchor": "start", fill: "#7f7" }));
        this.p[1].transform("T" + this.origin.x + "," + this.origin.y);
        this.p[1].node.setAttribute("class", "nohighlight");
    }
    ReactionView.prototype.getTubePathString = function () {
        // Get values from ESComplex
        var startAffinity = this.esComplex.bindRate, kCat = this.esComplex.reactRate * ReactionView.reactScale, endAffinity = this.epComplex.bindRate, ar = ReactionView.affinityRange, sw = ReactionView.segWidth, freeEnergy = this.esComplex.freeEnergyDelta;
        return "m0," + (-ar * startAffinity) +
            " h" + sw + " v" + (ar * startAffinity - ar * (1.0 + kCat)) + " h" + sw +
            " v" + ((1.0 + kCat) * ar + freeEnergy - ar * endAffinity) + " h" + sw + "";
    };
    ReactionView.prototype.getTubeStart = function (p) {
        p.x = 0;
        p.y = -ReactionView.affinityRange * this.esComplex.bindRate;
    };
    ReactionView.prototype.getTubeEnd = function (p) {
        p.x = this.offset.x;
        p.y = -ReactionView.affinityRange * this.epComplex.bindRate + this.esComplex.freeEnergyDelta;
    };
    // update everything that can change when something is dragged. 
    ReactionView.prototype.update = function () {
        var tube_width = ReactionView.tubeWidthScale * this.esComplex.enzyme.concentration;
        this.p[0].attr({ "stroke-width": tube_width,
            path: this.getTubePathString() });
    };
    ReactionView.tubeWidthScale = 1;
    ReactionView.affinityRange = 50;
    ReactionView.reactRange = 20;
    ReactionView.segWidth = 50;
    ReactionView.reactScale = 200;
    ReactionView.baseColor = "#0a0";
    ReactionView.moveColor = "#0f0";
    return ReactionView;
})(SubstanceView);
/// <reference path="../typings/tsd.d.ts"/>
/// <reference path='substrate_view.ts' />
/// <reference path='reaction_view.ts' />
// Visualize the metabolic pathway.
var MetabolicPathwayView = (function () {
    function MetabolicPathwayView(path, paper) {
        var _this = this;
        this.path = path;
        this.paper = paper;
        // Animation Logic ________________________________________
        this.draw = function () {
            var mpv = _this;
            window.requestAnimationFrame(_this.draw);
            var now = new Date().getTime(), dt = now - (mpv.time || now);
            // dt now has number of milliseconds that have passed. 
            mpv.time = now;
            // make 'now' be in seconds
            now /= 1000.0;
            for (var blob in mpv.blobs) {
                //console.log(blob);
                mpv.blobs[blob].draw(now);
                if (mpv.blobs[blob].transition()) {
                    var curr_stage = mpv.blobs[blob].currStage, next_stage = curr_stage + 1;
                    if (next_stage === _this.tanks.length) {
                        next_stage = 0;
                    }
                    var reaction_view = (curr_stage === _this.tubes.length ? null : _this.tubes[curr_stage]);
                    var substrate_view = _this.tanks[next_stage];
                    mpv.blobs[blob].incrStage(substrate_view, reaction_view, _this.tanks[next_stage].origin, next_stage, now);
                }
            }
        };
        this.tanks = new Array(0);
        this.tubes = new Array(0);
        this.blobs = new Array(0);
        // Magic number: we know the first tank is 100 high above it's starting point.
        var origin = { "x": 10, "y": 140 };
        // traverse the path and construct views of each piece of the path. 
        //console.log(path.complexList);
        for (var i = 1, j = 0; i < path.complexList.length; i += 2, j++) {
            var es_complex = path.complexList[i - 1];
            var ep_complex = path.complexList[i];
            var substrate_view = new SubstrateView(es_complex.substrate, origin, paper);
            this.tanks.push(substrate_view);
            // some blobs per tank. TODO base on concentration
            for (var k = 0; k < 5; k++) {
                var blob_view = new BlobView(substrate_view, origin, j, paper);
                this.blobs.push(blob_view);
            }
            origin = substrate_view.getEnd();
            var reaction_view = new ReactionView(es_complex, ep_complex, origin, paper);
            this.tubes.push(reaction_view);
            origin = reaction_view.getEnd();
        }
        // add last tank
        var ep_complex = path.complexList[path.complexList.length - 1];
        var substrate_view = new SubstrateView(ep_complex.substrate, origin, paper);
        this.tanks.push(substrate_view);
        // blobs...
        var blob_view = new BlobView(substrate_view, origin, j, paper);
        this.blobs.push(blob_view);
        origin = substrate_view.getEnd();
    }
    return MetabolicPathwayView;
})();
// For Phenylalanine, PheA appears twice - changing the concentration in one place should change it in both. 
// 
/// <reference path="../typings/tsd.d.ts"/>
///<reference path='metabolic_pathway_view.ts' />
//var raphael = require("raphael");
// creating the phenylalanine pathway
// chorismate [S1]
// PheA [E1]  dG = -23.1 kJ/mol 
// prephenate [S2]
// PheA [E1]  dG = -67.6 kJ/mol 
// phenylpyruvate [S3]
// TyrB [E2]  dG = -0.5 kJ/mol 
// phenylalanine [S4]
// Typically, S -> ES -> EP -> P
// If the pathway is set up naively, [E1 S2] shows up twice. 
// But one of them is ES, the other is EP, and those act differently - create two.
// S1 -> [E1 S1] -> [E1 S2] -> S2 -> [E1 S2] -> [E1 S3] -> S3 -> [E2 S3] -> [E2 S4] -> S4
/*
var chorismate = new Substrate("chorismate");
// source has non-zero supply rate
chorismate.supplyRate = 0.1;

var pheA = new Enzyme("PheA");

var prephenate = new Substrate("prephenate");
var phenylpyruvate = new Substrate("phenylpyruvate");
var phenylalanine = new Substrate("phenylalanine");

var tyrB = new Enzyme("TyrB");
tyrB.concentration = 20;

// create in reverse order to let us link them up.
var e2s4 = new ESComplex(tyrB, phenylalanine);
var e2s3 = new ESComplex(tyrB, phenylpyruvate, e2s4);
e2s3.freeEnergyDelta = 0.5;
var e1s3 = new ESComplex(pheA, phenylpyruvate);
var e1s2_es = new ESComplex(pheA, prephenate, e1s3);
e1s2_es.freeEnergyDelta = 26.0;
var e1s2_ep = new ESComplex(pheA, prephenate);
var e1s1 = new ESComplex(pheA, chorismate, e1s2_ep);
e1s1.bindRate = 1.0;
e1s1.unbindRate = 0.1;
e1s1.freeEnergyDelta = 70.0;
*/
var path = new MetabolicPathway();
//load a json file from local or server. 
function loadJSON(callback) {
    var xobj = new XMLHttpRequest();
    xobj.overrideMimeType("application/json");
    xobj.open('GET', 'app/phenylalanine_pathway.json', true);
    xobj.onreadystatechange = function () {
        if (xobj.readyState === 4 && xobj.status === 200) {
            // .open will NOT return a value but simply returns undefined in async mode so use a callback
            callback(xobj.responseText);
        }
    };
    xobj.send(null);
}
// Now visualize!
window.onload = function () {
    var paper = Raphael("holder", 900, 600);
    // Call to function with anonymous callback
    loadJSON(function (response) {
        // json object has groups of key-value pairs representing our pathway.
        var jsonresponse = JSON.parse(response);
        // Create a path with the json data.
        path.loadFromJSON(jsonresponse);
        var pathView = new MetabolicPathwayView(path, paper);
        // start animation:
        pathView.draw();
    });
};
//# sourceMappingURL=app.js.map