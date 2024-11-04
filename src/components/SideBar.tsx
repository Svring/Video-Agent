import { useEffect, useState } from "react";
import {
    FolderOpen as FolderOpenIcon, InsertLink as InsertLinkIcon,
    SaveAlt as SaveAltIcon, Settings as SettingsIcon, HelpOutline as HelpOutlineIcon,
    DarkMode as DarkModeIcon, LightMode as LightModeIcon
} from '@mui/icons-material';
import Snackbar from '@mui/material/Snackbar';
import {
    Modal, ModalContent, ModalHeader, ModalBody,
    ModalFooter, Button, useDisclosure, Kbd,
    Listbox, ListboxItem, Switch
} from "@nextui-org/react";
import { invoke } from "@tauri-apps/api/core";

export default function SideBar({ setVideoPath }:
    { setVideoPath: (videoPath: string) => void }) {

    const [darkMode, setDarkMode] = useState(true);

    const [folderUrl, setFolderUrl] = useState<string>("");
    const [videoUrl, setVideoUrl] = useState<string>("");

    const [open, setOpen] = useState(false);
    const { isOpen, onOpen, onOpenChange } = useDisclosure();
    const { isOpen: isSettingsOpen, onOpen: onSettingsOpen,
        onClose: onSettingsClose } = useDisclosure();

    useEffect(() => {
        if (darkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [darkMode]);

    const handleFolderOpen = async () => {
        // try {
        //     // Use showDirectoryPicker to get directory handle
        //     const dirHandle = await window.showDirectoryPicker();
        //     // Get the absolute path using Tauri's API
        //     const fullPath = await invoke('get_directory_path', { 
        //         path: dirHandle.name 
        //     });
        //     setFolderUrl(fullPath as string);
        // } catch (err) {
        //     console.error('Error selecting directory:', err);
        // }
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
        console.log(folderUrl);
        console.log(videoUrl);
        const response = await invoke('save_video', { video_path: videoUrl, folder_path: folderUrl });
        console.log(response);
    };

    return (
        <div className="flex flex-col gap-1 mx-0.5 pb-2 h-full rounded-lg items-center">
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
                                <Switch
                                    defaultSelected
                                    size="lg"
                                    color="success"
                                    startContent={<LightModeIcon />}
                                    endContent={<DarkModeIcon />}
                                    onValueChange={() => setDarkMode(!darkMode)}
                                >
                                    Dark mode
                                </Switch>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>
            <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
                <ModalContent>
                    {/* {(onClose) => ( */}
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
                    {/* )} */}
                </ModalContent>
            </Modal>
        </div>
    );
}
