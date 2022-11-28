import { Test, TestingModule } from '@nestjs/testing';
import { UfLangNamesService } from './uf-lang-names.service';

describe('UfLangNamesService', () => {
  let service: UfLangNamesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UfLangNamesService],
    }).compile();

    service = module.get<UfLangNamesService>(UfLangNamesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
