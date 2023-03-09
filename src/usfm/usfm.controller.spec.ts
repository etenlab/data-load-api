import { Test, TestingModule } from '@nestjs/testing';
import { UsfmController } from './usfm.controller';

describe('UsfmController', () => {
  let controller: UsfmController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsfmController],
    }).compile();

    controller = module.get<UsfmController>(UsfmController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
