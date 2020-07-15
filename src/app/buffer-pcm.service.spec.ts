import { TestBed } from '@angular/core/testing';

import { BufferPCMService } from './buffer-pcm.service';

describe('BufferPCMService', () => {
  let service: BufferPCMService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BufferPCMService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
