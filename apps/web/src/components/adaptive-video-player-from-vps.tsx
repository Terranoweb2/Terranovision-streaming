'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import Hls from 'hls.js';
import { Play, Pause, Volume2, VolumeX, Maximize, SkipBack, SkipForward, Info } from 'lucide-react';
import { Button } from './ui/button';
import { QualitySelector } from './quality-selector';
import type { XtreamQualityVariant } from '@/lib/xtream';
import { useDeviceDetection } from '@/hooks/useDeviceDetection';
import { useTVNavigation } from '@/hooks/useTVNavigation';
import { useGestures } from '@/hooks/useGestures';

interface AdaptiveVideoPlayerProps {
  channel: {
    id: string;
    name: string;
    streamUrl: string;
    streamUrlFallback?: string;
    streamType?: string;
    quality?: string;
    qualityVariants?: XtreamQualityVariant[];
  };
  onPreviousChannel?: () => void;
  onNextChannel?: () => void;
}

const MAX_RETRIES = 3;
const RETRY_DELAY = 2000;

export function AdaptiveVideoPlayer({ channel, onPreviousChannel, onNextChannel }: AdaptiveVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showControls, setShowControls] = useState(true);
  const [showInfo, setShowInfo] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [currentQuality, setCurrentQuality] = useState<string>(channel.quality || 'Auto');
  const [selectedVariant, setSelectedVariant] = useState<XtreamQualityVariant | null>(null);

  const deviceInfo = useDeviceDetection();

  // Fonctions de contrôle du player
  const togglePlay = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      video.play().then(() => {
        setIsPlaying(true);
      }).catch((err) => {
        console.error('[Player] Play error:', err);
        setError('Impossible de lire la vidéo. Cliquez pour réessayer.');
        setIsPlaying(false);
      });
    } else {
      video.pause();
      setIsPlaying(false);
    }
  }, []);

  const toggleMute = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setIsMuted(video.muted);
  }, []);

  const toggleFullscreen = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    if (!document.fullscreenElement) {
      container.requestFullscreen().catch(err => {
        console.error('[Player] Fullscreen error:', err);
      });
    } else {
      document.exitFullscreen();
    }
  }, []);

  const seekRelative = useCallback((seconds: number) => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = Math.max(0, Math.min(video.duration, video.currentTime + seconds));
  }, []);

  const adjustVolume = useCallback((delta: number) => {
    const video = videoRef.current;
    if (!video) return;
    video.volume = Math.max(0, Math.min(1, video.volume + delta));
  }, []);

  // Navigation TV avec télécommande
  useTVNavigation({
    onEnter: togglePlay,
    onLeft: () => seekRelative(-10),
    onRight: () => seekRelative(10),
    onUp: () => setShowControls(true),
    onDown: () => setShowControls(false),
    onBack: () => {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      }
    },
    enabled: deviceInfo.isTV,
  });

  // Gestures tactiles pour mobile/tablette
  useGestures(containerRef, {
    onSwipeLeft: onNextChannel,
    onSwipeRight: onPreviousChannel,
    onDoubleTap: toggleFullscreen,
    onTap: togglePlay,
    onSwipeUp: () => adjustVolume(0.1),
    onSwipeDown: () => adjustVolume(-0.1),
  }, {
    enabled: deviceInfo.isMobile || deviceInfo.isTablet,
  });

  // Chargement du stream avec retry
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let mounted = true;

    const loadStream = async (useHls = true, variant?: XtreamQualityVariant) => {
      if (!mounted) return;

      try {
        setIsLoading(true);
        setError(null);

        // Cleanup previous HLS instance
        if (hlsRef.current) {
          hlsRef.current.destroy();
          hlsRef.current = null;
        }

        // Clear any pending retry timeouts
        if (retryTimeoutRef.current) {
          clearTimeout(retryTimeoutRef.current);
          retryTimeoutRef.current = null;
        }

        let streamUrl: string;
        if (variant) {
          streamUrl = useHls ? variant.urlHls : variant.urlTs;
        } else {
          streamUrl = useHls ? channel.streamUrl : (channel.streamUrlFallback || channel.streamUrl);
        }

        // ⚠️ CHARGEMENT DIRECT - Le serveur Xtream bloque toutes les requêtes proxy
        // Les erreurs 403/458/509 sont des limitations du serveur IPTV
        console.log('[Player] Loading stream:', streamUrl);

        // Handle RTMP transcoding
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
            throw new Error('Erreur de transcodage RTMP');
          }

          const data = await response.json();
          streamUrl = data.outputUrl;
          await new Promise(resolve => setTimeout(resolve, 2000));
        }

        // HLS.js support
        if (Hls.isSupported() && useHls) {
          const hlsConfig = deviceInfo.isMobile || deviceInfo.isTablet ? {
            enableWorker: true,
            lowLatencyMode: false,
            backBufferLength: 30,
            maxLoadingDelay: 8,
            maxBufferLength: 15,
            maxMaxBufferLength: 30,
            manifestLoadingTimeOut: 15000,
            manifestLoadingMaxRetry: 4,
            levelLoadingTimeOut: 15000,
            fragLoadingTimeOut: 30000,
            fragLoadingMaxRetry: 6,
            fragLoadingMaxRetryTimeout: 64000,
            manifestLoadingMaxRetryTimeout: 64000,
            levelLoadingMaxRetry: 4,
            levelLoadingMaxRetryTimeout: 64000,
          } : {
            enableWorker: true,
            lowLatencyMode: true,
            backBufferLength: 90,
            maxLoadingDelay: 4,
            maxBufferLength: 30,
            maxMaxBufferLength: 60,
          };

          const hls = new Hls(hlsConfig);
          hlsRef.current = hls;

          hls.loadSource(streamUrl);
          hls.attachMedia(video);

          hls.on(Hls.Events.MANIFEST_PARSED, () => {
            if (!mounted) return;

            // Vérifier si c'est un flux offline
            if (streamUrl.includes('offline')) {
              setError('⚠️ Cette chaîne est actuellement hors ligne. Essayez une autre chaîne.');
              setIsLoading(false);
              hls.destroy();
              return;
            }

            setIsLoading(false);
            setRetryCount(0);

            // Autoplay avec gestion d'erreur
            video.play().catch(err => {
              console.log('[Player] Autoplay bloqué:', err.name);
              setIsPlaying(false);
              if (err.name !== 'NotAllowedError') {
                setError('Cliquez pour démarrer la lecture');
              }
            });
          });

          hls.on(Hls.Events.ERROR, (event, data) => {
            if (!mounted || !data.fatal) return;

            console.error('[Player] HLS Error:', data.type, data.details);

            switch (data.type) {
              case Hls.ErrorTypes.NETWORK_ERROR:
                if (retryCount < MAX_RETRIES) {
                  setError(`Erreur réseau. Tentative ${retryCount + 1}/${MAX_RETRIES}...`);
                  retryTimeoutRef.current = setTimeout(() => {
                    if (mounted) {
                      setRetryCount(prev => prev + 1);
                      hls.startLoad();
                    }
                  }, RETRY_DELAY);
                } else if (useHls && channel.streamUrlFallback) {
                  setError('Passage au flux TS...');
                  hls.destroy();
                  retryTimeoutRef.current = setTimeout(() => {
                    if (mounted) {
                      setRetryCount(0);
                      loadStream(false);
                    }
                  }, 1000);
                } else {
                  setError('❌ Impossible de charger le flux. Le serveur IPTV bloque la connexion (erreur réseau).');
                  setIsLoading(false);
                }
                break;

              case Hls.ErrorTypes.MEDIA_ERROR:
                setError('Erreur média. Récupération...');
                hls.recoverMediaError();
                break;

              default:
                if (useHls && channel.streamUrlFallback) {
                  setError('Passage au flux TS...');
                  hls.destroy();
                  retryTimeoutRef.current = setTimeout(() => {
                    if (mounted) {
                      setRetryCount(0);
                      loadStream(false);
                    }
                  }, 1000);
                } else {
                  setError('❌ Erreur fatale. Le serveur IPTV a rejeté la connexion.');
                  hls.destroy();
                  setIsLoading(false);
                }
                break;
            }
          });
        }
        // Native HLS support (Safari)
        else if (video.canPlayType('application/vnd.apple.mpegurl') || !useHls) {
          video.src = streamUrl;

          const onLoadedMetadata = () => {
            if (!mounted) return;
            setIsLoading(false);
            setRetryCount(0);

            video.play().catch(err => {
              console.log('[Player] Autoplay bloqué:', err.name);
              setIsPlaying(false);
              if (err.name !== 'NotAllowedError') {
                setError('Cliquez pour démarrer la lecture');
              }
            });
          };

          const onError = () => {
            if (!mounted) return;

            console.error('[Player] Video error');
            if (retryCount < MAX_RETRIES) {
              setError(`Erreur de chargement. Tentative ${retryCount + 1}/${MAX_RETRIES}...`);
              retryTimeoutRef.current = setTimeout(() => {
                if (mounted) {
                  setRetryCount(prev => prev + 1);
                  video.load();
                }
              }, RETRY_DELAY);
            } else if (useHls && channel.streamUrlFallback) {
              setError('Passage au flux TS...');
              retryTimeoutRef.current = setTimeout(() => {
                if (mounted) {
                  setRetryCount(0);
                  loadStream(false);
                }
              }, 1000);
            } else {
              setError('❌ Impossible de charger le flux. Vérifiez votre connexion ou essayez une autre chaîne.');
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
          setError('❌ Votre navigateur ne supporte pas la lecture de ce flux');
          setIsLoading(false);
        }
      } catch (err: unknown) {
        if (!mounted) return;

        console.error('[Player] Error loading stream:', err);
        const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue';

        if (retryCount < MAX_RETRIES) {
          setError(`Erreur: ${errorMessage}. Nouvelle tentative ${retryCount + 1}/${MAX_RETRIES}...`);
          retryTimeoutRef.current = setTimeout(() => {
            if (mounted) {
              setRetryCount(prev => prev + 1);
              loadStream(useHls, variant);
            }
          }, RETRY_DELAY);
        } else {
          setError(`❌ ${errorMessage}`);
          setIsLoading(false);
        }
      }
    };

    loadStream(true, selectedVariant || undefined);

    return () => {
      mounted = false;
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
        retryTimeoutRef.current = null;
      }
    };
  }, [channel, selectedVariant, deviceInfo.isMobile, deviceInfo.isTablet, retryCount]);

  const handleQualityChange = useCallback((variant: XtreamQualityVariant) => {
    setSelectedVariant(variant);
    setCurrentQuality(variant.quality);
    setRetryCount(0);
  }, []);

  return (
    <div ref={containerRef} className="relative w-full h-full bg-black group">
      <video
        ref={videoRef}
        className="w-full h-full"
        playsInline
        onClick={togglePlay}
      />

      {/* Loading indicator */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <div className="text-white text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-white mb-4 mx-auto"></div>
            <p>Chargement...</p>
          </div>
        </div>
      )}

      {/* Error display */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80 p-4">
          <div className="text-center">
            <p className="text-red-500 mb-4 text-lg">{error}</p>
            <Button onClick={() => {
              setError(null);
              setRetryCount(0);
              setSelectedVariant(null);
            }}>
              Réessayer
            </Button>
          </div>
        </div>
      )}

      {/* Controls */}
      {showControls && !isLoading && !error && (
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button size="sm" variant="ghost" onClick={togglePlay}>
                {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
              </Button>
              <Button size="sm" variant="ghost" onClick={toggleMute}>
                {isMuted ? <VolumeX className="h-6 w-6" /> : <Volume2 className="h-6 w-6" />}
              </Button>
              {onPreviousChannel && (
                <Button size="sm" variant="ghost" onClick={onPreviousChannel}>
                  <SkipBack className="h-6 w-6" />
                </Button>
              )}
              {onNextChannel && (
                <Button size="sm" variant="ghost" onClick={onNextChannel}>
                  <SkipForward className="h-6 w-6" />
                </Button>
              )}
            </div>
            <div className="flex items-center gap-2">
              {channel.qualityVariants && channel.qualityVariants.length > 0 && (
                <QualitySelector
                  variants={channel.qualityVariants}
                  currentQuality={currentQuality}
                  onQualityChange={handleQualityChange}
                />
              )}
              <Button size="sm" variant="ghost" onClick={() => setShowInfo(!showInfo)}>
                <Info className="h-6 w-6" />
              </Button>
              <Button size="sm" variant="ghost" onClick={toggleFullscreen}>
                <Maximize className="h-6 w-6" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Channel info */}
      {showInfo && (
        <div className="absolute top-4 left-4 bg-black/80 p-4 rounded text-white max-w-md">
          <h3 className="font-bold mb-2">{channel.name}</h3>
          <p className="text-sm opacity-75">Qualité: {currentQuality}</p>
          <p className="text-sm opacity-75">ID: {channel.id}</p>
        </div>
      )}
    </div>
  );
}
