# Micro frontends with Webpack Module Federation

## What's inside

- A starter frontend Angular app powered by [Nx.dev](https://nx.dev/).
- HTTP api's with [Nest.js](https://nestjs.com/).
- Web components with [lit-element](https://lit.dev/)
- Web application with [React](https://reactjs.org/)

Let's get started!

## Prerequisites

- vscode / webstorm
- node 14, npm 6

### On summercamp wifi

> Use when network/wifi is slow/unstable

On the summercamp network there is a nexus server with the node packages already cached. To make use of the cache rename the following files:

- `./assignment/.npmrc.summercamp` to `./assignment/.npmrc`
  - shell: `mv ./assignment/.npmrc.summercamp ./assignment/.npmrc`
- `./assignment/package-lock.json.summercamp` to `./assignment/package-lock.json`
  - shell: `rm -f ./assignment/package-lock.json && mv ./assignment/package-lock.json.summercamp ./assignment/package-lock.json`

## Get the code

```sh
git clone https://staquser:St4q2022!@git.quintor.nl/staq/staq-2022-micro-frontends.git
cd staq-2022-micro-frontends/assignment
npm install
npm run start:all
```

Open <http://127.0.0.1:4200> in a browser. You should see a black menu bar.

## What We’ll Be Building

For this workshop, we’ll be building a simple app that the user can login and search for flight information. The data will be supplied by NextJS HTTP API's we already supplied. The login page is an Angular Application. The flights page is a React Application. The Dashboard is a lit-element component.

![Homepage](./images/dashbord.png)
_Angular Shell met lit-element dashbord_

![Login](./images/login.png)
_Angular app login_

![Flights](./images/flights.png)
_React app flights_

## Webpack Module Federation

> New to Webpack? [Read the Webpack introduction](./webpack-intro.md)

The Module Federation integrated in Webpack beginning with version 5 allows the loading of separately compiled program parts. Hence, it finally provides an official solution for the implementation of micro frontends.

> New to micro frontends? [Read micro frontends architecture](./micro-frontends.md)

Until now, when implementing micro frontends, you had to dig a little into the bag of tricks. One reason is surely that current build tools and frameworks do not know this concept. Module Federation initiates a change of course here.

It allows an approach called Module Federation for referencing program parts that are not yet known at compile time. These can be self-compiled micro frontends. In addition, the individual program parts can share libraries with each other, so that the individual bundles do not contain any duplicates.

For a more detailed explanation [read Module Federation Concepts](./module-federation.md)

## Example

The example used here consists of a shell, which is able to load individual, separately provided micro frontends if required:

![Shell](./images/shell.png)
_Shell_

The shell is represented here by the black navigation bar. The micro front end through the framed area shown below. Also, the microfrontend can also be started without a shell

![Flights](./images/flights.png)
_app flights_

This is necessary to enable separate development and testing. It can also be advantageous for weaker clients, such as mobile devices, to only have to load the required program part.

## How does Module Federation help?

In the past, the implementation of scenarios like the one shown here was difficult, especially since tools like **Webpack assume** that the **entire program code is available when compiling**. Lazy loading is possible, but only from areas that were split off during compilation.

With micro frontend architectures, in particular, one would like to compile and provide the individual program parts separately. In addition, mutual referencing via the respective URL is necessary. Hence, constructs like this would be desirable:

```js
import('http://other-microfrontend');
```

Since this is not possible for the reasons mentioned, one had to resort to approaches such as [externals](https://webpack.js.org/configuration/externals/) and manual script loading. Fortunately, this will change with the Federation module in Webpack 5.

The idea behind it is simple: A so-called _host_ references a _remote_ using a configured name. What this name refers to **is not known at compile time**:

![host remote](./images/host-remote.webp)

This reference is only _resolved at runtime by loading a so-called remote entry point_. It is a _minimal script_ that provides the actual external url for such a configured name.

## Implementation of a host

The _host_ is a JavaScript application that loads a remote when needed. A dynamic import is used for this.

The following host loads the component `mfe1/component` in this way, `mfe1` is the name of a configured remote and `component` the name of a file (an ES module) it provides.

```js
const rxjs = await import('rxjs');

const container = document.getElementById('container');
const flightsLink = document.getElementById('flights');

rxjs.fromEvent(flightsLink, 'click').subscribe(async _ => {
    const module = await import('mfe1/component');
    const elm = document.createElement(module.elementName);
    […]    
    container.appendChild(elm);
});
```

Webpack would normally take this reference into account when compiling and split off a separate bundle for it. To prevent this, the `ModuleFederationPlugin` is used:

```js
const ModuleFederationPlugin = require("webpack/lib/container/ModuleFederationPlugin");

[…]
 output: {
      publicPath: "http://localhost:5000/",
      uniqueName: 'shell',
      […]
 },
plugins: [
  new ModuleFederationPlugin({
    name: "shell",
    library: { type: "var", name: "shell" },
    remoteType: "var",
    remotes: {
      mfe1: "mfe1"
    },
    shared: ["rxjs"]
  })
]
```

With its help, the remote `mfe1` (Microfrontend 1) is defined. The configuration shown here maps the internal application name `mfe1` to the same official name. Webpack **does not include** any `import` that now relates to mfe1 in **the bundles generated at compile time**.

Libraries that the host should share with the remotes are mentioned in the shared array. In the case shown, this is `rxjs`. This means that the entire application only needs to load this library once. Without this specification, `rxjs` would end up in the bundles of the host as well as those of all remotes.

For this to work without problems, the host and remote must agree on a common version.

In addition to the settings for the `ModuleFederationPlugin`, we also need to place some `options` in the output section. The `publicPath` defines the URL under which the application can later be found. This reveals where the individual bundles of the application but also their assets, e.g. pictures or styles, can be found.

The `uniqueName` is used to represents the host or remote in the generated bundles. By default, webpack uses the name from `package.json` for this. In order to avoid name conflicts when using Monorepos with several applications, it is recommended to set the `uniqueName` manually.

> New to Mono repos? [Read the Monorepo introduction](./monorepo-intro.md)

## Implementation of the Remote

Todo

## Angular

> New to Angular? [Read the Angular introduction](./angular-intro.md)

## React

> New to react? [Read the React introduction](./react-intro.md)

## Nx

> New to Nx? [Read the Nx introduction](./nx-intro.md)

## Webpack

> New to Webpack? [Read the Webpack introduction](./webpack-intro.md)

## Typescript

> New to Typescript? [Read the Typescript introduction](./typescript-intro.md)

## Lit-element

> New to lit-element? [Read the Lit-element introduction](./lit-intro.md)

## Current state

Angular -> <https://angular.io/guide/roadmap#investigate-micro-frontend-architecture-for-scalable-development-processes>

- angular als shell?
- angular niet als shell maakt routing en zone lastiger
React -> react 17: <https://reactjs.org/docs/web-components.html>, react 18 mogelijk web component support, preact heeft wel support
Vue -> Zie hier nog geen problemen.
Lit-element -> geen problemen.

## Types of micro frontends

<table>
<tbody><tr><td><b>Micro Frontend build / loading approaches</b></td>
<td><b>Frontend Monolith</b></span></td>
<td><b>Micro Frontend with Build-time Integration</b></td>
<td><b>Micro Frontend with runtime integration</b></td>
</tr><tr><td><b>Integration Approach</b></td>
<td>No integration. One code repository with everything in it.</td>
<td>A root application that npm installs on each of the web applications</td>
<td>A root application that dynamically loads each independently deployed web applications</td>
</tr><tr><td><b>Difficulty to set up</b></td>
<td>Easy</td>
<td>Medium</td>
<td>Advanced</td>
</tr><tr><td><b>Separate code repositories</b></td>
<td>No</td>
<td>No</td>
<td>Yes or No</td>
</tr><tr><td><b>Separate builds</b></td>
<td>No</td>
<td>Yes</td>
<td>Yes</td>
</tr><tr><td><b>Separate deployments</b></td>
<td>No</td>
<td>Yes</td>
<td>Yes</td>
</tr><tr><td><b>Advantages</b></td>
<td>Simple</td>
<td>Each web application can be built separately before publishing to npm</td>
<td>Supports an independent Micro Frontend deployment and release without any dependencies. Incredibly scalable.</td>
</tr><tr><td><b>Disadvantages</b></td>
<td>Slow build because every piece moves at the speed of the slowest part. Deployments are all tied together</td>
<td>Root application needs to reinstall, rebuild, and redeploy whenever one of the web applications changes.</td>
<td>Requires knowledge of the relationship between the web app shell (container app) and the Micro Frontends that will be consumed by web app shell.</td>
</tr></tbody></table>
