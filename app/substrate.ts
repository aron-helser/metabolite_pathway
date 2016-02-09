///<reference path='substance.ts' />
// substrate or metabolite, transformed into another substrate or product during a reaction. 
class Substrate extends Substance implements Updater {
	// What do we bind to?
	reactants : Substance[];
    
    setConcentration(new_concentration: number) {
        this.concentration = new_concentration;
        this.notify();
    }
    
    // Updater mixin
    public subscribers : UpdateInterface[] = new Array;
    addSubscriber: (thing: UpdateInterface) => void;
    removeSubscriber: (thing: UpdateInterface) => void;
    notify: () => void;
}

applyMixins(Substrate, [Updater]);
