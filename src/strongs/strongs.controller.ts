import { Controller, Post } from '@nestjs/common';
import { StrongsService } from './strongs.service';

@Controller('strongs')
export class StrongsController {
  constructor(private strongsService: StrongsService) {}

  @Post('create')
  async create() {
    await this.strongsService.loadStrongsIntoDB();
  }
}
