import React, { useState } from "react";
import IconButton from '@mui/material/IconButton';
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
                const absolutePath = files[0].path.split(files[0].webkitRelativePath)[0];
                setFolderUrl(absolutePath);
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
        const fileName = videoUrl.split('/').pop() || 'video';
        const filePath = `${folderUrl}/${fileName}`;
        setVideoPath(filePath);
    };

    return (
        <div className="flex flex-col gap-1 mx-0.5 pt-8 pb-2 h-full rounded-lg">
            <IconButton onClick={handleFolderOpen}>
                <FolderOpenIcon sx={{ fontSize: 30, color: 'white' }} />
            </IconButton>
            <IconButton onClick={handleInsertLink}>
                <InsertLinkIcon sx={{ fontSize: 30, color: 'white' }} />
            </IconButton>
            <IconButton disabled={!videoUrl} onClick={handleSave}>
                <SaveAltIcon sx={{ fontSize: 30, color: videoUrl ? 'white' : 'gray' }} />
            </IconButton>
            <div className="flex-grow draggable" />
            <IconButton onClick={onOpen}>
                <SettingsIcon sx={{ fontSize: 30, color: 'white' }} />
            </IconButton>
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
                                    {videoUrl}
                                </p>
                            </ModalBody>
                            <ModalFooter>
                                <Button color="danger" variant="light" onPress={onClose}>
                                    Close
                                </Button>
                                <Button color="primary" onPress={onClose}>
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
