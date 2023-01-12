import { Controller, Get, Post, Request, Response, Body } from '@nestjs/common';
import { ScriptureService } from './scripture.service';
import { ApiProperty } from '@nestjs/swagger';

export class ByUrlDTO {
  @ApiProperty()
  url!: string;
}

export class ByTextDTO {
  @ApiProperty()
  usfm!: string;
}

@Controller('scripture')
export class ScriptureController {
  constructor(private readonly scriptureService: ScriptureService) {}

  @Post('by-url')
  async createByUrl(@Body() params: ByUrlDTO) {
    await this.scriptureService.loadUSFMIntoDBByUrl(params.url);
  }

  @Post('raw')
  async createWithBody(@Body() params: ByTextDTO) {
    await this.scriptureService.loadUSFMIntoDB(params.usfm);
  }
}
