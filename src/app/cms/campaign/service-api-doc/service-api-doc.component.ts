import { DatePipe } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ClipboardService } from 'ngx-clipboard';
import { ConfirmationService, MessageService } from '@openng/optimus-ui/api';
import { CrudService } from 'src/app/services/common/crud.service';
import { HttpService } from 'src/app/services/http/http.service';
import { environment } from 'src/environments/environment';

@Component({
    selector: 'app-service-api-doc',
    templateUrl: './service-api-doc.component.html',
    styleUrls: ['./service-api-doc.component.css'],
    standalone: false
})
export class ServiceApiDocComponent {

  read:boolean = false
  write:boolean = false
  delete:boolean = false

  apiDocs:any = {};
  CMS_API = environment.CMS_API

  constructor(
    private httpService:HttpService,
    public crudService:CrudService,
    private router:Router
  ){
    let permissions = this.crudService.hasPermission('campaigns')
    this.read = permissions.read
    this.write = permissions.write
    this.delete = permissions.delete
    if(!this.read){
      this.router.navigate(['no-access'])
    }
  }

  ngOnInit(){
    this.getServiceFiles();
  }

  getServiceFiles() {
    this.httpService.get(`${this.CMS_API}utility/serviceApiDoc`).subscribe({
      next:res=>{
        if(!res.error){
          this.apiDocs = res.data 
        }
      },
      error:err=>{
        console.log(err)
      }
    })
  }
}
