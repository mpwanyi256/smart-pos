/* global __static */
/* eslint-disable import/no-extraneous-dependencies */
import path from 'path';
import { app, protocol, BrowserWindow } from 'electron';
import { createProtocol } from 'vue-cli-plugin-electron-builder/lib';
import installExtension, { VUEJS_DEVTOOLS } from 'electron-devtools-installer';
// import * as electronLog from 'electron-log';
// import { autoUpdater } from 'electron-updater';

// Auto update logs
// autoUpdater.logger = electronLog;
// autoUpdater.logger.transports.file.level = 'info';

/* Update log locations
  - on macOS: ~/Library/Logs/{app name}/{process type}.log
  - on Windows: %USERPROFILE%\AppData\Roaming\{app name}\logs\{process type}.log
*/

const isDevelopment = process.env.NODE_ENV !== 'production';
let win;

// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([
  { scheme: 'app', privileges: { secure: true, standard: true } },
]);

async function createWindow() {
  // Create the browser window.
  win = new BrowserWindow({
    width: 1400,
    height: 800,
    title: 'SmartPOS',
    icon: path.join(__static, 'icon.png'),

    webPreferences: {
      // Use pluginOptions.nodeIntegration, leave this alone
      // eslint-disable-next-line max-len
      // See nklayman.github.io/vue-cli-plugin-electron-builder/guide/security.html#node-integration for more info
      nodeIntegration: process.env.ELECTRON_NODE_INTEGRATION,
      contextIsolation: !process.env.ELECTRON_NODE_INTEGRATION,
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  if (process.env.WEBPACK_DEV_SERVER_URL) {
    // Load the url of the dev server if in development mode
    await win.loadURL(process.env.WEBPACK_DEV_SERVER_URL);
    if (!process.env.IS_TEST) win.webContents.openDevTools();

    // dev-update file
    // autoUpdater.updateConfigPath = path.join(
    //   __dirname,
    //   '../dev-app-update.yml',
    // );
  } else {
    createProtocol('app');
    // Load the index.html when not in development
    win.loadURL('app://./index.html');
  }

  // Auto update
  // try {
  //   autoUpdater.autoDownload = false;
  //   autoUpdater.checkForUpdates();
  // } catch (e) {
  //   console.log('Auto update error', e);
  // }
}

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', async () => {
  if (isDevelopment && !process.env.IS_TEST) {
    // Install Vue Devtools
    try {
      await installExtension(VUEJS_DEVTOOLS);
    } catch (e) {
      console.error('Vue Devtools failed to install:', e.toString());
    }
  }
  createWindow();
});

// Notify user when update is available
// autoUpdater.on('update-available', () => {
//   console.info('“update_available”');
//   win.webContents.send('updater', 'update_available');
// });
// autoUpdater.on('update-not-available', () => {
//   console.info('update_not_available');
//   win.webContents.send('updater', 'update_not_available');
// });

// Exit cleanly on request from parent process in development mode.
if (isDevelopment) {
  if (process.platform === 'win32') {
    process.on('message', (data) => {
      if (data === 'graceful-exit') {
        app.quit();
      }
    });
  } else {
    process.on('SIGTERM', () => {
      app.quit();
    });
  }
}
