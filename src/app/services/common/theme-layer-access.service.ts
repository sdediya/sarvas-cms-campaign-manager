import { Injectable } from '@angular/core';
import { Observable, catchError, map, of, shareReplay, tap } from 'rxjs';
import { environment } from 'src/environments/environment';
import { HttpService } from '../http/http.service';
import { StateService } from '../storage/state.service';
import { StorageService } from '../storage/storage.service';

/** State key read by the menu to show "Default Themes". */
export const THEME_LAYERS_SUPERADMIN = 'theme_layers_superadmin';

/**
 * Whether the logged-in user may manage default theme layers. The layer routes answer 403 to
 * everyone else, and the error interceptor logs the user out on any 403, so screens and the menu
 * must ask this first. A 404 (layers off on the backend) or any error counts as "no".
 */
@Injectable({
  providedIn: 'root'
})
export class ThemeLayerAccessService {
  private readonly CMS_API = environment.CMS_API;
  private cached: { token: string; access$: Observable<boolean> } | null = null;

  constructor(
    private httpService: HttpService,
    private stateService: StateService,
    private storageService: StorageService
  ) {}

  isSuperadmin(): Observable<boolean> {
    if (!this.storageService.isLoggedIn()) return of(false);
    const token = this.storageService.getToken();
    if (!this.cached || this.cached.token !== token) {
      const access$ = this.httpService.get(`${this.CMS_API}campaign/theme-layers/access`).pipe(
        map((res: any) => !res?.error && res?.data?.is_superadmin === true),
        catchError(() => of(false)),
        tap((allowed) => this.stateService.addStateValue(THEME_LAYERS_SUPERADMIN, allowed)),
        shareReplay(1)
      );
      this.cached = { token, access$ };
    }
    return this.cached.access$;
  }
}
