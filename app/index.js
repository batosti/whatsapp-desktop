const { app, BrowserWindow } = require('electron');
const { config } = require('./config');

const createWindow = () => {
  const win = new BrowserWindow()

  win.loadURL('https://web.whatsapp.com', { userAgent: config.userAgent })
}

app.whenReady().then(() => {
  app.setAsDefaultProtocolClient('whatsapp')
  createWindow()
})