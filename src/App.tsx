import { useEffect, useState, useRef } from 'react';
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
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
        event.preventDefault();
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
      <PanelGroup direction="horizontal">
        <Panel defaultSize={4} minSize={5}>
          <SideBar setVideoPath={setVideoPath} />
        </Panel>
        <PanelResizeHandle/>
        <Panel defaultSize={40} minSize={20}>
          <Player
            videoPath={videoPath}
            ref={playerRef}
            setFocusedComponent={setFocusedComponent}
          />
        </Panel>
        <PanelResizeHandle/>
        <Panel defaultSize={40} minSize={20}>
          <Editor
            ref={editorRef}
            setFocusedComponent={setFocusedComponent}
          />
        </Panel>
      </PanelGroup>
    </div>
  );
}

export default App;
