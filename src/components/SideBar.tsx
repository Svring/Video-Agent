import React, { useState } from "react";
import {
    FolderOpen as FolderOpenIcon, InsertLink as InsertLinkIcon,
    SaveAlt as SaveAltIcon, Settings as SettingsIcon, HelpOutline as HelpOutlineIcon,
} from '@mui/icons-material';
import Snackbar from '@mui/material/Snackbar';
import {
    Modal, ModalContent, ModalHeader, ModalBody,
    ModalFooter, Button, useDisclosure, Kbd,
    Listbox, ListboxItem
} from "@nextui-org/react";

export default function SideBar({ setVideoPath }:
    { setVideoPath: (videoPath: string) => void }) {

    const [folderUrl, setFolderUrl] = useState<string>("");
    const [videoUrl, setVideoUrl] = useState<string>("");

    const [open, setOpen] = useState(false);
    const { isOpen, onOpen, onOpenChange } = useDisclosure();
    const { isOpen: isSettingsOpen, onOpen: onSettingsOpen,
        onClose: onSettingsClose } = useDisclosure();

    const handleFolderOpen = () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.webkitdirectory = true;
        input.onchange = (e) => {
            const files = (e.target as HTMLInputElement).files;
            if (files && files.length > 0) {
                const folderName = files[0].webkitRelativePath.split('/')[0];
                const absolutePath = files[0].path.split(files[0].webkitRelativePath)[0];
                setFolderUrl(absolutePath + folderName);
            }
        };
        input.click();
    };

    const handleInsertLink = () => {
        navigator.clipboard.readText()
            .then(text => {
                setVideoUrl(text);
                setVideoPath(text);
                setOpen(true);
            })
            .catch(err => {
                console.error('Failed to read clipboard contents: ', err);
            });
    };

    const handleSave = async () => {
        if (!folderUrl || !videoUrl) return;
        window.fileAPI.saveVideo(folderUrl, videoUrl);
    };

    const handleCopyVideoUrl = () => {
        navigator.clipboard.writeText(videoUrl)
            .then(() => {
                console.log('Video URL copied to clipboard');
                setOpen(true);
            })
            .catch(err => {
                console.error('Failed to copy video URL: ', err);
            });
    };

    return (
        <div className="flex flex-col gap-1 mx-0.5 pt-8 pb-2 h-full rounded-lg items-center">
            <Button onClick={handleFolderOpen} isIconOnly
                className={`bg-transparent ${folderUrl ? 'text-cyan-500' : 'text-white'}`}>
                <FolderOpenIcon sx={{ fontSize: 30 }} />
            </Button>
            <Button onClick={handleInsertLink} color="default" isIconOnly
                className={`bg-transparent ${videoUrl ? 'text-cyan-500' : 'text-white'}`}>
                <InsertLinkIcon sx={{ fontSize: 30 }} />
            </Button>
            <Button disabled={!videoUrl} onClick={handleSave} isDisabled={!videoUrl || !folderUrl}
                color="default" isIconOnly className="bg-transparent">
                <SaveAltIcon sx={{ fontSize: 30, color: videoUrl ? 'white' : 'gray' }} />
            </Button>
            <div className="flex-grow draggable w-full" />
            <Button onClick={onSettingsOpen} color="default" isIconOnly className="bg-transparent">
                <HelpOutlineIcon sx={{ fontSize: 30, color: 'white' }} />
            </Button>
            <Button onClick={onOpen} color="default" isIconOnly className="bg-transparent">
                <SettingsIcon sx={{ fontSize: 30, color: 'white' }} />
            </Button>
            <Snackbar
                open={open}
                autoHideDuration={2000}
                message={`Video path copied as ${videoUrl}`}
                onClose={() => setOpen(false)}
            />
            <Modal isOpen={isSettingsOpen} onOpenChange={onSettingsClose}>
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader className="flex flex-col gap-1 text-white">Keyboard Shortcuts</ModalHeader>
                            <ModalBody>
                                <p className="text-white">
                                    The following keyboard shortcuts are available:
                                    <Listbox>
                                        <ListboxItem
                                            key="ArrowLeft"
                                            endContent="Switch focus between player and editor"
                                            // description="The upper left corner of the keyboard"
                                        >
                                            <Kbd>`</Kbd>
                                        </ListboxItem>
                                        <ListboxItem key="ArrowRight" endContent="Move forward a fixed interval in player">
                                            <Kbd keys={['right']}></Kbd>
                                        </ListboxItem>
                                        <ListboxItem key="ArrowLeft" endContent="Move backward a fixed interval in player">
                                            <Kbd keys={['left']}></Kbd>
                                        </ListboxItem>
                                        <ListboxItem key="Space" endContent="Play/Pause">
                                            <Kbd keys={['space']}></Kbd>
                                        </ListboxItem>
                                        <ListboxItem key="Mute" endContent="Mute/Unmute">
                                            <Kbd>M</Kbd>
                                        </ListboxItem>
                                        <ListboxItem key="Up" endContent="Change the frequency of video">
                                            <Kbd keys={['up']}></Kbd>
                                        </ListboxItem>
                                        <ListboxItem key="Down" endContent="Change the skip interval of video">
                                            <Kbd keys={['down']}></Kbd>
                                        </ListboxItem>
                                    </Listbox>
                                </p>
                            </ModalBody>
                            <ModalFooter>
                                <Button color="danger" variant="light" onPress={onClose}>
                                    Close
                                </Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>
            <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader className="flex flex-col gap-1 text-white">Hearken to my prayer</ModalHeader>
                            <ModalBody>
                                <p className="text-white">
                                    Hail holy queen of the sea, whirling in rags, you're vast and you're sad.
                                </p>
                            </ModalBody>
                            <ModalFooter>
                                {/* <Button color="danger" variant="light" onPress={onClose}>
                                    Close
                                </Button>
                                <Button color="primary" onPress={() => { handleCopyVideoUrl(); onClose(); }}>
                                    Action
                                </Button> */}
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>
        </div>
    );
}
