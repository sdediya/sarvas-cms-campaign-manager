import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
const API = environment.API;
const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private http: HttpClient) { }

  /*
    To login cms 
  */ 
  login(data:any): Observable<any> {
    return this.http.post(API + 'login', data, httpOptions);
  }

  /*
    To logout user
  */
  logout(): Observable<any> {
    return this.http.post(API + 'signout', {}, httpOptions);
  }

}
