'use strict'

import { app, protocol, BrowserWindow, Menu, ipcMain, shell } from 'electron'
import { createProtocol } from 'vue-cli-plugin-electron-builder/lib'
import installExtension, { VUEJS_DEVTOOLS } from 'electron-devtools-installer'
import * as stream from "stream";
const isDevelopment = process.env.NODE_ENV !== 'production'

const ffmpeg = require('fluent-ffmpeg')
let win;

let menuTemplate=[
  {
    label:"Deneme"
  },
  {
    label:"Developers",
    submenu:[
      {
        label:"Developer Tools",
        click(){
          win.webContents.toggleDevTools()
        }
      }
    ]
  }
]

// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([
  { scheme: 'app', privileges: { secure: true, standard: true } }
])

async function createWindow() {
  // Create the browser window.
   win = new BrowserWindow({
    width: 800,
    height: 600,
    resizable:false,
    frame:false,
    webPreferences: {
      enableRemoteModule: false,
      nodeIntegration: true,
      contextIsolation: false
    }
  })

  win.webContents.send("send-data",videos)



  let mt=Menu.buildFromTemplate(menuTemplate)
  Menu.setApplicationMenu(mt)


  if (process.env.WEBPACK_DEV_SERVER_URL) {
    // Load the url of the dev server if in development mode
    await win.loadURL(process.env.WEBPACK_DEV_SERVER_URL)
    // if (!process.env.IS_TEST) win.webContents.openDevTools()
  } else {
    createProtocol('app')
    // Load the index.html when not in development
    win.loadURL('app://./index.html')
  }
}

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) createWindow()
})

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', async () => {
  if (isDevelopment && !process.env.IS_TEST) {
    // Install Vue Devtools
    try {
      await installExtension(VUEJS_DEVTOOLS)
    } catch (e) {
      console.error('Vue Devtools failed to install:', e.toString())
    }
  }
  createWindow()
})

// Exit cleanly on request from parent process in development mode.
if (isDevelopment) {
  if (process.platform === 'win32') {
    process.on('message', (data) => {
      if (data === 'graceful-exit') {
        app.quit()
      }
    })
  } else {
    process.on('SIGTERM', () => {
      app.quit()
    })
  }
}

let videos=[];

ipcMain.on("file-uploaded",async (e,{path,name})=>{
  await ffmpeg.ffprobe(path,(e,metadata)=>{
    videos.push({
      name,
      path,
      duration:metadata.format.duration
    })
    win.webContents.send("send-data",videos)

  })
})

ipcMain.on("clear-all",(e,a)=>{
  videos=[]
  win.webContents.send("send-data",videos)
})

ipcMain.on("convert-all", (e,type)=>{
  let path;
  videos.forEach((video)=>{
     path=video.path.split(video.name)[0]
     ffmpeg(video.path).
     output(`${path}/${video.name} converted ${type} .${type}`)
         .on("end",()=>{
           console.log("ended")

         })
  })
  win.webContents.send("finish",path)
})

ipcMain.on("open-folder",(e,path)=>{
  shell.showItemInFolder(path+'/')
})