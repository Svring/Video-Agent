// Native
import { join } from 'path';

// Packages
import { BrowserWindow, app, nativeTheme, ipcMain, IpcMainInvokeEvent, net } from 'electron';
import isDev from 'electron-is-dev';
import fs from 'fs';

const height = 800;
const width = 1200;

async function saveVideo(_: IpcMainInvokeEvent, filePath: string, videoPath: string) {
  console.log("Save video process initiated.");

  // Extract folder name from filePath
  const folderName = filePath.split('/').pop() || 'default';

  // Function to generate the next available filename
  const getNextFileName = (folderPath: string, prefix: string) => {
    const files = fs.readdirSync(folderPath);
    let maxIndex = -1;

    files.forEach(file => {
      const match = file.match(new RegExp(`^${prefix}-(\\d+)\\.mp4$`));
      if (match) {
        const index = parseInt(match[1], 10);
        if (index > maxIndex) {
          maxIndex = index;
        }
      }
    });

    const nextIndex = maxIndex + 1;
    return `${prefix}-${nextIndex}.mp4`;
  };

  // Generate the next available filename
  const videoFileName = getNextFileName(filePath, folderName);
  const fullFilePath = join(filePath, videoFileName);

  const file = fs.createWriteStream(fullFilePath);

  const request = net.request(videoPath);

  request.on('response', (response) => {
    console.log("Downloading video...");
    response.on('data', (chunk) => {
      file.write(chunk);
    });

    response.on('end', () => {
      file.end();
      console.log('No more data in response.');
    });
  });

  request.on('error', (err) => {
    console.error(`Error: ${err.message}`);
  });

  request.end();
}

function createWindow() {
  // Create the browser window.
  const window = new BrowserWindow({
    width,
    height,
    //  change to false to use AppBar
    frame: false,
    show: true,
    resizable: true,
    fullscreenable: true,
    webPreferences: {
      preload: join(__dirname, 'preload.js'),
      sandbox: false
    },
    titleBarStyle: 'hiddenInset'
  });

  const port = process.env.PORT || 3000;
  const url = isDev ? `http://localhost:${port}` : join(__dirname, '../dist-vite/index.html');

  // and load the index.html of the app.
  if (isDev) {
    window?.loadURL(url);
  } else {
    window?.loadFile(url);
  }

  nativeTheme.themeSource = 'dark';
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  ipcMain.handle('save-video', saveVideo);
  createWindow();

  app.on('activate', () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

