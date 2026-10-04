import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators, FormArray } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { HttpService } from 'src/app/services/http/http.service';
import { environment } from 'src/environments/environment';

@Component({
    selector: 'app-operator-revenue-calculator',
    templateUrl: './operator-revenue-calculator.component.html',
    styleUrls: ['./operator-revenue-calculator.component.css'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class OperatorRevenueCalculatorComponent implements OnInit {
  revenueCalForm: FormGroup;
  headers: any[] = [];
  telcoms: any[] = [];
  operator_name: any;
  CMS_API = environment.CMS_API;
  telid = '';
  regionShortCode = '';
  submitted: boolean = false;
  isValidForm : boolean = false;
  lastEnteredHeader: string = '';

  constructor(
    private frmbuilder: FormBuilder,
    private messageService: MessageService,
    private httpService: HttpService,
  ) {
    this.revenueCalForm = this.frmbuilder.group({
      revenue_telcom_region: ['', [Validators.required]],
      revenue_service_type: ['legacy'],
      op_formulas: this.frmbuilder.array([]), 
    });
  }

  ngOnInit(): void {
    this.getTelcoms(); 
  }

  get op_formulas(): FormArray {
    return this.revenueCalForm.get('op_formulas') as FormArray;
  }

  get f() { return this.revenueCalForm.controls; }

  getTelcoms() {
    this.httpService.get(`${this.CMS_API}telcom/list?limit=ALL&s=null&status=1`).subscribe({
      next: res => {
        if (!res.error) {
          this.telcoms = res.data.list.map((tel: any) => {
            tel.name = `${tel.name} (${tel.region_name})`;
            tel.id = `${tel.id}|$|${tel.region_id}`;
            return tel;
          });
          this.headers = res.data.headers.map((header: any) => ({
            key: header.key,
            header: header.header
          }));
        }
      },
      error: err => console.error('Error fetching telecom data', err)
    });
  }
  onDropdownChangeTel(event: any) {
    const selectedValue = event.value;
    this.revenueCalForm.get('revenue_telcom_region')?.setValue(selectedValue);
  }
  
  onSubmit() {
    this.submitted = true;
    // this.isValidForm = true;
    const selectedTelcomId = this.revenueCalForm.get('revenue_telcom_region')?.value;
    this.operator_name = this.findObjectByKeyValue(this.telcoms, 'id', selectedTelcomId);
    if (this.revenueCalForm.invalid) return;

    const [telid, regionId] = this.operator_name.id.split('|$|');
    this.telid = telid;
    this.regionShortCode = this.operator_name.region_shortcode;

    const data = {}; 
    this.httpService.post(`${this.CMS_API}reports/revenue-Formula-Headers`, data).subscribe({
      next: (data) => {
        if (Array.isArray(data)) {
          // this.headers = data.filter((header: any) => header.key !== 'date' && header.key !== 'service');
          this.addHeaders(data);
        }
      },
      error: (err) => console.error('Error fetching revenue headers:', err)
    });
  }

  // Handle formula submission
  onSubmitFormula() {
    let selectedTelcom = this.revenueCalForm.get('revenue_telcom_region')?.value;
    let serviceTelcom = this.revenueCalForm.get('revenue_service_type')?.value;
    this.operator_name = this.findObjectByKeyValue(this.telcoms, 'id', selectedTelcom);
    const [telid, regionId] = this.operator_name.id.split('|$|');
    this.telid = telid;
    const rowData = this.op_formulas.controls.map(control => {
      
      const headerName = control.get('headerName')?.value;
      let formula = control.get('formulas')?.value ?? null;
      let type = 'Number';

      if(headerName === "Date" || headerName === "Product Type"){
        type = 'String';
      }
      else{
        type = 'Number';
      } 

      if (formula) {
        formula = formula.replace(/(\d+)%/g, '($1/100)');
      } else {
        formula = this.getDefaultFormula(headerName);
      }


      return {
        key: control.get('key')?.value ? control.get('key')?.value : this.generateKey(headerName),
        header: headerName,
        type : type,
        formula: formula
      };
    });

    this.httpService.post(`${this.CMS_API}reports/revenue-formulas`, {
      telcomName: `${this.telid}_${serviceTelcom}`,
      rowData
    }).subscribe({
      next: (response) => {
        console.log('File saved successfully:', response);
        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'File saved successfully!' });
        this.resetForm();
      },
      error: (error) => {
        console.error('Error saving this file:', error);
        this.messageService.add({ severity: 'error', summary: 'Failed', detail: error });
      }
    });
  }

  getDefaultFormula(headerName: string): string {
    switch (headerName) {
      case "SEL Top-Line $": return "{selTopline}*{dollar_currency}";
      case "SEL Top-Line INR": return "{selToplineDollar}*{inr_currency}";
      case "P/L ($)": return "{selToplineDollar}-{costDollar}";
      case "SEL Top-Line": return "{topline}*({sel_share}/100)";
      default: return ''; 
    }
  }

//   generateKey(key: string) {
//     key = key.replace(/[^a-zA-Z0-9\s]/g, (match) => {
//       if (match === '-') return '';
//       const specialCharMap: { [key: string]: string } = {
//         '@': 'at',
//         '#': 'hash',
//         '$': 'dollar',
//         '%': 'percent',
//         '&': 'and',
//         '*': 'asterisk',
//         '!': 'exclamation',
//         '?': 'question',
//         '_': 'underscore',
//         '=': 'equals',
//         '+': 'plus',
//         '/': 'n'
//       };

//       return specialCharMap[match] || match;
//     });

//     key = key.toLowerCase();
//     key = key.replace(/\s(.)/g, (match, group1) => group1.toUpperCase());
//     key = key.replace(/\s+/g, '');  
//     key = key.charAt(0).toLowerCase() + key.slice(1);    
//     return key;
// }
generateKey(key: string) {
  key = key.replace(/[^a-zA-Z0-9\s]/g, (match) => {
    if (match === '-' || match === '(' || match === ')') return ''; // remove brackets and dash
    const specialCharMap: { [key: string]: string } = {
      '@': 'at',
      '#': 'hash',
      '$': 'dollar',
      '%': 'percent',
      '&': 'and',
      '*': 'asterisk',
      '!': 'exclamation',
      '?': 'question',
      '_': 'underscore',
      '=': 'equals',
      '+': 'plus',
      '/': 'n'
    };
    return specialCharMap[match] || match;
  });

  key = key.toLowerCase();
  key = key.replace(/\s(.)/g, (match, group1) => group1.toUpperCase());
  key = key.replace(/\s+/g, '');
  key = key.charAt(0).toLowerCase() + key.slice(1);
  return key;
}

  addHeaders(headers: any[]) {
    headers.forEach((header, index) => {
      if (!this.headers.some(existingHeader => existingHeader.key === header.key)) {
        this.headers.push({ key: header.key, header: header.header });
      }
      this.op_formulas.push(this.createNewRow(header, index));
    });
  }

  createNewRow(header: any, index: number): FormGroup {
    const isEditable = !['date', 'productType', 'totalHits', 'hitsWithMsisdn', 'activeBase','parkingBase','graceBase', 'wapS2s','wapAsync','serviceS2s',
    'serviceAsync','costDollar','cpa','totalAct','firstRen','actFromParking','activationrevenue','actfromparkrevenue','totalActRev','renCount','renFromGrace','renewalrevenue','renfromgracerevenue','totalRenRev','topline'].includes(header.key);
    return this.frmbuilder.group({
      key: [header.key || this.generateKey(header.header)],
      headerName: [header.header, Validators.required],
      formulas: ['', Validators.required],
      editable: [isEditable],
      selectedHeader: [null]
    });
  }

  addNewRow(i: number): void {
    this.op_formulas.insert(i + 1, this.createNewRow({ header: 'Enter New Header' }, i + 1));
  }

  removeRow(i: number): void {
    this.op_formulas.removeAt(i);
  }

  findObjectByKeyValue(arr: any[], key: string, value: any) {
    return arr.find(obj => obj[key] === value);
  }

  resetForm() {
    this.revenueCalForm.reset({ revenue_service_type: 'legacy' });
    this.op_formulas.clear();
    this.submitted = false;
  }

  onDropdownChange(event: any, i: number): void {
    const selectedKey = `{${event.value}}`;
    const formGroup = this.op_formulas.at(i);
    const currentFormula = formGroup.get('formulas')?.value || '';
    formGroup.get('formulas')?.setValue(currentFormula + (currentFormula ? ' ' : '') + selectedKey);
    formGroup.get('selectedHeader')?.reset();
  }
  onHeaderNameChange(headerName: string, i: number) {
    this.lastEnteredHeader = headerName;
    console.log(`Header at index ${i} changed to: ${headerName}`);
  }
  onHeaderBlur(i: number) {
    const row = this.op_formulas.at(i);
  
    if (row) {
      const headerName = row.get('headerName')?.value; 
      const key = this.generateKey(headerName);

      row.get('key')?.setValue(key);
      row.get('selectedHeader')?.setValue(headerName);
  
      if (!this.headers.some(header => header.key === key)) {
        this.headers.push({ key, header: headerName });
      }
    }
  }
    
}

