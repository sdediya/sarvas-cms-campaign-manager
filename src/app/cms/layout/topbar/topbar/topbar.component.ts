import { Component, ElementRef, ViewChild, OnInit } from '@angular/core';
import { HttpService } from 'src/app/services/http/http.service';
import { MenuItem } from 'primeng/api';
import { ConfirmationService, MessageService } from 'primeng/api';
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
    darkTheme:boolean = true;
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
      let colorScheme = localStorage.getItem('colorScheme')
      let theme = localStorage.getItem('theme')
      this.darkTheme = colorScheme=='dark'?true:false;
      if(colorScheme && theme){
        this.changeTheme(theme, colorScheme)
      }
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

    switchTheme(ev:any){
        if(ev.checked){
            this.changeTheme('vela-blue', 'dark')
        }
        else{
            this.changeTheme('saga-blue', 'light')
        }
      }

    changeTheme(theme: string, colorScheme: string) {
        const themeLink = <HTMLLinkElement>document.getElementById('theme-css');
      
        // Set Active theme in Localstorage
        localStorage.setItem('theme', theme);
        localStorage.setItem('colorScheme', colorScheme);
  
  
        const newHref = themeLink.getAttribute('href')!.replace(this.layoutService.config.theme, theme);
        this.replaceThemeLink(newHref, () => {
            this.layoutService.config.theme = theme;
            this.layoutService.config.colorScheme = colorScheme;
            this.layoutService.onConfigUpdate();
        });
    }
  
    replaceThemeLink(href: string, onComplete: Function) {
        const id = 'theme-css';
        const themeLink = <HTMLLinkElement>document.getElementById('theme-css');
        const cloneLinkElement = <HTMLLinkElement>themeLink.cloneNode(true);
  
        cloneLinkElement.setAttribute('href', href);
        cloneLinkElement.setAttribute('id', id + '-clone');
  
        themeLink.parentNode!.insertBefore(cloneLinkElement, themeLink.nextSibling);
  
        cloneLinkElement.addEventListener('load', () => {
            themeLink.remove();
            cloneLinkElement.setAttribute('id', id);
            onComplete();
        });
    }

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
