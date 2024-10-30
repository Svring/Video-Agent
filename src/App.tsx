import React, { useEffect, useState, useRef } from 'react';
import { Allotment } from "allotment";
import Player from './components/Player';
import Editor from './components/Editor';
import SideBar from './components/SideBar';

function App() {
  const [videoPath, setVideoPath] = useState<string>("");
  const playerRef = useRef<{ focus: () => void } | null>(null);
  const editorRef = useRef<{ focus: () => void } | null>(null);
  const [focusedComponent, setFocusedComponent] = useState<'player' | 'editor' | null>(null);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === '`') {
        if (focusedComponent === 'player') {
          editorRef.current?.focus();
          setFocusedComponent('editor');
        } else if (focusedComponent === 'editor') {
          playerRef.current?.focus();
          setFocusedComponent('player');
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [focusedComponent]);

  return (
    <div className="flex flex-row py-2 px-1.5 gap-1 justify-between w-full h-screen">
      <Allotment separator={false}>
        <Allotment.Pane minSize={70} preferredSize={70}>
          <SideBar setVideoPath={setVideoPath}/>
        </Allotment.Pane>
        <Allotment.Pane preferredSize={500}>
          <Player
            videoPath={videoPath}
            ref={playerRef}
            setFocusedComponent={setFocusedComponent}
          />
        </Allotment.Pane>
        <Allotment.Pane>
          <Editor
            ref={editorRef}
            setFocusedComponent={setFocusedComponent}
          />
        </Allotment.Pane>
      </Allotment>
    </div>
  );
}

export default App;
