import { BlockNoteView } from "@blocknote/mantine";
import {
    useCreateBlockNote,
    DragHandleButton,
    SideMenu,
    SideMenuController,
    useComponentsContext,
    useBlockNoteEditor,
    SideMenuProps,
} from "@blocknote/react";
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import React, { forwardRef, useImperativeHandle, useRef } from "react";

const Editor = forwardRef<{ focus: () => void }, {}>((props, ref) => {
    const editor = useCreateBlockNote();
    const editorRef = useRef<HTMLDivElement>(null);
    const regex = '(?<=[.!?]) +';

    useImperativeHandle(ref, () => {
        return {
            focus: () => {
                editorRef.current?.focus();
            }
        };
    }, [editorRef]);

    return (
        <div
            ref={editorRef}
            className="flex flex-col mx-0.5 h-full bg-gray-900 rounded-lg p-2 overflow-auto"
            style={{
                scrollbarWidth: 'none', // For Firefox
                msOverflowStyle: 'none', // For Internet Explorer and Edge
            }}
        >
            <BlockNoteView slashMenu={false} editor={editor} sideMenu={false} data-theming-css-demo>
                <SideMenuController
                    sideMenu={(props) => (
                        <SideMenu {...props}>
                            <DuplicateBlockButton {...props} />
                            <DragHandleButton {...props} />
                        </SideMenu>
                    )}
                />
            </BlockNoteView>
        </div>
    );
});

function DuplicateBlockButton(props: SideMenuProps) {
    const editor = useBlockNoteEditor();

    const Components = useComponentsContext()!;

    return (
        <Components.SideMenu.Button
            label="Duplicate block"
            icon={
                <ContentCopyIcon
                    fontSize="small"
                    onClick={() => {
                        const duplicatedBlock = editor.getBlock(props.block.id);
                        if (duplicatedBlock) {
                            editor.insertBlocks([duplicatedBlock], props.block, 'after');
                        }
                    }}
                />
            }
        />
    );
}

export default Editor;
