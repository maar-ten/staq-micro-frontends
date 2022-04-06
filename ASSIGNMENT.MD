## Generate nx mono repo

`npx create-nx-workspace --preset=empty --name=mfe --nx-cloud false`

## Install nx cli

`npm install -g nx`

## Go to project directory

`cd mfe`

## Install nx angular

`npm install --save-dev @nrwl/angular`

## Add following to package.json

```json
"scripts": {
    "start": "nx serve",
+   "start:all": "nx run-many --target serve --all --parallel 6",
    "build": "nx build",
    "test": "nx test"
  },
```

## Create shell application

`nx g @nrwl/angular:app shell --mfe --mfeType=host --routing=true --skipTests --style=css --e2eTestRunner=none`

## Replace app.component.html with

```html
<ul>
  <li><a routerLink="/">Home</a></li>
  <li><a routerLink="/flights">Flights</a></li>
</ul>

<router-outlet></router-outlet>
```

## Delete nx-welcome.component.ts

## Replace app.module.ts with

```ts
import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";

import { AppComponent } from "./app.component";
import { RouterModule } from "@angular/router";

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    RouterModule.forRoot([], { initialNavigation: "enabledBlocking" }),
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
```

## Add this to styles.css

```css
/* You can add global styles to this file, and also import other style files */

body {
  padding-top: 80px;
  padding-left: 10px;
}
```

## Install nx nest

`npm install -D @nrwl/nest`

## Create nest application

`nx g @nrwl/nest:app backend --frontendProject shell`

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

# Starting point

We're going to add an authentication library that can be shared between our different applications as a direct dependency. For this we will use and nx web library.

## Install nx web

`npm install -D @nrwl/web`

## Generate auth library

`nx g @nrwl/web:lib auth --unitTestRunner none`

## Replace auth.ts with

```ts
class AuthenticationService {
  async login(username: string, password: string) {
    const res = await fetch("/api/login", {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      method: "POST",
      body: JSON.stringify({ username, password }),
    });
    const { token } = await res.json();
    localStorage.setItem("auth-token", token);
    localStorage.setItem("username", username);
  }

  public logout() {
    localStorage.removeItem("auth-token");
  }

  public isLoggedIn() {
    return localStorage.getItem("auth-token") != null;
  }

  public getUserName() {
    return localStorage.getItem("username");
  }
}

export const authService = new AuthenticationService();
```

## Create login application

`nx g @nrwl/angular:app login --mfe --mfeType=remote --port=4201 --host=shell --routing=true --skipTests --style=css --e2eTestRunner=none`

Note: We provided remote as the --mfeType. This tells the generator to create a Webpack configuration file that is ready to be consumed by a Host application.

Note: We provided 4201 as the --port. This helps when developing locally as it will tell the serve target to serve on a different port reducing the chance of multiple remote apps trying to run on the same port.

Note: We provided --host=shell as an option. This tells the generator that this remote app will be consumed by the Shell application. The generator will automatically link these two apps together in the webpack.config.js

Note: The RemoteEntryModule generated will be imported in app.module.ts file, however, it is not used in the AppModule itself. This it to allow TS to find the Module during compilation, allowing it to be included in the built bundle. This is required for the Module Federation Plugin to expose the Module correctly. You can choose to import the RemoteEntryModule in the AppModule if you wish, however, it is not necessary.

## Add FormsModule to entry.module.ts import list

```ts
import { RemoteEntryComponent } from './entry.component';
+   import { FormsModule } from '@angular/forms';

//

imports: [
    CommonModule,
+   FormsModule,
    RouterModule.forChild([
```

## Replace entry.component.ts with

```ts
import { Component } from "@angular/core";
import { Router } from "@angular/router";
import { authService } from "@mfe/auth";

@Component({
  selector: "mfe-login-entry",
  template: ` <h2>Login</h2>
    <form>
      <div>User Name:</div>
      <div><input name="userName" [(ngModel)]="userName" /><br /></div>
      <div>Password:</div>
      <div>
        <input name="userName" type="password" [(ngModel)]="password" /><br />
      </div>

      <div>
        <button (click)="login()">Login</button>
        <button (click)="logout()">Logout</button>
      </div>
    </form>`,
})
export class RemoteEntryComponent {
  constructor(private readonly router: Router) {}

  userName = "";
  password = "";

  async login() {
    await authService.login(this.userName, this.password);
    this.router.navigateByUrl("/");
  }

  logout(): void {
    authService.logout();
    this.router.navigateByUrl("/");
  }
}
```

If you open the shell on http://localhost:4200/login you should see the login component. You can also view the login application home page at http://localhost:4201. As you can see the remote application can run independently. Currently it is not using the login module itself, but it could do so without issues, as well as load in remote applications itself.

## Install Lit

`npm i lit`

## Create dashboard application

`nx g @nrwl/web:application dashboard --e2eTestRunner=none --unitTestRunner=none --style css`

## Replace app.element.ts with

```ts
import { LitElement, html } from "lit";
import { authService } from "@mfe/auth";

export class MFEDashboardElement extends LitElement {
  static properties = {
    count: { type: Number },
  };

  count = 0;

  protected render() {
    const isLoggedIn = authService.isLoggedIn();
    const user = authService.getUserName();

    if (isLoggedIn) {
      return html`
        <p>Welcome ${user}</p>
        <button @click=${this.logout}>Logout</button>
      `;
    }

    return html`<span>Welcome, please login <a href="/login">here</a>.</span>`;
  }

  private logout() {
    authService.logout();
    window.location.assign("/dashboard");
  }
}

customElements.define("mfe-dashboard", MFEDashboardElement);
```

## Change the dashboard project.json

```json
    "styles": ["apps/dashboard/src/styles.css"],
    "scripts": [],
 +  "webpackConfig": "apps/dashboard/webpack.config.js"

 ///

 "options": {
    "buildTarget": "dashboard:build",
+   "port": 4202,
 },
```

## Voeg aan de dashboard project root webpack.config.js toe

```js
const ModuleFederationPlugin = require("webpack/lib/container/ModuleFederationPlugin");
const { merge } = require("webpack-merge");

module.exports = (config) =>
  merge(config, {
    output: {
      uniqueName: "dashboard",
      publicPath: "auto",
    },
    optimization: {
      runtimeChunk: false,
    },
    experiments: {
      outputModule: true,
    },
    plugins: [
      new ModuleFederationPlugin({
        name: "dashboard",
        filename: "remoteEntry.js",
        exposes: {
          "./Module": "apps/dashboard/src/app/app.element.ts",
        },
        library: {
          type: "module",
        },
      }),
    ],
  });
```

## Voeg aan de dashboard project root webpack.prod.config.js toe

```js
module.exports = require("./webpack.config");
```

## Vervang de dashboard project index html met

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Dashboard</title>
    <base href="/" />

    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <link rel="icon" type="image/x-icon" href="favicon.ico" />
  </head>
  <body>
    <mfe-dashboard></mfe-dashboard>
  </body>
</html>
```

## Voeg aan de shell applicatie een remote toe aan de webpack.config.js

```js
    login: 'http://localhost:4201/remoteEntry.js',
+   dashboard: 'http://localhost:4202/remoteEntry.js'
```

We need to add a wrapper component for remote web components for angular.

## Update decl.d.ts in shell project

```ts
    declare module "login/Module";
+   declare module "dashboard/Module";
```

## Add web-component-container.component.ts to the shell application

```ts
import { Component, ViewChild, ElementRef, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";

@Component({
  selector: "mfe-web-component-container",
  template: "<div #container></div>",
})
export class WebComponentContainerComponent implements OnInit {
  @ViewChild("container", { static: true })
  container!: ElementRef;

  constructor(private readonly route: ActivatedRoute) {}

  async ngOnInit() {
    const { loadElement, elementName } = this.route.snapshot.data;

    await loadElement();

    const element = document.createElement(elementName);
    this.container.nativeElement?.appendChild(element);
  }
}
```

## Update the shell app module with this component and route for the dashboard

```ts
import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";

import { AppComponent } from "./app.component";
import { RouterModule } from "@angular/router";
import { WebComponentContainerComponent } from "./web-component-container.component";

@NgModule({
  declarations: [AppComponent, WebComponentContainerComponent],
  imports: [
    BrowserModule,
    RouterModule.forRoot(
      [
        {
          path: "login",
          loadChildren: () =>
            import("login/Module").then((m) => m.RemoteEntryModule),
        },
        {
          path: "**",
          component: WebComponentContainerComponent,
          data: {
            loadElement: () => import("dashboard/Module"),
            elementName: "mfe-dashboard",
          },
        },
      ],
      { initialNavigation: "enabledBlocking" }
    ),
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
```
