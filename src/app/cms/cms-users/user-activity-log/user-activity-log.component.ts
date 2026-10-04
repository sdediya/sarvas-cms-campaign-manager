import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CrudService } from 'src/app/services/common/crud.service';
import { userActivityService } from 'src/app/services/common/userActivity.service';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Table } from 'primeng/table';
import { HttpService } from 'src/app/services/http/http.service';
import { environment } from 'src/environments/environment';

@Component({
    selector: 'app-user-activity-log',
    templateUrl: './user-activity-log.component.html',
    styleUrls: ['./user-activity-log.component.css'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class UserActivityLogComponent {
  CMS_API = environment.CMS_API;
userActivityLogs: any;
loading: boolean = false;
totalRecords: number = 0;
lazyLoadEvent:any;
selectedUserActivityLog: any;
showUserActivityLog: boolean = false;
rangeDates: string = '';
  users: any;
  selectedUser:any
  maxDate: any;
  userActivity_date_range:Date[] | undefined
  selected_user:any
   startDate:any
   endDate:any
   userId:any

data:any = {userId:null, startDate:null, endDate:null }
  
constructor(private userActivity : userActivityService, private httpService : HttpService, ){
 this.userList()
}

ngOnInit(){
  this.maxDate = new Date()
}

nextPage(event: any){
  this.lazyLoadEvent = event
  let limit = event.rows || 10;
  let page = event.first? (event.first / limit) + 1 : 1;
  this.data.limit = limit,
  this.data.page = page
  let searchData = Object.entries(this.data).reduce((a:any,[k,v]) => (v == null ? a : (a[k]=v, a)), {});
  
    this.userActivity.getFilterUserActivityLog('user/getFilterUserActivityLogs',searchData).subscribe(res=>{
      this.userActivityLogs = res.data.userLogData
      this.totalRecords = res.data.pagination.total_records;
    })
  
}

onSelectFilter(event:any,type:any){
if(type=='activity_date'){
  this.userActivity_date_range
}
}

onSubmit() {
  if(this.selected_user)this.data.userId = this.selected_user
  if(this.userActivity_date_range!= undefined){
    this.data.startDate =  this.userActivity_date_range[0].toISOString().substring(0, 10)
    this.data.endDate = this.userActivity_date_range[1].toISOString().substring(0, 10)
  }
  this.nextPage(this.lazyLoadEvent)
}

clearFilters(){
  this.selected_user = ''
  this.userId = '',
  this.userActivity_date_range = undefined
  Object.keys(this.data).forEach((i) =>{this.data[i] = null});
  this.nextPage(this.lazyLoadEvent);
}

userList(){
  let limit =  100;
  let page =  1;
  this.httpService.get(`${this.CMS_API}cms_users/user-list?page=${page}&limit=${limit}`).subscribe({
    next:res=>{
      if(!res.error){
        this.users = res.data.list;
        this.totalRecords = res.data.pagination.total_records;
      }
    },
    error:err=>{
      console.log(err);
    }
  })
}

showDialog(userActivityLog:any){
  this.showUserActivityLog = true
  this.selectedUserActivityLog = userActivityLog
}
}
