# Lit introduction

The use of powerful frameworks and libraries is very widespread nowadays. We can name Angular, React.js, Vue, Svelte, among others.

It's hard to imagine building a web application without the use of any of these component-based frameworks. For these options, the components are reusable and configurable widgets. They are able to provide a custom behavior and styling and they're used as building blocks for the application.

Can we share a component between these frameworks? The short answer is no. Every framework/library has a custom API definition to build components and they are not interoperable with each other.

## Lit Concepts

Here are a few Lit concepts you should be aware of:

### Web components

<https://developer.mozilla.org/en-US/docs/Web/Web_Components>

### lit-html

lit-html is a tiny and fast JavaScript library for HTML templating. lit-html works well with functional programming approaches, letting you express your application's UI declaratively, as a function of its state.

```js
const myTemplate = (name) => html`
    <div>
      Hi, my name is ${name}.
    </div>
`;
```

It's simple to render a lit-html template:

```js
render(myTemplate('Ada'), document.body);
```

Re-rendering a template only updates the data that's changed:

```js
render(myTemplate('Grace'), document.body);
```

lit-html is efficient, expressive, and extensible:

- **Efficient.** lit-html is lightning fast. When data changes, lit-html doesn't need to do any diffing; instead, it remembers where you inserted expressions in your template and only updates these dynamic parts.
- **Expressive.** lit-html gives you the full power of JavaScript, declarative UI, and functional programming patterns. The expressions in a lit-html template are just JavaScript, so you don't need to learn a custom syntax and you have all the expressiveness of the language at your disposal. lit-html supports many kinds of values natively: strings, DOM nodes, arrays and more. Templates themselves are values that can be computed, passed to and from functions, and nested.
- **Extensible**: lit-html is also customizable and extensible—your very own template construction kit. Directives customize how values are handled, allowing for asynchronous values, efficient keyed-repeats, error boundaries, and more. lit-html includes several ready-to-use directives and makes it easy to define your own.

If templating is all you need, you can only use [lit-html standalone](https://lit.dev/docs/libraries/standalone-templates/).

## LitElement

> LitElement is a simple base class for creating fast, lightweight web components that work in any web page with any framework.

LitElement uses `lit-html` to render components and adds APIs to declare reactive properties and attributes. Elements update automatically when their properties change. And they update fast, without diffing.

Here's a simple LitElement component in TypeScript:

```ts
@customElement('name-tag')
class NameTag extends LitElement {
    @property() name = 'a secret';

    render() {
        return html`<p>Hi, my name is ${this.name}!</p>`;
    }
}
```

This creates an element you can use anywhere you'd use a regular HTML element:

```html
<name-tag name="Ida"></name-tag>
```

## Summary

If you want to read more about Lit, here are some useful links:

- <https://codelabs.developers.google.com/codelabs/the-lit-path>
- <https://lit.dev/docs/>
