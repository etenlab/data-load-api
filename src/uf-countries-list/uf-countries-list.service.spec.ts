import { Test, TestingModule } from '@nestjs/testing';
import { UfCountriesListService } from './uf-countries-list.service';

describe('UfCountriesListService', () => {
  let service: UfCountriesListService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UfCountriesListService],
    }).compile();

    service = module.get<UfCountriesListService>(UfCountriesListService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
