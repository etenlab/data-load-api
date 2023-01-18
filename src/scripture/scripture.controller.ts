import { Controller, Post, Body } from '@nestjs/common';
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

export class GetBookDTO {
  @ApiProperty()
  identificator!: string;
}

@Controller('scripture')
export class ScriptureController {
  constructor(private readonly scriptureService: ScriptureService) {}

  @Post('by-url')
  async createByUrl(@Body() params: ByUrlDTO): Promise<{
    nodeIds: string[];
  }> {
    const nodeIds = await this.scriptureService.loadUSFMIntoDBByUrl(params.url);

    return {
      nodeIds,
    };
  }

  @Post('raw')
  async createWithBody(@Body() params: ByTextDTO) {
    await this.scriptureService.loadUSFMBooksIntoDB(params.usfm);
  }
}
