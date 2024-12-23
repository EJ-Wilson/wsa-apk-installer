import { app, BrowserWindow, ipcMain, dialog } from 'electron';
const child_process = require('child_process');
import path from 'node:path';
import started from 'electron-squirrel-startup';

var adbPath = ((app.isPackaged) ? '"resources/' : '"src/') + 'platform-tools/adb.exe"';
var mainWindow = null;

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (started) {
  app.quit();
}

async function handleFileOpen () {
  const { canceled, filePaths } = await dialog.showOpenDialog()
  if (!canceled) {
    return filePaths[0]
  }
}





function connectUpdate(data) { 
  console.log(data);
  mainWindow.webContents.send('update-output', data);
}

function connectComplete(code) {
  switch (code) {
    case 0:
      mainWindow.webContents.send('adb-connected');
      break;
  }
}

async function connect (event) {
  run_script(adbPath, ["connect", "127.0.0.1:58526"], connectUpdate, connectComplete);
}





function installUpdate(data) { 
  console.log(data);
  mainWindow.webContents.send('update-output', data);
}

function installComplete(code) {
  switch (code) {
    case 0:
      mainWindow.webContents.send('update-output', "Install complete!");
      break;
    default:
      mainWindow.webContents.send('update-output', "Install failed!");
      break;
  }
  
}

async function install (event, filePath) {
  mainWindow.webContents.send('update-output', "Installing " + filePath);
  run_script(adbPath, ["install", filePath], installUpdate, installComplete);
}





function createWindow () {
  mainWindow = new BrowserWindow({
    webPreferences: {
      preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
    }
  })
  // and load the index.html of the app.
  mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  ipcMain.handle('dialog:openFile', handleFileOpen);
  ipcMain.on('adb-install', install);
  ipcMain.on('adb-connect', connect);
  createWindow();

  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});






// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.

// This function will output the lines from the script 
// and will return the full combined output
// as well as exit code when it's done (using the callback).
function run_script(command, args, updateCallback, finalCallback) {
    var child = child_process.spawn(command, args, {
        encoding: 'utf8',
        shell: true
    });
    // You can also use a variable to save the output for when the script closes later
    child.on('error', (error) => {
        dialog.showMessageBox({
            title: 'Title',
            type: 'warning',
            message: 'Error occured.\r\n' + error
        });
    });

    child.stdout.setEncoding('utf8');
    child.stdout.on('data', (data) => {
        //Here is the output
        data=data.toString();   
        console.log(data);      
    });

    child.stderr.setEncoding('utf8');
    child.stderr.on('data', (data) => {
        // Return some data to the renderer process with the mainprocess-response ID
        mainWindow.webContents.send('mainprocess-response', data);
        //Here is the output from the command
        if (typeof updateCallback === 'function')
          updateCallback(data);
    });

    child.on('close', (code) => {
        //Here you can get the exit code of the script  
        if (typeof finalCallback === 'function')
          finalCallback(code);

    });
    
}