'use client';

import { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  Settings,
  SkipForward,
  SkipBack,
  Loader2,
  Info,
  AlertCircle,
  Wifi,
  WifiOff,
  Tv,
  Cast,
  PictureInPicture,
  Subtitles
} from 'lucide-react';
import { Button } from './ui/button';
import { Slider } from './ui/slider';
import type { XtreamQualityVariant } from '@/lib/xtream';

interface AdvancedVideoPlayerProps {
  channel: {
    id: string;
    name: string;
    streamUrl: string;
    streamUrlFallback?: string;
    streamType?: string;
    quality?: string;
    qualityVariants?: XtreamQualityVariant[];
    logo?: string;
  };
  onPrevious?: () => void;
  onNext?: () => void;
}

export function AdvancedVideoPlayer({ channel, onPrevious, onNext }: AdvancedVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const hlsRef = useRef<Hls | null>(null);

  // États du lecteur
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(50);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showControls, setShowControls] = useState(true);
  const [retryCount, setRetryCount] = useState(0);
  const [currentQuality, setCurrentQuality] = useState<string>(channel.quality || 'Auto');
  const [selectedVariant, setSelectedVariant] = useState<XtreamQualityVariant | null>(null);

  // États avancés
  const [showSettings, setShowSettings] = useState(false);
  const [showQualityMenu, setShowQualityMenu] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [buffered, setBuffered] = useState(0);
  const [isLive, setIsLive] = useState(true);
  const [connectionQuality, setConnectionQuality] = useState<'excellent' | 'good' | 'poor' | 'offline'>('good');
  const [showInfo, setShowInfo] = useState(false);
  const [isPiPSupported, setIsPiPSupported] = useState(false);
  const [isInPiP, setIsInPiP] = useState(false);

  // Détection mobile
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsMobile(/iPhone|iPad|iPod|Android/i.test(navigator.userAgent));
    setIsPiPSupported('pictureInPictureEnabled' in document);
  }, []);

  // Timer pour masquer les contrôles
  const controlsTimeoutRef = useRef<NodeJS.Timeout>();

  const showControlsTemporarily = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    if (!isMobile) {
      controlsTimeoutRef.current = setTimeout(() => {
        if (isPlaying) setShowControls(false);
      }, 3000);
    }
  };

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Détection avancée de l'appareil
    const ua = navigator.userAgent.toLowerCase();
    const isAndroid = /android/i.test(ua);
    const isIOS = /iphone|ipad|ipod/i.test(ua);
    const isTV = /tv|smarttv|googletv|appletv|hbbtv|pov_tv|netcast/i.test(ua) ||
                 (window.innerWidth >= 1920 && window.innerHeight >= 1080);
    const isMobileDevice = isMobile || isAndroid || isIOS;

    console.log('[Player] Device detection:', { isMobile, isAndroid, isIOS, isTV, isMobileDevice });

    const getStreamUrl = async (useHls = true, variant?: XtreamQualityVariant) => {
      try {
        setIsLoading(true);
        setError(null);

        let streamUrl: string;
        if (variant) {
          streamUrl = useHls ? variant.urlHls : variant.urlTs;
        } else {
          // Mobile/Android/TV : TOUJOURS préférer TS (meilleure compatibilité)
          // Desktop : HLS pour qualité adaptative
          if (isMobileDevice || isTV) {
            streamUrl = channel.streamUrlFallback || channel.streamUrl;
            console.log('[Player] Using TS stream for mobile/TV:', streamUrl);
          } else {
            streamUrl = channel.streamUrl || channel.streamUrlFallback || '';
            console.log('[Player] Using HLS stream for desktop:', streamUrl);
          }
        }

        // Mobile/Android/TV : Forcer lecture native TS (pas HLS.js)
        const shouldUseNativePlayer = (isMobileDevice || isTV) && streamUrl.endsWith('.ts');

        if (!shouldUseNativePlayer && Hls.isSupported() && streamUrl.endsWith('.m3u8')) {
          console.log('[Player] Using HLS.js for', isMobileDevice ? 'mobile' : 'desktop');
          const hls = new Hls({
            enableWorker: true,
            lowLatencyMode: true,
            backBufferLength: 90,
            // Optimisations mobile/TV pour chargement rapide
            maxBufferLength: (isMobileDevice || isTV) ? 3 : 30,
            maxMaxBufferLength: (isMobileDevice || isTV) ? 8 : 60,
            maxBufferSize: 60 * 1000 * 1000,
            maxBufferHole: 0.3,
            highBufferWatchdogPeriod: 1,
            // Chargement plus agressif
            startLevel: -1, // Auto-select quality
            abrEwmaDefaultEstimate: (isMobileDevice || isTV) ? 300000 : 500000,
            manifestLoadingTimeOut: 10000,
            manifestLoadingMaxRetry: 5,
            manifestLoadingRetryDelay: 300,
            levelLoadingTimeOut: 10000,
            levelLoadingMaxRetry: 3,
            levelLoadingRetryDelay: 300,
            fragLoadingTimeOut: 20000,
            fragLoadingMaxRetry: 5,
            fragLoadingRetryDelay: 300,
          });

          hlsRef.current = hls;
          hls.loadSource(streamUrl);
          hls.attachMedia(video);

          hls.on(Hls.Events.MANIFEST_PARSED, () => {
            setIsLoading(false);
            setRetryCount(0);
            video.muted = false;
            video.volume = 0.5;
            setIsMuted(false);
            setVolume(50);

            // Forcer lecture sur mobile/Android/TV avec plusieurs tentatives
            const forcePlay = async () => {
              try {
                await video.play();
                setIsPlaying(true);
                setConnectionQuality('excellent');
                console.log('[Player] Playback started successfully');
              } catch (err: any) {
                console.log('[Player] Autoplay blocked, retrying...', err.message);
                // Retry avec interaction utilisateur simulée
                setTimeout(async () => {
                  try {
                    video.muted = true;
                    await video.play();
                    video.muted = false;
                    video.volume = 0.5;
                    setIsPlaying(true);
                    console.log('[Player] Playback started after retry');
                  } catch (err2) {
                    console.log('[Player] Waiting for user interaction');
                    setIsPlaying(false);
                  }
                }, 100);
              }
            };

            forcePlay();
          });

          // Gestion avancée des erreurs avec recovery automatique
          let mediaErrorRecoveryCount = 0;
          let networkErrorRecoveryCount = 0;

          hls.on(Hls.Events.ERROR, (event, data) => {
            // Logging uniquement en mode dev
            if (process.env.NODE_ENV === 'development') {
              console.log('[Player] HLS Error:', data.type, data.details, data);
            }

            // Erreurs non fatales - continuer la lecture silencieusement
            if (!data.fatal) {
              if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
                setConnectionQuality('poor');
              }
              return;
            }

            // Erreurs fatales - recovery automatique
            setConnectionQuality('offline');

            switch (data.type) {
              case Hls.ErrorTypes.NETWORK_ERROR:
                networkErrorRecoveryCount++;

                if (networkErrorRecoveryCount <= 5) {
                  // Recovery silencieux - pas de message d'erreur
                  setError(null);
                  setRetryCount(networkErrorRecoveryCount);
                  const retryDelay = Math.min(networkErrorRecoveryCount * 200, 1000);
                  setTimeout(() => {
                    hls.startLoad();
                  }, retryDelay);
                } else if (useHls && channel.streamUrlFallback) {
                  // Basculement vers TS après 5 tentatives
                  setError(null);
                  setRetryCount(0);
                  networkErrorRecoveryCount = 0;
                  hls.destroy();
                  setTimeout(() => getStreamUrl(false), 200);
                } else {
                  // Forcer le rechargement même sans fallback
                  setError(null);
                  setTimeout(() => {
                    networkErrorRecoveryCount = 0;
                    setRetryCount(0);
                    hls.startLoad();
                  }, 1000);
                }
                break;

              case Hls.ErrorTypes.MEDIA_ERROR:
                mediaErrorRecoveryCount++;

                if (mediaErrorRecoveryCount <= 3) {
                  // Recovery silencieux
                  setError(null);
                  setRetryCount(mediaErrorRecoveryCount);
                  if (data.details === Hls.ErrorDetails.BUFFER_STALLED_ERROR) {
                    hls.startLoad();
                  } else {
                    hls.recoverMediaError();
                  }
                } else {
                  // Swap audio codec après 3 tentatives
                  setError(null);
                  hls.swapAudioCodec();
                  hls.recoverMediaError();
                  mediaErrorRecoveryCount = 0;
                  setRetryCount(0);
                }
                break;

              default:
                // Recovery silencieux pour toutes les autres erreurs
                setError(null);
                if (useHls && channel.streamUrlFallback) {
                  hls.destroy();
                  setTimeout(() => getStreamUrl(false), 200);
                } else {
                  setTimeout(() => {
                    hls.destroy();
                    getStreamUrl(useHls);
                  }, 1000);
                }
            }
          });

          // Monitoring de la qualité et auto-recovery
          hls.on(Hls.Events.FRAG_BUFFERED, () => {
            setConnectionQuality('excellent');
            setError(null);
            // Reset compteurs après succès
            mediaErrorRecoveryCount = 0;
            networkErrorRecoveryCount = 0;
          });

          hls.on(Hls.Events.FRAG_LOADED, () => {
            setConnectionQuality('good');
            setError(null);
          });

          // Détection de stalling et auto-recovery silencieux
          let stallTimeout: NodeJS.Timeout;
          const checkStalling = () => {
            if (video.readyState < 3 && !video.paused && !isLoading) {
              // Recovery silencieux sans message
              setError(null);
              hls.startLoad();
            }
          };

          video.addEventListener('waiting', () => {
            setConnectionQuality('poor');
            stallTimeout = setTimeout(checkStalling, 3000);
          });

          video.addEventListener('playing', () => {
            clearTimeout(stallTimeout);
            setConnectionQuality('excellent');
            setError(null);
            setRetryCount(0);
            setIsPlaying(true);
            setIsLoading(false);
          });

          video.addEventListener('canplay', () => {
            clearTimeout(stallTimeout);
            setConnectionQuality('good');
            setError(null);
          });

        }
        // Support natif (Safari iOS, Android, TV, TS direct)
        else {
          console.log('[Player] Using native player for:', streamUrl);
          video.src = streamUrl;

          const onLoadedMetadata = () => {
            setIsLoading(false);
            setRetryCount(0);
            video.muted = false;
            video.volume = 0.5;
            setIsMuted(false);
            setVolume(50);

            // Forcer lecture sur mobile/Android/TV avec plusieurs stratégies
            const forceNativePlay = async () => {
              try {
                // Stratégie 1: Lecture directe
                await video.play();
                setIsPlaying(true);
                setConnectionQuality('good');
                console.log('[Player] Native playback started');
              } catch (err: any) {
                console.log('[Player] Native autoplay blocked, trying alternatives...', err.message);

                // Stratégie 2: Mute puis unmute
                try {
                  video.muted = true;
                  await video.play();
                  setTimeout(() => {
                    video.muted = false;
                    video.volume = 0.5;
                  }, 500);
                  setIsPlaying(true);
                  console.log('[Player] Native playback started (muted first)');
                } catch (err2) {
                  // Stratégie 3: Attendre interaction utilisateur
                  console.log('[Player] Waiting for user tap to start playback');
                  setIsPlaying(false);

                  // Sur mobile/TV, forcer au premier clic
                  const startOnInteraction = async () => {
                    try {
                      await video.play();
                      setIsPlaying(true);
                      document.removeEventListener('click', startOnInteraction);
                      document.removeEventListener('touchstart', startOnInteraction);
                    } catch (e) {
                      console.log('[Player] Still blocked');
                    }
                  };

                  document.addEventListener('click', startOnInteraction, { once: true });
                  document.addEventListener('touchstart', startOnInteraction, { once: true });
                }
              }
            };

            forceNativePlay();
          };

          const onError = () => {
            setConnectionQuality('offline');
            if (retryCount < 2) {
              setError(`Reconnexion... ${retryCount + 1}/2`);
              setTimeout(() => {
                setRetryCount(prev => prev + 1);
                video.load();
              }, 2000);
            } else if (useHls && channel.streamUrlFallback) {
              setError('Basculement vers flux alternatif...');
              setTimeout(() => getStreamUrl(false), 1000);
            } else {
              setError('Flux indisponible');
              setIsLoading(false);
            }
          };

          video.addEventListener('loadedmetadata', onLoadedMetadata);
          video.addEventListener('error', onError);

          return () => {
            video.removeEventListener('loadedmetadata', onLoadedMetadata);
            video.removeEventListener('error', onError);
          };
        }
      } catch (err: any) {
        setError(err.message || 'Erreur de chargement');
        setIsLoading(false);
        setConnectionQuality('offline');
      }
    };

    getStreamUrl(true, selectedVariant || undefined);

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
      }
    };
  }, [channel, selectedVariant, retryCount, isMobile]);

  // Gestion des événements vidéo
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => setCurrentTime(video.currentTime);
    const handleDurationChange = () => setDuration(video.duration);
    const handleProgress = () => {
      if (video.buffered.length > 0) {
        setBuffered((video.buffered.end(video.buffered.length - 1) / video.duration) * 100);
      }
    };
    const handleWaiting = () => setIsLoading(true);
    const handleCanPlay = () => setIsLoading(false);

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('durationchange', handleDurationChange);
    video.addEventListener('progress', handleProgress);
    video.addEventListener('waiting', handleWaiting);
    video.addEventListener('canplay', handleCanPlay);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('durationchange', handleDurationChange);
      video.removeEventListener('progress', handleProgress);
      video.removeEventListener('waiting', handleWaiting);
      video.removeEventListener('canplay', handleCanPlay);
    };
  }, []);

  // Contrôles du lecteur
  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      video.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
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

  const handleVolumeChange = (value: number[]) => {
    const video = videoRef.current;
    if (!video) return;
    const newVolume = value[0];
    video.volume = newVolume / 100;
    setVolume(newVolume);
    if (newVolume === 0) {
      setIsMuted(true);
      video.muted = true;
    } else {
      setIsMuted(false);
      video.muted = false;
    }
  };

  const toggleFullscreen = async () => {
    if (!containerRef.current) return;

    try {
      if (!document.fullscreenElement) {
        await containerRef.current.requestFullscreen();
        setIsFullscreen(true);
      } else {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch (err) {
      console.error('Erreur fullscreen:', err);
    }
  };

  const togglePiP = async () => {
    const video = videoRef.current;
    if (!video || !isPiPSupported) return;

    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
        setIsInPiP(false);
      } else {
        await video.requestPictureInPicture();
        setIsInPiP(true);
      }
    } catch (err) {
      console.error('Erreur PiP:', err);
    }
  };

  const handleQualityChange = (variant: XtreamQualityVariant) => {
    setCurrentQuality(variant.quality);
    setSelectedVariant(variant);
    setRetryCount(0);
    setShowQualityMenu(false);
    setShowSettings(false);
  };

  const skip = (seconds: number) => {
    const video = videoRef.current;
    if (!video || isLive) return;
    video.currentTime = Math.max(0, Math.min(video.duration, video.currentTime + seconds));
  };

  // Raccourcis clavier
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      switch (e.key) {
        case ' ':
          e.preventDefault();
          togglePlay();
          break;
        case 'f':
          toggleFullscreen();
          break;
        case 'm':
          toggleMute();
          break;
        case 'ArrowLeft':
          skip(-10);
          break;
        case 'ArrowRight':
          skip(10);
          break;
        case 'ArrowUp':
          e.preventDefault();
          handleVolumeChange([Math.min(100, volume + 10)]);
          break;
        case 'ArrowDown':
          e.preventDefault();
          handleVolumeChange([Math.max(0, volume - 10)]);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isPlaying, volume, isLive]);

  const formatTime = (seconds: number) => {
    if (!isFinite(seconds)) return '00:00';
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    if (h > 0) {
      return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const ConnectionIndicator = () => {
    const icons = {
      excellent: <Wifi className="w-4 h-4 text-green-500" />,
      good: <Wifi className="w-4 h-4 text-yellow-500" />,
      poor: <Wifi className="w-4 h-4 text-orange-500" />,
      offline: <WifiOff className="w-4 h-4 text-red-500" />
    };
    return icons[connectionQuality];
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full bg-black group"
      onMouseMove={showControlsTemporarily}
      onMouseLeave={() => !isMobile && setShowControls(false)}
      onClick={() => isMobile && setShowControls(!showControls)}
    >
      {/* Vidéo */}
      <video
        ref={videoRef}
        className="w-full h-full object-contain"
        playsInline
        webkit-playsinline="true"
        x5-playsinline="true"
        x-webkit-airplay="allow"
        preload="metadata"
        crossOrigin="anonymous"
      />

      {/* Overlay de chargement - Masqué pendant recovery automatique */}
      {isLoading && retryCount === 0 && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="text-center">
            <Loader2 className="w-16 h-16 text-primary-500 animate-spin mx-auto mb-4" />
            <p className="text-white text-lg">Chargement du flux...</p>
          </div>
        </div>
      )}

      {/* Indicateur de reconnexion discret - En bas à droite */}
      {(error || retryCount > 0) && isLoading && (
        <div className="absolute bottom-20 right-4 bg-black/80 backdrop-blur-sm rounded-lg px-4 py-2 flex items-center gap-2">
          <Loader2 className="w-4 h-4 text-yellow-500 animate-spin" />
          <span className="text-yellow-500 text-sm">Reconnexion...</span>
        </div>
      )}

      {/* Info chaîne (en haut) */}
      <div
        className={`absolute top-0 left-0 right-0 bg-gradient-to-b from-black/80 via-black/50 to-transparent p-4 transition-opacity duration-300 ${
          showControls || showInfo ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {channel.logo && (
              <img src={channel.logo} alt={channel.name} className="h-10 w-auto object-contain" />
            )}
            <div>
              <h2 className="text-white font-bold text-lg">{channel.name}</h2>
              <div className="flex items-center gap-2 text-sm text-gray-300">
                {isLive && (
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                    EN DIRECT
                  </span>
                )}
                <span>{currentQuality}</span>
                <ConnectionIndicator />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isPiPSupported && (
              <Button
                size="icon"
                variant="ghost"
                className="text-white hover:bg-white/20"
                onClick={togglePiP}
                title="Picture-in-Picture"
              >
                <PictureInPicture className="w-5 h-5" />
              </Button>
            )}
            <Button
              size="icon"
              variant="ghost"
              className="text-white hover:bg-white/20"
              onClick={() => setShowInfo(!showInfo)}
              title="Informations"
            >
              <Info className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Contrôles (en bas) */}
      <div
        className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent transition-opacity duration-300 ${
          showControls ? 'opacity-100' : 'opacity-0'
        }`}
      >
        {/* Barre de progression */}
        {!isLive && (
          <div className="px-4 pb-2">
            <Slider
              value={[currentTime]}
              max={duration || 100}
              step={0.1}
              onValueChange={(value) => {
                if (videoRef.current) videoRef.current.currentTime = value[0];
              }}
              className="cursor-pointer"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>
        )}

        {/* Contrôles principaux */}
        <div className="flex items-center justify-between px-4 pb-4">
          {/* Gauche */}
          <div className="flex items-center gap-2">
            <Button
              size="icon"
              variant="ghost"
              className="text-white hover:bg-white/20"
              onClick={togglePlay}
            >
              {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
            </Button>

            {onPrevious && (
              <Button
                size="icon"
                variant="ghost"
                className="text-white hover:bg-white/20"
                onClick={onPrevious}
                title="Chaîne précédente"
              >
                <SkipBack className="w-5 h-5" />
              </Button>
            )}

            {onNext && (
              <Button
                size="icon"
                variant="ghost"
                className="text-white hover:bg-white/20"
                onClick={onNext}
                title="Chaîne suivante"
              >
                <SkipForward className="w-5 h-5" />
              </Button>
            )}

            <div className="flex items-center gap-2 group/volume">
              <Button
                size="icon"
                variant="ghost"
                className="text-white hover:bg-white/20"
                onClick={toggleMute}
              >
                {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
              </Button>
              {!isMobile && (
                <div className="w-0 group-hover/volume:w-24 transition-all overflow-hidden">
                  <Slider
                    value={[volume]}
                    max={100}
                    step={1}
                    onValueChange={handleVolumeChange}
                    className="w-24"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Droite */}
          <div className="flex items-center gap-2">
            {channel.qualityVariants && channel.qualityVariants.length > 1 && (
              <div className="relative">
                <Button
                  size="icon"
                  variant="ghost"
                  className="text-white hover:bg-white/20"
                  onClick={() => {
                    setShowQualityMenu(!showQualityMenu);
                    setShowSettings(false);
                  }}
                  title="Qualité"
                >
                  <Tv className="w-5 h-5" />
                </Button>
                {showQualityMenu && (
                  <div className="absolute bottom-full right-0 mb-2 bg-black/95 rounded-lg p-2 min-w-[120px]">
                    {channel.qualityVariants.map((variant) => (
                      <button
                        key={variant.id}
                        onClick={() => handleQualityChange(variant)}
                        className={`block w-full text-left px-3 py-2 rounded hover:bg-white/10 transition-colors ${
                          variant.quality === currentQuality ? 'text-primary-500' : 'text-white'
                        }`}
                      >
                        {variant.quality}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            <Button
              size="icon"
              variant="ghost"
              className="text-white hover:bg-white/20"
              onClick={toggleFullscreen}
              title="Plein écran"
            >
              {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Indicateur de buffering */}
      {isLoading && isPlaying && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <Loader2 className="w-12 h-12 text-white animate-spin" />
        </div>
      )}
    </div>
  );
}
