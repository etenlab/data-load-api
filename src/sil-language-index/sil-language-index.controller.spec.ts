import { Test, TestingModule } from '@nestjs/testing';
import { SilLanguageIndexController } from './sil-language-index.controller';

describe('SilLanguageIndexController', () => {
  let controller: SilLanguageIndexController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SilLanguageIndexController],
    }).compile();

    controller = module.get<SilLanguageIndexController>(
      SilLanguageIndexController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
