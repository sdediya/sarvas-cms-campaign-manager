import { Component } from '@angular/core';
import { LayoutService } from '../../layout/layout.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpService } from 'src/app/services/http/http.service';
import { environment } from 'src/environments/environment';
import { ConfirmationService, MessageService } from '@openng/optimus-ui/api';
import { StorageService } from 'src/app/services/storage/storage.service';
import { Router } from '@angular/router';

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.css'],
    standalone: false
})
export class LoginComponent {

  // valCheck: string[] = ['remember'];
  CMS_API = environment.CMS_API;
  
  loginForm: FormGroup;
  constructor(
    public layoutService: LayoutService, 
    private frmbuilder: FormBuilder, 
    private httpService: HttpService,
    private messageService: MessageService, 
    private storageService: StorageService,
    private router: Router ) { 
      let auth = this.storageService.getUser();
      if(Object.keys(auth).length) {
        this.router.navigate(['dashboard']);
      }
      this.loginForm = this.frmbuilder.group({
        username: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required]]
      })
  }

  login() {
    if(this.loginForm.valid) {
      this.httpService.post(`${this.CMS_API}auth/login`, this.loginForm.value).subscribe({
        next:res=> {
          console.log(res);
          this.storageService.saveUser(res.data);
          this.router.navigate(['dashboard'])
        },
        error:error=> {
          console.log(error)
          if(error.status == 401){
            this.messageService.add({severity: 'error', summary: 'Error', detail: "Invalid credentials"})
          }
          if(error.status == 429){
            this.messageService.add({severity: 'error', summary: 'Error', detail: error.error})
          }
        }
      })
    }
  }

}
