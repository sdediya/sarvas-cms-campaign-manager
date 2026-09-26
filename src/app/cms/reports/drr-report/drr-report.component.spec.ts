import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DrrReportComponent } from './drr-report.component';

describe('DrrReportComponent', () => {
  let component: DrrReportComponent;
  let fixture: ComponentFixture<DrrReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DrrReportComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DrrReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
