## Generate nx mono repo

`npx create-nx-workspace@13.9.5 --preset=empty --name=mfe --nx-cloud false`

## Go to project directory

`cd mfe`

## Install nx angular

`npm install -D @nrwl/angular@13.9.5`

## Add following to package.json

We will add a start all script the package json that we can use to launch all applications and shut down easily.

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

# Starting point

When you open the app now you see a top menu bar, but there is nothing assinged to the application routs.

We're going to add an authentication library that can be shared between our different applications as a direct dependency. For this we will use an nx web library.

## Install nx web

`npm install -D @nrwl/web@13.9.5`

## Generate auth library

`npx nx g @nrwl/web:lib auth --unitTestRunner=none`

## Replace auth.ts with

We will create a simple (very insecure) authentication service containing 4 functions: `login`, `logout`, `isLoggedIn` and `getUserName`. For login it used the `/api/login` endpoint of our nestjs backend. For keeping login details between refreshes in uses `localStorage`.

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

Next we are going to add a login application. This will be an angular remote application that will expose a login form as an external. For this application the NX cli will do the heavy lifting with generating and updating webpack configurations, later on we will do this ourselves.

Run the following command to generate the application.

`npx nx g @nrwl/angular:app login --mfe --mfeType=remote --port=4201 --host=shell --routing=true --skipTests --style=css --e2eTestRunner=none`

Note: We provided remote as the --mfeType. This tells the generator to create a Webpack configuration file that is ready to be consumed by a Host application.

Note: We provided 4201 as the --port. This helps when developing locally as it will tell the serve target to serve on a different port reducing the chance of multiple remote apps trying to run on the same port.

Note: We provided --host=shell as an option. This tells the generator that this remote app will be consumed by the Shell application. The generator will automatically link these two apps together in the webpack.config.js

Note: The RemoteEntryModule generated will be imported in app.module.ts file, however, it is not used in the AppModule itself. This it to allow TS to find the Module during compilation, allowing it to be included in the built bundle. This is required for the Module Federation Plugin to expose the Module correctly. You can choose to import the RemoteEntryModule in the AppModule if you wish, however, it is not necessary.

## Add FormsModule to entry.module.ts import list in the login application

For the login form we will need the angular forms module, this provides us with two way data binding via the `ngModel` attribute. For further information you can read [here](https://angular.io/guide/forms-overview).

When logging in the authentication service we made in earlier is used to login, after logging in the component uses the angular router to navigate us back to the root url.

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
  template: `
    <section class="container">
      <header><h1>Login</h1></header>

      <form #loginForm="ngForm" (ngSubmit)="login()">
        <div class="mb-3">
          <label for="username" class="form-label">Username</label>
          <input
            name="username"
            type="text"
            [(ngModel)]="userName"
            class="form-control"
            id="username"
          />
        </div>
        <div class="mb-3">
          <label for="password" class="form-label">Password</label>
          <input
            name="password"
            type="password"
            class="form-control"
            id="password"
            [(ngModel)]="password"
            aria-describedby="passwordHelp"
          />
          <div id="passwordHelp" class="form-text">
            We'll never share your password with anyone else. 🤞
          </div>
        </div>
        <button type="submit" class="btn btn-primary">Submit</button>
        <button type="button" class="btn btn-danger" (click)="logout()">
          Logout
        </button>
      </form>
    </section>
  `,
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

If you now start the application with `npm run start:all` and open the shell on http://localhost:4200/login you should see the login component in the shell. You can also view the login application home page at http://localhost:4201. As you can see the remote application can run independently. Currently it is not using the login component itself, but it could do so without issues, both exposing a module and consuming it.

# Add a web component based dashboard

In the next section we will add a web component based application, using the lit libary to simplify the creation of web components.

## Install Lit

`npm i lit@2.2.1`

## Create dashboard application

This will generate a new basic web application in the `apps` directory.

`npx nx g @nrwl/web:application dashboard --e2eTestRunner=none --unitTestRunner=none --style css`

## Create a dashboard web component

Here we will add a component that the user will see at the root url of the application. The goal is that the user sees something else depending on if he is logged in or not. We will use the authService we created earlier for this.

You can replace the content of app.element.ts with the following, note that the component registers itself whenever we import it with `customElements.define("mfe-dashboard", MFEDashboardElement);`

```ts
import { LitElement, html } from "lit";
import { authService } from "@mfe/auth";

export class MFEDashboardElement extends LitElement {
  protected render() {
    const isLoggedIn = authService.isLoggedIn();
    const user = authService.getUserName();

    if (isLoggedIn) {
      return html`
        <section class="container">
          <header>
            <h1>Welcome, ${user}!</h1>
          </header>
          <mfe-current-weather class="mt-3 mb-3"></mfe-current-weather>
          <footer>
            <button type="button" class="btn btn-primary" @click=${this.logout}>
              Logout
            </button>
          </footer>
        </section>
      `;
    }

    return html`<section class="container">
      <header>
        <h1>Welcome</h1>
      </header>
      <p>
        Please login
        <a href="/login" class="link-primary">on the login page</a>.
      </p>
    </section>`;
  }

  private logout() {
    authService.logout();
    window.location.assign("/");
  }

  createRenderRoot() {
    /**
     * Render template without shadow DOM. Note that shadow DOM features like
     * encapsulated CSS and slots are unavailable.
     */
    return this;
  }
}

customElements.define("mfe-dashboard", MFEDashboardElement);
```

## Change the dashboard project.json

We have to change some configuration options in the project.json, telling it to use the custom webpack configuration we are about to add in order to support Module Federation, as well as change the serve port so it doesn't conflict with the other applications.

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

## Add a custom webpack configuration

Next we will a custom webpack configuration to the dashboard application. Unlike the Angular application nx doesn't give the option to automatically configure module federation for you.

Add a `webpack.config.js` file to the root of the dashboard application and add the following to it:

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

The `publicPath` attribute is so that applications using the dashboard as a remote know the root url to request resources from. `auto` lets webpack determine this. `optimization` and `experiments` are both required for Module federation to work. The ModuleFederationPlugin is configured similarly to the Angular application ModuleFederationPlugin, but instead of a `remotes` section, it has an `exposes` section.
If you remember when adding the `login` application, in the shell application routes we used `import('login/Module')`. The `Module` section of that is determined here, if we change the exposes to for example `"./App"`, applications importing it would have to use `import('login/App')`.
An application can expose as many modules as it wants here, and these can be seperately imported in consuming applications.

## Update de dashboard project index html

Currently it has and `mfe-root` component in the body from the generated boilerplate, this should be changed to `mfe-dashboard`.

```html
<body>
  <mfe-dashboard></mfe-dashboard>
</body>
```

## Add a remote for the dashboard to the shell application

Now that we have added the dashboard application, we need to let the shell application know about it. We will start by adding it to the remotes list in the shell's webpack.config.js

```js
    login: 'http://localhost:4201/remoteEntry.js',
+   dashboard: 'http://localhost:4202/remoteEntry.js'
```

## Let typescript know about the remote in the shell application

In order for typescript to not complain about an import path it doesn't know about, we have to declare the module path in the shell applications `decl.d.ts` file. If we don't do this the typescript compiler will complain when we try and use `import('dashboard/Module')`. The declaration for the login app was automatically generated by the nx cli when we generated the login application, this is currently only possible with angular applications.

```ts
    declare module "login/Module";
+   declare module "dashboard/Module";
```

We need to add a wrapper component for remote web components for angular.

## Add a remote web component wrapper to the shell application

We now need a way for the shell application to load remote web components. The are multiple ways you could go about this, but for the purposes of this workshop we will create a reusable angular component that gets as input the function to load the remote application, and the tag name of the web component. Because the webcomponent registers itself we then only have use `document.createElement` to create the web component and append it to a wrapper div element.
The way the component receives this information is through data passed in by the route. It will become more clear what we are doing here in the next step when we update the app module of the shell with the dashboard route.

For now, create a file called `web-component-container.component.ts` in the same directory as `app.module.ts` in the shell application with the following content.

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

## Add the dashboard route to the shell application module

Finally, we have to add a route to the shell application which will display the remote dashboard component. Make juse to add the `WebComponentContainerComponent` to the `imports`, and the `declarations` list.

Next add the following route to the same array the login route is in. The `path` tells angular it should only match this route to the root url. The `component` indicats which component Angular should render on this route.

Finally, whatever we add into the `data` property, is accessable in the component through the `ActivatedRoute` snapshot data. As you can see the names match those that we used in the component in the previous step. `loadElement` is a function that returns a dynamic import of the remote application. `elementName` matches the one we registered in the dashboard applications `app.element.ts` file with `customElements.define('mfe-dashboard', MFEDashboardElement);`.

```ts
{
  path: "",
  component: WebComponentContainerComponent,
  data: {
    loadElement: () => import("dashboard/Module"),
    elementName: "mfe-dashboard",
  },
},
```

After these changes the app.module.ts file in the shell application should look like this.

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
          path: "",
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

# Add flight information application using react

For the next section we will use react to create a flights page, where logged in users will be able to search for flight information. We will add multiple routes to this application in order to demonstrate this is possible to use routing from other library routing, and also to demonstrate some of the issues you might run into.

## Install nx react library

`npm install -D @nrwl/react@13.9.5`

## Generate react application

This will generate a react application called flights in the `apps` directory.

`npx nx g @nrwl/react:app flights --e2eTestRunner=none --routing=true --style=css --unitTestRunner=none`

## Add a flights and flight search component

Next we will add a flights home page and seach page. We will use `react-router-dom` to define the routes and render either `Search` or `Home` component based on that. If you notice in the `App` component, we pass in the rootUrl, the that the remote does not need to know what base url it will be hosted on, while still being able to define it's own routes.

You can replace the flights applications app.tsx with the following.

```tsx
import { BrowserRouter } from "react-router-dom";
import { Route, Link } from "react-router-dom";
import { useState, lazy, Suspense } from "react";
import { authService } from "@mfe/auth";

export function Home() {
  const [username] = useState(authService.getUserName());

  return (
    <section className="container">
      <header>
        <h1>Welcome, {username}!</h1>
      </header>

      <footer>
        <Link to="/search">Search flights.</Link>
      </footer>
    </section>
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
    <section className="container">
      <header>
        <h1>Flights</h1>
      </header>
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
              <tr key={s.date + s.departure + s.arrival}>
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
    </section>
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

## Update react project.json

For the same reasons as the dashboard application, we need to change the project.json of the flights application to give it it's own port and use our custom webpack config. A difference is that react comes default with it's own webpack config, we also have to disable hrm as this does not play nicely with module federation. The application will run fine until you update something and then crash with an HMR error.

```json
    "styles": ["apps/flights/src/styles.css"],
    "scripts": [],
 -  "webpackConfig": "@nrwl/react/plugins/webpack"
 +  "webpackConfig": "apps/flights/webpack.config.js"

 ///

 "options": {
    "buildTarget": "flights:build",
-   "hmr": true,
+   "port": 4203
 },
```

## Add a custom webpack configuration

Just as with the dashboard application we have to add a custom webpack configuration to the react application root directory. The main differences with the dashboard application is that we have to also use the webpack configuration overrides provided for react by nx, and that we need to declare the dependencies we want to share with the shell application.

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

## Add the flights remote to the shell application

```js
    login: 'http://localhost:4201/remoteEntry.js',
    dashboard: 'http://localhost:4202/remoteEntry.js',
+   flights: 'http://localhost:4203/remoteEntry.js'
```

## Let typescript know about the flights remote

```ts
    declare module "login/Module";
    declare module "dashboard/Module";
+   declare module "flights/Module";
```

## Add a remote react wrapper to the shell application

We now need a way for the shell application to load remote react components. The are multiple ways you could go about this, but for the purposes of this workshop we will create a reusable angular component that gets as input the function to load the remote react component, as well as the route url.
We will then use `React.createElement` to create the element loaded from the remote, and `ReactDOM.render` to render it into a a container div in the angular component. When we create the component we pass in the rootUrl which we use in the remote react component as the root for the router.

Create a file called `react-component-container.component.ts` in the same directory as `app.module.ts` in the shell application with the following content.

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

## Add the flights route to the shell application module

Next we will add the flights route to the shell application. Make sure you add the `ReactContainerComponent` to the `imports` and the `declarations` list. Now add the following route.

```ts
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
```

This route is slightly different from the web component one because we want React to handle all the subroutes of `flights`. To do this, we register the path `flights`, with a children array with a single catch all path (all routes starting with flights), and tell it to render a `ReactContainerComponent` there. Similar to the web component wrapper we pass the information to load the component via data.

After adding this route the shell application `app.module.ts` should look like this.

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

## Add react shared dependencies to shell application webpack configuration.

If you try and start the application now, you will see that it will build, but when you go to the flights route you will see an error in the console from the react component that you cannot use hooks because there are multiple versions of react loaded.

In order to fix this we have to add the following items to the shared list of the module federation plugin in the shell application, without this, module federation does not know how to resolve the shared dependencies. If you look you will see we already did this in the react application webpack configuration.

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

After this is added, the flights route should work!.
