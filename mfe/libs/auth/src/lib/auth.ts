class AuthenticationService {
  async login(username: string, password: string) {
    const res = await fetch("/api/login", {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      method: "POST",
      body: JSON.stringify({ username, password }),
    });
    const { token } = await res.json();
    localStorage.setItem("auth-token", token);
    localStorage.setItem("username", username);
  }

  public logout() {
    localStorage.removeItem("auth-token");
  }

  public isLoggedIn() {
    return localStorage.getItem("auth-token") != null;
  }

  public getUserName() {
    return localStorage.getItem("username");
  }
}

export const authService = new AuthenticationService();
