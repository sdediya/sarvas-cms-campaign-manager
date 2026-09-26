import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ConfigComponent } from './config.component';
import { SharedUiModule } from 'src/app/shared/shared-ui.module';

@NgModule({
  declarations: [
    ConfigComponent
  ],
  imports: [
    SharedUiModule,
    CommonModule,
    FormsModule],
  exports:[
    ConfigComponent
  ]
})
export class ConfigModule { }
