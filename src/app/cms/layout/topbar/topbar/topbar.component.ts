import { Component, EventEmitter, Output } from '@angular/core';
import { provideIcons } from '@ng-icons/core';
import { lucideChevronDown, lucideLogOut, lucideMenu, lucideUser } from '@ng-icons/lucide';
import { Router } from '@angular/router';
import { HttpService } from 'src/app/services/http/http.service';
import { StorageService } from 'src/app/services/storage/storage.service';
import { StateService } from 'src/app/services/storage/state.service';
import { userActivityService } from 'src/app/services/common/userActivity.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-topbar',
  templateUrl: './topbar.component.html',
  standalone: false,
  providers: [provideIcons({ lucideMenu, lucideUser, lucideLogOut, lucideChevronDown })],
})
export class TopbarComponent {
  @Output() menuToggle = new EventEmitter<void>();

  CMS_API = environment.CMS_API;
  loggedInUser: any;
  displayName = '';

  constructor(
    private httpService: HttpService,
    private storageService: StorageService,
    private router: Router,
    private stateSerive: StateService,
    private userActivityService: userActivityService,
  ) {
    this.loggedInUser = this.storageService.getUser();
    const name = this.loggedInUser?.name || '';
    this.displayName = name ? this.getFirstName(name).toUpperCase() : '';
  }

  getFirstName(name: string): string {
    return name.split(' ')[0];
  }

  logout(): void {
    this.userActivityService.addLog('logOut', 'TopbarComponent');
    this.httpService.post(`${this.CMS_API}auth/logout`, {}).subscribe({
      next: () => {
        this.storageService.clean();
        this.stateSerive.removeAllStateValue();
        this.router.navigate(['/auth/login']);
      },
      error: (error) => {
        console.log(error);
      },
    });
  }
}
