import { Controller, Get, Post, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { EpgService } from './epg.service';

@ApiTags('epg')
@Controller('epg')
export class EpgController {
  constructor(private readonly epgService: EpgService) {}

  @Get('channel/:channelId')
  @ApiOperation({ summary: 'Get EPG for a channel' })
  @ApiQuery({ name: 'startDate', required: false, type: String })
  @ApiQuery({ name: 'endDate', required: false, type: String })
  @ApiResponse({ status: 200, description: 'Returns EPG programs' })
  async getChannelEpg(
    @Param('channelId') channelId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string
  ) {
    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;

    return this.epgService.getChannelEpg(channelId, start, end);
  }

  @Get('channel/:channelId/current')
  @ApiOperation({ summary: 'Get current program for a channel' })
  @ApiResponse({ status: 200, description: 'Returns current program' })
  async getCurrentProgram(@Param('channelId') channelId: string) {
    return this.epgService.getCurrentProgram(channelId);
  }

  @Post('channel/:channelId/generate-placeholder')
  @ApiOperation({ summary: 'Generate placeholder EPG for demo' })
  @ApiResponse({ status: 201, description: 'Placeholder EPG generated' })
  async generatePlaceholder(@Param('channelId') channelId: string) {
    return this.epgService.generatePlaceholderEpg(channelId);
  }
}
