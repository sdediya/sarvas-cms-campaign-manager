import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { DatePickerModule } from 'primeng/datepicker';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { DrawerModule } from 'primeng/drawer';
import { TabsModule } from 'primeng/tabs';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmPopupModule } from 'primeng/confirmpopup';
import { DialogModule } from 'primeng/dialog';
import { MultiSelectModule } from 'primeng/multiselect';
import { CheckboxModule } from 'primeng/checkbox';
import { FieldsetModule } from 'primeng/fieldset';
import { DividerModule } from 'primeng/divider';
import { TooltipModule } from 'primeng/tooltip';
import { RadioButtonModule } from 'primeng/radiobutton';
import { ColorPickerModule } from 'primeng/colorpicker';
import { EditorModule } from 'primeng/editor';
import { CardModule } from 'primeng/card';
import { BadgeModule } from 'primeng/badge';
import { InputNumberModule } from 'primeng/inputnumber';
import { ToggleButtonModule } from 'primeng/togglebutton';
import { MenubarModule } from 'primeng/menubar';
import { TieredMenuModule } from 'primeng/tieredmenu';
import { RippleModule } from 'primeng/ripple';
import { MessageModule } from 'primeng/message';
import { PasswordModule } from 'primeng/password';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { TextareaModule } from 'primeng/textarea';
import { SharedModule as PrimeSharedModule } from 'primeng/api';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';

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
