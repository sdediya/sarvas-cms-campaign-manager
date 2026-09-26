import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListLandingPageConfigurationComponent } from './list-landing-page-configuration.component';

describe('ListLandingPageConfigurationComponent', () => {
  let component: ListLandingPageConfigurationComponent;
  let fixture: ComponentFixture<ListLandingPageConfigurationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ListLandingPageConfigurationComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListLandingPageConfigurationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
