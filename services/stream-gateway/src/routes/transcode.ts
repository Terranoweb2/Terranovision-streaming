import { Router, Request, Response } from 'express';
import { TranscodeService } from '../services/transcode.service';
import { logger } from '../index';

const router: Router = Router();
const transcodeService = new TranscodeService();

/**
 * POST /transcode
 * Start transcoding a stream from RTMP to HLS
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const { channelId, inputUrl, quality } = req.body;

    if (!channelId || !inputUrl) {
      return res.status(400).json({
        error: 'Missing required fields: channelId and inputUrl',
      });
    }

    logger.info({ channelId, inputUrl }, 'Starting transcode');

    const result = await transcodeService.startTranscode({
      channelId,
      inputUrl,
      quality: quality || 'auto',
    });

    res.status(200).json(result);
  } catch (error: any) {
    logger.error({ error: error.message }, 'Transcode failed');
    res.status(500).json({
      error: 'Transcode failed',
      message: error.message,
    });
  }
});

/**
 * GET /transcode/:channelId/status
 * Get transcoding status for a channel
 */
router.get('/:channelId/status', (req: Request, res: Response) => {
  const { channelId } = req.params;
  const status = transcodeService.getStatus(channelId);

  if (!status) {
    return res.status(404).json({
      error: 'Channel not found or not transcoding',
    });
  }

  res.json(status);
});

/**
 * DELETE /transcode/:channelId
 * Stop transcoding for a channel
 */
router.delete('/:channelId', (req: Request, res: Response) => {
  const { channelId } = req.params;

  try {
    transcodeService.stopTranscode(channelId);
    res.json({ message: 'Transcode stopped', channelId });
  } catch (error: any) {
    res.status(500).json({
      error: 'Failed to stop transcode',
      message: error.message,
    });
  }
});

/**
 * GET /transcode/active
 * Get all active transcodes
 */
router.get('/active', (req: Request, res: Response) => {
  const active = transcodeService.getActiveTranscodes();
  res.json({ active, count: active.length });
});

export { router as transcodeRouter };
