import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class EpgService {
  private readonly logger = new Logger(EpgService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Get EPG for a specific channel
   */
  async getChannelEpg(channelId: string, startDate?: Date, endDate?: Date) {
    const start = startDate || new Date();
    const end = endDate || new Date(Date.now() + 24 * 60 * 60 * 1000); // +24 hours

    return this.prisma.epgProgram.findMany({
      where: {
        channelId,
        startTime: { gte: start },
        endTime: { lte: end },
      },
      orderBy: {
        startTime: 'asc',
      },
    });
  }

  /**
   * Get current program for a channel
   */
  async getCurrentProgram(channelId: string) {
    const now = new Date();

    return this.prisma.epgProgram.findFirst({
      where: {
        channelId,
        startTime: { lte: now },
        endTime: { gte: now },
      },
    });
  }

  /**
   * Generate placeholder EPG data for demo purposes
   * This should be replaced with actual XMLTV parsing in production
   */
  async generatePlaceholderEpg(channelId: string) {
    const now = new Date();
    const programs = [];

    // Generate 24 hours of 2-hour blocks
    for (let i = 0; i < 12; i++) {
      const startTime = new Date(now.getTime() + i * 2 * 60 * 60 * 1000);
      const endTime = new Date(startTime.getTime() + 2 * 60 * 60 * 1000);

      programs.push({
        channelId,
        title: `Programme ${i + 1}`,
        description: 'Programme de démonstration. Remplacer par des données EPG réelles.',
        startTime,
        endTime,
        category: 'Général',
      });
    }

    // Insert programs
    for (const program of programs) {
      await this.prisma.epgProgram.upsert({
        where: {
          id: `${channelId}-${program.startTime.getTime()}`,
        },
        update: program,
        create: {
          ...program,
          id: `${channelId}-${program.startTime.getTime()}`,
        },
      });
    }

    return programs;
  }

  /**
   * TODO: Parse XMLTV format EPG data
   * This is a placeholder for future implementation
   */
  async importFromXmltv(xmlContent: string) {
    this.logger.warn('XMLTV import not yet implemented');
    throw new Error('XMLTV import not yet implemented');
  }
}
