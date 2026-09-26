import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MsisdnwiseReportComponent } from './msisdnwise-report.component';

describe('MsisdnwiseReportComponent', () => {
  let component: MsisdnwiseReportComponent;
  let fixture: ComponentFixture<MsisdnwiseReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MsisdnwiseReportComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MsisdnwiseReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
