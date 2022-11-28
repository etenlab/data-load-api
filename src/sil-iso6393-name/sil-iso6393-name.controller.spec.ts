import { Test, TestingModule } from '@nestjs/testing';
import { SilIso6393NameController } from './sil-iso6393-name.controller';

describe('SilIso6393NameController', () => {
  let controller: SilIso6393NameController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SilIso6393NameController],
    }).compile();

    controller = module.get<SilIso6393NameController>(SilIso6393NameController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
