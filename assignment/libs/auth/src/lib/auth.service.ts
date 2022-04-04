import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private _userName?: string;
  private _password?: string;

  public get userName() {
    return this._userName;
  }

  login(userName: string, password: string): void {
    sessionStorage.setItem('loggedIn', userName);
  }

  logout(): void {
    sessionStorage.removeItem('loggedIn');
  }

  isLoggedIn() {
    return sessionStorage.getItem('loggedIn') != null;
  }
}
