import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { Prisma } from '@terranovision/database';

export interface ChannelFilter {
  search?: string;
  categoryId?: string;
  groupName?: string;
  language?: string;
  isActive?: boolean;
  ageRating?: number;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

@Injectable()
export class ChannelsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(filter: ChannelFilter = {}, pagination: PaginationParams = {}) {
    const { page = 1, limit = 50, sortBy = 'order', sortOrder = 'asc' } = pagination;
    const skip = (page - 1) * limit;

    const where: Prisma.ChannelWhereInput = {
      isActive: filter.isActive !== undefined ? filter.isActive : true,
    };

    if (filter.search) {
      where.OR = [
        { name: { contains: filter.search, mode: 'insensitive' } },
        { description: { contains: filter.search, mode: 'insensitive' } },
        { groupName: { contains: filter.search, mode: 'insensitive' } },
      ];
    }

    if (filter.categoryId) {
      where.categoryId = filter.categoryId;
    }

    if (filter.groupName) {
      where.groupName = filter.groupName;
    }

    if (filter.language) {
      where.language = filter.language;
    }

    if (filter.ageRating !== undefined) {
      where.ageRating = { lte: filter.ageRating };
    }

    const [channels, total] = await Promise.all([
      this.prisma.channel.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          category: true,
        },
      }),
      this.prisma.channel.count({ where }),
    ]);

    return {
      data: channels,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const channel = await this.prisma.channel.findUnique({
      where: { id },
      include: {
        category: true,
        epgPrograms: {
          where: {
            startTime: { lte: new Date() },
            endTime: { gte: new Date() },
          },
          take: 1,
          orderBy: { startTime: 'asc' },
        },
      },
    });

    if (!channel) {
      throw new NotFoundException(`Channel with ID ${id} not found`);
    }

    return channel;
  }

  async findBySlug(slug: string) {
    const channel = await this.prisma.channel.findUnique({
      where: { slug },
      include: {
        category: true,
        epgPrograms: {
          where: {
            startTime: { lte: new Date() },
            endTime: { gte: new Date() },
          },
          take: 1,
          orderBy: { startTime: 'asc' },
        },
      },
    });

    if (!channel) {
      throw new NotFoundException(`Channel with slug ${slug} not found`);
    }

    return channel;
  }

  async getGroups() {
    const groups = await this.prisma.channel.groupBy({
      by: ['groupName'],
      where: {
        groupName: { not: null },
        isActive: true,
      },
      _count: {
        id: true,
      },
      orderBy: {
        groupName: 'asc',
      },
    });

    return groups.map(g => ({
      name: g.groupName,
      count: g._count.id,
    }));
  }

  async search(query: string, limit = 20) {
    return this.prisma.channel.findMany({
      where: {
        isActive: true,
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
          { groupName: { contains: query, mode: 'insensitive' } },
        ],
      },
      take: limit,
      include: {
        category: true,
      },
      orderBy: {
        name: 'asc',
      },
    });
  }

  async create(data: Prisma.ChannelCreateInput) {
    return this.prisma.channel.create({
      data,
      include: {
        category: true,
      },
    });
  }

  async update(id: string, data: Prisma.ChannelUpdateInput) {
    return this.prisma.channel.update({
      where: { id },
      data,
      include: {
        category: true,
      },
    });
  }

  async delete(id: string) {
    return this.prisma.channel.delete({
      where: { id },
    });
  }
}
