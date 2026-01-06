const { app, BrowserWindow, session } = require('electron');
const path = require('path');
const serve = require('electron-serve');

const appServe = app.isPackaged ? serve({ directory: path.join(__dirname, '../out') }) : null;

const createWindow = () => {
    const win = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js'),
        },
    });

    // Enable SharedArrayBuffer by enforcing COOP/COEP headers
    session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
        callback({
            responseHeaders: {
                ...details.responseHeaders,
                'Cross-Origin-Opener-Policy': 'same-origin',
                'Cross-Origin-Embedder-Policy': 'require-corp',
            },
        });
    });

    if (app.isPackaged) {
        appServe(win).then(() => {
            win.loadURL('app://-');
        });
    } else {
        win.loadURL('http://localhost:3000');
        // win.webContents.openDevTools();
        win.webContents.on('did-fail-load', (e, code, desc) => {
            console.log("Clean refresh attempt");
            win.webContents.reloadIgnoringCache();
        });
    }
};

app.on('ready', () => {
    createWindow();
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});
