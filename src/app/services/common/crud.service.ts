import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from 'src/environments/environment';
import { StateService } from '../storage/state.service';
import { userActivityService } from './userActivity.service';
const API = environment.API;
const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type': 'application/json',
  })
};

@Injectable({
  providedIn: 'root'
})
export class CrudService {
  user_permissions :any = [];
  page_name: any;
  module_name:any
  constructor(private http: HttpClient, private StateService:StateService,
             private userActivityService : userActivityService) {
    // this.user_permissions = this.StateService.getSingleStateValue('user_permissions')
    
  }

  getModuleLoaded(page_name:any,module_name:any){
    this.page_name = page_name
    this.module_name = module_name
  }

  getList(urlName:String): Observable<any> {
    return this.http.get(API + urlName, httpOptions).pipe(map((response)=>{
      this.userActivityService.handleComponent(this.page_name,this.module_name,'get',urlName,'',response)
      return response
    }));;
  }
  addOne(urlName:String, data:any): Observable<any> {
    return this.http.post(API + urlName, data, httpOptions).pipe(map((response)=>{
      this.userActivityService.handleComponent(this.page_name,this.module_name,'post',urlName,data,response)
      return response
    }));
  }
  deleteOne(urlName:String, id:any): Observable<any> {
    return this.http.delete(API + `${urlName}/${id}`, httpOptions).pipe(map((response)=>{
      this.userActivityService.handleComponent(this.page_name,this.module_name,'delete',urlName,id,response)
      return response
    }));
  }
  getOne(urlName:String, id:any): Observable<any> {
    return this.http.get(API + `${urlName}/${id}`, httpOptions).pipe(map((response)=>{
      this.userActivityService.handleComponent(this.page_name,this.module_name,'get',urlName,id,response)
      return response
    }));
  }
  updateOne(urlName:String, id:any, data:any): Observable<any> {
    return this.http.put(API + `${urlName}/${id}`, data, httpOptions).pipe(map((response)=>{
      this.userActivityService.handleComponent(this.page_name,this.module_name,'put',urlName,id,response)
      return response
    }));
  }

  hasPermission(module:string) {
    let permission : any = ['read','write','delete']
    let return_permissions = {read: false, write: false, delete: false};
    let all_permissions = this.StateService.getSingleStateValue('user_permissions');
  
    // Permissions not hydrated yet (refresh race). Do not deny — callers treat
    // false read as hard no-access redirect. Temporary read avoids bounce loops;
    // real permissions replace this as soon as get-permissions resolves.
    if (!all_permissions || !Array.isArray(all_permissions)) {
      return { read: true, write: false, delete: false };
    }

    let user_permission = all_permissions.find((ele:any)=> {
      return ele.module_name == module;
    });
    
    if(permission.includes('read') && user_permission?.module_read == 1) {
      return_permissions.read = true;
    }
    if(permission.includes('write') && user_permission?.module_write == 1) {
      return_permissions.write = true;
    }
    if(permission.includes('delete') && user_permission?.module_delete == 1) {
      return_permissions.delete = true;
    }
    return return_permissions;
  }

  hasCustomerLogsPermission(): boolean {
    let all_permissions = this.StateService.getSingleStateValue('user_permissions');
    if (!all_permissions || !Array.isArray(all_permissions)) {
      return true;
    }
    let user_permission = all_permissions.find((ele: any) => ele.module_name === 'customer_logs');

    // Existing user fallback: if no customer_logs record in DB, default to true (visible)
    if (user_permission === undefined) {
      return true;
    }
    return user_permission?.module_read == 1;
  }

  hasCustomerRefundPermission(): boolean {
    let all_permissions = this.StateService.getSingleStateValue('user_permissions');
    if (!all_permissions || !Array.isArray(all_permissions)) {
      return true;
    }
    let user_permission = all_permissions.find((ele: any) => ele.module_name === 'customer_refund');

    // Existing user fallback: if no customer_refund record in DB, default to true (visible)
    if (user_permission === undefined) {
      return true;
    }
    return user_permission?.module_read == 1;
  }

}


