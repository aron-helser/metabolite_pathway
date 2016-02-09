System.register(['angular2/core'], function(exports_1) {
    var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
        var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
        else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
        return c > 3 && r && Object.defineProperty(target, key, r), r;
    };
    var __metadata = (this && this.__metadata) || function (k, v) {
        if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
    };
    var core_1;
    var AppComponent;
    return {
        setters:[
            function (core_1_1) {
                core_1 = core_1_1;
            }],
        execute: function() {
            AppComponent = (function () {
                function AppComponent() {
                }
                AppComponent = __decorate([
                    core_1.Component({
                        selector: 'my-app',
                        template: "<h1>Chorismate to Phenylalanine Metabolic Pathway</h1>\n            <!-- div id=\"form\">\n            <select id=\"easingx\">\n                <option value=\"\">Linear</option>\n                <option value=\">\">Ease In</option>\n                <option value=\"<\">Ease Out</option>\n                <option value=\"<>\">Ease In and Out</option>\n                <option value=\"bounce\">Bounce</option>\n                <option value=\"elastic\">Elastic</option>\n                <option value=\"backIn\">Back In</option>\n                <option value=\"backOut\">Back Out</option>\n            </select>\n            <button id=\"run\">Run</button>\n        </div>\n        <h2>Pathway</h2 -->\n        <div id=\"holder\"></div>\n"
                    }), 
                    __metadata('design:paramtypes', [])
                ], AppComponent);
                return AppComponent;
            })();
            exports_1("AppComponent", AppComponent);
        }
    }
});
//# sourceMappingURL=app.component.js.map