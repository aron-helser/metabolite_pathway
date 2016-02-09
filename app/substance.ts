// notify/update, for views that depend on changes in underlying model. 
interface UpdateInterface {
    update() : void;
}

// Mixin: notify our subscribers when they need to update.
class Updater {
    public subscribers : UpdateInterface[];
    addSubscriber(thing: UpdateInterface) {
        this.subscribers.push(thing);
    }
    removeSubscriber(thing: UpdateInterface){
        for (var i = 0; i < this.subscribers.length; i++) {
            if (this.subscribers[i] === thing){
                this.subscribers.splice(i, 1);
                break;
            }
        }
    }
    notify() {
        for (var i = 0; i < this.subscribers.length; i++) {
            this.subscribers[i].update();
        }        
    }
}

// from typescript handbook, http://www.typescriptlang.org/Handbook#mixins 
function applyMixins(derivedCtor: any, baseCtors: any[]) {
    baseCtors.forEach(baseCtor => {
        Object.getOwnPropertyNames(baseCtor.prototype).forEach(name => {
            derivedCtor.prototype[name] = baseCtor.prototype[name];
        })
    }); 
}


// base class for metabolites/substrates, enzymes, and enzyme-substrate complexes
class Substance {
	constructor(public name: string) {}; 
	// everything has a current amount or concentration
	concentration = 10;
	// Initial metabolite will usually have non-zero supplyRate
	supplyRate = 0.0;
	// One time-step, binding and reactions result in changing concentration
	react() {};
}