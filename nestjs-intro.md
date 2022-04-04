# NestJS Introduction

NestJS is a framework for building API's using Node.js and TypeScript. NestJS provides an opinionated API on top of Express and makes heavy use of TypeScript classes and decorators, enabling a declarative way to quickly add new functionality without writing a lot of code.

NestJS has [great documentation](https://docs.nestjs.com/) and is actively maintained. There are a lot of useful libraries provided by the project itself, and there is a growing community that provides even more functionality. Besides that, NestJS is easy to extend if the functionality you need does not exist.

## NestJS concepts

Here are a few NestJS concepts you should be aware of:

### Modules

The architecture from NestJS is inspired by Angular. It uses modules to encapsulate functionality in standalone, reusable blocks that can be imported by other modules. Modules tie the other components together, and make sure dependency injection works.

### Controllers

The Controllers are used to build a RESTful API. They allow building any HTTP api that you can dream of, and does so in a clean and declarative matter by adding methods to TypeScript classes, and decorate them. These Controllers define the external REST API, most of the heavy lifting is done through Providers.

### Providers

The Providers are injected into the Controllers, Resolvers or other Providers, and handle their requests. Things like accessing a database or calling into third-party API's or libraries are all done in Providers. This keeps the Controllers clean and focussed, and makes it easy to share the functionality with other parts of the application.

### Resolvers

The Resolvers are used to build a GraphQL API. They allow building a GraphQL API using a code-first approach. That means that you don't need use GraphQL's Schema Definition Language (SDL) to define the API, but rather TypeScript code. Like the controllers, the Resolvers define the external API, and use Providers to do the heavy lifting.

## Summary

If you want to read more about NestJS, here are some useful links:

- <https://docs.nestjs.com/first-steps>
- <https://blog.logrocket.com/full-stack-app-tutorial-nestjs-react/>
- <https://www.thisdot.co/blog/introduction-to-restful-apis-with-nestjs>
