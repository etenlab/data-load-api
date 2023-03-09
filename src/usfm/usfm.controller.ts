import { Controller, Post, RawBodyRequest, Req } from '@nestjs/common';
import { ApiBody, ApiResponse } from '@nestjs/swagger';
import { parseUSFMMarkers } from '../scripture/usfmParser';

@Controller('usfm')
export class UsfmController {
  //   constructor(private scriptureService: ScriptureService) {}

  @ApiBody({
    type: 'text',
  })
  @ApiResponse({
    type: 'text',
  })
  @Post('to-markers')
  async toMarkers(@Req() req: RawBodyRequest<Request>) {
    const text = req.body!.toString();

    const markers = parseUSFMMarkers(text);

    const str = JSON.stringify(markers);

    return str;
  }
}
