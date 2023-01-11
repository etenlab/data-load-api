import { Test, TestingModule } from '@nestjs/testing';
import { StrongsController } from './strongs.controller';

describe('StrongsController', () => {
  let controller: StrongsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StrongsController],
    }).compile();

    controller = module.get<StrongsController>(StrongsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
