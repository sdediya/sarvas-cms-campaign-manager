import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ServiceApiDocComponent } from './service-api-doc.component';

describe('ServiceApiDocComponent', () => {
  let component: ServiceApiDocComponent;
  let fixture: ComponentFixture<ServiceApiDocComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ServiceApiDocComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ServiceApiDocComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
