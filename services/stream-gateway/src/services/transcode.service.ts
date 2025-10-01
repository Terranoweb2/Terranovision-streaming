import ffmpeg from 'fluent-ffmpeg';
import path from 'path';
import fs from 'fs';
import NodeCache from 'node-cache';
import { logger } from '../index';

interface TranscodeOptions {
  channelId: string;
  inputUrl: string;
  quality?: 'auto' | '480p' | '720p' | '1080p';
}

interface TranscodeStatus {
  channelId: string;
  status: 'starting' | 'running' | 'stopped' | 'error';
  inputUrl: string;
  outputUrl: string;
  startTime: Date;
  error?: string;
}

export class TranscodeService {
  private static processes = new Map<string, any>();
  private static cache = new NodeCache({ stdTTL: 300 }); // 5 minutes cache
  private readonly hlsDir: string;
  private readonly segmentDuration: number;
  private readonly playlistSize: number;
  private readonly maxConcurrent: number;

  constructor() {
    this.hlsDir = path.join(__dirname, '../../hls');
    this.segmentDuration = Number(process.env.HLS_SEGMENT_DURATION) || 4;
    this.playlistSize = Number(process.env.HLS_PLAYLIST_SIZE) || 5;
    this.maxConcurrent = Number(process.env.MAX_CONCURRENT_TRANSCODES) || 10;

    // Ensure HLS directory exists
    if (!fs.existsSync(this.hlsDir)) {
      fs.mkdirSync(this.hlsDir, { recursive: true });
    }

    // Set ffmpeg path if provided
    const ffmpegPath = process.env.FFMPEG_PATH;
    if (ffmpegPath) {
      ffmpeg.setFfmpegPath(ffmpegPath);
    }
  }

  /**
   * Start transcoding a stream
   */
  async startTranscode(options: TranscodeOptions): Promise<TranscodeStatus> {
    const { channelId, inputUrl, quality = 'auto' } = options;

    // Check if already transcoding
    if (TranscodeService.processes.has(channelId)) {
      const cached = TranscodeService.cache.get<TranscodeStatus>(channelId);
      if (cached) {
        return cached;
      }
    }

    // Check concurrent limit
    if (TranscodeService.processes.size >= this.maxConcurrent) {
      throw new Error('Maximum concurrent transcodes reached');
    }

    // Create output directory
    const outputDir = path.join(this.hlsDir, channelId);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const outputPath = path.join(outputDir, 'index.m3u8');
    const outputUrl = `/hls/${channelId}/index.m3u8`;

    const status: TranscodeStatus = {
      channelId,
      status: 'starting',
      inputUrl,
      outputUrl: process.env.CDN_BASE_URL
        ? `${process.env.CDN_BASE_URL}${outputUrl}`
        : outputUrl,
      startTime: new Date(),
    };

    try {
      // Start ffmpeg process
      const command = this.createFfmpegCommand(inputUrl, outputPath, quality);

      command
        .on('start', commandLine => {
          logger.info({ channelId, commandLine }, 'FFmpeg started');
          status.status = 'running';
          TranscodeService.cache.set(channelId, status);
        })
        .on('progress', progress => {
          logger.debug({ channelId, progress }, 'Transcoding progress');
        })
        .on('error', (err, stdout, stderr) => {
          logger.error({ channelId, error: err.message, stderr }, 'FFmpeg error');
          status.status = 'error';
          status.error = err.message;
          TranscodeService.processes.delete(channelId);
          TranscodeService.cache.del(channelId);
        })
        .on('end', () => {
          logger.info({ channelId }, 'FFmpeg ended');
          status.status = 'stopped';
          TranscodeService.processes.delete(channelId);
          TranscodeService.cache.del(channelId);
        });

      command.run();

      TranscodeService.processes.set(channelId, command);
      TranscodeService.cache.set(channelId, status);

      return status;
    } catch (error: any) {
      logger.error({ channelId, error: error.message }, 'Failed to start transcode');
      status.status = 'error';
      status.error = error.message;
      throw error;
    }
  }

  /**
   * Create ffmpeg command with appropriate settings
   */
  private createFfmpegCommand(
    inputUrl: string,
    outputPath: string,
    quality: string
  ): ffmpeg.FfmpegCommand {
    let command = ffmpeg(inputUrl)
      .inputOptions([
        '-re', // Read input at native frame rate
        '-timeout 10000000', // 10 seconds timeout
      ])
      .outputOptions([
        '-c:v libx264', // H.264 video codec
        '-c:a aac', // AAC audio codec
        '-preset veryfast', // Encoding preset
        '-g 48', // GOP size
        '-sc_threshold 0', // Scene change threshold
        '-f hls', // HLS format
        `-hls_time ${this.segmentDuration}`, // Segment duration
        `-hls_list_size ${this.playlistSize}`, // Playlist size
        '-hls_flags delete_segments+append_list', // Delete old segments
        '-hls_segment_type mpegts', // Segment type
        '-hls_segment_filename',
        path.join(path.dirname(outputPath), 'segment_%03d.ts'),
      ]);

    // Set video quality
    switch (quality) {
      case '480p':
        command = command.size('854x480').videoBitrate('1500k');
        break;
      case '720p':
        command = command.size('1280x720').videoBitrate('2500k');
        break;
      case '1080p':
        command = command.size('1920x1080').videoBitrate('4500k');
        break;
      default:
        // Auto - copy codecs if possible
        command = command.outputOptions(['-c copy']);
    }

    command = command.output(outputPath);

    return command;
  }

  /**
   * Stop transcoding
   */
  stopTranscode(channelId: string): void {
    const process = TranscodeService.processes.get(channelId);

    if (process) {
      process.kill('SIGKILL');
      TranscodeService.processes.delete(channelId);
      TranscodeService.cache.del(channelId);

      // Clean up HLS files
      const outputDir = path.join(this.hlsDir, channelId);
      if (fs.existsSync(outputDir)) {
        fs.rmSync(outputDir, { recursive: true, force: true });
      }

      logger.info({ channelId }, 'Transcode stopped');
    }
  }

  /**
   * Get transcoding status
   */
  getStatus(channelId: string): TranscodeStatus | null {
    return TranscodeService.cache.get<TranscodeStatus>(channelId) || null;
  }

  /**
   * Get all active transcodes
   */
  getActiveTranscodes(): string[] {
    return Array.from(TranscodeService.processes.keys());
  }

  /**
   * Stop all transcodes (cleanup)
   */
  stopAll(): void {
    for (const channelId of TranscodeService.processes.keys()) {
      this.stopTranscode(channelId);
    }
  }
}

// Cleanup on process exit
process.on('SIGINT', () => {
  const service = new TranscodeService();
  service.stopAll();
  process.exit(0);
});

process.on('SIGTERM', () => {
  const service = new TranscodeService();
  service.stopAll();
  process.exit(0);
});
