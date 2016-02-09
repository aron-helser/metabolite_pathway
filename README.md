# metabolite_pathway
Metabolic pathway visualization in an HTML5 canvas

Illustrates the workings of a metabolic pathway. 
- Metabolites or Substrates are contained in 'tanks' 
- A pipe connects neighboring tanks, representing a chemical reaction to produce a new substrate
- These reactions are always enabled by an enzyme, so the pipes are labeled with an enzyme.
- Handles on the pipe adjust the enzyme's affinity for the substrate and product, the energy barrier to overcome, and the concentration of the enzyme

Needed tools:
 - node.js and npm
 - Project files provided for Visual Studio Code

Resources used:
 - Angular 2.0 Typescript quickstart was used as a starting point, so Angular 2 and Typescript are the base language
 - RaphaelJS is used for SVG graphic manipulation in a canvas. 
 
 Startup:
 - Install node.js
 - In the node command shell, switch to the project directory
    - npm install
 - You may need to run the install multiple times
 - To see the current state and make changes:
   - npm start 
 - This starts a local webserver and launches your default browser, and
 - launches the typescript -> js compiler, which will watch for file changes, recompile, and reload the page in the browser. 
 
 Let me know if you have questions or suggestions, thanks!
 Aron Helser
 a.ronhelser at gmail
