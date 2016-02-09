#!/bin/sh
# deploy necessary files only to another dir. 

dest="deploy/";

src=(
node_modules/angular2/bundles/angular2-polyfills.js
node_modules/systemjs/dist/system.src.js
node_modules/rxjs/bundles/Rx.js
node_modules/angular2/bundles/angular2.dev.js
raphael.js
demo.css
app/app.js
app/boot.js
app/app.js.map
app/blob_view.ts
app/app.component.js
app/boot.js.map
app/app.component.js.map
index.html
app/phenylalanine_pathway.json
"app/*.ts"
"*.ts"
)

for i in ${src[*]}
do
	 cp -v --parents $i $dest
done
