import { TestBed, inject } from '@angular/core/testing';

import { GapiService } from './gapi.service';

describe('GapiService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [GapiService]
    });
  });

  it('should be created', inject([GapiService], (service: GapiService) => {
    expect(service).toBeTruthy();
  }));
});
