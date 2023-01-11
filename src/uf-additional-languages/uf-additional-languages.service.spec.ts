import { Test, TestingModule } from '@nestjs/testing';
import { UfAdditionalLanguagesService } from './uf-additional-languages.service';

describe('UfAdditionalLanguagesService', () => {
  let service: UfAdditionalLanguagesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UfAdditionalLanguagesService],
    }).compile();

    service = module.get<UfAdditionalLanguagesService>(
      UfAdditionalLanguagesService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
