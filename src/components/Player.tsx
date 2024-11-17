import { useEffect, useRef, useState, forwardRef, useImperativeHandle } from "react";
import ReactPlayer from 'react-player';
import { Card, CardBody, CardFooter, Slider } from "@nextui-org/react";
import { Typography } from "@mui/material";
import { Button, ButtonGroup } from '@nextui-org/react';

const Player = forwardRef<{ focus: () => void, blur: () => void }, {
  videoPath: string,
  focusedComponent: 'player' | 'editor' | null,
  setFocusedComponent: (component: 'player' | 'editor' | null) => void
}>((props, ref) => {
  const reactPlayerRef = useRef<ReactPlayer>(null);
  const playerContainerRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [skipInterval, setSkipInterval] = useState<number>(1);
  const [frequency, setFrequency] = useState<number>(1);

  useImperativeHandle(ref, () => ({
    focus: () => {
      playerContainerRef.current?.focus();
    },
    blur: () => {
      playerContainerRef.current?.blur();
    }
  }), []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (props.focusedComponent !== 'player' || !playerContainerRef.current) return;

      if (reactPlayerRef.current) {
        const currentTime = reactPlayerRef.current.getCurrentTime();
        const internalPlayer = reactPlayerRef.current.getInternalPlayer();

        switch (event.key) {
          case 'ArrowLeft':
            handleSeek(Math.max(currentTime - skipInterval, 0));
            setTimeout(() => {
              internalPlayer.pause();
            }, 50);
            break;
          case 'ArrowRight':
            handleSeek(Math.min(currentTime + skipInterval, duration));
            setTimeout(() => {
              internalPlayer.pause();
            }, 50);
            break;
          case ' ':
            handlePlayPause();
            break;
          case 'ArrowUp':
            handleFrequency();
            break;
          case 'ArrowDown':
            handleSkipInterval();
            break;
          case 'm':
            handleMute();
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [skipInterval, duration]);

  const handleProgress = (state: { playedSeconds: number }) => {
    if (!reactPlayerRef.current?.getInternalPlayer()) return;
    setProgress(state.playedSeconds); // Update progress with current time in seconds
  };

  const handleMute = () => {
    if (!reactPlayerRef.current?.getInternalPlayer()) return;
    const internalPlayer = reactPlayerRef.current.getInternalPlayer();
    setIsMuted((prevIsMuted) => {
      internalPlayer.muted = !prevIsMuted;
      return !prevIsMuted;
    });
  };

  const handlePlayPause = () => {
    if (!reactPlayerRef.current?.getInternalPlayer()) return;
    const internalPlayer = reactPlayerRef.current.getInternalPlayer();
    if (internalPlayer.paused) {
      internalPlayer.play();
    } else {
      internalPlayer.pause();
    }
  };

  const handleSeek = (newTime: number) => {
    reactPlayerRef.current?.seekTo(newTime, 'seconds');
  };

  const handleFrequency = () => {
    setFrequency((prevFrequency) => {
      if (prevFrequency === 0.5) return 1;
      if (prevFrequency === 1) return 2;
      if (prevFrequency === 2) return 0.5;
      return 1;
    });
  };

  const handleSkipInterval = () => {
    setSkipInterval((prevSkipInterval) => {
      if (prevSkipInterval === 1) return 2;
      if (prevSkipInterval === 2) return 5;
      if (prevSkipInterval === 5) return 1;
      return 1;
    });
  };

  return (
    <div
      ref={playerContainerRef}
      tabIndex={0}
      onFocus={() => {
        props.setFocusedComponent('player');
      }}
      onBlur={() => {
        reactPlayerRef.current?.getInternalPlayer()?.pause();
      }}
      className="flex flex-col justify-center items-center 
      mx-0.5 h-full bg-zinc-900 rounded-lg focus:outline-none"
    >
      <Card
        isBlurred
        shadow="sm"
        className={`w-full h-full border-none bg-gray-900 rounded-lg 
          ${props.focusedComponent === 'player' ? 'ring-1 ring-inset ring-cyan-500' : ''}`}
      >
        <CardBody onMouseDown={() => {
          props.setFocusedComponent('player')
          console.log('card body focused');
        }}>
          <ReactPlayer
            ref={reactPlayerRef}
            url={props.videoPath}
            width="100%"
            height="100%"
            onProgress={handleProgress}
            onDuration={(duration) => setDuration(duration)}
            playbackRate={frequency}
          />
        </CardBody>
        <CardFooter className="flex flex-col border-t border-gray-700">
          <Slider
            aria-label="Progress"
            size="sm"
            color="foreground"
            className="max-w-sm"
            value={(progress / duration) * 100}
            onFocus={() => playerContainerRef.current?.focus()}
            onChange={(value) => {
              const newTime = (value as number / 100) * duration;
              setProgress(newTime);
              reactPlayerRef.current?.seekTo(newTime);
              playerContainerRef.current?.focus();
            }}
          />
          <div className="flex flex-row items-center w-full h-5 px-4 text-xs text-gray-400 max-w-sm">
            <Typography variant="body2">{progress.toFixed(0)}</Typography>

            {/* Skip Interval Buttons */}
            <ButtonGroup size="sm" isIconOnly className="bg-transparent flex-grow">
              {[1, 2, 5].map((value) => (
                <Button
                  key={value}
                  isIconOnly
                  className={`bg-transparent ${skipInterval === value ? 'text-cyan-500' : 'text-gray-400'}`}
                  onClick={() => setSkipInterval(value)}
                >
                  {value}
                </Button>
              ))}
            </ButtonGroup>

            {/* Mute Button */}
            <Button
              size="sm"
              onClick={handleMute}
              className={`bg-transparent ${isMuted ? 'text-cyan-500' : 'text-gray-400'}`}
            >
              {isMuted ? 'Unmute' : 'Mute'}
            </Button>

            {/* Playback Speed Buttons */}
            <ButtonGroup size="sm" isIconOnly className="bg-transparent flex-grow">
              {[0.5, 1, 2].map((value) => (
                <Button
                  key={value}
                  isIconOnly
                  className={`bg-transparent ${frequency === value ? 'text-cyan-500' : 'text-gray-400'}`}
                  onClick={() => setFrequency(value)}
                >
                  {value}
                </Button>
              ))}
            </ButtonGroup>

            <Typography variant="body2">{duration.toFixed(0)}</Typography>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
});

export default Player;
