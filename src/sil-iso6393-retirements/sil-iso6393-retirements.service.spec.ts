import { Test, TestingModule } from '@nestjs/testing';
import { SilIso6393RetirementsService } from './sil-iso6393-retirements.service';

describe('SilIso6393RetirementsService', () => {
  let service: SilIso6393RetirementsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SilIso6393RetirementsService],
    }).compile();

    service = module.get<SilIso6393RetirementsService>(
      SilIso6393RetirementsService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
