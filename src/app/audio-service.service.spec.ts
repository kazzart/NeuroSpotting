import { TestBed } from '@angular/core/testing';

import { KeywordSpottingService } from './keyword-spotting.service';

describe('AudioServiceService', () => {
  let service: KeywordSpottingService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(KeywordSpottingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
