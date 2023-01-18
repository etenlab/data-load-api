import {
  BadRequestException,
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Query,
} from '@nestjs/common';
import { ApiParam, ApiProperty } from '@nestjs/swagger';
import { inspect } from 'util';
import { GraphService } from './graph.service';

@Controller('graph')
export class GraphController {
  constructor(private readonly graphService: GraphService) {}

  @Get('node/:id')
  @ApiParam({
    name: 'id',
    description: 'The id of the node to get',
  })
  async getNodeGraph(@Param('id') id: string) {
    if (!id) {
      throw new BadRequestException('id is required');
    }

    const node = await this.graphService.resolveNode(id);

    if (!node) {
      return new NotFoundException('Node not found');
    }

    const str = inspect(node, false, 10);

    return str;
  }
}
