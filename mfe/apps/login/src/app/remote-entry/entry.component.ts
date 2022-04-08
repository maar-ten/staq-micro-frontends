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
