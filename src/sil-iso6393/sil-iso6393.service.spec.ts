import { Test, TestingModule } from '@nestjs/testing';
import { SilIso6393Service } from './sil-iso6393.service';

describe('SilIso6393Service', () => {
  let service: SilIso6393Service;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SilIso6393Service],
    }).compile();

    service = module.get<SilIso6393Service>(SilIso6393Service);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
