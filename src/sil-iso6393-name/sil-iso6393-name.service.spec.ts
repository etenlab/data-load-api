import { Test, TestingModule } from '@nestjs/testing';
import { SilIso6393NameService } from './sil-iso6393-name.service';

describe('SilIso6393NameService', () => {
  let service: SilIso6393NameService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SilIso6393NameService],
    }).compile();

    service = module.get<SilIso6393NameService>(SilIso6393NameService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
