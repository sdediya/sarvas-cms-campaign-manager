import { Injectable, inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { StorageService } from 'src/app/services/storage/storage.service';

@Injectable({
  providedIn: 'root'
})

class PermissionsService {
  constructor(private storage:StorageService, private router: Router){}

  canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    if(this.storage.isLoggedIn()){
      return true;
    }
    this.router.navigate(['auth/login']);
    return false;
  }
}

export const AuthGuard: CanActivateFn =  (next: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean => {

  return inject(PermissionsService).canActivate(next, state);

}

