import { Component, OnInit } from '@angular/core';
import { Table } from '@openng/optimus-ui/table';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpService } from 'src/app/services/http/http.service';
import { ConfirmationService, MessageService } from '@openng/optimus-ui/api';
import { environment } from 'src/environments/environment';
import { CrudService } from 'src/app/services/common/crud.service';
import { Router } from '@angular/router';

@Component({
    selector: 'app-list-user',
    templateUrl: './list-user.component.html',
    styleUrls: ['./list-user.component.css'],
    standalone: false
})
export class ListUserComponent implements OnInit {

  read:boolean = false
	write:boolean = false
	delete:boolean = false

  loading: boolean = false;
  users:any=[]
  totalRecords: number = 0;
  CMS_API = environment.CMS_API;

  lazyLoadEvent:any;
  
  ngOnInit(){}

  constructor(
    private frmbuilder:FormBuilder,
    private httpService:HttpService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private crudService: CrudService,
    private router:Router
  ){
    let permissions = this.crudService.hasPermission('user_management')
    this.read = permissions.read
    this.write = permissions.write
    this.delete = permissions.delete
    if(!this.read){
      this.router.navigate(['no-access'])
    }
  }

  toggleUser(userId:any, userSts:any, userIndex:any){
    let data = {
      user_status: userSts==1?0:1,
      user_id: userId
    }
    this.confirmationService.confirm({
      key: 'confirmActiveInactive',
      target: new EventTarget,
      message: 'Are you sure that you want to change status of the user?',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.httpService.post(`${this.CMS_API}cms_users/user-delete`, data).subscribe({
          next:res=>{
            if(!res.error){
              this.messageService.add({ severity: 'success', summary: 'Success', detail: res.message });
              this.nextPage(this.lazyLoadEvent);
            }
            else{
              this.messageService.add({ severity: 'error', summary: 'Failed', detail: 'Something went wrong! Try again later...' });
            }
          },
          error:err=>console.log(err)
        })
      },
      reject: () => {
          this.users[userIndex].checked = this.users[userIndex].checked ? false:true
          return false;
      }
  });
    
  }

  filterOnChange(ev:any, fieldName:string){
    this.nextPage(this.lazyLoadEvent);
  }

  nextPage(event: any){
    this.lazyLoadEvent = event
    let limit = event.rows || 10;
    let page = event.first? (event.first / limit) + 1 : 1;
    this.httpService.get(`${this.CMS_API}cms_users/user-list?page=${page}&limit=${limit}`).subscribe({
      next:res=>{
        if(!res.error){
          this.users = res.data.list;
          this.totalRecords = res.data.pagination.total_records;
          this.users.map((ele:any)=> {
            ele.checked = ele.status? true: false;
            return ele;
          })
        }
      },
      error:err=>{
        console.log(err);
      }
    })
  }

  onGlobalFilter(table: Table, event: Event) {
    table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }

}

