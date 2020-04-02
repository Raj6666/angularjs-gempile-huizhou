# Gempile Frontend

### Introduction
This is a AngularJS frontend project built by Gulp, Webpack2 and Babel.

### Code Style

It's highly recommended to use a IDE or tool to restrict the code style by `.editorconfig` and `.eslintrc.json`.

### Build & Run

> Note : It's time to use [Yarn](https://yarnpkg.com/) instead of origin npm to manage the dependencies.

1. Switch the directory to `gempile-in-web`
2. Run `npm i -g yarn webpack eslint gulp serve` 
3. Run `yarn` to install dependencies of project
4. Run `npm start` to begin development on [`localhost:8081`](http:\\localhost:8081) with live-reload ( Since the refactor is still going on , the changes in views only causes a copy operation from `src/views` to `build` without live-reload)
5. Run `npm run build` to build the project into `/gempile-in-web/build/app`
6. Run `serve -p 9000` to start a simple serve in `build/app` on [`localhost:9000`](http:\\localhost:9000)
7. Change the configuration in these files before the project is deployed.for example,'index.html','ApisConfig.js',
'TopNav.js','LoginController.js'

