import { Test, TestingModule } from '@nestjs/testing';
import { SilIso6393MacrolanguagesService } from './sil-iso6393-macrolanguages.service';

describe('SilIso6393MacrolanguagesService', () => {
  let service: SilIso6393MacrolanguagesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SilIso6393MacrolanguagesService],
    }).compile();

    service = module.get<SilIso6393MacrolanguagesService>(SilIso6393MacrolanguagesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
