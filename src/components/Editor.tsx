import { BlockNoteView } from "@blocknote/mantine";
import {
  useCreateBlockNote,
  DragHandleButton,
  SideMenu,
  SideMenuController,
  useComponentsContext,
  useBlockNoteEditor,
  SideMenuProps,
  DragHandleMenu,
  DragHandleMenuProps,
} from "@blocknote/react";
import DeleteIcon from '@mui/icons-material/Delete';
import { forwardRef, useImperativeHandle, useRef } from "react";

const Editor = forwardRef<{ focus: () => void }, {
  setFocusedComponent: (component: 'player' | 'editor' | null) => void
}>
  ((props, ref) => {
    const editor = useCreateBlockNote();
    const editorRef = useRef<HTMLDivElement>(null);

    useImperativeHandle(ref, () => ({
      focus: () => {
        const focusNextElement = () => {
          // Get all focusable elements
          const focusable = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
          const elements = Array.from(document.querySelectorAll(focusable));

          // Find current element index
          const currentIndex = elements.indexOf(editorRef.current as Element);

          // Focus next element or first if at end
          const nextElement = elements[currentIndex + 1] || elements[0];
          (nextElement as HTMLElement).focus();
        };

        editorRef.current?.focus();
        focusNextElement();
      },
    }), []);

    return (
      <div
        ref={editorRef}
        tabIndex={0}
        className="flex flex-col mx-0.5 h-full bg-gray-900 rounded-lg p-2 overflow-auto dark:bg-zinc-900"
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
        onFocus={() => props.setFocusedComponent('editor')}
      >
        <BlockNoteView slashMenu={false} editor={editor} sideMenu={false} data-theming-css-demo>
          <SideMenuController
            sideMenu={(props) => (
              <SideMenu {...props}>
                <RemoveBlockButton {...props} />
                <DragHandleButton {...props} dragHandleMenu={(props) => (
                  <DragHandleMenu {...props} >
                    <DuplicateBlockButton {...props}>Duplicate</DuplicateBlockButton>
                    <SplitBlockButton {...props}>Split</SplitBlockButton>
                    <MergeBlockButton {...props}>Merge</MergeBlockButton>
                  </DragHandleMenu>
                )} />
              </SideMenu>
            )}
          />
        </BlockNoteView>
      </div>
    );
  });

function RemoveBlockButton(props: SideMenuProps) {
  const editor = useBlockNoteEditor();
  const Components = useComponentsContext()!;

  return (
    <Components.SideMenu.Button
      label="Remove block"
      icon={
        <DeleteIcon
          onClick={() => {
            editor.removeBlocks([props.block]);
          }}
        />
      }
    />
  );
}

function DuplicateBlockButton(props: DragHandleMenuProps) {
  const editor = useBlockNoteEditor();
  const Components = useComponentsContext()!;

  return (
    <Components.Generic.Menu.Item
      onClick={() => {
        editor.insertBlocks([props.block], props.block, 'after');
      }}>
      Duplicate
    </Components.Generic.Menu.Item>
  );
}

function SplitBlockButton(props: DragHandleMenuProps) {
  const editor = useBlockNoteEditor();
  const Components = useComponentsContext()!;
  const regex = /(?<=[.!?]) +/;

  return (
    <Components.Generic.Menu.Item
      onClick={() => {
        const { content } = props.block;
        if (Array.isArray(content) && content.length > 0) {
          const text = content.reduce((acc, block) => {
            return acc + (block.type === 'link' ? block.content[0].text : block.text);
          }, '');

          text.split(regex).reverse().forEach((text) => {
            editor.insertBlocks([{ type: 'paragraph', content: text }], props.block, 'after');
          });
          editor.removeBlocks([props.block]);
        }
      }}>
      Split
    </Components.Generic.Menu.Item>
  );
}

function MergeBlockButton(_: DragHandleMenuProps) {
  const editor = useBlockNoteEditor();
  const Components = useComponentsContext()!;

  return (
    <Components.Generic.Menu.Item
      onClick={() => {
        const combinedText = editor.document
          .reduce<string[]>((acc, block) => {
            if (Array.isArray(block.content) && block.content.length > 0 && 'text' in block.content[0]) {
              acc.push(block.content[0].text);
            }
            return acc;
          }, [])
          .join(' ');

        editor.replaceBlocks(editor.document, [{
          type: 'paragraph',
          content: combinedText
        }]);
      }}>
      Merge
    </Components.Generic.Menu.Item>
  );
}

export default Editor;
