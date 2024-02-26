const { app, BrowserWindow, shell, nativeImage } = require('electron');
const { config } = require('./config');
var path = require('path')

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
  const window = new BrowserWindow({
    autoHideMenuBar: true,
    icon: path.join(__dirname, 'assets/icons/64x64.png')
  })
  window.loadURL(appUrl, { userAgent: config.userAgent })

	window.webContents.setWindowOpenHandler(onNewWindow);

}

app.whenReady().then(() => {
  app.setAsDefaultProtocolClient('whatsapp')
  createWindow()
})