import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WapComponent } from './wap.component';

describe('WapComponent', () => {
  let component: WapComponent;
  let fixture: ComponentFixture<WapComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WapComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
