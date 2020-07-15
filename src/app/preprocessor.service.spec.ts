import { TestBed } from '@angular/core/testing';

import { PreprocessorService } from './preprocessor.service';

describe('PreprocessorService', () => {
  let service: PreprocessorService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PreprocessorService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
