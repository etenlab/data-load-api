import { Test, TestingModule } from '@nestjs/testing';
import { Iso6392Service } from './iso6392.service';

describe('Iso6392Service', () => {
  let service: Iso6392Service;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [Iso6392Service],
    }).compile();

    service = module.get<Iso6392Service>(Iso6392Service);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
