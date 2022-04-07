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
    - [Your mission, if you choose to accept it](#your-mission-if-you-choose-to-accept-it)
    - [Conclusion](#conclusion)
  - [Dynamic Module Federation](#dynamic-module-federation)
  - [Getting Out of Version-Mismatch-Hell with Module Federation](#getting-out-of-version-mismatch-hell-with-module-federation)
  - [Pitfalls](#pitfalls)
  - [Multi-framework and -version micro frontends with Module Federation: The Good, the Bad, the Ugly](#multi-framework-and-version-micro-frontends-with-module-federation-the-good-the-bad-the-ugly)
    - [The 1st Rule for Multi-framework and -version MFEs](#the-1st-rule-for-multi-framework-and-version-mfes)
      - [Alternative 1: Evergreen Version with Module Federation](#alternative-1-evergreen-version-with-module-federation)
      - [Alternative 2: Relaxing Version Requirements + Heavy Testing](#alternative-2-relaxing-version-requirements-heavy-testing)
    - [The Good](#the-good)
    - [The Bad](#the-bad)
    - [The Ugly](#the-ugly)
    - [Conclusion](#conclusion-1)

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

![Homepage](./images/shell.png)
_Angular Shell met Angular header en lit-element weather dashboard_

![Login](./images/login.png)
_Angular app login_

![Flights](./images/flights-result.png)
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

![host remote](./images/host-remote.png)

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

We have shown how to use Module Federation to implement micro frontends. This part brings Angular into play and shows how to create an Angular-based micro frontend shell using the router to lazy load a separately compiled, and deployed micro frontend.

### Your mission, if you choose to accept it

If you want to know more about the tools used in the hands-on:

- [React introduction](./react-intro.md)
- [Typescript introduction](./typescript-intro.md)
- [Lit-element introduction](./lit-intro.md)
- [Nx introduction](./nx-intro.md)

You are a creating a [micro frontend with runtime integration](./micro-frontends.md#types-of-micro-frontends-build-loading-approaches).

**[Open to accept your mission](./HANDS-ON.MD)**

### Conclusion

The implementation of micro frontends has so far involved numerous tricks and workarounds. Webpack Module Federation finally provides a simple and solid solution for this. To improve performance, libraries can be shared and strategies for dealing with incompatible versions can be configured.

It is also interesting that the micro frontends are loaded by Webpack under the hood. There is no trace of this in the source code of the host or the remote. This simplifies the use of module federation and the resulting source code, which does not require additional micro frontend frameworks.

However, this approach also puts more responsibility on the developers. For example, you have to ensure that the components that are only loaded at runtime and that were not yet known when compiling also interact as desired.

One also has to deal with possible version conflicts. For example, it is likely that components that were compiled with completely different Angular versions will not work together at runtime. Such cases must be avoided with conventions or at least recognized as early as possible with integration tests.

## Dynamic Module Federation

Dynamic Module Federation provides more flexibility as it allows loading micro frontends we don’t have to know at compile time. We don’t even have to know their number upfront. This is possible because of the runtime API provided by webpack. To make using it a bit easier, the `@angular-architects/module-federation` plugin wrap it nicely into some convenience functions.

The following blog post explains in detail how this works [Dynamic Module Federation with Angular](https://www.angulararchitects.io/en/aktuelles/dynamic-module-federation-with-angular/)

## Getting Out of Version-Mismatch-Hell with Module Federation

Webpack Module Federation makes it easy to load separately compiled code like micro frontends. It even allows us to share libraries among them. This prevents that the same library has to be loaded several times.

However, there might be situations where several micro frontends and the shell need different versions of a shared library. Also, these versions might not be compatible with each other.

For dealing with such cases, Module Federation provides several options:

- Semantic Versioning by Default
- Fallback Modules for Incompatible Versions
- Singletons
- Accepting a Version Range

Module Federation brings several options for dealing with different versions and version mismatches. Most of the time, you don’t need to do anything, as it uses semantic versioning to decide for the highest compatible version. If a remote needs an incompatible version, it falls back to such one by default.

[Getting Out of Version-Mismatch-Hell with Module Federation](https://www.angulararchitects.io/en/aktuelles/getting-out-of-version-mismatch-hell-with-module-federation) explains the options in detail.

## Pitfalls

While Module Federation is really a straight and thoroughly thought through solution, using micro frontends means in general to make runtime dependencies out of compile time dependencies. As a result, the compiler cannot protect you as well as you are used to. Here are some examples:

- "No required version specified" and Secondary Entry Points
- Unobvious Version Mismatches: Issues with Peer Dependencies
- Issues with Sharing Code and Data
- NullInjectorError: Service expected in Parent Scope (Root Scope)
- Multiple Bundles

[Manfred Steyer](https://www.angulararchitects.io/en/aktuelles/pitfalls-with-module-federation-and-angular/) explains these errors in detail and how to fix them.

Module Federation is really clever when it comes to auto-detecting details and compensating for version mismatches. However, it can only be as good as the meta data it gets. To avoid getting off the rails, you should remember the following:

- **requiredVersion**: Assign the requiredVersion by hand, esp. when working with secondary entrypoints and when having peer dependency warnings. The plugin @angular-architects/module-federation get’s you covered with its share helper function allowing the option requiredVersion: 'auto' that takes the version number from your project’s package.json.
- **Share dependencies of shared libraries** too, esp. if they are also used somewhere else. Also think on secondary entry points.
- Make the **shell provide global services** the loaded micro frontends need, e. g. the `HttpClient` via the `HttpClientModule`.
Never expose the `AppModule` via Module Federation. Prefer to expose lazy Feature modules.
- Use `singleton:true` for Angular and other stateful framework respective libraries.
- Don’t worry about **duplicated bundles** as long as only one of them is loaded at runtime.

## Multi-framework and -version micro frontends with Module Federation: The Good, the Bad, the Ugly

Combining Module Federation and Web Components brings several advantages. Nevertheless, in general, combining different frameworks and versions is nothing the individual frameworks have been built for. Hence, there are some pitfalls, here are some workarounds.

### The 1st Rule for Multi-framework and -version MFEs

**Don’t do it** 😉

Seriously, while wrapping applications into web components and loading them with Module Federation is not that difficult, there are several pitfalls along the way. Hence, two alternatives:

#### Alternative 1: Evergreen Version with Module Federation

if all parts of your system use the same major version, using Module Federation for integrating them is straightforward. We don’t need Web Components to bridge the gap between different versions and from our framework’s perspective, everything we do is using lazy loading. Underneath the covers, Module Federation takes care of loading separately compiled code at runtime.

#### Alternative 2: Relaxing Version Requirements + Heavy Testing

Another approach is to relax the requirements for needed versions. For instance, we could tell Module Federation that an application built with Angular 10 also works with Angular 11. For this, Module Federation provides the configuration property `requiredVersion` described earlier
  
This might work because, normally, Angular’s core didn’t recently change much between major versions. However, this is not officially supported and hence you need a huge amount of E2E tests to make sure everything works seamlessly together. On the other side, you need E2E tests anyway as micro frontends are runtime dependencies not known upfront at compilation time.

### The Good

Okay, let’s go on with finding out how the combination of Module Federation and Web Components allows building multi framework(version) micro frontends

- Sharing Libraries
- Exporting Web Components
- Loading micro frontends dynamically
- No need for a separate meta framework
- Standalone Mode

### The Bad

Now, let’s proceed with some of the challenges this architecture comes with.

- Bundle Size
- Several Routers must Work Together

### The Ugly

As all these frameworks are not designed to work side-by-side with different versions of itself or other frameworks, we also need some "special" workarounds

- Bypassing Routing Issues
- Reuse Angular Platform
- Angular Elements and Zone.js

### Conclusion

Using Module Federation together with Web Components leads to a huge amount of advantages: We can easily share libraries, provide and dynamically load Web Components and route to web components using a wrapper. Also, our main framework e.g. Angular also becomes our meta framework so that we don’t need to deal with additional technologies. The loaded Web Components can even make use of lazy loading.

However, this comes with costs: **Bundle Sizes** increase and we need several tricks and workarounds to make everything work seamlessly.

Building micro frontend architectures using Web Components and adding Module Federation to the game makes this by far simpler.
