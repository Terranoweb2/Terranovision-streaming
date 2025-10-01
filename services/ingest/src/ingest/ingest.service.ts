import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { M3uParserService, ParsedChannel } from './m3u-parser.service';
import { CategoriesService } from '../categories/categories.service';

@Injectable()
export class IngestService {
  private readonly logger = new Logger(IngestService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly m3uParser: M3uParserService,
    private readonly categoriesService: CategoriesService
  ) {}

  /**
   * Import M3U playlist from URL
   */
  async importFromUrl(url: string): Promise<{ imported: number; updated: number; errors: number }> {
    this.logger.log(`Starting M3U import from: ${url}`);

    try {
      // Parse M3U
      const channels = await this.m3uParser.fetchAndParse(url);

      // Import channels
      const result = await this.importChannels(channels);

      this.logger.log(
        `Import completed: ${result.imported} imported, ${result.updated} updated, ${result.errors} errors`
      );

      return result;
    } catch (error) {
      this.logger.error(`Import failed: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Import channels into database
   */
  private async importChannels(
    channels: ParsedChannel[]
  ): Promise<{ imported: number; updated: number; errors: number }> {
    let imported = 0;
    let updated = 0;
    let errors = 0;

    // Ensure default categories exist
    await this.categoriesService.ensureDefaultCategories();

    for (const channel of channels) {
      try {
        await this.importChannel(channel);
        imported++;
      } catch (error) {
        if (error.code === 'P2002') {
          // Unique constraint violation - try to update
          try {
            await this.updateChannel(channel);
            updated++;
          } catch (updateError) {
            this.logger.error(
              `Failed to update channel ${channel.name}: ${updateError.message}`
            );
            errors++;
          }
        } else {
          this.logger.error(`Failed to import channel ${channel.name}: ${error.message}`);
          errors++;
        }
      }
    }

    return { imported, updated, errors };
  }

  /**
   * Import single channel
   */
  private async importChannel(channel: ParsedChannel) {
    const slug = this.generateSlug(channel.name);
    const streamType = this.m3uParser.detectStreamType(channel.url);
    const categorySlug = this.m3uParser.mapGroupToCategory(channel.groupTitle || '');
    const ageRating = this.m3uParser.detectAgeRating(channel.name, channel.groupTitle);

    // Find category by slug
    let category = null;
    if (categorySlug) {
      category = await this.prisma.category.findUnique({
        where: { slug: categorySlug },
      });
    }

    return this.prisma.channel.create({
      data: {
        name: channel.name,
        slug,
        streamUrl: channel.url,
        streamType,
        logo: channel.tvgLogo,
        groupName: channel.groupTitle,
        tvgId: channel.tvgId,
        tvgName: channel.tvgName,
        language: channel.language || 'fr',
        country: channel.country,
        categoryId: category?.id,
        ageRating,
        isActive: true,
      },
    });
  }

  /**
   * Update existing channel
   */
  private async updateChannel(channel: ParsedChannel) {
    const slug = this.generateSlug(channel.name);
    const streamType = this.m3uParser.detectStreamType(channel.url);

    return this.prisma.channel.update({
      where: { slug },
      data: {
        name: channel.name,
        streamUrl: channel.url,
        streamType,
        logo: channel.tvgLogo,
        groupName: channel.groupTitle,
        tvgId: channel.tvgId,
        tvgName: channel.tvgName,
        language: channel.language || 'fr',
        country: channel.country,
      },
    });
  }

  /**
   * Generate URL-friendly slug from channel name
   */
  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
      .replace(/[^a-z0-9]+/g, '-') // Replace non-alphanumeric with hyphens
      .replace(/^-+|-+$/g, '') // Remove leading/trailing hyphens
      .substring(0, 100); // Limit length
  }

  /**
   * Get import statistics
   */
  async getStats() {
    const [totalChannels, activeChannels, categories, groups] = await Promise.all([
      this.prisma.channel.count(),
      this.prisma.channel.count({ where: { isActive: true } }),
      this.prisma.category.count(),
      this.prisma.channel.groupBy({
        by: ['groupName'],
        where: { groupName: { not: null } },
      }),
    ]);

    return {
      totalChannels,
      activeChannels,
      categories,
      groups: groups.length,
    };
  }
}
