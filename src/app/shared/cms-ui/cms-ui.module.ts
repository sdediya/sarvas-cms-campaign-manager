import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmLabelImports } from '@spartan-ng/helm/label';
import { HlmSeparatorImports } from '@spartan-ng/helm/separator';
import { HlmTableImports } from '@spartan-ng/helm/table';
import { HlmSpinnerImports } from '@spartan-ng/helm/spinner';

import { CmsPageHeaderComponent } from './cms-page-header.component';
import { CmsFilterBarComponent } from './cms-filter-bar.component';
import { CmsDataTableComponent } from './cms-data-table.component';
import { CmsFormSectionComponent } from './cms-form-section.component';
import { CmsEmptyStateComponent } from './cms-empty-state.component';

const CMS_WRAPPERS = [
  CmsPageHeaderComponent,
  CmsFilterBarComponent,
  CmsDataTableComponent,
  CmsFormSectionComponent,
  CmsEmptyStateComponent,
];

const HELM_IMPORTS = [
  ...HlmButtonImports,
  ...HlmInputImports,
  ...HlmLabelImports,
  ...HlmSeparatorImports,
  ...HlmTableImports,
  ...HlmSpinnerImports,
];

@NgModule({
  declarations: [...CMS_WRAPPERS],
  imports: [CommonModule, ...HELM_IMPORTS],
  exports: [...CMS_WRAPPERS, ...HELM_IMPORTS],
})
export class CmsUiModule {}
