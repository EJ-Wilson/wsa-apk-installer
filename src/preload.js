// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
  openFile: () => ipcRenderer.invoke('dialog:openFile'),
  install: (filePath) => ipcRenderer.send('adb-install', filePath),
  onUpdateOutput: (callback) => ipcRenderer.on('update-output', (_event, output) => callback(output)),
  connect: (filePath) => ipcRenderer.send('adb-connect', filePath),
  onConnect: (callback) => ipcRenderer.on('adb-connected', (_event) => callback())
})