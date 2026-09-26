import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { RxwebValidators } from '@rxweb/reactive-form-validators'
import { HttpService } from 'src/app/services/http/http.service';
import * as customValidator from 'src/app/utils/validators'
import { environment } from 'src/environments/environment';
import { ConfirmationService, MessageService } from 'primeng/api';
import { CrudService } from 'src/app/services/common/crud.service';

@Component({
    selector: 'app-add-master-aggregator',
    templateUrl: './add-master-aggregator.component.html',
    styleUrls: ['./add-master-aggregator.component.css'],
    standalone: false
})
export class AddMasterAggregatorComponent implements OnInit{

  read:boolean = false
	write:boolean = false
	delete:boolean = false

  CMS_API = environment.CMS_API;

  [key:string]:any
  masterAggregatorForm: any = FormGroup;

  submitted : boolean = false;
  isValidForm : boolean = false;

   // Edit
   editable : boolean = false;
   maggregator_id:any;
   currentMasterAggregator:any={
     maggregator_id:'',
     maggregator_name:'',
   }

   constructor(
    private frmbuilder:FormBuilder, 
    private httpService:HttpService,
    private route: ActivatedRoute,
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
    private router: Router,
    private crudService:CrudService
){

  let permissions = this.crudService.hasPermission('masters')
    this.read = permissions.read
    this.write = permissions.write
    this.delete = permissions.delete
    if(!this.write){
      this.router.navigate(['no-access'])
    }

  this.route.queryParams
      .subscribe(params => {        
        if(params['id']){
          this.editable = true
          this.maggregator_id = params['id'];
        }
      }
      );
      this.masterAggregatorForm = frmbuilder.group({
        maggregator_name: ['', [Validators.required]]
      });
  }

  ngOnInit(){
    if(this.editable){
      this.getMasterAggregatorById();
    }
  }

  // convenience getter for easy access to form fields
  get f() { return this.masterAggregatorForm.controls; }

  getMasterAggregatorById(){
    this.httpService.get(`${this.CMS_API}master_aggregator/getMasterAggregatorById?maggregator_id=${this.maggregator_id}`).subscribe({
      next:res=>{
        if(!res.error){
          this.currentMasterAggregator = res.data
          console.log("res.data", res.data)
          this.masterAggregatorForm.addControl('maggregator_id', new FormControl('', []));
          this.masterAggregatorForm.patchValue(res.data)
        }
      },
      error:err=>console.log(err)
    })
  }

  onSubmit(){
    this.submitted = true;
    if(this.masterAggregatorForm.status!=='INVALID'){
      this.isValidForm = true;
      const data = {
        ...this.masterAggregatorForm.value
      };
      let masterAggregatorAction = this.editable ? "edit" : "add"
      this.httpService.post(`${this.CMS_API}master_aggregator/${masterAggregatorAction}`, data).subscribe({
        next:res=>{
          if(!res.error){
            this.messageService.add({ severity: 'success', summary: 'Success', detail: res.message });
            setTimeout(()=>{
              this.router.navigate(['masters/master-aggregators'])
            },1e3)
          }
          else{
            this.messageService.add({ severity: 'error', summary: 'Failed', detail: res.message });
          }
        },
        error:err=>{
          this.messageService.add({ severity: 'error', summary: 'Failed', detail: err.error.message });
        }
      });
    }
    return false;
  }

}
