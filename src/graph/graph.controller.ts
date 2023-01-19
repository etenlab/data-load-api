import {
  BadRequestException,
  Controller,
  Get,
  NotFoundException,
  NotImplementedException,
  Param,
  Query,
} from '@nestjs/common';
import { ApiOkResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { inspect } from 'util';
import { GraphService } from './graph.service';

type Direction = 'all' | 'upstream' | 'downstream';

@Controller('graph')
export class GraphController {
  constructor(private readonly graphService: GraphService) {}

  @Get('from-node/:id')
  @ApiOkResponse({
    description:
      'Output graph starting with the node. Result is stringified with utils.inspect',
  })
  @ApiParam({
    name: 'id',
    description: 'The id of the node to get',
    schema: {
      type: 'string',
    },
  })
  @ApiQuery({
    enum: ['downstream'] as Direction[],
    name: 'direction',
    description:
      'The direction to traverse the graph. Only "downstream" is implemented',
  })
  @ApiQuery({
    name: 'max-depth',
    type: 'number',
    description: 'Max depth to traverse the graph. Default is 1000',
  })
  async getNodeGraph(
    @Param('id') id: string,
    @Query('direction')
    direction: Direction = 'all',
    @Query('max-depth')
    maxDepth = 1000,
  ) {
    if (!Number.isInteger(Number(id))) {
      throw new BadRequestException('id should be integer');
    }

    let incoming = true;
    const outgoing = true;

    switch (direction) {
      case 'downstream':
        incoming = false;
        break;
      case 'upstream':
        throw new NotImplementedException(
          'upstream graph traversal not implemented yet',
        );
      case 'all':
        throw new NotImplementedException(
          'full graph traversal not implemented yet',
        );
      default:
        throw new BadRequestException('Unrecognized param "direction"');
    }

    const resolved = await this.graphService.resolveGraphFromNodeDownstream(
      id,
      maxDepth,
    );

    const graph = this.graphService.simplifyNodeGraph(
      resolved,
      incoming,
      outgoing,
    );

    if (!graph) {
      return new NotFoundException('Node not found');
    }

    const str = inspect(graph, false, 1000);

    return str;
  }
}
