import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ThirdPartyLogsComponent } from './third-party-logs.component';

describe('ThirdPartyLogsComponent', () => {
  let component: ThirdPartyLogsComponent;
  let fixture: ComponentFixture<ThirdPartyLogsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ThirdPartyLogsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ThirdPartyLogsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
