import { Controller, Get } from '@nestjs/common';
import { SilIso6393NameService } from './sil-iso6393-name.service';

@Controller('sil-iso6393-name')
export class SilIso6393NameController {
  constructor(private silIso6393Name: SilIso6393NameService) {}
  @Get('sync')
  async sync(): Promise<string> {
    await this.silIso6393Name.fetchData();
    return 'test';
  }
}
