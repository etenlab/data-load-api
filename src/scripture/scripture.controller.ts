import { Body, Controller, Get, Post, Response } from '@nestjs/common';
import { ScriptureService } from './scripture.service';
import { ApiProperty } from '@nestjs/swagger';

export class ByUrlDTO {
  @ApiProperty()
  url: string;
}

@Controller('scripture')
export class ScriptureController {
  constructor(private readonly scriptureService: ScriptureService) {}

  @Post('by-url')
  async create(@Body() params: ByUrlDTO) {
    await this.scriptureService.loadUSFMIntoDBByUrl(params.url);
  }
}
