import { FormControl, FormGroup, Validators} from "@angular/forms";

export default class CustomValidators {
    public static atLeastOneRequired = (keys: string[]) => {
        return (group: FormGroup) => {
          const { controls } = group;
          return keys.some(key => controls[key] && controls[key].value.length!==0)
            ? null
            : { atLeastOne: 'error' };
        };
    };

    public static conditionalRequired = (masterField:FormControl, slaveField:FormControl) => {
        masterField.valueChanges.subscribe((value:boolean)=> {
            if (value) {
                slaveField.setValidators([Validators.required]);
            } else {
                slaveField.clearValidators();
            }
            slaveField.updateValueAndValidity();
        })
    }

    public static updateValidations = (conditions:boolean, formControl: FormControl, validations:any) =>{
        if(conditions) {
            formControl.setValidators(validations);
        }else {
            formControl.clearValidators();
        }
        formControl.updateValueAndValidity();
    }

    // To check whether field has validator 'required'
    public static checkIfRequired = (group:FormGroup, formControl: any) =>{
        let abstractControl = group.controls[formControl];
        return abstractControl.hasValidator(Validators.required);
    }

}