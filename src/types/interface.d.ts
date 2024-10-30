export interface IFileAPI {
    saveVideo: (filePath: string, videoPath: string) => Promise<void>,
}

declare global {
    interface Window {
        fileAPI: IFileAPI
    }
}