import { Test, TestingModule } from '@nestjs/testing';
import { SilLanguageCodesService } from './sil-language-codes.service';

describe('SilLanguageCodesService', () => {
  let service: SilLanguageCodesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SilLanguageCodesService],
    }).compile();

    service = module.get<SilLanguageCodesService>(SilLanguageCodesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
