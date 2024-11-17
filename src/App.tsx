import { useEffect, useState, useRef } from 'react';
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import Player from './components/Player';
import Editor from './components/Editor';
import SideBar from './components/SideBar';

function App() {
  const [videoPath, setVideoPath] = useState<string>("");
  const playerRef = useRef<{ focus: () => void, blur: () => void } | null>(null);
  const editorRef = useRef<{ focus: () => void, blur: () => void } | null>(null);
  const [bubbleOpen, setBubbleOpen] = useState(false);
  const [focusedComponent, setFocusedComponent] = useState<'player' | 'editor' | null>('player');
  const [note, setNote] = useState("");

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === '`' || event.key === '·') {
        event.preventDefault();
        handleFocusChange(null);
      }
    };

    if (focusedComponent === 'player') {
      playerRef.current?.focus();
      console.log("focusedComponent: player");
    } else if (focusedComponent === 'editor') {
      editorRef.current?.focus();
      console.log("focusedComponent: editor");
    }

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [focusedComponent]);

  function handleFocusChange(component: 'player' | 'editor' | null) {
    if (component === null) {
      setFocusedComponent(prev => prev === 'player' ? 'editor' : 'player');
    } else {
      setFocusedComponent(component);
    }
  }

  return (
    <div data-tauri-drag-region
      className="flex flex-row py-2 px-1.5 gap-1 justify-between w-full h-screen">
      <PanelGroup direction="horizontal">
        <div className="w-14">
          <SideBar setVideoPath={setVideoPath} />
        </div>
        <Panel defaultSize={40} minSize={20}>
          <Player
            videoPath={videoPath}
            ref={playerRef}
            focusedComponent={focusedComponent}
            setFocusedComponent={handleFocusChange}
          />
        </Panel>
        <PanelResizeHandle />
        <Panel defaultSize={40} minSize={20}>
          <Editor
            ref={editorRef}
            focusedComponent={focusedComponent}
            setFocusedComponent={handleFocusChange}
          />
        </Panel>
        <div className={`absolute bg-gray-900 bottom-4 right-4 
          text-white cursor-pointer transition-all duration-300
          flex items-center justify-center ring-1 ring-gray-700
          ${bubbleOpen ? 'w-1/2 h-1/2 rounded-lg' : 'w-10 h-10 rounded-full'}
        `}
          onClick={() => bubbleOpen ? false : setBubbleOpen(true)}
        >
          {bubbleOpen ?
            <div className="w-full h-full flex">
              <textarea 
                className="w-full h-full border-none outline-none 
                p-4 text-md ring-1 ring-gray-700 rounded-lg"
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />

              <div className={`absolute bg-gray-900 bottom-1 right-1
                text-white cursor-pointer transition-all duration-300
                flex items-center justify-center
                w-10 h-10 rounded-full ring-1 ring-gray-700
              `}
                onClick={() => setBubbleOpen(false)}
              >
                -
              </div>
            </div>
            : '+'}
        </div>
      </PanelGroup>
    </div>
  );
}

export default App;
