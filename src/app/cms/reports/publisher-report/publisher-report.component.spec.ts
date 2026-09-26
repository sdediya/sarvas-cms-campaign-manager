import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PublisherReportComponent } from './publisher-report.component';

describe('PublisherReportComponent', () => {
  let component: PublisherReportComponent;
  let fixture: ComponentFixture<PublisherReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PublisherReportComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PublisherReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
