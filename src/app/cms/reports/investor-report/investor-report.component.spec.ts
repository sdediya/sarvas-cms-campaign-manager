import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InvestorReportComponent } from './investor-report.component';

describe('InvestorReportComponent', () => {
  let component: InvestorReportComponent;
  let fixture: ComponentFixture<InvestorReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InvestorReportComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InvestorReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
