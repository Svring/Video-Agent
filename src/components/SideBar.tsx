import React, { useState } from "react";
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import InsertLinkIcon from '@mui/icons-material/InsertLink';
import SaveAltIcon from '@mui/icons-material/SaveAlt';
import Snackbar from '@mui/material/Snackbar';
import SettingsIcon from '@mui/icons-material/Settings';
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, useDisclosure } from "@nextui-org/react";

export default function SideBar({ setVideoPath }:
    { setVideoPath: (videoPath: string) => void }) {

    const [folderUrl, setFolderUrl] = useState<string>("");
    const [videoUrl, setVideoUrl] = useState<string>("");

    const [open, setOpen] = useState(false);
    const { isOpen, onOpen, onOpenChange } = useDisclosure();

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
            <Button onClick={onOpen} color="default" isIconOnly className="bg-transparent">
                <SettingsIcon sx={{ fontSize: 30, color: 'white' }} />
            </Button>
            <Snackbar
                open={open}
                autoHideDuration={2000}
                message={`Video path copied as ${videoUrl}`}
                onClose={() => setOpen(false)}
            />
            <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader className="flex flex-col gap-1 text-white">Settings</ModalHeader>
                            <ModalBody>
                                <p className="text-white">
                                    In the depths of code we write,
                                    Digital dreams take their flight.
                                    Through pixels, bytes, and flowing streams,
                                    We build the future, or so it seems.

                                    Each function like a verse so neat,
                                    Making our program feel complete.
                                    In this dance of ones and zeros bright,
                                    We craft our world, day and night.
                                </p>
                            </ModalBody>
                            <ModalFooter>
                                <Button color="danger" variant="light" onPress={onClose}>
                                    Close
                                </Button>
                                <Button color="primary" onPress={() => { handleCopyVideoUrl(); onClose(); }}>
                                    Action
                                </Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>
        </div>
    );
}
