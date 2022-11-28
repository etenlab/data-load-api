import { Test, TestingModule } from '@nestjs/testing';
import { Iso6392Controller } from './iso6392.controller';

describe('Iso6392Controller', () => {
  let controller: Iso6392Controller;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [Iso6392Controller],
    }).compile();

    controller = module.get<Iso6392Controller>(Iso6392Controller);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
