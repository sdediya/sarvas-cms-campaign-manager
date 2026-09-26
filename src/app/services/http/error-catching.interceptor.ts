import {Injectable} from '@angular/core';
import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import {Observable, throwError} from 'rxjs';
import {catchError, map} from "rxjs/operators";
import { Router } from '@angular/router';
import { StorageService } from '../storage/storage.service';

@Injectable()
export class ErrorCatchingInterceptor implements HttpInterceptor {

  constructor(private router: Router, private storageService: StorageService) {
  }

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {

    
    if(this.storageService.isLoggedIn() && request.url.includes('/api/cms/')){
        let token = this.storageService.getToken();
        request = request.clone({
            headers: request.headers.set("x-access-token", token)
        })
    }
    

     return next.handle(request)
           .pipe(
                map(res=> {
                    // console.log("pass throue insercept", res)
                    return res
                }),
                 catchError((error: HttpErrorResponse) => {
                    if(error.status == 403){
                        this.storageService.clean();
                        this.router.navigate(['/auth/login']);
                    }
                    return throwError(error);
                 })
           )
  }
}