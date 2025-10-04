'use client';

import { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';
import { Play, Pause, Volume2, VolumeX, Maximize, Settings } from 'lucide-react';
import { Button } from './ui/button';
import { QualitySelector } from './quality-selector';
import type { XtreamQualityVariant } from '@/lib/xtream';

interface VideoPlayerProps {
  channel: {
    id: string;
    name: string;
    streamUrl: string;
    streamUrlFallback?: string;
    streamType?: string;
    quality?: string;
    qualityVariants?: XtreamQualityVariant[];
  };
}

export function VideoPlayer({ channel }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showControls, setShowControls] = useState(true);
  const [retryCount, setRetryCount] = useState(0);
  const [currentUrl, setCurrentUrl] = useState<string>('');
  const [currentQuality, setCurrentQuality] = useState<string>(channel.quality || 'Auto');
  const [selectedVariant, setSelectedVariant] = useState<XtreamQualityVariant | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Get HLS URL with fallback to TS
    const getStreamUrl = async (useHls = true, variant?: XtreamQualityVariant) => {
      try {
        setIsLoading(true);
        setError(null);

        // Use selected variant or default channel URLs
        let streamUrl: string;
        if (variant) {
          streamUrl = useHls ? variant.urlHls : variant.urlTs;
        } else {
          streamUrl = useHls ? channel.streamUrl : (channel.streamUrlFallback || channel.streamUrl);
        }

        // MOBILE FIX: Ne PAS passer par le proxy pour éviter erreur 509
        // Les navigateurs mobiles supportent le chargement direct HTTP → HTTPS
        // Le proxy est désactivé car il cause bandwidth limit exceeded

        setCurrentUrl(streamUrl);

        // If RTMP, request transcoding
        if (channel.streamType === 'rtmp' || streamUrl.startsWith('rtmp')) {
          const response = await fetch('/api/stream/transcode', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              channelId: channel.id,
              inputUrl: streamUrl,
            }),
          });

          if (!response.ok) {
            throw new Error('Failed to start transcoding');
          }

          const data = await response.json();
          streamUrl = data.outputUrl;

          // Wait a bit for transcoding to start
          await new Promise(resolve => setTimeout(resolve, 2000));
        }

        // Initialize HLS.js
        if (Hls.isSupported() && useHls) {
          const hls = new Hls({
            enableWorker: true,
            lowLatencyMode: true,
            backBufferLength: 90,
            maxLoadingDelay: 4,
            maxBufferLength: 30,
            maxMaxBufferLength: 60,
          });

          hlsRef.current = hls;
          hls.loadSource(streamUrl);
          hls.attachMedia(video);

          hls.on(Hls.Events.MANIFEST_PARSED, () => {
            setIsLoading(false);
            setRetryCount(0);
            video.play();
            setIsPlaying(true);
          });

          hls.on(Hls.Events.ERROR, (event, data) => {
            if (data.fatal) {
              switch (data.type) {
                case Hls.ErrorTypes.NETWORK_ERROR:
                  console.error('[Player] Network error:', data);
                  // Auto-retry avec fallback
                  if (retryCount < 3) {
                    setError(`Erreur réseau. Tentative ${retryCount + 1}/3...`);
                    setTimeout(() => {
                      setRetryCount(prev => prev + 1);
                      hls.startLoad();
                    }, 2000);
                  } else if (useHls && channel.streamUrlFallback) {
                    // Fallback vers TS
                    setError('Passage au flux TS...');
                    hls.destroy();
                    setTimeout(() => getStreamUrl(false), 1000);
                  } else {
                    setError('Impossible de charger le flux après 3 tentatives.');
                    setIsLoading(false);
                  }
                  break;
                case Hls.ErrorTypes.MEDIA_ERROR:
                  console.error('[Player] Media error:', data);
                  setError('Erreur média. Tentative de récupération...');
                  hls.recoverMediaError();
                  break;
                default:
                  console.error('[Player] Fatal error:', data);
                  if (useHls && channel.streamUrlFallback) {
                    setError('Erreur HLS. Passage au flux TS...');
                    hls.destroy();
                    setTimeout(() => getStreamUrl(false), 1000);
                  } else {
                    setError('Erreur fatale. Impossible de lire le flux.');
                    hls.destroy();
                    setIsLoading(false);
                  }
                  break;
              }
            }
          });
        }
        // Native HLS support (Safari) or TS fallback
        else if (video.canPlayType('application/vnd.apple.mpegurl') || !useHls) {
          video.src = streamUrl;

          const onLoadedMetadata = () => {
            setIsLoading(false);
            setRetryCount(0);
            // Autoplay avec gestion de l'erreur NotAllowedError
            // Mobile: essayer d'abord avec son, puis muted si bloqué
            video.play().catch(err => {
              console.log('[Player] Autoplay bloqué, essai en mode muet...', err);
              video.muted = true;
              setIsMuted(true);
              video.play().catch(err2 => {
                console.log('[Player] Autoplay muet bloqué, attente interaction:', err2);
                setIsPlaying(false);
              });
            });
          };

          const onError = () => {
            console.error('[Player] Video error');
            if (retryCount < 3) {
              setError(`Erreur de chargement. Tentative ${retryCount + 1}/3...`);
              setTimeout(() => {
                setRetryCount(prev => prev + 1);
                video.load();
              }, 2000);
            } else if (useHls && channel.streamUrlFallback) {
              setError('Passage au flux TS...');
              setTimeout(() => getStreamUrl(false), 1000);
            } else {
              setError('Impossible de charger le flux après 3 tentatives.');
              setIsLoading(false);
            }
          };

          video.addEventListener('loadedmetadata', onLoadedMetadata);
          video.addEventListener('error', onError);

          return () => {
            video.removeEventListener('loadedmetadata', onLoadedMetadata);
            video.removeEventListener('error', onError);
          };
        } else {
          setError('Votre navigateur ne supporte pas la lecture de ce flux');
          setIsLoading(false);
        }
      } catch (err: any) {
        console.error('[Player] Error loading stream:', err);
        if (retryCount < 3) {
          setError(`Erreur: ${err.message}. Nouvelle tentative ${retryCount + 1}/3...`);
          setTimeout(() => {
            setRetryCount(prev => prev + 1);
            getStreamUrl(currentUrl.includes('.m3u8'));
          }, 2000);
        } else {
          setError(err.message || 'Erreur lors du chargement du flux');
          setIsLoading(false);
        }
      }
    };

    getStreamUrl(true, selectedVariant || undefined);

    // Cleanup
    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
      }
    };
  }, [channel, selectedVariant]);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      video.play().then(() => {
        setIsPlaying(true);
      }).catch(err => {
        console.error('[Player] Play error:', err);
        setIsPlaying(false);
      });
    } else {
      video.pause();
      setIsPlaying(false);
    }
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = !video.muted;
    setIsMuted(video.muted);
  };

  const toggleFullscreen = () => {
    const video = videoRef.current;
    if (!video) return;

    if (!document.fullscreenElement) {
      video.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  const handleQualityChange = (variant: XtreamQualityVariant) => {
    console.log('[Player] Changing quality to:', variant.quality);
    setCurrentQuality(variant.quality);
    setSelectedVariant(variant);
    setRetryCount(0);
  };

  let controlsTimeout: NodeJS.Timeout;
  const handleMouseMove = () => {
    setShowControls(true);
    clearTimeout(controlsTimeout);
    controlsTimeout = setTimeout(() => setShowControls(false), 3000);
  };

  return (
    <div
      className="relative w-full h-full bg-black group"
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setShowControls(false)}
    >
      <video
        ref={videoRef}
        className="w-full h-full object-contain"
        playsInline
        webkit-playsinline="true"
        x5-playsinline="true"
        preload="auto"
        onClick={togglePlay}
      />

      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-500 mx-auto mb-4" />
            <p className="text-white">Chargement du flux...</p>
          </div>
        </div>
      )}

      {/* Error Overlay */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80">
          <div className="text-center max-w-md p-6">
            <p className="text-red-400 text-lg mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>Réessayer</Button>
          </div>
        </div>
      )}

      {/* Controls */}
      {!isLoading && !error && (
        <div
          className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 transition-opacity ${
            showControls ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <div className="flex items-center gap-4">
            <Button
              size="icon"
              variant="ghost"
              className="text-white"
              onClick={togglePlay}
            >
              {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
            </Button>

            <Button
              size="icon"
              variant="ghost"
              className="text-white"
              onClick={toggleMute}
            >
              {isMuted ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
            </Button>

            <div className="flex-1" />

            {channel.qualityVariants && channel.qualityVariants.length > 1 && (
              <QualitySelector
                variants={channel.qualityVariants}
                currentQuality={currentQuality}
                onQualityChange={handleQualityChange}
              />
            )}

            <Button
              size="icon"
              variant="ghost"
              className="text-white"
              onClick={toggleFullscreen}
            >
              <Maximize className="w-6 h-6" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
