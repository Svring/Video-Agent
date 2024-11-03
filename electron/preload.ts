const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('fileAPI', {
  saveVideo: (filePath: string, videoPath: string) => ipcRenderer.invoke('save-video', filePath, videoPath)
})

export {}