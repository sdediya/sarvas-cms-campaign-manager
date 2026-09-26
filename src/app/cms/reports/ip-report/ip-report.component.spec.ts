import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IpReportComponent } from './ip-report.component';

describe('IpReportComponent', () => {
  let component: IpReportComponent;
  let fixture: ComponentFixture<IpReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ IpReportComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IpReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
