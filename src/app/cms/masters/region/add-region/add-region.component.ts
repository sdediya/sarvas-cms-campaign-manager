import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { RxwebValidators } from '@rxweb/reactive-form-validators'
import { HttpService } from 'src/app/services/http/http.service';
import * as customValidator from 'src/app/utils/validators'
import { environment } from 'src/environments/environment';
import { ConfirmationService, MessageService } from 'primeng/api';
import { CrudService } from 'src/app/services/common/crud.service';

@Component({
    selector: 'app-add-region',
    templateUrl: './add-region.component.html',
    styleUrls: ['./add-region.component.css'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class AddRegionComponent  implements OnInit{
  read:boolean = false
	write:boolean = false
	delete:boolean = false

  CMS_API = environment.CMS_API;

  [key:string]:any
  regionForm: any = FormGroup;

  submitted : boolean = false;
  isValidForm : boolean = false;

  // Edit
  editable : boolean = false;
  region_id:any;
  currentRegion:any={
    region_id:'',
    region_name:'',
    region_iso:'',
    region_call_code:'',
    region_mob_max_length:'',
    region_mob_min_length:'',
    region_currency_code:'',
    region_currency_name:''
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
          this.region_id = params['id'];
        }
      }
      );
      this.regionForm = frmbuilder.group({
        region_name: ['', [Validators.required]],
        region_iso: ['', [Validators.required, Validators.maxLength(3)]],
        region_call_code: ['', [Validators.required]],
        region_mob_max_length: ['', [Validators.required, Validators.pattern('^[0-9]+$'), Validators.minLength(1), Validators.maxLength(2)]],
        region_mob_min_length: ['', [Validators.required, Validators.pattern('^[0-9]+$'), Validators.minLength(1), Validators.maxLength(2)]],
        region_currency_code: ['', [Validators.required]],
        region_currency_name: ['', [Validators.required]]

      });
  }

  ngOnInit(){
    if(this.editable){
      this.getRegionById();
    }
  }

  // convenience getter for easy access to form fields
  get f() { return this.regionForm.controls; }

  getRegionById(){
    this.httpService.get(`${this.CMS_API}region/getRegionById?region_id=${this.region_id}`).subscribe({
      next:res=>{
        if(!res.error){
          this.currentRegion = res.data
          this.regionForm.addControl('region_id', new FormControl('', []));
          this.regionForm.patchValue(res.data)
        }
      },
      error:err=>console.log(err)
    })
  }


  onSubmit(){
    this.submitted = true;
    console.log("this.regionForm", this.regionForm)
    if(this.regionForm.status!=='INVALID'){
      this.isValidForm = true;
      const data = {
        ...this.regionForm.value
      };
      let regionAction = this.editable ? "edit" : "add"
      this.httpService.post(`${this.CMS_API}region/${regionAction}`, data).subscribe({
        next:res=>{
          if(!res.error){
            this.messageService.add({ severity: 'success', summary: 'Success', detail: res.message });
            setTimeout(()=>{
              this.router.navigate(['masters/region'])
            },1e3)
          }
          else{
            this.messageService.add({ severity: 'error', summary: 'Failed', detail: res.message });
          }
        },
        error:err=>{
          console.log(err)
          this.messageService.add({ severity: 'error', summary: 'Failed', detail: err.error.message });
        }
      });
    }
    return false;
  }


}
