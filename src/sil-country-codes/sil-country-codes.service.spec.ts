import { Test, TestingModule } from '@nestjs/testing';
import { SilCountryCodesService } from './sil-country-codes.service';

describe('SilCountryCodesService', () => {
  let service: SilCountryCodesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SilCountryCodesService],
    }).compile();

    service = module.get<SilCountryCodesService>(SilCountryCodesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
