import { Test, TestingModule } from '@nestjs/testing';
import { StrongsService } from './strongs.service';

describe('StrongsService', () => {
  let service: StrongsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [StrongsService],
    }).compile();

    service = module.get<StrongsService>(StrongsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
