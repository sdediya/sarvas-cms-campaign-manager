import { Component, ElementRef, ViewChild, OnInit } from '@angular/core';
import { HttpService } from 'src/app/services/http/http.service';
import { MenuItem } from '@openng/optimus-ui/api';
import { ConfirmationService, MessageService } from '@openng/optimus-ui/api';
import { LayoutService } from '../../layout.service';
import { StorageService } from 'src/app/services/storage/storage.service';
import { Router } from '@angular/router';
import { StateService } from 'src/app/services/storage/state.service';
import { userActivityService } from 'src/app/services/common/userActivity.service';
import { environment } from 'src/environments/environment';

@Component({
    selector: 'app-topbar',
    templateUrl: './topbar.component.html',
    standalone: false
})
export class TopbarComponent implements OnInit {
    CMS_API = environment.CMS_API;
    items!: MenuItem[];
    loggedInUser:any
    @ViewChild('menubutton') menuButton!: ElementRef;
    @ViewChild('topbarmenubutton') topbarMenuButton!: ElementRef;
    @ViewChild('topbarmenu') menu!: ElementRef;

    constructor(
        private httpService: HttpService,
        public layoutService: LayoutService, 
        private storageService: StorageService,
         private router: Router, 
         private stateSerive: StateService, 
         private userActivityService : userActivityService){
        this.loggedInUser = this.storageService.getUser();

    }

    getFirstName (name:string){
        return name.split(' ')[0]
    }
    get visible(): boolean {
        return this.layoutService.state.configSidebarVisible;
    }

    ngOnInit(){
      this.items = [
          {
              label: `Welcome, ${this.getFirstName(this.loggedInUser.name).toUpperCase()}`,
              icon: 'pi pi-fw pi-user',
          },
          {
              separator: true
          },
          {
              label: 'Logout',
              icon: 'pi pi-fw pi-sign-out',
              command: ()=> this.logout()
          },
      ];
      localStorage.setItem('theme', 'saga-blue');
      localStorage.setItem('colorScheme', 'light');
      this.layoutService.config.theme = 'saga-blue';
      this.layoutService.config.colorScheme = 'light';
      this.setScale('12')
    }

    set visible(_val: boolean) {
        this.layoutService.state.configSidebarVisible = _val;
    }
  
    get scale(): number {
        return this.layoutService.config.scale;
    }
  
    set scale(_val: number) {
        this.layoutService.config.scale = _val;
    }
  
    get menuMode(): string {
        return this.layoutService.config.menuMode;
    }
  
    set menuMode(_val: string) {
        this.layoutService.config.menuMode = _val;
    }
  
    get inputStyle(): string {
        return this.layoutService.config.inputStyle;
    }
  
    set inputStyle(_val: string) {
        this.layoutService.config.inputStyle = _val;
    }
  
    get ripple(): boolean {
        return this.layoutService.config.ripple;
    }
  
    set ripple(_val: boolean) {
        this.layoutService.config.ripple = _val;
    }

    // onConfigButtonClick() {
    //     this.layoutService.showConfigSidebar();
    // }

    logout() {
        this.userActivityService.addLog('logOut', 'TopbarComponent')
        this.httpService.post(`${this.CMS_API}auth/logout`, {}).subscribe({
            next: res => {

                this.storageService.clean();
                this.stateSerive.removeAllStateValue()
                this.router.navigate(['/auth/login']);
            },
            error: error => {
                console.log(error)
            }
        })


    }

    setScale(customScale:string) {
        document.documentElement.style.fontSize = customScale + 'px';
    }

}
