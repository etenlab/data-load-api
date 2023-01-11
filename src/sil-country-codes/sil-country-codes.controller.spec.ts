import { Test, TestingModule } from '@nestjs/testing';
import { SilCountryCodesController } from './sil-country-codes.controller';

describe('SilCountryCodesController', () => {
  let controller: SilCountryCodesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SilCountryCodesController],
    }).compile();

    controller = module.get<SilCountryCodesController>(
      SilCountryCodesController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
