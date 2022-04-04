# Nx introduction

Nx combines a [mono-repository](./monorepo-intro.md) structure with CLI tools to develop and manage one or more applications and libraries, all within the same repository. Nx encourages code collaboration, unified testing, and optimizes builds and testing performances.

Nx is an amazing tool for building medium or large sized applications. Using a mono-repo allows you to easily share code between various parts of the project, without having to worry about the these parts being out of sync. Nx is smart in the sense that it knows which parts of the app relate to each other. Read more about the Dependency Graph below.

## Nx concepts

Here are a few Nx concepts you should be aware of:

### Workspace

The workspace is defined on the root of the repository, and consists of one or more projects, which can be either an application or a library. The workspace uses either the Nx CLI or Angular CLI to serve, test, build and lint the projects. The workspace is defined in the files `nx.json` and `workspace.json` (or `angular.json` if using the Angular CLI).

### Applications

In Nx, the applications (or apps), are the projects that contain a runnable application. Applications should be light-weight, and expose the functionality defined in the libraries.

### Libraries

The libraries (or libs), are the projects that implement the functionality for the apps. The libraries define an external API that can be consumed by the apps and other libs.

### Plugins

The actual functionality of the Nx workspace is defined by the plugins that are installed. Nx comes with quite a few official plugins that add support for, for example, Angular, Node, Next, React and Web Components. Additionally, there is a growing list of community plugins.

### Dependency Graph

The Dependency Graph, or dep graph, is an automatically generated schema that shows how different parts of the monorepo depend on each other. Nx uses this information to intelligently execute commands on parts of the workspace. For example, it will only re-build projects that are actually changed, or when one of the dependencies are change.

## Summary

If you want to read more about Nx, here are some useful links:

- <https://juristr.com/blog/2020/11/get-started-with-nx/>
- <https://nx.dev/getting-started/nx-and-angular>
- <https://blog.nrwl.io/nx/home>
