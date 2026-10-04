import { Component, OnInit, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { LayoutService } from '../../layout.service';
import jsonMenuData from '../../../../../assets/menu.json';
import { environment } from 'src/environments/environment';
import { HttpService } from 'src/app/services/http/http.service';
import { StateService } from 'src/app/services/storage/state.service';
import { StorageService } from 'src/app/services/storage/storage.service';
import { THEME_LAYERS_SUPERADMIN, ThemeLayerAccessService } from 'src/app/services/common/theme-layer-access.service';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-menu',
    templateUrl: './menu.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class MenuComponent implements OnInit, OnDestroy {
  CMS_API = environment.CMS_API;
  userPermissions: any = [];
  model: any[] = [];
  menuData: any = jsonMenuData;
  private stateSub!: Subscription;

  constructor(
    public layoutService: LayoutService,
    private httpService: HttpService,
    private StateService: StateService,
    private storageService: StorageService,
    private themeLayerAccess: ThemeLayerAccessService
  ) {}

  ngOnInit() {
    // The answer lands in state, which re-runs the filter below.
    this.themeLayerAccess.isSuperadmin().subscribe();

    // 1. Reactively filter menu when permissions arrive or update in state
    this.stateSub = this.StateService.stateValue$.subscribe((state: any) => {
      if (state && state['user_permissions']) {
        this.getUserMenusByPermissions(state['user_permissions']);
      }
    });

    // 2. Initial check if permissions are already loaded
    const currentPermissions = this.StateService.getSingleStateValue('user_permissions');
    if (currentPermissions && currentPermissions.length) {
      this.getUserMenusByPermissions(currentPermissions);
    }
  }

  ngOnDestroy() {
    if (this.stateSub) {
      this.stateSub.unsubscribe();
    }
  }

  getUserMenusByPermissions(permissionsList?: any[]) {
    this.userPermissions = permissionsList || this.StateService.getSingleStateValue('user_permissions') || [];

    if (!this.userPermissions || !Array.isArray(this.userPermissions) || !this.userPermissions.length) {
      this.model = [];
      return;
    }

    const authorizedUsers = ['Purushottam Pawar', 'Shruti Athawale', 'Kabir Gangurde', 'Ashish Jadhav', 'Sanket Dediya', 'VAS Superadmin'];
    const currentUser = this.storageService.getUser();
    const currentUserEmail = currentUser?.name;

    // Deep clone menu items to avoid in-memory reference mutation
    const clonedMenuItems = JSON.parse(JSON.stringify(this.menuData.items));

    this.model = clonedMenuItems.filter((levelOneMenu: any) => {
      let permissions = this.userPermissions.find((el: any) => el.module_name === levelOneMenu.item_key);

      if (permissions && permissions.module_read == 1) {
        if (levelOneMenu.items && levelOneMenu.items.length) {
          levelOneMenu.items = levelOneMenu.items.filter((ele: any) => {
            if (ele.label === 'Failed Callback Logs' && !authorizedUsers.includes(currentUserEmail)) {
              return false;
            }

            if (Object.hasOwn(ele, 'routerLink')) return ele;

            if (Object.hasOwn(ele, 'items')) {
              ele.items = ele.items.filter((item: any) => {
                if (item.label === 'Failed Callback Logs' && !authorizedUsers.includes(currentUserEmail)) {
                  return false;
                }

                if (item.label === 'Default Themes' && this.StateService.getSingleStateValue(THEME_LAYERS_SUPERADMIN) !== true) {
                  return false;
                }

                if (item.label === 'Customer Refund') {
                  let refundPerm = this.userPermissions.find((el: any) => el.module_name === 'customer_refund');
                  if (refundPerm !== undefined && refundPerm.module_read != 1) {
                    return false;
                  }
                }

                if (item.item_action === 'write' && permissions.module_write == 1) {
                  return item;
                }
                if (item.item_action === 'read' && permissions.module_read == 1) {
                  return item;
                }
                return false;
              });
              return ele.items.length > 0;
            }
            return false;
          });
          return levelOneMenu.items.length > 0;
        }
        return true;
      }
      return false;
    });
  }
}
