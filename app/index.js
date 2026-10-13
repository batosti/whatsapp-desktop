import { app, BrowserWindow, session, shell } from 'electron';
import contextMenu from 'electron-context-menu';
import path from 'node:path';
import { config } from './config/index.js';

const appUrl = 'https://web.whatsapp.com';
const appOrigin = new URL(appUrl).origin;

// Permissions WhatsApp Web needs: microphone/camera for voice notes and calls,
// notifications, clipboard, fullscreen video, output device selection, and
// storage/sync for the session. Everything else (geolocation, USB, HID, ...) is denied.
const allowedPermissions = new Set([
	'media',
	'notifications',
	'clipboard-read',
	'clipboard-sanitized-write',
	'fullscreen',
	'speaker-selection',
	'persistent-storage',
	'background-sync',
	'screen-wake-lock',
]);

/**
 * @type {BrowserWindow}
 */
let window = null;

function isAppUrl(url) {
	try {
		return new URL(url).origin === appOrigin;
	} catch {
		return false;
	}
}

function openExternal(url) {
	try {
		const { protocol } = new URL(url);
		if (['https:', 'http:', 'mailto:'].includes(protocol)) {
			shell.openExternal(url);
		}
	} catch {
		// ignore malformed URLs
	}
}

/**
 * @param {Electron.HandlerDetails} details
 * @returns {{action: 'deny'}}
 */
function onNewWindow(details) {
	openExternal(details.url);
	return { action: 'deny' };
}

function onWillNavigate(event) {
	// will-redirect also fires for subframes (e.g. embedded YouTube); only police the main frame
	if (event.isMainFrame && !isAppUrl(event.url)) {
		event.preventDefault();
		openExternal(event.url);
	}
}

function isPermissionAllowed(permission, origin) {
	return allowedPermissions.has(permission) && isAppUrl(origin);
}

function setupPermissions() {
	session.defaultSession.setPermissionRequestHandler((webContents, permission, callback, details) => {
		callback(isPermissionAllowed(permission, details.requestingUrl));
	});
	session.defaultSession.setPermissionCheckHandler((webContents, permission, requestingOrigin) => {
		return isPermissionAllowed(permission, requestingOrigin);
	});
}

const createWindow = (url) => {
	window = new BrowserWindow({
		icon: path.join(import.meta.dirname, 'assets/icons/64x64.png'),
		autoHideMenuBar: true,
		webPreferences: {
			contextIsolation: true,
			nodeIntegration: false,
			sandbox: true,
		},
	});
	window.loadURL(url, { userAgent: config.userAgent });

	window.webContents.setWindowOpenHandler(onNewWindow);
	window.webContents.on('will-navigate', onWillNavigate);
	window.webContents.on('will-redirect', onWillNavigate);

	window.once('ready-to-show', () => {
		window.maximize();
	});
};

contextMenu({
	showSaveImageAs: true,
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
	app.whenReady().then(onAppReady);
}

function onAppReady() {
	setupPermissions();
	createWindow(processArgs(process.argv) ?? appUrl);
}

/**
 * Maps a web.whatsapp.com or whatsapp:// link from the command line to a URL
 * on web.whatsapp.com. Anything that would resolve to another origin is ignored.
 */
function processArgs(args) {
	for (const arg of args) {
		let url;
		if (arg.startsWith('https://')) {
			url = arg;
		} else if (arg.startsWith('whatsapp://')) {
			url = appUrl + arg.substring('whatsapp:/'.length);
		}
		if (url && isAppUrl(url)) {
			return url;
		}
	}
}

function onAppSecondInstance(event, args) {
	console.debug('second-instance started');
	if (window) {
		const url = processArgs(args);
		if (url) {
			window.loadURL(url, { userAgent: config.userAgent });
		}

		if (window.isMinimized()) {
			window.restore();
		}
		window.focus();
	}
}
