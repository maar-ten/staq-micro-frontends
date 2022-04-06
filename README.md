# Micro frontends with Webpack Module Federation

- [Micro frontends with Webpack Module Federation](#micro-frontends-with-webpack-module-federation)
  - [What's inside](#whats-inside)
  - [Prerequisites](#prerequisites)
    - [On summercamp wifi](#on-summercamp-wifi)
  - [Get the code](#get-the-code)
  - [What We’ll Be Building](#what-well-be-building)
  - [Webpack Module Federation](#webpack-module-federation)
  - [Example](#example)
  - [How does Module Federation help?](#how-does-module-federation-help)
    - [Implementation of a host](#implementation-of-a-host)
    - [Implementation of the Remote](#implementation-of-the-remote)
  - [Module Federation with Angular](#module-federation-with-angular)
    - [The Shell (aka Host)](#the-shell-aka-host)
    - [Conclusion](#conclusion)
  - [Dynamic Module Federation with Angular](#dynamic-module-federation-with-angular)
    - [Module Federation Config](#module-federation-config)
    - [Routing to Dynamic Microfrontends](#routing-to-dynamic-microfrontends)
    - [Improvement for Dynamic Module Federation](#improvement-for-dynamic-module-federation)
    - [Bonus: Dynamic Routes for Dynamic Microfrontends](#bonus-dynamic-routes-for-dynamic-microfrontends)
    - [Conclusion](#conclusion-1)
  - [React](#react)
  - [Typescript](#typescript)
  - [Lit-element](#lit-element)
  - [Current state](#current-state)

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

### Implementation of a host

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

### Implementation of the Remote

The remote is also a standalone application. In the case considered here, it is based on Web Components:

```js
class Microfrontend1 extends HTMLElement {

    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    async connectedCallback() {
        this.shadowRoot.innerHTML = `[…]`;
    }
}

const elementName = 'microfrontend-one';
customElements.define(elementName, Microfrontend1);

export { elementName };
```

Instead of web components, any JavaScript constructs or components based on frameworks can also be used. In this case, the frameworks can be shared between the remotes and the host as shown.

The webpack configuration of the remote, which also uses the `ModuleFederationPlugin`, exports this component with the property exposes under the name component:

```js
 output: {
      publicPath: "http://localhost:3000/",
      uniqueName: 'mfe1',
      […]
 },
 […]
 plugins: [
    new ModuleFederationPlugin({
      name: "mfe1",
      library: { type: "var", name: "mfe1" },
      filename: "remoteEntry.js",
      exposes: {
        './component': "./mfe1/component"
      },
      shared: ["rxjs"]
    })
]
```

The name component refers to the corresponding file. In addition, this configuration defines the name `mfe1` for the remote. To access the remote, the host uses a path that consists of the two configured names, `mfe1` and `component`. This results in the instruction shown above:

```js
import('mfe1/component')
```

## Module Federation with Angular

> New to Angular? [Read the Angular introduction](./angular-intro.md)

We have shown how to use Module Federation to implement microfrontends. This part brings Angular into play and shows how to create an Angular-based microfrontend shell using the router to lazy load a separately compiled, and deployed microfrontend.

### The Shell (aka Host)

> New to Nx? [Read the Nx introduction](./nx-intro.md)

We are a [Micro Frontend with runtime integration](./micro-frontends.md#types-of-micro-frontends-build-loading-approaches)

Opdracht hier

### Conclusion

The implementation of micro frontends has so far involved numerous tricks and workarounds. Webpack Module Federation finally provides a simple and solid solution for this. To improve performance, libraries can be shared and strategies for dealing with incompatible versions can be configured.

It is also interesting that the micro frontends are loaded by Webpack under the hood. There is no trace of this in the source code of the host or the remote. This simplifies the use of module federation and the resulting source code, which does not require additional micro frontend frameworks.

However, this approach also puts more responsibility on the developers. For example, you have to ensure that the components that are only loaded at runtime and that were not yet known when compiling also interact as desired.

One also has to deal with possible version conflicts. For example, it is likely that components that were compiled with completely different Angular versions will not work together at runtime. Such cases must be avoided with conventions or at least recognized as early as possible with integration tests.

## Dynamic Module Federation with Angular

Assuming a more dynamic situation where the shell does not know the microfrontends or even their number upfront. Instead, this information is provided at runtime via a lookup service.

Plaatje?

For all microfrontends the shell gets informed about at runtime it displays a menu item. When clicking it, the microfrontend is loaded and displayed by the shell’s router.

### Module Federation Config

### Routing to Dynamic Microfrontends

### Improvement for Dynamic Module Federation

This was quite easy, wasn’t it? However, we can improve this solution a bit. Ideally, we load the remote entry upfront before Angular bootstraps. In this early phase, Module Federation tries to determine the highest compatible versions of all dependencies.

Let’s assume, the shell provides version 1.0.0 of a dependency (specifying ^1.0.0 in its package.json) and the micro frontend uses version 1.1.0 (specifying ^1.1.0 in its package.json). In this case, they would go with version 1.1.0. However, this is only possible if the remote’s entry is loaded upfront.

> versie mismatch uitleggen? hier, later, andere MD file of niet?

To achieve this goal, let’s use the helper function loadRemoteEntry in our `main.ts`

```ts
import { loadRemoteEntry } from '@angular-architects/module-federation';

Promise.all([
   loadRemoteEntry({type: 'module', remoteEntry: 'http://localhost:3000/remoteEntry.js'})
])
.catch(err => console.error('Error loading remote entries', err))
.then(() => import('./bootstrap'))
.catch(err => console.error(err));
```

Here, we need to remember, that the `@angular-architects/module-federation` plugin moves the contents of the original `main.ts` into the `bootstrap.ts` file. Also, it loads the `bootstrap.ts` with a dynamic import in the `main.ts`. This is necessary because the dynamic import gives _Module Federation_ the needed time to negotiate the versions of the shared libraries to use with all the remotes.

Also, loading the remote entry needs to happen before importing `bootstrap.ts` so that its metadata can be respected during the negotiation.

### Bonus: Dynamic Routes for Dynamic Microfrontends

Mogelijk idee om zelf te implementeren?

### Conclusion

Dynamic Module Federation provides more flexibility as it allows loading microfrontends we don’t have to know at compile time. We don’t even have to know their number upfront. This is possible because of the runtime API provided by webpack. To make using it a bit easier, the `@angular-architects/module-federation` plugin wrap it nicely into some convenience functions.

## React

> New to react? [Read the React introduction](./react-intro.md)

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
