import { Component, OnInit, isDevMode, ChangeDetectionStrategy } from '@angular/core';

import { environment } from 'src/environments/environment';
import { HttpService } from './services/http/http.service';
import { StateService } from './services/storage/state.service';
import { StorageService } from './services/storage/storage.service';
import { ActivatedRoute, NavigationEnd, NavigationStart, Router } from '@angular/router';
import { CrudService } from './services/common/crud.service';
import { userActivityService } from './services/common/userActivity.service';
import { LoadingService } from './shared/loading.service';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class AppComponent  implements OnInit{
  title = 'VAS_frontend';
  loading = false;
  CMS_API = environment.CMS_API;
  isLoading$ = this.loadingService.loading$;

  private permissionsFetchStarted = false;

  constructor(
    private loadingService: LoadingService,
    private httpService:HttpService, 
    private StateService:StateService, 
    private storage:StorageService,
    private router:Router,
    private route : ActivatedRoute,
    private userActivityService : userActivityService,
    private crudService : CrudService
    ){
      // Restore cached permissions synchronously so route constructors
      // don't race to /no-access on refresh before get-permissions returns.
      try {
        if (this.storage.isLoggedIn()) {
          const cached = sessionStorage.getItem('user_permissions');
          if (cached && !this.StateService.getSingleStateValue('user_permissions')) {
            this.StateService.addStateValue('user_permissions', JSON.parse(cached));
          }
        }
      } catch {
        /* ignore corrupt cache */
      }

      router.events.subscribe((val) => {
          if(val instanceof NavigationStart) {
            if (this.storage.isLoggedIn() && !this.permissionsFetchStarted) {
                this.permissionsFetchStarted = true;
                const isPermissionsExists = this.StateService.getSingleStateValue('user_permissions');
                if (!isPermissionsExists) {
                  this.loading = true;
                }
                this.getUserPermissions();
            }
          }
      });
    }

  ngOnInit() {
    if (this.storage.isLoggedIn() && !this.permissionsFetchStarted) {
      this.permissionsFetchStarted = true;
      this.getUserPermissions();
    }
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.getComponentForRoute(this.route.root)
      }
    })
    if (isDevMode()) {
      console.log('Development!');
      console.log("DEV TITLE", environment.title)
    } else {
      console.log('Production!');
      console.log("PROD TITLE", environment.title)
    }
  }

  getUserPermissions(){
    this.httpService.get(`${this.CMS_API}cms_users/get-permissions`).subscribe({
      next:res=>{
        this.StateService.addStateValue('user_permissions', res.data)
        try {
          sessionStorage.setItem('user_permissions', JSON.stringify(res.data));
        } catch {
          /* ignore quota / private mode */
        }
        this.loading = false
      },
      error:err=>{
        this.loading = false
        console.log("err ", err)
      }
    })
  }

  getComponentForRoute(route: ActivatedRoute) {
    while (route.firstChild) {
      route = route.firstChild;
    }
 let currentComponentName
    if (route.snapshot && route.snapshot.routeConfig) {
       currentComponentName = route.snapshot.routeConfig.component?.name || 'Not Found';
    } else {
      currentComponentName = 'Not Found';
    }
    // 
    const urlSegment = route.snapshot.url?.[0]?.path || route.snapshot.routeConfig?.path || '';
    this.crudService.getModuleLoaded(urlSegment,currentComponentName)
    this.httpService.getModuleLoaded(urlSegment,currentComponentName)
    this.userActivityService.addLog(urlSegment,currentComponentName)
  }
}
