# Packages
| Package | Description |
| - | - |
|<img src="./doc/icons/firebase-48.png" width="48"/><br>firebase| v8, DB And Serverless|
|<img src="./doc/icons/nodejs-48.png" width="48"/><br>node| v14, Server Side|
|<img src="./doc/icons/react-60.png" width="48"/><br>react| v17, Web Framework |
|<img src="./doc/icons/bootstrap-48.png" width="48"/><br>bootstrap| v5, CSS Framework|
|<img src="./doc/icons/sweetalert.png" width="48"/><br>sweetalert2| Modal, Input Form|
|moment|Time Format|
|cypress|E2E Test|

# Run
- FrontEnd : React
  ```
  npm run start
  ```
  http://localhost:8900/
- BackEnd : Firebase Emulator
  ```
  npm run e:start
  ```
  http://localhost:8000/

# Deploy
- All : ```firebase deploy```
- Only Front End
  - prod : ```firebase deploy --only hosting:prod```
  - stage : ```firebase deploy --only hosting:stage```
- Only Functions
  - ```firebase deploy --only functions```

# Pages
## Animation Gallery
<img src="./doc/images/animations.png" width="100%"/>

# Link
https://ani-canvas.art/
