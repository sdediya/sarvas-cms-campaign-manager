import { Component, Input, OnInit } from '@angular/core';
import { LayoutService } from '../../layout.service';
import { MenuService } from '../../menu/menu.service';

@Component({
    selector: 'app-config',
    templateUrl: './config.component.html',
    standalone: false
})
export class ConfigComponent implements OnInit{
  
  @Input() minimal: boolean = false;
  scales: number[] = [12, 13, 14, 15, 16];

  constructor(public layoutService: LayoutService, public menuService: MenuService) { }

  get visible(): boolean {
      return this.layoutService.state.configSidebarVisible;
  }

  ngOnInit(){
    //   let colorScheme = localStorage.getItem('colorScheme')
    //   let theme = localStorage.getItem('theme')

    //   if(colorScheme && theme){
    //     this.changeTheme(theme, colorScheme)
    //   }
    // console.log("Scale", this.layoutService.config.scale);
      this.setScale(this.layoutService.config.scale)
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

  onConfigButtonClick() {
      this.layoutService.showConfigSidebar();
  }

  changeTheme(theme: string, colorScheme: string) {
      const themeLink = <HTMLLinkElement>document.getElementById('theme-css');
    
      // Set Active theme in Localstorage
      localStorage.setItem('theme', theme);
      localStorage.setItem('colorScheme', theme);


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

  decrementScale() {
      this.scale--;
      this.applyScale();
  }

  incrementScale() {
      this.scale++;
      this.applyScale();
  }

  applyScale() {
      document.documentElement.style.fontSize = this.scale + 'px';
  }

  setScale(customScale:any) {
    document.documentElement.style.fontSize = customScale + 'px';
}

}
