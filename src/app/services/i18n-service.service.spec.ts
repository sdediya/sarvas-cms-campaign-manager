import { TestBed } from '@angular/core/testing';

import { I18nServiceService } from './i18n-service.service';

describe('I18nServiceService', () => {
  let service: I18nServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(I18nServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
