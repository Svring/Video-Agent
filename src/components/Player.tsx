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
    const handleKeyDown = (event: KeyboardEvent) => {
      if (isFocused && reactPlayerRef.current) {
        const currentTime = reactPlayerRef.current.getCurrentTime();

        if (event.key === 'ArrowLeft') {
          reactPlayerRef.current.seekTo(Math.max(currentTime - skipInterval, 0));
          reactPlayerRef.current.getInternalPlayer().pause();
        } else if (event.key === 'ArrowRight') {
          reactPlayerRef.current.seekTo(Math.min(currentTime + skipInterval, duration));
          reactPlayerRef.current.getInternalPlayer().pause();
        } else if (event.key === ' ') {
          if (reactPlayerRef.current.getInternalPlayer().paused) {
            reactPlayerRef.current.getInternalPlayer().play();
          } else {
            reactPlayerRef.current.getInternalPlayer().pause();
          }
        } else if (event.key === 'ArrowUp') {
          setFrequency((prevFrequency) => {
            if (prevFrequency === 0.5) return 1;
            if (prevFrequency === 1) return 2;
            if (prevFrequency === 2) return 0.5;
            return 1;
          });
        } else if (event.key === 'ArrowDown') {
          setSkipInterval((prevSkipInterval) => {
            if (prevSkipInterval === 1) return 2;
            if (prevSkipInterval === 2) return 5;
            if (prevSkipInterval === 5) return 1;
            return 1;
          });
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isFocused]);

  const handleProgress = (state: { playedSeconds: number }) => {
    setProgress(state.playedSeconds); // Update progress with current time in seconds
  };

  const handleMute = () => {
    if (reactPlayerRef.current) {
      const internalPlayer = reactPlayerRef.current.getInternalPlayer();
      if (isMuted) {
        internalPlayer.muted = false;
        setIsMuted(false);
      } else {
        internalPlayer.muted = true;
        setIsMuted(true);
      }
    }
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
        <CardBody>
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
            onChange={(value) => {
              const newTime = (value as number / 100) * duration;
              setProgress(newTime);
              reactPlayerRef.current?.seekTo(newTime);
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
