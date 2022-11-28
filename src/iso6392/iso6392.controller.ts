import { Controller, Get } from '@nestjs/common';
import { Iso6392Service } from './iso6392.service';

@Controller('iso6392')
export class Iso6392Controller {
  constructor(private iso6392: Iso6392Service) {}
  @Get('sync')
  async sync(): Promise<string> {
    await this.iso6392.fetchData();
    return 'test';
  }
}
