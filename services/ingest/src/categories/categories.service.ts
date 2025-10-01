import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.category.findMany({
      orderBy: { order: 'asc' },
      include: {
        _count: {
          select: { channels: true },
        },
      },
    });
  }

  async findOne(id: string) {
    return this.prisma.category.findUnique({
      where: { id },
      include: {
        _count: {
          select: { channels: true },
        },
      },
    });
  }

  /**
   * Ensure default categories exist in database
   */
  async ensureDefaultCategories() {
    const defaultCategories = [
      { name: 'Sport', slug: 'sport', icon: '⚽', order: 1, ageRating: 0 },
      { name: 'Actualités', slug: 'news', icon: '📰', order: 2, ageRating: 0 },
      { name: 'Cinéma', slug: 'movies', icon: '🎬', order: 3, ageRating: 0 },
      { name: 'Séries', slug: 'series', icon: '📺', order: 4, ageRating: 0 },
      { name: 'Divertissement', slug: 'entertainment', icon: '🎭', order: 5, ageRating: 0 },
      { name: 'Enfants', slug: 'kids', icon: '🧸', order: 6, ageRating: 0 },
      { name: 'Musique', slug: 'music', icon: '🎵', order: 7, ageRating: 0 },
      { name: 'Documentaires', slug: 'documentary', icon: '🌍', order: 8, ageRating: 0 },
      { name: 'Lifestyle', slug: 'lifestyle', icon: '🏡', order: 9, ageRating: 0 },
      { name: 'Adulte', slug: 'adult', icon: '🔞', order: 10, ageRating: 18 },
    ];

    for (const category of defaultCategories) {
      await this.prisma.category.upsert({
        where: { slug: category.slug },
        update: {},
        create: category,
      });
    }
  }
}
