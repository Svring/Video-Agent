import React, { useEffect, useRef, useState, forwardRef, useImperativeHandle } from "react";
import ReactPlayer from 'react-player';
import { Card, CardBody, CardFooter, Slider } from "@nextui-org/react";
import { Typography } from "@mui/material";
import { Button, ButtonGroup } from '@nextui-org/react';

const Player = forwardRef<{ focus: () => void }, { videoPath: string, 
  setFocusedComponent: (component: 'player' | 'editor' | null) => void }>((props, ref) => {
  const reactPlayerRef = useRef<ReactPlayer>(null);
  const playerContainerRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState<number>(0);
  const [isFocused, setIsFocused] = useState<boolean>(false);
  const [duration, setDuration] = useState<number>(0);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [skipInterval, setSkipInterval] = useState<number>(1);
  const [frequency, setFrequency] = useState<number>(1);

  useImperativeHandle(ref, () => ({
    focus: () => {
      playerContainerRef.current?.focus();
    }
  }), []);

  useEffect(() => {
    if (!reactPlayerRef.current?.getInternalPlayer()) return;
    if (!isFocused && reactPlayerRef.current) {
      reactPlayerRef.current.getInternalPlayer().pause();
    } else if (isFocused && reactPlayerRef.current) {
      reactPlayerRef.current.getInternalPlayer().play();
    }
  }, [isFocused]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (isFocused && reactPlayerRef.current) {
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
  }, [isFocused, skipInterval, duration]);

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
        setIsFocused(true);
        props.setFocusedComponent('player');
      }}
      onBlur={() => {
        setIsFocused(false);
        if (reactPlayerRef.current) {
          reactPlayerRef.current.getInternalPlayer().pause();
        }
      }}
      className="flex flex-col justify-center items-center 
      mx-0.5 h-full bg-gray-900 rounded-lg focus:outline-none"
    >
      <Card 
        isBlurred 
        shadow="sm" 
        className={`w-full h-full border-none bg-gray-900 rounded-lg ${
          isFocused ? 'ring-1 ring-inset ring-cyan-500' : ''
        }`}
      >
        <CardBody onClick={() => {
          handlePlayPause();
        }}>
          <ReactPlayer
            ref={reactPlayerRef}
            url={props.videoPath}
            width="100%"
            height="100%"
            onProgress={handleProgress}
            onDuration={(duration) => setDuration(duration)} // Capture video duration
            playbackRate={frequency} // Set playback rate based on frequency state
          />
        </CardBody>
        <CardFooter className="flex flex-col border-t border-gray-700">
          <Slider
            aria-label="Progress"
            size="sm"
            color="foreground"
            className="max-w-sm"
            value={(progress / duration) * 100} // Adjust slider value to reflect current time
            onFocus={() => {
              // Immediately shift focus back to the container
              playerContainerRef.current?.focus();
            }}
            onClick={() => {
              // Ensure container gets focus after click interactions too
              playerContainerRef.current?.focus();
            }}
            onChange={(value) => {
              const newTime = (value as number / 100) * duration;
              setProgress(newTime);
              reactPlayerRef.current?.seekTo(newTime);
              // Also return focus after value changes
              playerContainerRef.current?.focus();
            }}
          />
          <div className="flex flex-row items-center w-full h-5 px-4 text-xs text-gray-400 max-w-sm">
            <Typography variant="body2">{progress.toFixed(0)}</Typography>
            <ButtonGroup size="sm" isIconOnly className="bg-transparent flex-grow">
              <Button className={`bg-transparent ${skipInterval === 1 ? 'text-cyan-500' : 'text-gray-400'}`} onClick={() => setSkipInterval(1)} isIconOnly>1</Button>
              <Button className={`bg-transparent ${skipInterval === 2 ? 'text-cyan-500' : 'text-gray-400'}`} onClick={() => setSkipInterval(2)} isIconOnly>2</Button>
              <Button className={`bg-transparent ${skipInterval === 5 ? 'text-cyan-500' : 'text-gray-400'}`} onClick={() => setSkipInterval(5)} isIconOnly>5</Button>
            </ButtonGroup>
            <Button onClick={handleMute} size="sm"
              className={`bg-transparent ${isMuted ? 'text-cyan-500' : 'text-gray-400'}`}>
              {isMuted ? 'Unmute' : 'Mute'}
            </Button>
            <ButtonGroup size="sm" isIconOnly className="bg-transparent flex-grow">
              <Button className={`bg-transparent ${frequency === 0.5 ? 'text-cyan-500' : 'text-gray-400'}`} onClick={() => setFrequency(0.5)} isIconOnly>0.5</Button>
              <Button className={`bg-transparent ${frequency === 1 ? 'text-cyan-500' : 'text-gray-400'}`} onClick={() => setFrequency(1)} isIconOnly>1</Button>
              <Button className={`bg-transparent ${frequency === 2 ? 'text-cyan-500' : 'text-gray-400'}`} onClick={() => setFrequency(2)} isIconOnly>2</Button>
            </ButtonGroup>
            <Typography variant="body2">{duration.toFixed(0)}</Typography>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
});

export default Player;
