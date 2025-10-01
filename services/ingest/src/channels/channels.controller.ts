import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Query,
  Body,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { ChannelsService, ChannelFilter, PaginationParams } from './channels.service';

@ApiTags('channels')
@Controller('channels')
@UseGuards()
export class ChannelsController {
  constructor(private readonly channelsService: ChannelsService) {}

  @Get()
  @Throttle({ default: { limit: 60, ttl: 60000 } })
  @ApiOperation({ summary: 'Get all channels with filters and pagination' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'categoryId', required: false, type: String })
  @ApiQuery({ name: 'groupName', required: false, type: String })
  @ApiQuery({ name: 'language', required: false, type: String })
  @ApiResponse({ status: 200, description: 'Returns paginated channels' })
  async findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('categoryId') categoryId?: string,
    @Query('groupName') groupName?: string,
    @Query('language') language?: string,
    @Query('ageRating') ageRating?: string
  ) {
    const filter: ChannelFilter = {
      search,
      categoryId,
      groupName,
      language,
      ageRating: ageRating ? Number(ageRating) : undefined,
    };

    const pagination: PaginationParams = {
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
    };

    return this.channelsService.findAll(filter, pagination);
  }

  @Get('search')
  @Throttle({ default: { limit: 30, ttl: 60000 } })
  @ApiOperation({ summary: 'Search channels by query' })
  @ApiQuery({ name: 'q', required: true, type: String })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Returns matching channels' })
  async search(@Query('q') query: string, @Query('limit') limit?: string) {
    return this.channelsService.search(query, limit ? Number(limit) : undefined);
  }

  @Get('groups')
  @Throttle({ default: { limit: 30, ttl: 60000 } })
  @ApiOperation({ summary: 'Get all channel groups' })
  @ApiResponse({ status: 200, description: 'Returns list of channel groups' })
  async getGroups() {
    return this.channelsService.getGroups();
  }

  @Get(':id')
  @Throttle({ default: { limit: 60, ttl: 60000 } })
  @ApiOperation({ summary: 'Get channel by ID' })
  @ApiResponse({ status: 200, description: 'Returns channel details' })
  @ApiResponse({ status: 404, description: 'Channel not found' })
  async findOne(@Param('id') id: string) {
    return this.channelsService.findOne(id);
  }

  @Get('slug/:slug')
  @Throttle({ default: { limit: 60, ttl: 60000 } })
  @ApiOperation({ summary: 'Get channel by slug' })
  @ApiResponse({ status: 200, description: 'Returns channel details' })
  @ApiResponse({ status: 404, description: 'Channel not found' })
  async findBySlug(@Param('slug') slug: string) {
    return this.channelsService.findBySlug(slug);
  }
}
