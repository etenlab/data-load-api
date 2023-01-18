import { Controller, Post, Body } from '@nestjs/common';
import { ScriptureService } from './scripture.service';
import { ApiCreatedResponse, ApiProperty } from '@nestjs/swagger';

export class ByUrlDTO {
  @ApiProperty()
  url!: string;
}

export class GetBookDTO {
  @ApiProperty()
  identificator!: string;
}

export class BooksReponse {
  @ApiProperty()
  bookIds!: string[];
}

@Controller('scripture')
export class ScriptureController {
  constructor(private readonly scriptureService: ScriptureService) {}

  @Post('by-url')
  @ApiCreatedResponse({
    description: 'The books has been successfully created',
    type: BooksReponse,
  })
  async createByUrl(@Body() params: ByUrlDTO): Promise<BooksReponse> {
    const bookIds = await this.scriptureService.loadUSFMIntoDBByUrl(params.url);

    return {
      bookIds,
    };
  }
}
