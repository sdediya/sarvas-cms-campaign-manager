import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from 'src/environments/environment';
import { userActivityService } from '../common/userActivity.service';
const httpOptions :any = {'Content-Type':'multipart/form-data'};
const API = environment.API
const headers :any = new HttpHeaders({
  'Content-Type': 'multipart/form-data', // Set the Content-Type header
});

@Injectable({
  providedIn: 'root'
})
export class HttpService {
  
  module_name:any
  page_name: any;
  constructor(private http: HttpClient,  private userActivityService : userActivityService) { }

  getModuleLoaded(page_name:any,module_name:any){
    this.module_name = module_name
    this.page_name = page_name
    }

  get(url:any): Observable<any> {
    let actionUrl = url.includes('http') || url.includes('https') ? url : API+url
    return this.http.get(actionUrl).pipe(map((response)=>{
      if(!url.includes('get-permissions')){
        this.userActivityService.handleComponent(this.page_name,this.module_name,'post',actionUrl,'',response)
      }
      return response
    }));
  }

  post(url:any, data:any): Observable<any> {
    let actionUrl = url.includes('http') || url.includes('https') ? url : API+url
    return this.http.post(actionUrl, data).pipe(map((response)=>{
      if(!url.includes('login')){
      this.userActivityService.handleComponent(this.page_name,this.module_name,'post',actionUrl,data,response)
      }
      return response
    }));
  }

  postWithUploadFile(url:any, data:any): Observable<any> {
    let actionUrl = url.includes('http') || url.includes('https') ? url : API+url
    return this.http.post(actionUrl, data, httpOptions).pipe(map((response)=>{
      this.userActivityService.handleComponent(this.page_name,this.module_name,'post',actionUrl,data,response)
      return response
    }));
  }



}
