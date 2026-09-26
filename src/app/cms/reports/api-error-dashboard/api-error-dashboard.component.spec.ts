import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ApiErrorDashboardComponent } from './api-error-dashboard.component';

describe('ApiErrorDashboardComponent', () => {
  let component: ApiErrorDashboardComponent;
  let fixture: ComponentFixture<ApiErrorDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ApiErrorDashboardComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ApiErrorDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
