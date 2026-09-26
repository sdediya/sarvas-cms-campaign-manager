import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { TableModule } from '@openng/optimus-ui/table';
import { ButtonModule } from '@openng/optimus-ui/button';
import { InputTextModule } from '@openng/optimus-ui/inputtext';
import { SelectModule } from '@openng/optimus-ui/select';
import { DatePickerModule } from '@openng/optimus-ui/datepicker';
import { ToggleSwitchModule } from '@openng/optimus-ui/toggleswitch';
import { DrawerModule } from '@openng/optimus-ui/drawer';
import { TabsModule } from '@openng/optimus-ui/tabs';
import { ToastModule } from '@openng/optimus-ui/toast';
import { ConfirmDialogModule } from '@openng/optimus-ui/confirmdialog';
import { ConfirmPopupModule } from '@openng/optimus-ui/confirmpopup';
import { DialogModule } from '@openng/optimus-ui/dialog';
import { MultiSelectModule } from '@openng/optimus-ui/multiselect';
import { CheckboxModule } from '@openng/optimus-ui/checkbox';
import { FieldsetModule } from '@openng/optimus-ui/fieldset';
import { DividerModule } from '@openng/optimus-ui/divider';
import { TooltipModule } from '@openng/optimus-ui/tooltip';
import { RadioButtonModule } from '@openng/optimus-ui/radiobutton';
import { ColorPickerModule } from '@openng/optimus-ui/colorpicker';
import { EditorModule } from '@openng/optimus-ui/editor';
import { CardModule } from '@openng/optimus-ui/card';
import { BadgeModule } from '@openng/optimus-ui/badge';
import { InputNumberModule } from '@openng/optimus-ui/inputnumber';
import { ToggleButtonModule } from '@openng/optimus-ui/togglebutton';
import { MenubarModule } from '@openng/optimus-ui/menubar';
import { TieredMenuModule } from '@openng/optimus-ui/tieredmenu';
import { RippleModule } from '@openng/optimus-ui/ripple';
import { MessageModule } from '@openng/optimus-ui/message';
import { PasswordModule } from '@openng/optimus-ui/password';
import { ProgressSpinnerModule } from '@openng/optimus-ui/progressspinner';
import { TextareaModule } from '@openng/optimus-ui/textarea';
import { SharedModule as PrimeSharedModule } from '@openng/optimus-ui/api';
import { IconFieldModule } from '@openng/optimus-ui/iconfield';
import { InputIconModule } from '@openng/optimus-ui/inputicon';

const SHARED = [
  CommonModule,
  FormsModule,
  ReactiveFormsModule,
  RouterModule,
  TableModule,
  ButtonModule,
  InputTextModule,
  SelectModule,
  DatePickerModule,
  ToggleSwitchModule,
  DrawerModule,
  TabsModule,
  ToastModule,
  ConfirmDialogModule,
  ConfirmPopupModule,
  DialogModule,
  MultiSelectModule,
  CheckboxModule,
  FieldsetModule,
  DividerModule,
  TooltipModule,
  RadioButtonModule,
  ColorPickerModule,
  EditorModule,
  CardModule,
  BadgeModule,
  InputNumberModule,
  ToggleButtonModule,
  MenubarModule,
  TieredMenuModule,
  RippleModule,
  MessageModule,
  PasswordModule,
  ProgressSpinnerModule,
  TextareaModule,
  IconFieldModule,
  InputIconModule,
  PrimeSharedModule,
];

@NgModule({
  imports: [...SHARED],
  exports: [...SHARED],
})
export class SharedUiModule {}
