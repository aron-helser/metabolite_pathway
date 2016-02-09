///<reference path='substrate.ts' />
///<reference path='es_complex.ts' />

// Substrates are converted to products using enzymes. 
class MetabolicPathway {
    // the complete metabolic path
    public complexList: ESComplex[];
    // Source of the pathway
    public source: Substrate;
    // Final Product
    public product: Substrate;
    // Total energy change from all reactions. Helpful for sizing the viz.     
    private totalEnergyChange = 0.0;

    constructor(   ) 
    {
    }
    applyComplexList(
        newComplexList: ESComplex[]
    ) 
    {
        this.complexList = newComplexList;
        this.totalEnergyChange = 0.0;
        this.source = this.complexList[0].substrate;
        this.product = this.complexList[this.complexList.length - 1].substrate;
        for (var complex in this.complexList) {
            this.totalEnergyChange += complex.freeEnergyDelta;
        }
    };
    
    getEnergy() : number { return this.totalEnergyChange; };
    
    applyJSONProps(json: any, obj: any) 
    {
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
    }

    loadFromJSON(json : any)
    {
        var substrates : any = {};
        var enzymes : any = {};
        var complexes : any = {};
        var new_complexList : ESComplex[] = new Array();
        
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
            var complex_enzyme = <Enzyme>enzymes[complex_json["enzyme_name"]];
            var complex_substrate = <Substrate>substrates[complex_json["substrate_name"]];
            var complex_product : ESComplex = null;
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
        this.applyComplexList( new_complexList );
    }
}