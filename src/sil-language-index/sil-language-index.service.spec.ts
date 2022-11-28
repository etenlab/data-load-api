import { Test, TestingModule } from '@nestjs/testing';
import { SilLanguageIndexService } from './sil-language-index.service';

describe('SilLanguageIndexService', () => {
  let service: SilLanguageIndexService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SilLanguageIndexService],
    }).compile();

    service = module.get<SilLanguageIndexService>(SilLanguageIndexService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
