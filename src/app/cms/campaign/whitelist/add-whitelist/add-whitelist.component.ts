import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { environment } from 'src/environments/environment';
import { HttpService } from 'src/app/services/http/http.service';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ActivatedRoute, Router } from '@angular/router';
import { CrudService } from 'src/app/services/common/crud.service';

@Component({
    selector: 'app-add-whitelist',
    templateUrl: './add-whitelist.component.html',
    styleUrls: ['./add-whitelist.component.css'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class AddWhitelistComponent  implements OnInit{

  read:boolean = false
	write:boolean = false
	delete:boolean = false

  addWhitelistForm: any = FormGroup;
  submitted : boolean = false;
  isValidForm : boolean = false;
  
  CMS_API = environment.CMS_API;

  whitelistType : string = '';

  whitelist_types = [
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

    let permissions = this.crudService.hasPermission('campaign_configurations')
    this.read = permissions.read
    this.write = permissions.write
    this.delete = permissions.delete
    if(!this.write){
      this.router.navigate(['no-access'])
    }

    this.addWhitelistForm = frmbuilder.group({
      whitelist_value:['', [Validators.required, Validators.pattern('^[0-9]+$')]],
      whitelist_type:['', [Validators.required]],
      whitelist_is_bulk:['']
    })

    this.f['whitelist_is_bulk'].valueChanges.subscribe((value:any)=> {
      let whitelistValueFormControl = this.f['whitelist_value'];
      if(value){
        whitelistValueFormControl.setValidators([Validators.required]);
      }else {
        whitelistValueFormControl.setValidators([Validators.required, Validators.pattern('^[0-9]+$')]);
      }
      whitelistValueFormControl.updateValueAndValidity();
      whitelistValueFormControl.reset();
    })
  }
  
  ngOnInit(){}

  // convenience getter for easy access to form fields
  get f() { return this.addWhitelistForm.controls; }

  onSubmit(){
    this.submitted = true;
    if(this.addWhitelistForm.status!=='INVALID'){
      this.isValidForm = true;
      const data = {
        ...this.addWhitelistForm.value
      };
      // console.log("data", data);
      // return;
      let whitelistConfAction = "add"
      this.httpService.post(`${this.CMS_API}campaign//whitelist/${whitelistConfAction}`, data).subscribe({
        next:res=>{
          if(!res.error){
            this.messageService.add({ severity: 'success', summary: 'Success', detail: res.message });
            setTimeout(()=>{
              this.router.navigate(['campaign/whitelist'])
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
  }

  onWhitelistTypeChange(ev:any){
    this.whitelistType = ev.value;
    // if(this.whitelistType=='series'){// If selected "Series"
    //   this.addWhitelistForm.get('whitelist_value').clearValidators(); 
    //   this.addWhitelistForm.get('whitelist_value').reset(''); 
    // }
    // else{// If selected "Number"
    //   this.addWhitelistForm.get('whitelist_value').addValidators([Validators.required, Validators.pattern('^[0-9]+$')]);
    // }
  }

}
