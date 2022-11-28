import { Controller, Get } from '@nestjs/common';
import { SilCountryCodesService } from './sil-country-codes.service';

@Controller('sil-country-codes')
export class SilCountryCodesController {
  constructor(private silCountryCode: SilCountryCodesService) {}
  @Get('sync')
  async sync(): Promise<string> {
    await this.silCountryCode.fetchData();
    return 'test';
  }
}
