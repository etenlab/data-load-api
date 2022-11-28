import { Controller, Get } from '@nestjs/common';
import { SilIso6393Service } from './sil-iso6393.service';

@Controller('sil-iso6393')
export class SilIso6393Controller {
  constructor(private silIso6393: SilIso6393Service) {}

  @Get('sync')
  async sync(): Promise<string> {
    await this.silIso6393.fetchData();
    return 'test';
  }
}
