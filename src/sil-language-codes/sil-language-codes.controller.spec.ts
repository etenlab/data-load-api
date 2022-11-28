import { Test, TestingModule } from '@nestjs/testing';
import { SilLanguageCodesController } from './sil-language-codes.controller';

describe('SilLanguageCodesController', () => {
  let controller: SilLanguageCodesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SilLanguageCodesController],
    }).compile();

    controller = module.get<SilLanguageCodesController>(SilLanguageCodesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
