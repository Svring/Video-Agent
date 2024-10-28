import React, { useEffect, useState, useRef } from 'react';
import { Allotment } from "allotment";
import Player from './components/Player';
import Editor from './components/Editor';
import SideBar from './components/SideBar';

function App() {
  const [videoPath, setVideoPath] = useState<string>("");
  const playerRef = useRef<{ focus: () => void } | null>(null);
  const editorRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === '`') {
        const playerElement = playerRef.current as unknown as HTMLElement;
        const editorElement = editorRef.current;

        if (document.activeElement === playerElement) {
          playerElement.blur();
          editorElement?.focus();
        } else {
          playerElement?.focus();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <div className="flex flex-row py-2 px-1.5 gap-1 justify-between w-full h-screen">
      <Allotment separator={false}>
        <Allotment.Pane minSize={70} preferredSize={70}>
          <SideBar setVideoPath={setVideoPath}/>
        </Allotment.Pane>
        <Allotment.Pane preferredSize={500}>
          <Player videoPath={videoPath} ref={playerRef}/>
        </Allotment.Pane>
        <Allotment.Pane>
          <Editor ref={editorRef}/>
        </Allotment.Pane>
      </Allotment>
    </div>
  );
}

export default App;
