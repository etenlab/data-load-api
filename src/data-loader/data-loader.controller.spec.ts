import { Test, TestingModule } from '@nestjs/testing';
import { DataLoaderController } from './data-loader.controller';

describe('DataLoaderController', () => {
  let controller: DataLoaderController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DataLoaderController],
    }).compile();

    controller = module.get<DataLoaderController>(DataLoaderController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
