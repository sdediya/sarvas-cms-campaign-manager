import { Component, OnInit, isDevMode} from '@angular/core';

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
    standalone: false
})
export class AppComponent  implements OnInit{
  title = 'VAS_frontend';
  loading = false;
  CMS_API = environment.CMS_API;
  isLoading$ = this.loadingService.loading$;

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

      

      router.events.subscribe((val) => {
          if(val instanceof NavigationStart) {
            let isPermissionsExists = this.StateService.getSingleStateValue('user_permissions')
            if(this.storage.isLoggedIn() && !isPermissionsExists){
                this.loading = true;
                this.getUserPermissions();
            }
          }
      });
    }

  ngOnInit() {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        const currentRoute = event.url
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
    const url = route.snapshot.url[0].path;
    this.crudService.getModuleLoaded(url,currentComponentName)
    this.httpService.getModuleLoaded(url,currentComponentName)
    this.userActivityService.addLog(url,currentComponentName)
  }
}
