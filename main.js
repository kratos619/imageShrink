const { app, BrowserWindow, Menu, ipcMain, shell } = require('electron');
const path = require('path');
const os = require('os');

const imagemin = require('imagemin');
const slash = require('slash');
const imageminmozjpeg = require('imagemin-mozjpeg');
const imageminPngquant = require('imagemin-pngquant');

//set env
process.env.NODE_ENV = 'production';

const isDev = process.env.NODE_ENV !== 'production' ? true : false;
const isMac = process.platform !== 'darwin' ? false : true;


let mainWindow;
let aboutWindow;
function createMainWindow() {
    mainWindow = new BrowserWindow({
        title: 'ImageShrink',
        width: isDev ? 900 : 500,
        height: 600,
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
    options.dist = path.join(os.homedir(), 'imageshrink');
    makeImageResize(options);
});


async function makeImageResize({ dist, imgPath, quality }) {
    try {
        let pngquality = quality / 100;
        const file = await imagemin([slash(imgPath)], {
            destination: dist,
            plugins: [
                imageminmozjpeg({
                    quality
                }),
                imageminPngquant({
                    quality: [pngquality, pngquality]
                })
            ]
        });
        shell.openExternal(dist);
        mainWindow.webContents.send('image:resize');
    } catch (error) {
        mainWindow.webContents.send('image:resizeError');
    }
}