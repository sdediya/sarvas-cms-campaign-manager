import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PayoutReportComponent } from './payout-report.component';

describe('PayoutReportComponent', () => {
  let component: PayoutReportComponent;
  let fixture: ComponentFixture<PayoutReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PayoutReportComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PayoutReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
