import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmLabelImports } from '@spartan-ng/helm/label';
import { HlmSeparatorImports } from '@spartan-ng/helm/separator';
import { HlmTableImports } from '@spartan-ng/helm/table';
import { HlmSpinnerImports } from '@spartan-ng/helm/spinner';

import { CmsUiModule } from './cms-ui/cms-ui.module';

const HELM_IMPORTS = [
  ...HlmButtonImports,
  ...HlmInputImports,
  ...HlmLabelImports,
  ...HlmSeparatorImports,
  ...HlmTableImports,
  ...HlmSpinnerImports,
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    CmsUiModule,
    ...HELM_IMPORTS,
  ],
  exports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    CmsUiModule,
    ...HELM_IMPORTS,
  ],
})
export class SharedSpartanModule {}
