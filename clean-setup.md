# Clean setup

Nx commands and code used to setup the current checkout.

## Generate nx mono repo

`npx create-nx-workspace@13.9.5 --preset=empty --name=mfe --nx-cloud false`

## Go to project directory

`cd mfe`

## Install nx angular

`npm install -D @nrwl/angular@13.9.5`

## Add following to package.json

We will add a start all script the package json that we can use to launch all applications and shut down easily.

```diff
"scripts": {
    "start": "nx serve",
+   "start:all": "nx run-many --target serve --all --parallel 6",
    "build": "nx build",
    "test": "nx test"
  },
```

## Create shell application

`npx nx g @nrwl/angular:app shell --mfe --mfeType=host --routing=true --skipTests --style=css --e2eTestRunner=none`

## Replace app.component.html with

```html
<ul>
  <li><img src="../assets/angular.png" width="50" /></li>
  <li><a routerLink="/">Home</a></li>
  <li><a routerLink="/flights">Flights</a></li>
</ul>

<router-outlet></router-outlet>
```

## Update app.component.css with

```css
ul {
  list-style-type: none;
  margin: 0;
  padding: 0;
  overflow: hidden;
  background-color: #333;

  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
}

li {
  float: left;
  height: 50px;
  margin-top: auto;
  margin-bottom: auto;
}

li a {
  display: block;
  color: white;
  text-align: center;
  padding: 14px 16px;
  text-decoration: none;
  cursor: pointer;
}

li a:hover {
  background-color: #111;
}
```

## Add this to styles.css

```css
/* You can add global styles to this file, and also import other style files */

body {
  padding-top: 80px;
  padding-left: 10px;
}
```

## Update index.html head with this style sheet

```html
<link
  href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css"
  rel="stylesheet"
  integrity="sha384-1BmE4kWBq78iYhFldvKuhfTAU6auU8tT94WrHftjDbrCEXSU1oBoqyl2QvZ6jIW3"
  crossorigin="anonymous"
/>
```

## Install nx nest

`npm install -D @nrwl/nest@13.9.5`

## Create nest application

`npx nx g @nrwl/nest:app backend --frontendProject shell`

## Replace app.controller.ts with following

```ts
import { Controller, Get, Post } from "@nestjs/common";
import { AppService } from "./app.service";

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get("/flights")
  getData() {
    return this.appService.getData();
  }

  @Post("/login")
  login() {
    return this.appService.login();
  }
}
```

## Replace app.service.ts with the following

```ts
import { Injectable } from "@nestjs/common";

@Injectable()
export class AppService {
  getData() {
    return [
      { date: "2022-03-04", departure: "13:00", arrival: "17:00", price: 500 },
      { date: "2022-03-04", departure: "15:00", arrival: "19:00", price: 550 },
    ];
  }

  login() {
    return { token: "abcd" };
  }
}
```
