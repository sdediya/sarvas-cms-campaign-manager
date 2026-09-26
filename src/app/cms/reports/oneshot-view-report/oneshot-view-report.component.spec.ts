import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OneshotViewReportComponent } from './oneshot-view-report.component';

describe('OneshotViewReportComponent', () => {
  let component: OneshotViewReportComponent;
  let fixture: ComponentFixture<OneshotViewReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OneshotViewReportComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OneshotViewReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
