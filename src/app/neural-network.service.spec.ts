import { TestBed } from '@angular/core/testing';

import { NeuralNetworkService } from './neural-network.service';

describe('NeuralNetworkService', () => {
  let service: NeuralNetworkService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NeuralNetworkService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
