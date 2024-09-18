const { app, BrowserWindow, shell } = require('electron');
const { config } = require('./config');
var path = require('path')
const contextMenu = require('electron-context-menu');

const appUrl = 'https://web.whatsapp.com'

/**
 * @type {BrowserWindow}
 */
let window = null;

/**
 * @param {Electron.HandlerDetails} details 
 * @returns {action: 'deny'}
 */
function onNewWindow(details) {
  shell.openExternal(details.url);
	return { action: 'deny' };
}

const createWindow = () => {
  window = new BrowserWindow({
    icon: path.join(__dirname, 'assets/icons/64x64.png'),
	autoHideMenuBar: true
  })
  window.loadURL(appUrl, { userAgent: config.userAgent });

  window.webContents.setWindowOpenHandler(onNewWindow);

  window.once('ready-to-show', () => {
    window.maximize()
  })
}

contextMenu({
	showSaveImageAs: true
});

const appLock = app.requestSingleInstanceLock();

const protocolClient = 'whatsapp';
if (!app.isDefaultProtocolClient(protocolClient, process.execPath)) {
	app.setAsDefaultProtocolClient(protocolClient, process.execPath);
}

if (!appLock) {
	app.quit();
} else {
  app.on('second-instance', onAppSecondInstance);
  app.on('ready', onAppReady);
}
async function onAppReady() {
	createWindow();
};

function processArgs(args) {
	var regHttps = /^https:\/\/web\.whatsapp\.com\/.*/g;
	var regWapp = /^whatsapp:\/.*/g;
	for (const arg of args) {
		if (regHttps.test(arg)) {
			return arg;
		}
		if (regWapp.test(arg)) {
			return appUrl + arg.substring(10, arg.length);
		}
	}
}

function onAppSecondInstance(event, args) {
	console.debug('second-instance started');
	if (window) {
		event.preventDefault();
		const url = processArgs(args);
		if (url) {
			allowFurtherRequests = false;
			setTimeout(() => { allowFurtherRequests = true; }, 5000);
			window.loadURL(url, { userAgent: config.chromeUserAgent });
		}

    window.focus();
  }
};

