# Tibco Spotfire One Click Support extension functionality for Tableau

## Using

### Loading of script
1. Add the script to the page header, e.g. `<script src="https;//some-host/one-click-support.js" async defer></script>`.
2. When script is loaded click on the button "One Click Support" to show a support form.

**Attention:**
The script adds a tag `<div id="one-click-support-root"></div>` to the end of body of the document. 


## Development

### Requirements
* Optional: Node Version Manager to switch between NodeJS versions (this item can be skipped if the proper NodeJS version is already installed). Check it with `nvm --version`
* NodeJS v8+. Check it with `node -v`
* Node Package Manager v5+. Check it with `npm -v`

### Installation of dependencies
1. Clone a repository: `git clone git@gitbud.epam.com:epm-eard/one-click-support-3.0.git`
2. Go to the cloned repository: `cd one-click-support-3.0`
3. Make sure that NodeJS version is right:
    * if NVM is installed choose necessary NodeJS version: e.g. `nvm use 8.11.1`
    * otherwise just check that the NodeJS version is 8+ with `node -v`
4. Install dependencies with Node Package Manager: `npm install`

### Build creation
1. Go to the repository: `cd one-click-support-3.0`
2. Run a build script: (e.g. `npm run build` - see the [table 1](#table-1) below) 
3. Go to a repository where the build is deployed: `cd dist-[tool-name-you-build-for]`
4. Copy all content of `dist-[tool-name-you-build-for]` to a server's repository

<a name="table-1"></a>**Table 1.** Commands for build creation

 NPM command                 | Description                                         | Repository build name
---------------------------- |---------------------------------------------------- | ---------------------
 npm run build               | Builds OCS bundle for Tableau (production version)  | dist-tableau
 npm run build-dev           | Builds OCS bundle for Tableau (development version) | dist-tableau


### Test on local server
1. Go to the repository: `cd one-click-support-3.0`
2. Start local server (e.g. `npm start` - see the [table 2](#table-2) below) 
3. Open <http://localhost:9091> (or a specific link from the [table 2](#table-2) below) where webpack dev server will be launched 



<a name="table-2"></a>**Table 2.** Commands for local server tests

 NPM command                 | Description                                    | Test link
---------------------------- |----------------------------------------------- | -----------------------------------------------
 npm start                   | Launches OCS local server for Tableau          | [Tableau](http://localhost:9091/tableau.html)

