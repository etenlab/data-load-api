import { Controller, Get } from '@nestjs/common';
import { SilIso6393RetirementsService } from './sil-iso6393-retirements.service';

@Controller('sil-iso6393-retirements')
export class SilIso6393RetirementsController {
  constructor(private silIso6393Retirement: SilIso6393RetirementsService) {}
  @Get('sync')
  async sync(): Promise<string> {
    await this.silIso6393Retirement.fetchData();
    return 'test';
  }
}
