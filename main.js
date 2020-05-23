const { app, BrowserWindow, Menu, ipcMain } = require('electron');
const path = require('path');
const os = require('os');

const imagemin = require('imagemin');
const slash = require('slash');
const imageminmozjpeg = require('imagemin-mozjpeg');

//set env
process.env.NODE_ENV = 'development';

const isDev = process.env.NODE_ENV !== 'production' ? true : false;
const isMac = process.platform !== 'darwin' ? false : true;


let mainWindow;
let aboutWindow;
function createMainWindow() {
    mainWindow = new BrowserWindow({
        title: 'ImageShrink',
        width: isDev ? 900 : 500,
        height: 600,
        icon: './app/icons/Icon_256x256.png',
        resizable: isDev ? true : false,
        backgroundColor: "white",
        webPreferences: {
            nodeIntegration: true
        }
    });
    if (isDev) {
        mainWindow.webContents.openDevTools();
    }
    mainWindow.loadFile('./app/index.html');
}
function createAboutWindow() {
    aboutWindow = new BrowserWindow({
        title: 'AboutUs',
        width: 400,
        height: 400,
        icon: './app/icons/Icon_256x256.png',
        resizable: isDev ? true : false
    });
    aboutWindow.loadFile('./app/about.html');
}

const menu = [
    ...(isMac ? [{ role: 'appMenu' }] : []),
    {
        role: 'fileMenu'
    },
    ...(!isMac ?
        [
            {
                label: "Help",
                submenu: [
                    {
                        label: 'About',
                        click: createAboutWindow,
                    }
                ]
            }
        ] : []
    ),
    ...(isDev ?
        [
            {
                label: "Developer",
                submenu: [
                    { role: 'reload' },
                    { role: 'forcereload' },
                    { type: 'separator' },
                    { role: 'toggledevtools' },
                ]
            }
        ]
        : [])
];
app.on('ready', () => {
    createMainWindow();

    const mainMenu = Menu.buildFromTemplate(menu);
    Menu.setApplicationMenu(mainMenu);
    // globalShortcut.register('CmdOrCtrl+R', () => mainWindow.reload());
    mainWindow.on('ready', () => mainWindow == null);
});



app.on('window-all-closed', () => {
    if (!isMac) {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) { createMainWindow(); }
});

//events from fronteend

ipcMain.on('image:resize', (e, options) => {
    console.log(e);
    console.log(options.dist);

    console.log(options.quality);
});

