///<reference path='substance.ts' />

// Enzymes are not consumed in reactions. They bind into complexes to speed up reactions.
class Enzyme extends Substance implements Updater {
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

applyMixins(Enzyme, [Updater]);
