///<reference path='substrate.ts' />
///<reference path='enzyme.ts' />

// A single enzyme and substrate combine into a complex, to produce a new substance.
class ESComplex extends Substance implements Updater {
    // Product might be a substrate or an escomplex, so needs to be type Substance
	constructor (public enzyme: Enzyme, 
                public substrate : Substrate,
                public product : ESComplex = null) 
    {
        super("[" + enzyme.name + " " + substrate.name + "]");
    };
    
    // rates of binding and reaction, in units/step:
    bindRate = 0.5;
    unbindRate = 0.05;
    // Assume catalysis rate is 100x slower than binding rate. 
    reactRate = this.bindRate * 0.01;
    reverseRate = this.unbindRate * 0.01;
    // TODO Km supposedly sets the ratio of bind/unbind and react/reverse, 
    // which should be the same. Might set Km and calculate reverse, unbind. 
    
    // change in free energy between input substrate and output product
    // Units are either kJ/mol or multiples of the substrate tank height.
    freeEnergyDelta = 70;
    
    // reactRate affects some of our viewers. 
    setReactRate(new_rate: number) {
        this.reactRate = new_rate;
        this.notify();
    }
    // Updater mixin
    public subscribers : UpdateInterface[] = new Array;
    addSubscriber: (thing: UpdateInterface) => void;
    removeSubscriber: (thing: UpdateInterface) => void;
    notify: () => void;
}

applyMixins(ESComplex, [Updater]);
