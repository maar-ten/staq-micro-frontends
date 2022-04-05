# Lit introduction

The use of powerful frameworks and libraries is very widespread nowadays. We can name Angular, React.js, Vue, Svelte, among others.

It's hard to imagine building a web application without the use of any of these component-based frameworks. For these options, the components are reusable and configurable widgets. They are able to provide a custom behavior and styling and they're used as building blocks for the application.

Can we share a component between these frameworks? The short answer is no. Every framework/library has a custom API definition to build components and they are not interoperable with each other.

## Lit Concepts

Here are a few Lit concepts you should be aware of:

### Web components

are a set of web platform APIs that allow you to create new custom, reusable, encapsulated HTML tags to use in web pages and web apps. Custom components and widgets build on the Web Component standards, will work across modern browsers, and can be used with any JavaScript library or framework that works with HTML.

Web components are based on existing web standards. Features to support web components are currently being added to the HTML and DOM specs, letting web developers easily extend HTML with new elements with encapsulated styling and custom behavior.

Read more about the specs and API's on [MDN Web Components](https://developer.mozilla.org/en-US/docs/Web/Web_Components)

### lit-html

is a tiny and fast JavaScript library for HTML templating. _lit-html_ works well with functional programming approaches, letting you express your application's UI declaratively, as a function of its state.

```js
const myTemplate = (name) => html`
    <div>
      Hi, my name is ${name}.
    </div>
`;
```

It's simple to render a _lit-html_ template:

```js
render(myTemplate('Ada'), document.body);
```

Re-rendering a template only updates the data that's changed:

```js
render(myTemplate('Grace'), document.body);
```

_lit-html_ is efficient, expressive, and extensible:

- **Efficient.** It's lightning fast. When data changes, _lit-html_ doesn't need to do any diffing; instead, it remembers where you inserted expressions in your template and only updates these dynamic parts.
- **Expressive.** The library gives you the full power of JavaScript, declarative UI, and functional programming patterns. The expressions in a _lit-html_ template are just JavaScript, so you don't need to learn a custom syntax and you have all the expressiveness of the language at your disposal. _lit-html_ supports many kinds of values natively: strings, DOM nodes, arrays and more. Templates themselves are values that can be computed, passed to and from functions, and nested.
- **Extensible**: It's customizable and extensible your very own template construction kit. Directives customize how values are handled, allowing for asynchronous values, efficient keyed-repeats, error boundaries, and more. _lit-html_ includes several ready-to-use directives and makes it easy to define your own.

If templating is all you need, you can only use [lit-html standalone](https://lit.dev/docs/libraries/standalone-templates/).

## LitElement

> LitElement is a simple base class for creating fast, lightweight web components that work in any web page with any framework.

_LitElement_ uses _lit-html_ to render components and adds APIs to declare reactive properties and attributes. Elements update automatically when their properties change. And they update fast, without diffing.

Here's a simple _LitElement_ component in TypeScript:

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

If you want to read more about _Lit_, here are some useful links:

- <https://codelabs.developers.google.com/codelabs/the-lit-path>
- <https://lit.dev/docs/>
