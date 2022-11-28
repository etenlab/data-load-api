import { Test, TestingModule } from '@nestjs/testing';
import { SilIso6393Controller } from './sil-iso6393.controller';

describe('SilIso6393Controller', () => {
  let controller: SilIso6393Controller;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SilIso6393Controller],
    }).compile();

    controller = module.get<SilIso6393Controller>(SilIso6393Controller);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
