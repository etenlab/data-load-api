import { Controller, Get } from '@nestjs/common';
import { SilLanguageIndexService } from './sil-language-index.service';

@Controller('sil-language-index')
export class SilLanguageIndexController {
  constructor(private silLanguageIndex: SilLanguageIndexService) {}
  @Get('sync')
  async sync(): Promise<string> {
    await this.silLanguageIndex.fetchData();
    return 'test';
  }
}
