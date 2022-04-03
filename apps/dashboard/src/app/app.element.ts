import { LitElement, html } from 'lit';

export class MFEDashboardElement extends LitElement {
  static properties = {
    count: { type: Number },
  };

  count = 0;

  protected render() {
    const user = sessionStorage.getItem('loggedIn');

    if (user) {
      return html`
        <p>Welcome ${user}</p>
        <button @click=${this.logout}>Logout</button>
      `;
    }

    return html`<span>Welcome, please login <a href="/login">here</a>.</span>`;
  }

  private logout() {
    sessionStorage.removeItem('loggedIn');
    window.location.assign('/dashboard');
  }
}

customElements.define('mfe-dashboard', MFEDashboardElement);
