import { Test, TestingModule } from '@nestjs/testing';
import { SilIso6393MacrolanguagesController } from './sil-iso6393-macrolanguages.controller';

describe('SilIso6393MacrolanguagesController', () => {
  let controller: SilIso6393MacrolanguagesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SilIso6393MacrolanguagesController],
    }).compile();

    controller = module.get<SilIso6393MacrolanguagesController>(SilIso6393MacrolanguagesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
