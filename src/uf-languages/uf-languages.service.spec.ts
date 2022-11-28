import { Test, TestingModule } from '@nestjs/testing';
import { UfLanguagesService } from './uf-languages.service';

describe('UfLanguagesService', () => {
  let service: UfLanguagesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UfLanguagesService],
    }).compile();

    service = module.get<UfLanguagesService>(UfLanguagesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
