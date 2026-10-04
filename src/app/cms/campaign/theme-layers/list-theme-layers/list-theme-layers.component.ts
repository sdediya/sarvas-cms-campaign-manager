import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { Router } from '@angular/router';
import { Table } from 'primeng/table';
import { ConfirmationService, MessageService } from 'primeng/api';
import { HttpService } from 'src/app/services/http/http.service';
import { ThemeLayerAccessService } from 'src/app/services/common/theme-layer-access.service';
import { environment } from 'src/environments/environment';
import { LAYER_SCOPE_OPTIONS, scopeLabel } from '../theme-layer-fields';

@Component({
    selector: 'app-list-theme-layers',
    templateUrl: './list-theme-layers.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class ListThemeLayersComponent implements OnInit {
  CMS_API = environment.CMS_API;

  loading = false;
  allowed = false;
  layers: any[] = [];

  scopes = LAYER_SCOPE_OPTIONS;
  telecoms: { id: string; name: string }[] = [];
  services: { id: string; name: string }[] = [];
  private telecomNames = new Map<string, string>();
  private serviceNames = new Map<string, string>();

  filter: { scope: string | null; telecom_id: string | null; service_id: string | null } = {
    scope: null,
    telecom_id: null,
    service_id: null
  };

  constructor(
    private httpService: HttpService,
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
    private router: Router,
    private access: ThemeLayerAccessService
  ) {}

  ngOnInit() {
    this.access.isSuperadmin().subscribe((allowed) => {
      if (!allowed) {
        this.router.navigate(['no-access']);
        return;
      }
      this.allowed = true;
      this.getReferenceData();
      this.getLayers();
    });
  }

  getReferenceData() {
    this.httpService.get(`${this.CMS_API}campaign/campaign-data`).subscribe({
      next: (res) => {
        if (res.error) return;
        this.telecoms = (res.data.telecoms ?? []).map((t: any) => ({ id: t.id, name: `${t.name} (${t.region_name})` }));
        this.services = (res.data.services ?? []).map((s: any) => ({ id: s.id, name: s.name }));
        this.telecomNames = new Map(this.telecoms.map((t) => [t.id, t.name]));
        this.serviceNames = new Map(this.services.map((s) => [s.id, s.name]));
      },
      error: (err) => console.log(err)
    });
  }

  getLayers() {
    const params = new URLSearchParams();
    if (this.filter.scope) params.set('scope', this.filter.scope);
    if (this.filter.telecom_id) params.set('telecom_id', this.filter.telecom_id);
    if (this.filter.service_id) params.set('service_id', this.filter.service_id);
    const query = params.toString();
    this.loading = true;
    this.httpService.get(`${this.CMS_API}campaign/theme-layers/list${query ? `?${query}` : ''}`).subscribe({
      next: (res) => {
        this.loading = false;
        if (res.error) {
          this.messageService.add({ severity: 'error', summary: 'Failed', detail: res.message });
          return;
        }
        this.layers = res.data ?? [];
      },
      error: (err) => {
        this.loading = false;
        this.messageService.add({ severity: 'error', summary: 'Failed', detail: err?.error?.message ?? 'Could not load default themes' });
      }
    });
  }

  clearFilters() {
    this.filter = { scope: null, telecom_id: null, service_id: null };
    this.getLayers();
  }

  scopeLabel(scope: string) {
    return scopeLabel(scope);
  }

  telecomName(id: string | null) {
    return id ? (this.telecomNames.get(id) ?? id) : '—';
  }

  serviceName(id: string | null) {
    return id ? (this.serviceNames.get(id) ?? id) : '—';
  }

  deleteLayer(layer: any) {
    this.confirmationService.confirm({
      key: 'confirmThemeLayerDelete',
      message: 'Delete this default theme? Campaign pages fall back to the next layer or the built-in defaults.',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.httpService.post(`${this.CMS_API}campaign/theme-layers/delete`, { layer_id: layer.layer_id }).subscribe({
          next: (res) => {
            if (res.error) {
              this.messageService.add({ severity: 'error', summary: 'Failed', detail: res.message });
              return;
            }
            this.messageService.add({ severity: 'success', summary: 'Success', detail: res.message });
            this.getLayers();
          },
          error: (err) => {
            this.messageService.add({ severity: 'error', summary: 'Failed', detail: err?.error?.message ?? 'Delete failed' });
          }
        });
      }
    });
  }

  onGlobalFilter(table: Table, event: Event) {
    table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }
}
