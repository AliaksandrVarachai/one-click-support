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
4. To test locally the content of a **just sent report** open [bug-report](https://localhost:9091/bug-report.html)



<a name="table-2"></a>**Table 2.** Commands for local server tests

 NPM command                 | Description                                    | Test link
---------------------------- |----------------------------------------------- | -----------------------------------------------
 npm run server              | Launches proxy https server for Tableau        | [Tableau Proxy](https://localhost:9091)



## Tableau server configuration

### Injecting of OneClick Support script

#### Production

Assumptions:
- Tableau server is deployed on `ecsb00100f14.epam.com`
- External MicroStrategy server which stores the OCS javascript: `ecsb00100c96.epam.com`

Steps:
1. Open `ecsb00100c96.epam.com`
2. Copy `one-click-support.js` to `/Volumes/MicroStrategy`
3. Open `ecsb00100f14.epam.com`
4. Go to the folder `C:\Users\All Users\Tableau\Tableau Server\data\tabsvc\config` and add next lines to the config file `httpd.conf`:
    ```
    <VirtualHost *:443>
      <LocationMatch "^/$" >
        AddOutputFilterByType INFLATE;SUBSTITUTE;DEFLATE text/html
        Substitute "s|<\s*/\s*head\s*>|<script src=\"https://ecsb00100c96.epam.com:444/one-click-support.js\" async defer></script></head>|i"
      </LocationMatch>
    </VirtualHost>
    ```
5. Reload Tableau server
6. Login to [https://ecsb00100f14.epam.com](https://ecsb00100f14.epam.com/) to check OneClick Support application.

#### Development

The aim of the development is to __provide the loading of custom webpage configuration depending on client cookies__.

Assumptions:
- Tableau server is deployed on `ecsb00100f14.epam.com`
- OCS javascript is stored and requested from  Tableau server

Steps:
1. Open Tableau server `ecsb00100f14.epam.com`
2. Go to `C:\Program Files\Tableau\Tableau Server\10.3\vizportalclient\public\en\` add a `<script>` tag to the end of `<head>` tag of `vizportal.html` :
   ```
   <script src="/javascripts/api/one-click-support.js" async defer></script>
   ```
3. Go to `C:\Program Files\Tableau\Tableau Server\10.3\wgserver\public\javascripts\api\`:
   1. Save here **a common script for all users** with name `one-click-support.js`
   2. Create a new folder, e.g. `user_name`, and copy there **a custom script** `one-click-support.js` which will be loaded 
      **only for user with set cookie `test_ocs_path=test_ocs_path`**
4. Go to the folder `C:\Users\All Users\Tableau\Tableau Server\data\tabsvc\config` and edit a config file `httpd.conf`.  
   Add next configuration which reads a query parameter `test_ocs_path` and passes it through to cookie with the same name:
    ```
    RewriteCond %{REQUEST_URI} ^/$
    RewriteCond %{QUERY_STRING} !(?:^|&)test_ocs_path=([^&]+) [NC]
    RewriteRule .* - [CO=test_ocs_path:invalid:ecsb00100f14.epam.com:-1]
    
    RewriteCond %{REQUEST_URI} ^/$
    RewriteCond %{QUERY_STRING} (?:^|&)test_ocs_path=([^&]+) [NC]
    RewriteRule .* - [CO=test_ocs_path:%1:ecsb00100f14.epam.com:1440:/:true:true]
    
    RewriteCond %{REQUEST_URI} ^/javascripts/api/one-click-support.js$
    RewriteCond %{HTTP_COOKIE} "(?:^|;\ *)test_ocs_path=([^;]+)"
    RewriteRule .* /javascripts/api/%1/one-click-support.js [PT,NE]
    ```
5. Reload Tableau server
6. Login to [https://ecsb00100f14.epam.com](https://ecsb00100f14.epam.com/) to check OneClick Support application:
   1. Check **a common script** by link [https://ecsb00100f14.epam.com/#/signin](https://ecsb00100f14.epam.com/#/signin)
   2. Check **a custom script** just by adding of a query parameter `https://ecsb00100f14.epam.com/?test_ocs_path=user_name#/signin`
      relevant to the name of the previously created folder. (Note: the query string must precedence to the hash)

### Configuration of the server to proxy third-party images

Assumptions:
- Tableau server is deployed on `ecsb00100f14.epam.com`

Steps:
1. Open Tableau server `ecsb00100f14.epam.com`
2. Go to the folder `C:\Users\All Users\Tableau\Tableau Server\data\tabsvc\config` and edit a config file `httpd.conf`.  
   Add next configuration which proxies all requests to `/image-proxy?url=third-party-url-with-image`:
    ```
    RewriteMap unescape int:unescape
    RewriteCond %{REQUEST_URI} ^/image-proxy$
    # RewriteCond %{QUERY_STRING} "(?:^|&)url=([^&|$]+)" [NC]
    # RewriteRule .* ${unescape:%1} [P]
    # Fix of the untrusted SSL certificate problem
    RewriteCond %{QUERY_STRING} "(?:^|&)url=https%3A%2F%2F([^&|$]+)" [NC]
    RewriteRule .* http://${unescape:%1} [P]
    ```

