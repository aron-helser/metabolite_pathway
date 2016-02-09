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
var path = new MetabolicPathway( );

//load a json file from local or server. 
function loadJSON(callback : (s: string) => void) {

    var xobj = new XMLHttpRequest();
    xobj.overrideMimeType("application/json");
    xobj.open('GET', 'app/phenylalanine_pathway.json', true);
    xobj.onreadystatechange = function() {
        if (xobj.readyState === 4 && xobj.status === 200) {

            // .open will NOT return a value but simply returns undefined in async mode so use a callback
            callback(xobj.responseText);

        }
    }
    xobj.send(null);
}

// Now visualize!
window.onload = function () {
	var paper = Raphael("holder", 900, 600);
    // Call to function with anonymous callback
    loadJSON(function(response) {
        // json object has groups of key-value pairs representing our pathway.
        var jsonresponse = JSON.parse(response);

        // Create a path with the json data.
        path.loadFromJSON(jsonresponse);
        var pathView = new MetabolicPathwayView(path, paper);
        // start animation:
        pathView.draw();

    });


}