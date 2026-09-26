import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomerRefundComponent } from './customer-refund.component';

describe('CustomerRefundComponent', () => {
  let component: CustomerRefundComponent;
  let fixture: ComponentFixture<CustomerRefundComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CustomerRefundComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CustomerRefundComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
