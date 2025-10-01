import { Module } from '@nestjs/common';
import { IngestController } from './ingest.controller';
import { IngestService } from './ingest.service';
import { M3uParserService } from './m3u-parser.service';
import { DatabaseModule } from '../database/database.module';
import { CategoriesModule } from '../categories/categories.module';

@Module({
  imports: [DatabaseModule, CategoriesModule],
  controllers: [IngestController],
  providers: [IngestService, M3uParserService],
  exports: [IngestService],
})
export class IngestModule {}
