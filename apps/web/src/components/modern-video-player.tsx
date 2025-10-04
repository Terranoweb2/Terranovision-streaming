'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import Hls from 'hls.js';
import { useTVNavigation } from '@/hooks/useTVNavigation';
import { useGestures } from '@/hooks/useGestures';
import {
  Play, Pause, Volume2, VolumeX, Maximize, Minimize,
  Settings, PictureInPicture, SkipBack, SkipForward,
  Loader2, Wifi, WifiOff
} from 'lucide-react';

interface ModernVideoPlayerProps {
  streamUrl: string;
  channelName?: string;
  channelLogo?: string;
  onPreviousChannel?: () => void;
  onNextChannel?: () => void;
  autoplay?: boolean;
  muted?: boolean;
}

interface DeviceInfo {
  isMobile: boolean;
  isTablet: boolean;
  isTV: boolean;
  isDesktop: boolean;
}

const PLAYBACK_SPEEDS = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];
const MAX_RETRIES = 3;
const RETRY_DELAY = 2000;

export function ModernVideoPlayer({
  streamUrl,
  channelName = 'Chaîne en direct',
  channelLogo,
  onPreviousChannel,
  onNextChannel,
  autoplay = true,
  muted = false,
}: ModernVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const retryTimeoutRef = useRef<NodeJS.Timeout>();
  const controlsTimeoutRef = useRef<NodeJS.Timeout>();

  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(muted ? 0 : 1);
  const [isMuted, setIsMuted] = useState(muted);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isPiP, setIsPiP] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [loading, setLoading] = useState(true);
  const [retryCount, setRetryCount] = useState(0);
  const [isOnline, setIsOnline] = useState(true);
  const [buffering, setBuffering] = useState(false);
  const [progress, setProgress] = useState(0);
  const [bufferProgress, setBufferProgress] = useState(0);

  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo>({
    isMobile: false,
    isTablet: false,
    isTV: false,
    isDesktop: true,
  });

  // Détection du type d'appareil
  useEffect(() => {
    const userAgent = navigator.userAgent.toLowerCase();
    const width = window.innerWidth;

    setDeviceInfo({
      isMobile: /android|webos|iphone|ipod|blackberry|iemobile|opera mini/i.test(userAgent) && width < 768,
      isTablet: /ipad|android/i.test(userAgent) && width >= 768 && width < 1024,
      isTV: /tv|smarttv|googletv|appletv/i.test(userAgent) || window.innerWidth > 1920,
      isDesktop: width >= 1024 && !/mobile|tablet|tv/i.test(userAgent),
    });
  }, []);

  // Gestion des contrôles auto-hide
  const resetControlsTimer = useCallback(() => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    if (isPlaying && !deviceInfo.isTV) {
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
        setShowSettings(false);
      }, 3000);
    }
  }, [isPlaying, deviceInfo.isTV]);

  // Initialisation HLS
  const initHLS = useCallback(() => {
    if (!videoRef.current) return;

    const video = videoRef.current;

    // Nettoyer l'instance HLS existante
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    // Vérifier le support HLS natif
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = streamUrl;
      return;
    }

    // Vérifier le support HLS.js
    if (!Hls.isSupported()) {
      console.error('HLS.js not supported');
      return;
    }

    const hls = new Hls({
      enableWorker: true,
      lowLatencyMode: true,
      backBufferLength: 90,
      maxBufferLength: 30,
      maxMaxBufferLength: 60,
      maxBufferSize: 60 * 1000 * 1000,
      maxBufferHole: 0.5,
      highBufferWatchdogPeriod: 2,
      nudgeOffset: 0.1,
      nudgeMaxRetry: 5,
      maxFragLookUpTolerance: 0.25,
      liveSyncDurationCount: 3,
      liveMaxLatencyDurationCount: 10,
      liveDurationInfinity: true,
      manifestLoadingTimeOut: 20000,
      manifestLoadingMaxRetry: 4,
      manifestLoadingRetryDelay: 1000,
      levelLoadingTimeOut: 20000,
      levelLoadingMaxRetry: 4,
      levelLoadingRetryDelay: 1000,
      fragLoadingTimeOut: 30000,
      fragLoadingMaxRetry: 6,
      fragLoadingRetryDelay: 1000,
      startFragPrefetch: true,
      xhrSetup: (xhr: XMLHttpRequest, url: string) => {
        xhr.withCredentials = false;
        xhr.setRequestHeader('Accept', '*/*');
      },
    });

    hls.loadSource(streamUrl);

    hls.attachMedia(video);

    hls.on(Hls.Events.MANIFEST_PARSED, () => {
      setLoading(false);
      setRetryCount(0);
      if (autoplay) {
        video.play().catch(() => {
          // Silent autoplay error
        });
      }
    });

    hls.on(Hls.Events.ERROR, (_event, data) => {
      if (data.fatal) {
        switch (data.type) {
          case Hls.ErrorTypes.NETWORK_ERROR:
            if (retryCount < MAX_RETRIES) {
              setRetryCount(prev => prev + 1);
              retryTimeoutRef.current = setTimeout(() => {
                hls.startLoad();
              }, RETRY_DELAY);
            } else {
              setIsOnline(false);
            }
            break;
          case Hls.ErrorTypes.MEDIA_ERROR:
            hls.recoverMediaError();
            break;
          default:
            if (retryCount < MAX_RETRIES) {
              setRetryCount(prev => prev + 1);
              retryTimeoutRef.current = setTimeout(() => {
                initHLS();
              }, RETRY_DELAY);
            }
            break;
        }
      }
    });

    hls.on(Hls.Events.FRAG_BUFFERED, () => {
      setBuffering(false);
    });

    hlsRef.current = hls;
  }, [streamUrl, autoplay, retryCount]);

  // Initialisation et nettoyage
  useEffect(() => {
    initHLS();

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, [initHLS]);

  // Gestionnaires vidéo
  const handlePlay = useCallback(() => {
    setIsPlaying(true);
    setLoading(false);
  }, []);

  const handlePause = useCallback(() => {
    setIsPlaying(false);
  }, []);

  const handleWaiting = useCallback(() => {
    setBuffering(true);
  }, []);

  const handleCanPlay = useCallback(() => {
    setBuffering(false);
    setLoading(false);
  }, []);

  const handleTimeUpdate = useCallback(() => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    if (video.duration > 0) {
      setProgress((video.currentTime / video.duration) * 100);
    }
  }, []);

  const handleProgress = useCallback(() => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    if (video.buffered.length > 0 && video.duration > 0) {
      const buffered = video.buffered.end(video.buffered.length - 1);
      setBufferProgress((buffered / video.duration) * 100);
    }
  }, []);

  // Contrôles de lecture
  const togglePlay = useCallback(() => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play().catch(() => {
        // Silent error
      });
    }
  }, [isPlaying]);

  const changeVolume = useCallback((newVolume: number) => {
    if (!videoRef.current) return;
    const clampedVolume = Math.max(0, Math.min(1, newVolume));
    setVolume(clampedVolume);
    setIsMuted(clampedVolume === 0);
    videoRef.current.volume = clampedVolume;
  }, []);

  const toggleMute = useCallback(() => {
    if (!videoRef.current) return;
    const newMuted = !isMuted;
    setIsMuted(newMuted);
    videoRef.current.muted = newMuted;
    if (newMuted) {
      videoRef.current.volume = 0;
    } else {
      videoRef.current.volume = volume || 0.5;
      setVolume(volume || 0.5);
    }
  }, [isMuted, volume]);

  const toggleFullscreen = useCallback(() => {
    if (!containerRef.current) return;

    if (!isFullscreen) {
      if (containerRef.current.requestFullscreen) {
        containerRef.current.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  }, [isFullscreen]);

  const togglePiP = useCallback(async () => {
    if (!videoRef.current) return;

    try {
      if (!isPiP) {
        await videoRef.current.requestPictureInPicture();
        setIsPiP(true);
      } else {
        await document.exitPictureInPicture();
        setIsPiP(false);
      }
    } catch (err) {
      console.error('PiP error:', err);
    }
  }, [isPiP]);

  const changePlaybackSpeed = useCallback((speed: number) => {
    if (!videoRef.current) return;
    setPlaybackSpeed(speed);
    videoRef.current.playbackRate = speed;
    setShowSettings(false);
  }, []);

  const seekRelative = useCallback((seconds: number) => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = Math.max(0, videoRef.current.currentTime + seconds);
  }, []);

  // Événements fullscreen
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  // Événements PiP
  useEffect(() => {
    const handlePiPChange = () => {
      setIsPiP(!!document.pictureInPictureElement);
    };

    videoRef.current?.addEventListener('enterpictureinpicture', handlePiPChange);
    videoRef.current?.addEventListener('leavepictureinpicture', handlePiPChange);

    return () => {
      videoRef.current?.removeEventListener('enterpictureinpicture', handlePiPChange);
      videoRef.current?.removeEventListener('leavepictureinpicture', handlePiPChange);
    };
  }, []);

  // Navigation TV avec D-pad
  useTVNavigation({
    onLeft: () => onPreviousChannel?.(),
    onRight: () => onNextChannel?.(),
    onUp: () => changeVolume(volume + 0.1),
    onDown: () => changeVolume(volume - 0.1),
    onEnter: togglePlay,
    onBack: onPreviousChannel,
    enabled: deviceInfo.isTV,
  });

  // Gestures tactiles
  useGestures(
    containerRef,
    {
      onSwipeLeft: onNextChannel,
      onSwipeRight: onPreviousChannel,
      onSwipeUp: () => changeVolume(volume + 0.1),
      onSwipeDown: () => changeVolume(volume - 0.1),
      onDoubleTap: togglePlay,
      onTap: () => setShowControls(prev => !prev),
    },
    { enabled: deviceInfo.isMobile || deviceInfo.isTablet }
  );

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full bg-black group"
      onMouseMove={resetControlsTimer}
      onMouseLeave={() => !deviceInfo.isMobile && setShowControls(false)}
      onClick={deviceInfo.isMobile ? () => setShowControls(prev => !prev) : undefined}
    >
      {/* Vidéo */}
      <video
        ref={videoRef}
        className="w-full h-full"
        playsInline
        onPlay={handlePlay}
        onPause={handlePause}
        onWaiting={handleWaiting}
        onCanPlay={handleCanPlay}
        onTimeUpdate={handleTimeUpdate}
        onProgress={handleProgress}
      />

      {/* Logo chaîne */}
      {channelLogo && (
        <div className="absolute top-4 left-4 z-10">
          <img src={channelLogo} alt={channelName} className="h-12 w-auto drop-shadow-lg" />
        </div>
      )}

      {/* Indicateur de chargement */}
      {(loading || buffering) && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-20">
          <Loader2 className="w-16 h-16 animate-spin text-white" />
        </div>
      )}

      {/* Indicateur hors ligne */}
      {!isOnline && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-20">
          <div className="text-center">
            <WifiOff className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <p className="text-white text-xl">Connexion perdue</p>
            <p className="text-gray-400 mt-2">Tentatives: {retryCount}/{MAX_RETRIES}</p>
          </div>
        </div>
      )}

      {/* Contrôles */}
      <div
        className={`absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/50 transition-opacity duration-300 z-30 ${
          showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        {/* Titre */}
        <div className="absolute top-4 right-4 text-white">
          <h3 className="text-lg font-semibold drop-shadow-lg">{channelName}</h3>
          {isOnline && (
            <div className="flex items-center gap-2 mt-1">
              <Wifi className="w-4 h-4" />
              <span className="text-sm">En direct</span>
            </div>
          )}
        </div>

        {/* Contrôles centraux */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex items-center gap-8">
          {onPreviousChannel && (
            <button
              onClick={onPreviousChannel}
              className="p-4 bg-white/20 hover:bg-white/30 rounded-full transition-colors"
            >
              <SkipBack className="w-8 h-8 text-white" />
            </button>
          )}

          <button
            onClick={togglePlay}
            className="p-6 bg-white/20 hover:bg-white/30 rounded-full transition-colors"
          >
            {isPlaying ? (
              <Pause className="w-12 h-12 text-white" />
            ) : (
              <Play className="w-12 h-12 text-white" />
            )}
          </button>

          {onNextChannel && (
            <button
              onClick={onNextChannel}
              className="p-4 bg-white/20 hover:bg-white/30 rounded-full transition-colors"
            >
              <SkipForward className="w-8 h-8 text-white" />
            </button>
          )}
        </div>

        {/* Barre de progression */}
        <div className="absolute bottom-20 left-4 right-4">
          <div className="relative h-1 bg-white/30 rounded-full overflow-hidden">
            <div
              className="absolute h-full bg-white/50 transition-all"
              style={{ width: `${bufferProgress}%` }}
            />
            <div
              className="absolute h-full bg-red-600 transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Contrôles du bas */}
        <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={togglePlay}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              {isPlaying ? (
                <Pause className="w-6 h-6 text-white" />
              ) : (
                <Play className="w-6 h-6 text-white" />
              )}
            </button>

            <div className="flex items-center gap-2 group/volume">
              <button
                onClick={toggleMute}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                {isMuted || volume === 0 ? (
                  <VolumeX className="w-6 h-6 text-white" />
                ) : (
                  <Volume2 className="w-6 h-6 text-white" />
                )}
              </button>

              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={volume}
                onChange={(e) => changeVolume(parseFloat(e.target.value))}
                className="w-0 group-hover/volume:w-24 transition-all duration-300 opacity-0 group-hover/volume:opacity-100"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <Settings className="w-6 h-6 text-white" />
              </button>

              {showSettings && (
                <div className="absolute bottom-full mb-2 right-0 bg-black/90 rounded-lg p-2 min-w-[150px]">
                  <p className="text-white text-sm font-semibold mb-2 px-2">Vitesse</p>
                  {PLAYBACK_SPEEDS.map((speed) => (
                    <button
                      key={speed}
                      onClick={() => changePlaybackSpeed(speed)}
                      className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                        playbackSpeed === speed
                          ? 'bg-red-600 text-white'
                          : 'text-white hover:bg-white/20'
                      }`}
                    >
                      {speed}x {speed === 1 && '(Normal)'}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {document.pictureInPictureEnabled && (
              <button
                onClick={togglePiP}
                className={`p-2 rounded-lg transition-colors ${
                  isPiP ? 'bg-red-600' : 'hover:bg-white/20'
                }`}
              >
                <PictureInPicture className="w-6 h-6 text-white" />
              </button>
            )}

            <button
              onClick={toggleFullscreen}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              {isFullscreen ? (
                <Minimize className="w-6 h-6 text-white" />
              ) : (
                <Maximize className="w-6 h-6 text-white" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
