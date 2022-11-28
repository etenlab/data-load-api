import { Controller, Get } from '@nestjs/common';
import { SilIso6393MacrolanguagesService } from './sil-iso6393-macrolanguages.service';

@Controller('sil-iso6393-macrolanguages')
export class SilIso6393MacrolanguagesController {
  constructor(private silIso6393Macrolang: SilIso6393MacrolanguagesService) {}

  @Get('sync')
  async sync(): Promise<string> {
    await this.silIso6393Macrolang.fetchData();
    return 'test';
  }
}
