import { Controller, Get } from '@nestjs/common';
import { SilLanguageCodesService } from './sil-language-codes.service';

@Controller('sil-language-codes')
export class SilLanguageCodesController {
  constructor(private silLanguageCode: SilLanguageCodesService) {}
  @Get('sync')
  async sync(): Promise<string> {
    await this.silLanguageCode.fetchData();
    return 'test';
  }
}
