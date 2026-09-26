import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddLandingPageConfigurationComponent } from './add-landing-page-configuration.component';

describe('AddLandingPageConfigurationComponent', () => {
  let component: AddLandingPageConfigurationComponent;
  let fixture: ComponentFixture<AddLandingPageConfigurationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddLandingPageConfigurationComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddLandingPageConfigurationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
