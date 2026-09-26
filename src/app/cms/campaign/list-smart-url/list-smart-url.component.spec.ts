import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListSmartUrlComponent } from './list-smart-url.component';

describe('ListSmartUrlComponent', () => {
  let component: ListSmartUrlComponent;
  let fixture: ComponentFixture<ListSmartUrlComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ListSmartUrlComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListSmartUrlComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
