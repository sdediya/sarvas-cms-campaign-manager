import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { HttpService } from 'src/app/services/http/http.service';
import { ThemeLayerAccessService } from 'src/app/services/common/theme-layer-access.service';
import { environment } from 'src/environments/environment';
import {
  COLOR_FIELDS,
  ENUM_FIELDS,
  FLAG_FIELDS,
  FLAG_OPTIONS,
  HEX_COLOR_INPUT,
  HTTP_URL,
  HTTPS_OR_ROOT_URL,
  LAYER_LANGUAGE_OPTIONS,
  LAYER_SCOPE_OPTIONS,
  MAX_IMAGES,
  TEXT_SECTIONS
} from '../theme-layer-fields';

const KEY_FIELDS = ['layer_scope', 'layer_telecom_id', 'layer_service_id', 'theme_language'];
const IMAGE_TYPES = ['png', 'jpg', 'jpeg', 'gif', 'webp'];
const MAX_IMAGE_BYTES = 1024 * 1024;

/** Optional pattern: blank passes (it means "inherit"). */
function optionalPattern(pattern: RegExp): ValidatorFn {
  return (control: AbstractControl) => {
    const value = typeof control.value === 'string' ? control.value.trim() : control.value;
    return !value || pattern.test(value) ? null : { pattern: true };
  };
}

/** `p-colorpicker` may emit hex without the leading '#'. */
function normalizeColor(value: unknown): string | null {
  const v = typeof value === 'string' ? value.trim() : '';
  if (!v) return null;
  return v.startsWith('#') ? v : `#${v}`;
}

function blankToNull(value: unknown): unknown {
  if (value === undefined || value === null) return null;
  if (typeof value === 'string' && value.trim() === '') return null;
  return value;
}

@Component({
    selector: 'app-add-theme-layer',
    templateUrl: './add-theme-layer.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class AddThemeLayerComponent implements OnInit {
  CMS_API = environment.CMS_API;

  allowed = false;
  editable = false;
  layerId: string | null = null;
  submitted = false;
  saving = false;

  scopes = LAYER_SCOPE_OPTIONS;
  languages = LAYER_LANGUAGE_OPTIONS;
  textSections = TEXT_SECTIONS;
  colorFields = COLOR_FIELDS;
  flagFields = FLAG_FIELDS;
  flagOptions = FLAG_OPTIONS;
  enumFields = ENUM_FIELDS;

  telecoms: { id: string; name: string; services: { id: string; name: string }[] }[] = [];
  allServices: { id: string; name: string }[] = [];
  serviceOptions: { id: string; name: string }[] = [];

  images: string[] = [];
  imageUrlInput = '';
  imageError = '';
  selectedFile: File | null = null;
  uploading = false;

  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    private httpService: HttpService,
    private messageService: MessageService,
    private route: ActivatedRoute,
    private router: Router,
    private access: ThemeLayerAccessService
  ) {
    const controls: Record<string, any> = {
      layer_scope: [null, [Validators.required]],
      layer_telecom_id: [null],
      layer_service_id: [null],
      theme_language: [null],
      theme_exit_button_url: ['', [optionalPattern(HTTP_URL), Validators.maxLength(1000)]],
      theme_operator_logo_url: ['', [optionalPattern(HTTPS_OR_ROOT_URL), Validators.maxLength(1000)]]
    };
    for (const section of TEXT_SECTIONS) {
      for (const field of section.fields) controls[field.name] = ['', [Validators.maxLength(field.max)]];
    }
    for (const field of COLOR_FIELDS) controls[field.name] = ['', [optionalPattern(HEX_COLOR_INPUT)]];
    for (const field of FLAG_FIELDS) controls[field.name] = [null];
    for (const field of ENUM_FIELDS) controls[field.name] = [null];
    this.form = this.fb.group(controls);
  }

  get f() {
    return this.form.controls;
  }

  get scope(): string | null {
    return this.form.get('layer_scope')?.value ?? null;
  }

  get needsTelecom(): boolean {
    return this.scope === 'operator' || this.scope === 'operator_service';
  }

  get needsService(): boolean {
    return this.scope === 'service' || this.scope === 'operator_service';
  }

  ngOnInit() {
    this.access.isSuperadmin().subscribe((allowed) => {
      if (!allowed) {
        this.router.navigate(['no-access']);
        return;
      }
      this.allowed = true;
      this.layerId = this.route.snapshot.queryParamMap.get('id');
      this.editable = !!this.layerId;
      this.getReferenceData();
      if (this.layerId) this.loadLayer(this.layerId);
    });
  }

  getReferenceData() {
    this.httpService.get(`${this.CMS_API}campaign/campaign-data`).subscribe({
      next: (res) => {
        if (res.error) return;
        this.telecoms = (res.data.telecoms ?? []).map((t: any) => ({
          id: t.id,
          name: `${t.name} (${t.region_name})`,
          services: (t.tel_services ?? []).map((s: any) => ({ id: s.id, name: s.name ?? s.id }))
        }));
        this.allServices = (res.data.services ?? []).map((s: any) => ({ id: s.id, name: s.name }));
        this.refreshServiceOptions();
      },
      error: (err) => console.log(err)
    });
  }

  loadLayer(id: string) {
    this.httpService.get(`${this.CMS_API}campaign/theme-layers/get?layer_id=${encodeURIComponent(id)}`).subscribe({
      next: (res) => {
        if (res.error) {
          this.messageService.add({ severity: 'error', summary: 'Failed', detail: res.message });
          return;
        }
        const layer = res.data ?? {};
        const values: Record<string, unknown> = {};
        for (const name of Object.keys(this.form.controls)) {
          if (name in layer) values[name] = layer[name] ?? (this.isNullDefault(name) ? null : '');
        }
        this.form.patchValue(values);
        this.images = String(layer.theme_image_urls ?? '').split(',').map((u) => u.trim()).filter(Boolean);
        for (const key of KEY_FIELDS) this.form.get(key)?.disable();
        this.refreshServiceOptions();
      },
      error: (err) => {
        this.messageService.add({ severity: 'error', summary: 'Failed', detail: err?.error?.message ?? 'Could not load the default theme' });
      }
    });
  }

  private isNullDefault(name: string): boolean {
    return KEY_FIELDS.includes(name) || FLAG_FIELDS.some((f) => f.name === name) || ENUM_FIELDS.some((f) => f.name === name);
  }

  onScopeChange() {
    if (!this.needsTelecom) this.form.patchValue({ layer_telecom_id: null });
    if (!this.needsService) this.form.patchValue({ layer_service_id: null });
    this.refreshServiceOptions();
  }

  onTelecomChange() {
    if (this.scope === 'operator_service') this.form.patchValue({ layer_service_id: null });
    this.refreshServiceOptions();
  }

  /** Operator + service offers only the operator's partner services. */
  private refreshServiceOptions() {
    if (this.scope === 'operator_service') {
      const telecomId = this.form.get('layer_telecom_id')?.value;
      this.serviceOptions = this.telecoms.find((t) => t.id === telecomId)?.services ?? [];
    } else {
      this.serviceOptions = this.allServices;
    }
  }

  // ---- images ----

  addImageUrl() {
    const url = this.imageUrlInput.trim();
    this.imageError = '';
    if (!url) return;
    if (!HTTPS_OR_ROOT_URL.test(url)) {
      this.imageError = 'Use an https URL or a root-relative path (starting with /).';
      return;
    }
    if (this.images.length >= MAX_IMAGES) {
      this.imageError = `At most ${MAX_IMAGES} images.`;
      return;
    }
    this.images.push(url);
    this.imageUrlInput = '';
  }

  removeImage(index: number) {
    this.images.splice(index, 1);
  }

  onFileChange(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;
    this.imageError = '';
    this.selectedFile = null;
    if (!file) return;
    const parts = file.name.toLowerCase().split('.');
    const ext = parts.length > 1 ? parts.pop()! : '';
    if (!IMAGE_TYPES.includes(ext) || !file.type.startsWith('image/')) {
      this.imageError = 'Only PNG, JPG, GIF or WEBP images.';
      input.value = '';
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      this.imageError = 'The image must be 1 MB or smaller.';
      input.value = '';
      return;
    }
    this.selectedFile = file;
  }

  uploadImage(input: HTMLInputElement) {
    if (!this.selectedFile || this.uploading) return;
    if (this.images.length >= MAX_IMAGES) {
      this.imageError = `At most ${MAX_IMAGES} images.`;
      return;
    }
    const formData = new FormData();
    formData.append('file', this.selectedFile);
    this.uploading = true;
    this.httpService.postWithUploadFile(`${this.CMS_API}campaign/theme/image_upload`, formData).subscribe({
      next: (res) => {
        this.uploading = false;
        if (res.error) {
          this.imageError = res.message;
          return;
        }
        const path = String(res.data?.file_path ?? '');
        if (!HTTPS_OR_ROOT_URL.test(path)) {
          this.imageError = `Uploaded, but "${path}" is not https or root-relative, so default themes cannot use it. Paste an https URL instead.`;
          return;
        }
        this.images.push(path);
        this.selectedFile = null;
        input.value = '';
      },
      error: (err) => {
        this.uploading = false;
        this.imageError =
          err?.status === 503
            ? 'Image upload is not configured on the server. Paste an https image URL instead.'
            : (err?.error?.message ?? 'Upload failed');
      }
    });
  }

  // ---- submit ----

  private keyErrors(): string | null {
    const raw = this.form.getRawValue();
    if (!raw.layer_scope) return 'Please select a scope';
    if (this.needsTelecom && !raw.layer_telecom_id) return 'Please select an operator';
    if (this.needsService && !raw.layer_service_id) return 'Please select a service';
    return null;
  }

  private content(): Record<string, unknown> {
    const raw = this.form.getRawValue();
    const body: Record<string, unknown> = {};
    for (const section of TEXT_SECTIONS) {
      for (const field of section.fields) body[field.name] = blankToNull(raw[field.name]);
    }
    for (const field of COLOR_FIELDS) body[field.name] = normalizeColor(raw[field.name]);
    for (const field of FLAG_FIELDS) body[field.name] = raw[field.name] ?? null;
    for (const field of ENUM_FIELDS) body[field.name] = raw[field.name] ?? null;
    body['theme_exit_button_url'] = blankToNull(raw.theme_exit_button_url?.trim?.() ?? raw.theme_exit_button_url);
    body['theme_operator_logo_url'] = blankToNull(raw.theme_operator_logo_url?.trim?.() ?? raw.theme_operator_logo_url);
    body['theme_image_urls'] = this.images.length ? this.images.join(',') : null;
    return body;
  }

  onSubmit() {
    this.submitted = true;
    const keyError = this.editable ? null : this.keyErrors();
    if (keyError || this.form.invalid) {
      this.messageService.add({ severity: 'error', summary: 'Check the form', detail: keyError ?? 'Some fields are invalid' });
      return;
    }
    const raw = this.form.getRawValue();
    const body = this.editable
      ? { layer_id: this.layerId, ...this.content() }
      : {
          layer_scope: raw.layer_scope,
          layer_telecom_id: this.needsTelecom ? raw.layer_telecom_id : null,
          layer_service_id: this.needsService ? raw.layer_service_id : null,
          theme_language: raw.theme_language,
          ...this.content()
        };
    this.saving = true;
    this.httpService.post(`${this.CMS_API}campaign/theme-layers/${this.editable ? 'update' : 'create'}`, body).subscribe({
      next: (res) => {
        this.saving = false;
        if (res.error) {
          this.messageService.add({ severity: 'error', summary: 'Failed', detail: res.message });
          return;
        }
        this.messageService.add({ severity: 'success', summary: 'Success', detail: res.message });
        setTimeout(() => this.router.navigate(['campaign/theme-layers/list']), 1000);
      },
      error: (err) => {
        this.saving = false;
        this.messageService.add({ severity: 'error', summary: 'Failed', detail: err?.error?.message ?? 'Save failed' });
      }
    });
  }
}
