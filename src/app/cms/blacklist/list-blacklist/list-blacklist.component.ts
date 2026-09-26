import { Component, OnInit } from '@angular/core';
import { Table } from 'primeng/table';
import { FormBuilder } from '@angular/forms';
import { HttpService } from 'src/app/services/http/http.service';
import { MessageService } from 'primeng/api';
import { environment } from 'src/environments/environment';
import { CrudService } from 'src/app/services/common/crud.service';
import { Router } from '@angular/router';

@Component({
    selector: 'app-list-blacklist',
    templateUrl: './list-blacklist.component.html',
    styleUrls: ['./list-blacklist.component.css'],
    standalone: false
})
export class ListBlacklistComponent implements OnInit{
  read:boolean = false
	write:boolean = false
	delete:boolean = false

  loading: boolean = false;
  blacklist_confs:any=[]
  totalRecords: number = 0;
  CMS_API = environment.CMS_API;

  lazyLoadEvent:any;
  filter: any = {'blacklist_type': null, 'blacklist_duration_type':null}
  
  blacklist_duration_types = [
    { name: 'Temporary', code:'temporary' },
    { name: 'Permanent', code:'permanent' }
  ]

  blacklist_types = [
    { name: 'Series', code:'series' },
    { name: 'Mobile Number', code:'number' }
  ]
  filterString: any;

  constructor(
    private frmbuilder:FormBuilder,
    private httpService:HttpService,
    private messageService: MessageService,
    private crudService: CrudService,
    private router:Router
  ){
    let permissions = this.crudService.hasPermission('blacklist_management')
    this.read = permissions.read
    this.write = permissions.write
    this.delete = permissions.delete
    if(!this.read){
      this.router.navigate(['no-access'])
    }
  }

  ngOnInit(){}

  filterOnChange(ev:any, fieldName:string){
    this.nextPage(this.lazyLoadEvent);
  }
  
  nextPage(event: any){
    this.lazyLoadEvent = event
    let limit = event.rows || 10;
    let page = event.first? (event.first / limit) + 1 : 1;
    let params = new URLSearchParams(this.filter);
    let s = event.globalFilter
    this.filterString = {s, ...this.filter}
    this.httpService.get(`${this.CMS_API}blacklist/listing?page=${page}&limit=${limit}&s=${event.globalFilter}&${params}`).subscribe({
      next:res=>{
        if(!res.error){
          this.blacklist_confs = res.data.list;
          this.totalRecords = res.data.pagination.total_records;
          this.blacklist_confs.map((ele:any)=> {
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

  clearFilters(){
    Object.keys(this.filter).forEach((i) => this.filter[i] = null);
    this.nextPage(this.lazyLoadEvent);
  }
}
