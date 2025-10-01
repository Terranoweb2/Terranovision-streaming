import { Controller, Post, Get, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { IngestService } from './ingest.service';

class ImportPlaylistDto {
  url: string;
}

@ApiTags('ingest')
@Controller('ingest')
@UseGuards()
export class IngestController {
  constructor(private readonly ingestService: IngestService) {}

  @Post('import')
  @Throttle({ default: { limit: 5, ttl: 300000 } }) // 5 requests per 5 minutes
  @ApiOperation({ summary: 'Import M3U playlist from URL' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        url: {
          type: 'string',
          example: process.env.M3U_ENDPOINT,
        },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Playlist imported successfully' })
  @ApiResponse({ status: 400, description: 'Invalid URL or import failed' })
  async importPlaylist(@Body() body: ImportPlaylistDto) {
    const url = body.url || process.env.M3U_ENDPOINT;

    if (!url) {
      throw new Error('No M3U URL provided and M3U_ENDPOINT not set');
    }

    return this.ingestService.importFromUrl(url);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get import statistics' })
  @ApiResponse({ status: 200, description: 'Returns import statistics' })
  async getStats() {
    return this.ingestService.getStats();
  }

  @Post('import/auto')
  @Throttle({ default: { limit: 2, ttl: 300000 } }) // 2 requests per 5 minutes
  @ApiOperation({ summary: 'Import from default M3U_ENDPOINT' })
  @ApiResponse({ status: 201, description: 'Playlist imported successfully' })
  async autoImport() {
    const url = process.env.M3U_ENDPOINT;

    if (!url) {
      throw new Error('M3U_ENDPOINT environment variable not set');
    }

    return this.ingestService.importFromUrl(url);
  }
}
