const { app, BrowserWindow, shell } = require('electron');
const { config } = require('./config');

const appUrl = 'https://web.whatsapp.com'

/**
 * @param {Electron.HandlerDetails} details 
 * @returns {action: 'deny'}
 */
function onNewWindow(details) {
  shell.openExternal(details.url);
	return { action: 'deny' };
}

const createWindow = () => {
  const window = new BrowserWindow()
  window.loadURL(appUrl, { userAgent: config.userAgent })

	window.webContents.setWindowOpenHandler(onNewWindow);

}

app.whenReady().then(() => {
  app.setAsDefaultProtocolClient('whatsapp')
  createWindow()
})