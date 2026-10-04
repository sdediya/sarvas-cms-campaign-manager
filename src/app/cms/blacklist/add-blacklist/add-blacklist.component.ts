import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { environment } from 'src/environments/environment';
import { HttpService } from 'src/app/services/http/http.service';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ActivatedRoute, Router } from '@angular/router';
import { CrudService } from 'src/app/services/common/crud.service';

@Component({
    selector: 'app-add-blacklist',
    templateUrl: './add-blacklist.component.html',
    styleUrls: ['./add-blacklist.component.css'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class AddBlacklistComponent implements OnInit{
  read:boolean = false
	write:boolean = false
	delete:boolean = false

  addBlacklistForm: any = FormGroup;
  submitted : boolean = false;
  isValidForm : boolean = false;

  CMS_API = environment.CMS_API;

  blacklistDurationType : string = '';
  blacklist_duration_types = [
    { name: 'Temporary', code:'temporary' },
    { name: 'Permanent', code:'permanent' }
  ]

  blacklistType : string = '';
  blacklist_types = [
    { name: 'Series', code:'series' },
    { name: 'Mobile Number', code:'number' }
  ]

  constructor(
    private frmbuilder:FormBuilder,
    private httpService:HttpService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private route: ActivatedRoute,
    private router: Router,
    private crudService:CrudService
  ){

    let permissions = this.crudService.hasPermission('blacklist_management')
    this.read = permissions.read
    this.write = permissions.write
    this.delete = permissions.delete
    if(!this.write){
      this.router.navigate(['no-access'])
    }

    this.addBlacklistForm = frmbuilder.group({
      blacklist_value:['', [Validators.required, Validators.pattern('^[0-9]+$')]],
      blacklist_is_bulk: [false],
      blacklist_duration_type:['', [Validators.required]],
      blacklist_type:['', [Validators.required]],
      blacklist_days:['', [Validators.required, Validators.minLength(1), Validators.maxLength(2), Validators.pattern('^[0-9]+$')]],
    })

    this.f['blacklist_is_bulk'].valueChanges.subscribe((value:any)=> {
      if(value){
        this.f['blacklist_value'].setValidators([Validators.required]);
      }else {
        this.f['blacklist_value'].setValidators([Validators.required, Validators.pattern('^[0-9]+$')]);
      }
      
      this.f['blacklist_value'].updateValueAndValidity();
      this.f['blacklist_value'].reset();
    })
  }

  ngOnInit(){}

  // convenience getter for easy access to form fields
  get f() { return this.addBlacklistForm.controls; }

  onSubmit(){
    this.submitted = true;
    if(this.addBlacklistForm.status!=='INVALID'){
      this.isValidForm = true;
      const data = {
        ...this.addBlacklistForm.value
      };
      
      this.httpService.post(`${this.CMS_API}blacklist/create`, data).subscribe({
        next:res=>{
          if(!res.error){
            this.messageService.add({ severity: 'success', summary: 'Success', detail: res.message });
            setTimeout(()=>{
              this.router.navigate(['blacklist/list'])
            },1e3)
          }
          else{
            this.messageService.add({ severity: 'error', summary: 'Failed', detail: res.message });
          }
        },
        error:err=>{
          this.messageService.add({ severity: 'error', summary: 'Failed', detail: err.error.message || 'Oops! Something went wrong...' });
          console.log(err)
        }
      });
    }
  }

  onBlacklistDurationTypeChange(ev:any){
    this.blacklistDurationType = ev.value;
    if(this.blacklistDurationType=='permanent'){
      this.addBlacklistForm.get('blacklist_days').clearValidators(); 
      this.addBlacklistForm.get('blacklist_days').reset(''); 
    }
    else{
      this.addBlacklistForm.get('blacklist_days').addValidators([Validators.required, Validators.minLength(1), Validators.maxLength(2), Validators.pattern('^[0-9]+$')]);
    }
  }

  onBlacklistTypeChange(ev:any){
    this.blacklistType = ev.value;
  }

}
