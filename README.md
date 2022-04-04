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

## What We’ll Be Building

For this workshop, we’ll be building a simple app that the user can login and search for flight information. The data will be supplied by NextJS HTTP API's we already supplied. The login page is an Angular Application. The flights page is a React Application. The Dashboard is a lit-element component.

![Homepage](./images/dashbord.png)
_Angular Shell met lit-element dashbord_

![Login](./images/login.png)
_Angular app login_

![Flights](./images/flights.png)
_React app flights_

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

## Monorepo

> New to Mono repos? [Read the Monorepo introduction](./monorepo-intro.md)

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
