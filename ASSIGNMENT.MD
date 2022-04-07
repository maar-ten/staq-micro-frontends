## Generate nx mono repo

`npx create-nx-workspace@13.9.5 --preset=empty --name=mfe --nx-cloud false`

## Go to project directory

`cd mfe`

## Install nx angular

`npm install -D @nrwl/angular@13.9.5`

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

`npx nx g @nrwl/angular:app shell --mfe --mfeType=host --routing=true --skipTests --style=css --e2eTestRunner=none`

## Replace app.component.html with

```html
<ul>
  <li><a routerLink="/">Home</a></li>
  <li><a routerLink="/flights">Flights</a></li>
</ul>

<router-outlet></router-outlet>
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

# Starting point

We're going to add an authentication library that can be shared between our different applications as a direct dependency. For this we will use and nx web library.

## Install nx web

`npm install -D @nrwl/web@13.9.5`

## Generate auth library

`npx nx g @nrwl/web:lib auth --unitTestRunner=none`

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

`npx nx g @nrwl/angular:app login --mfe --mfeType=remote --port=4201 --host=shell --routing=true --skipTests --style=css --e2eTestRunner=none`

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

`npm i lit@2.2.1`

## Create dashboard application

`npx nx g @nrwl/web:application dashboard --e2eTestRunner=none --unitTestRunner=none --style css`

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
+   "port": 4202
 },
```

## Voeg aan de dashboard project root een webpack.config.js toe

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

## Update decl.d.ts in shell project

```ts
    declare module "login/Module";
+   declare module "dashboard/Module";
```

We need to add a wrapper component for remote web components for angular.

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

# Add react flights application

## Install nx react library

`npm install -D @nrwl/react@13.9.5`

## Generate react application

`npx nx g @nrwl/react:app flights --e2eTestRunner=none --routing=true --style=css --unitTestRunner=none`

## Update react project.json

```json
    "styles": ["apps/flights/src/styles.css"],
    "scripts": [],
 +  "webpackConfig": "apps/flights/webpack.config.js"

 ///

 "options": {
    "buildTarget": "flights:build",
+   "port": 4203,
 },
```

## Replace app.tsx with

```ts
import { authService } from "@mfe/auth";
import { useState } from "react";
import { BrowserRouter, Link, Route } from "react-router-dom";

export function Home() {
  const [username] = useState(authService.getUserName());

  return (
    <>
      <h1>Welcome, {username}!</h1>

      <p>
        <Link to="/search">Search flights.</Link>
      </p>
    </>
  );
}

export function Search() {
  const [state, setState] = useState<
    {
      date: string;
      departure: string;
      arrival: string;
      price: number;
    }[]
  >([]);
  const getFlights = () => {
    fetch("api/flights")
      .then((res) => res.json())
      .then((flights) => setState(flights));
  };

  return (
    <div className="container">
      <h1>Flights</h1>
      <div className="row g-2 align-items-center">
        <div className="col-auto">
          <input className="form-control" type="text" placeholder="From" />
        </div>
        <div className="col-auto">
          <input type="text" className="form-control" placeholder="To" />
        </div>
      </div>
      <div className="mt-3">
        <button
          onClick={() => getFlights()}
          type="button"
          className="btn btn-primary"
        >
          Search
        </button>
      </div>

      {state.length > 0 && (
        <table className="table">
          <thead>
            <tr>
              <th scope="col">#</th>
              <th scope="col">Date</th>
              <th scope="col">Departure</th>
              <th scope="col">Arrival</th>
              <th scope="col">Price</th>
            </tr>
          </thead>
          <tbody>
            {state.map((s, i) => (
              <tr key={s.date}>
                <th scope="row">{i}</th>
                <td>{dateFormat(s.date)}</td>
                <td>{s.departure}</td>
                <td>{s.arrival}</td>
                <td>{numberFormat(s.price)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

const numberFormat = (value: number) =>
  new Intl.NumberFormat("nl-NL", {
    style: "currency",
    currency: "EUR",
  }).format(value);

const dateFormat = (value: string) =>
  new Intl.DateTimeFormat("nl-NL").format(new Date(value));

export function App({ rootUrl = "" }) {
  return (
    <BrowserRouter basename={rootUrl}>
      <Route path="/" exact render={() => <Home />} />
      <Route path="/search" exact render={() => <Search />} />
    </BrowserRouter>
  );
}

export default App;
```

## Voeg webpack.config.js toe aan react root

```js
const ModuleFederationPlugin = require("webpack/lib/container/ModuleFederationPlugin");
const mf = require("@angular-architects/module-federation/webpack");
const reactConfig = require("@nrwl/react/plugins/webpack");
const { merge } = require("webpack-merge");

module.exports = (config) => {
  config = reactConfig(config);
  return merge(config, {
    output: {
      uniqueName: "flights",
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
        name: "flights",
        filename: "remoteEntry.js",
        exposes: {
          "./Module": "apps/flights/src/app/app.tsx",
        },
        library: {
          type: "module",
        },
        shared: mf.share({
          react: {
            singleton: true,
            strictVersion: true,
            requiredVersion: "auto",
            includeSecondaries: true,
          },
          "react-dom": {
            singleton: true,
            strictVersion: true,
            requiredVersion: "auto",
            includeSecondaries: true,
          },
          "react-router-dom": {
            singleton: true,
            strictVersion: true,
            requiredVersion: "auto",
            includeSecondaries: true,
          },
        }),
      }),
    ],
  });
};
```

## Voeg een webpack.prod.config.js toe aan react application root

```js
module.exports = require("./webpack.config");
```

## Voeg aan de shell applicatie een remote toe aan de webpack.config.js

```js
    login: 'http://localhost:4201/remoteEntry.js',
    dashboard: 'http://localhost:4202/remoteEntry.js',
+   flights: 'http://localhost:4203/remoteEntry.js'
```

## Update decl.d.ts in shell project

```ts
    declare module "login/Module";
    declare module "dashboard/Module";
+   declare module "flights/Module";
```

## Add react-component-container.component.ts

```ts
import { Component, ElementRef, OnInit, ViewChild } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import * as React from "react";
import * as ReactDOM from "react-dom";

@Component({
  selector: "mfe-react-component-container",
  template: "<div #container></div>",
})
export class ReactContainerComponent implements OnInit {
  @ViewChild("container", { static: true })
  container!: ElementRef;

  constructor(private readonly route: ActivatedRoute) {}

  async ngOnInit() {
    const { loadElement, rootUrl } = this.route.snapshot.data;
    const element = await loadElement();

    const reactELement = React.createElement(element.default, { rootUrl });
    ReactDOM.render(reactELement, this.container.nativeElement);
  }
}
```

## Replace app.module.ts with the following

```ts
import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";

import { AppComponent } from "./app.component";
import { RouterModule } from "@angular/router";
import { WebComponentContainerComponent } from "./web-component-container.component";
import { ReactContainerComponent } from "./react-component-container.component";

@NgModule({
  declarations: [
    AppComponent,
    WebComponentContainerComponent,
    ReactContainerComponent,
  ],
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
          path: "flights",
          children: [
            {
              path: "**",
              component: ReactContainerComponent,
              data: {
                loadElement: () => import("flights/Module"),
                rootUrl: "/flights",
              },
            },
          ],
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

## Voeg het volgende toe aan de share lijst van de shell webpack.config.js

```js
{
//
  react: {
    singleton: true,
    strictVersion: true,
    requiredVersion: 'auto',
    includeSecondaries: true,
  },
  'react-dom': {
    singleton: true,
    strictVersion: true,
    requiredVersion: 'auto',
    includeSecondaries: true,
  },
  'react-router-dom': {
    singleton: true,
    strictVersion: true,
    requiredVersion: 'auto',
    includeSecondaries: true,
  },
}
```
