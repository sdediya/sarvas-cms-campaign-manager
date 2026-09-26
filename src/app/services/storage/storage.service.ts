import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
const USER_KEY = environment.USER_KEY;

@Injectable({
  providedIn: 'root'
})
export class StorageService {

  constructor() { }

  /*
    To clear user details from session after successfull logout
  */
  clean(): void {
    window.localStorage.clear();
  }

  /*
    To save user details in session after successfull login
  */
  public saveUser(user: any): void {
    window.localStorage.removeItem(USER_KEY);
    window.localStorage.setItem(USER_KEY, JSON.stringify(user));
  }

  /*
    To get user details whoever is loggedIn
  */
  public getUser(): any {
    const user = window.localStorage.getItem(USER_KEY);
    if (user) {
      return JSON.parse(user);
    }
    return {};
  }

  /*
    To check whethere user is loggedIn
  */
  public isLoggedIn(): boolean {
    const user = window.localStorage.getItem(USER_KEY);
    if (user) {
      return true;
    }

    return false;
  }

  /*
    To get UserToken
  */
  public getToken(): any {
    const user = window.localStorage.getItem(USER_KEY) || '';
    const userToken = JSON.parse(user)
    return `${userToken.token}`
  }

  /*
    To get UserId
  */
  public getUserId(): any {
    const user = window.localStorage.getItem(USER_KEY) || '';
    const userData = JSON.parse(user)
    return `${userData.id}`
  }

}
