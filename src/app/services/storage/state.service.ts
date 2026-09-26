import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class StateService {

  constructor() { }

  private readonly _stateValue = new BehaviorSubject <any>([]);

  readonly stateValue$ = this._stateValue.asObservable();

  public getSingleStateValue(stateType:any = ''): any {
    return this._stateValue.getValue()[stateType] || null;
  }

  public getAllStateValues(): any {
    return this._stateValue.getValue();
  }

  private set stateValue(val: any) {
    this._stateValue.next(val);
  }

  addStateValue(key:any, value: any) {
    this.stateValue = {...this.getAllStateValues(), [key]: value};
  }

  removeStateValue(key:any) {
    delete this.stateValue[key];
  }
  removeAllStateValue() {
    this.stateValue = [];
  }

}
