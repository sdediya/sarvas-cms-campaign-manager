import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserActivityLogComponent } from './user-activity-log.component';

describe('UserActivityLogComponent', () => {
  let component: UserActivityLogComponent;
  let fixture: ComponentFixture<UserActivityLogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UserActivityLogComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UserActivityLogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
