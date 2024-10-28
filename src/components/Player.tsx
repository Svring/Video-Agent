import React, { useEffect, useRef, useState, forwardRef, useImperativeHandle } from "react";
import ReactPlayer from 'react-player';
import { Card, CardBody, CardFooter, Slider } from "@nextui-org/react";

const Player = forwardRef<{ focus: () => void }, { videoPath: string }>((props, ref) => {
    const reactPlayerRef = useRef<ReactPlayer>(null);
    const playerContainerRef = useRef<HTMLDivElement>(null);
    const [progress, setProgress] = useState<number>(0);
    const [isFocused, setIsFocused] = useState<boolean>(false);
    const [duration, setDuration] = useState<number>(0);

    useImperativeHandle(ref, () => {
        return {
            focus: () => {
                playerContainerRef.current?.focus();
            },
            blur: () => {
                playerContainerRef.current?.blur();
            }
        };
    }, [playerContainerRef]);

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (isFocused && reactPlayerRef.current) {
                const currentTime = reactPlayerRef.current.getCurrentTime();

                if (event.key === 'ArrowLeft') {
                    reactPlayerRef.current.seekTo(Math.max(currentTime - 1, 0));
                    reactPlayerRef.current.getInternalPlayer().pause();
                } else if (event.key === 'ArrowRight') {
                    reactPlayerRef.current.seekTo(currentTime + 1);
                    reactPlayerRef.current.getInternalPlayer().pause();
                } else if (event.key === ' ') {
                    if (reactPlayerRef.current.getInternalPlayer().paused) {
                        reactPlayerRef.current.getInternalPlayer().play();
                    } else {
                        reactPlayerRef.current.getInternalPlayer().pause();
                    }
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

    return (
        <div
            ref={playerContainerRef}
            tabIndex={0}
            onFocus={() => {
                setIsFocused(true);
                console.log("Player focused");
            }}
            onBlur={() => {
                setIsFocused(false);
                console.log("Player blurred");
            }}
            className="flex flex-col justify-center items-center mx-0.5 h-full bg-gray-900 rounded-lg"
        >
            <Card isBlurred shadow="sm" className="w-full h-full border-none bg-gray-900 rounded-lg">
                <CardBody>
                    <ReactPlayer
                        ref={reactPlayerRef}
                        url={props.videoPath}
                        width="100%"
                        height="100%"
                        onProgress={handleProgress}
                        onDuration={(duration) => setDuration(duration)} // Capture video duration
                    />
                </CardBody>
                <CardFooter className="flex flex-col justify-center border-t border-gray-700">
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
                    <div className="flex flex-row w-full px-4 text-xs text-gray-400">
                        <p>{progress.toFixed(2)}s</p>
                        <div className="flex-grow" />
                        <p>{duration.toFixed(2)}s</p>
                    </div>
                </CardFooter>
            </Card>
        </div>
    );
});

export default Player;
