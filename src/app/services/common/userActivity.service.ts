import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from 'src/environments/environment';
import { StorageService } from '../storage/storage.service';
const API = environment.CMS_API;
const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type': 'application/json',
  })
};

@Injectable({
  providedIn: 'root'
})
export class userActivityService {
  page_name: any;
  module_name:any
  constructor(private http: HttpClient) {}

getModuleLoaded(page_name:any,module_name:any){
  this.page_name = page_name
  this.module_name = module_name
}


adduserActivityLogs(data:any): Observable<any> {
  return this.http.post(API + 'user/userActivityLogs', data, httpOptions)
}

getUserActivityList(urlName:String): Observable<any> {
  return this.http.get(API + urlName, httpOptions)
}

getFilterUserActivityLog(urlName:String, data:any): Observable<any> {
  
  return this.http.post(API + urlName, data, httpOptions).pipe(map((response)=>{
    // this.handleComponent(this.page_name,this.module_name,'post',urlName,'',response)
    return response
  }));
}

async addLog(pageName:any,moduleName:string){
    let  data= {
      pageName:pageName,
      moduleName:moduleName,
      }
      if(pageName!='login') await this.adduserActivityLogs(data).subscribe()
  }

  handleComponent(pageName:any,moduleName:any,action:any,requestUrl:any,requestPayload:any,responseData:any){
   
   let  data= {
    pageName:pageName,
    moduleName:moduleName,
    action:action,
    requestUrl:requestUrl,
    requestPayload:requestPayload,
    responseStatus:responseData.code,
    responseData:responseData
    }
    switch(action){
        case 'get':
            this.adduserActivityLogs(data).subscribe()
        break;

        case 'post':
            this.adduserActivityLogs(data).subscribe()
        break;

        case 'put':
            this.adduserActivityLogs(data).subscribe()
        break;

        case 'delete':
            this.adduserActivityLogs(data).subscribe
        break;

        default:
        console.error('Unknown component:', action);
        break;
    }
  }
}


