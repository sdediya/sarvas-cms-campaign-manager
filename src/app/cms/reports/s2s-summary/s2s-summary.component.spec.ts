import { ComponentFixture, TestBed } from '@angular/core/testing';

import { S2sSummaryComponent } from './s2s-summary.component';

describe('S2sSummaryComponent', () => {
  let component: S2sSummaryComponent;
  let fixture: ComponentFixture<S2sSummaryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ S2sSummaryComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(S2sSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
