import { Router, Request, Response } from 'express';
import { TranscodeService } from '../services/transcode.service';

const router: Router = Router();

router.get('/', (req: Request, res: Response) => {
  const transcodeService = new TranscodeService();
  const activeTranscodes = transcodeService.getActiveTranscodes();

  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'stream-gateway',
    activeTranscodes: activeTranscodes.length,
    ffmpegPath: process.env.FFMPEG_PATH || 'ffmpeg',
  });
});

export { router as healthRouter };
