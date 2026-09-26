import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddSmartUrlComponent } from './add-smart-url.component';

describe('AddSmartUrlComponent', () => {
  let component: AddSmartUrlComponent;
  let fixture: ComponentFixture<AddSmartUrlComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddSmartUrlComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddSmartUrlComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
