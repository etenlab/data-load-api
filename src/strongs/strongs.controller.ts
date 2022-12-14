import { Controller, Get } from '@nestjs/common';
import { StrongsService } from './strongs.service';

@Controller('strongs')
export class StrongsController {
  constructor(private strongsService: StrongsService) {}

  @Get('create')
  async create() {
    await this.strongsService.loadStrongsIntoDB();
  }
}
