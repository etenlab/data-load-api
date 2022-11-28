import { Test, TestingModule } from '@nestjs/testing';
import { SilIso6393RetirementsController } from './sil-iso6393-retirements.controller';

describe('SilIso6393RetirementsController', () => {
  let controller: SilIso6393RetirementsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SilIso6393RetirementsController],
    }).compile();

    controller = module.get<SilIso6393RetirementsController>(SilIso6393RetirementsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
