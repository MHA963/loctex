const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const http = require('http');
const { spawn } = require('child_process');

let mainWindow = null;
let serverProcess = null;

const PORT = process.env.PORT || 4173;
const HOST = '127.0.0.1';

// Setup data directory: in dev, directly reuse workspace loctex_data so all browser projects are available
const isDev = !app.isPackaged;
const workspaceDataDir = path.resolve(__dirname, '..', 'loctex_data');
let loctexDataDir;

if (isDev) {
  // In development, directly read and write to the existing workspace loctex_data
  loctexDataDir = process.env.LOCTEX_DATA_DIR || workspaceDataDir;
} else {
  // In packaged installer (.exe), write to %APPDATA%/LocTex/loctex_data
  const userDataDir = app.getPath('userData');
  loctexDataDir = process.env.LOCTEX_DATA_DIR || path.join(userDataDir, 'loctex_data');

  // Automatic one-time migration: if appData has no db yet but workspace data exists, copy it over
  if (
    !fs.existsSync(path.join(loctexDataDir, 'loctex.db')) &&
    fs.existsSync(path.join(workspaceDataDir, 'loctex.db'))
  ) {
    try {
      fs.cpSync(workspaceDataDir, loctexDataDir, { recursive: true });
      console.log('⚡ Migrated existing projects from browser workspace to desktop AppData.');
    } catch (e) {
      console.warn('Migration warning:', e.message);
    }
  }
}

if (!fs.existsSync(loctexDataDir)) {
  fs.mkdirSync(loctexDataDir, { recursive: true });
}

process.env.LOCTEX_DATA_DIR = loctexDataDir;
process.env.PORT = String(PORT);
process.env.HOST = HOST;

/**
 * Poll server until /api/health responds with HTTP 200
 */
function waitForServer(retries = 30, delayMs = 300) {
  return new Promise((resolve, reject) => {
    let attempts = 0;
    const check = () => {
      attempts++;
      const req = http.get(`http://${HOST}:${PORT}/api/health`, (res) => {
        if (res.statusCode === 200) {
          resolve(true);
        } else if (attempts < retries) {
          setTimeout(check, delayMs);
        } else {
          reject(new Error(`Server health check failed with status ${res.statusCode}`));
        }
      });

      req.on('error', () => {
        if (attempts < retries) {
          setTimeout(check, delayMs);
        } else {
          reject(new Error('Server failed to start within timeout limit.'));
        }
      });
      req.end();
    };
    check();
  });
}

/**
 * Start the backend server process
 */
function startBackendServer() {
  const isDev = !app.isPackaged;
  const projectRoot = isDev ? path.resolve(__dirname, '..') : process.resourcesPath;

  const serverEnv = {
    ...process.env,
    LOCTEX_DATA_DIR: loctexDataDir,
    PORT: String(PORT),
    HOST,
    NODE_ENV: isDev ? 'development' : 'production',
  };

  const compiledServer = path.join(projectRoot, 'dist-server', 'index.mjs');

  if (fs.existsSync(compiledServer)) {
    // Launch compiled Node server without shell splitting or loader path bugs
    serverProcess = spawn('node', [compiledServer], {
      cwd: projectRoot,
      env: serverEnv,
      stdio: 'inherit',
      shell: false,
    });
  } else {
    // Direct tsx CLI fallback
    const tsxCli = path.join(projectRoot, 'node_modules', 'tsx', 'dist', 'cli.mjs');
    if (fs.existsSync(tsxCli)) {
      serverProcess = spawn('node', [tsxCli, 'server/index.ts'], {
        cwd: projectRoot,
        env: serverEnv,
        stdio: 'inherit',
        shell: false,
      });
    } else {
      serverProcess = spawn(
        process.platform === 'win32' ? 'npx.cmd' : 'npx',
        ['tsx', 'server/index.ts'],
        {
          cwd: projectRoot,
          env: serverEnv,
          stdio: 'inherit',
          shell: true,
        }
      );
    }
  }

  if (serverProcess) {
    serverProcess.on('error', (err) => {
      console.error('Failed to spawn backend server process:', err);
    });
  }
}

/**
 * Create frameless Electron window
 */
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1440,
    height: 920,
    minWidth: 1024,
    minHeight: 680,
    frame: false,
    titleBarStyle: 'hidden',
    backgroundColor: '#0e0d0b',
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
    icon: path.join(__dirname, '..', 'public', 'favicon.ico'),
    show: false,
  });

  const appUrl = !app.isPackaged && process.env.VITE_DEV_SERVER_URL
    ? process.env.VITE_DEV_SERVER_URL
    : `http://${HOST}:${PORT}`;

  mainWindow.webContents.on('did-fail-load', () => {
    setTimeout(() => {
      if (mainWindow) mainWindow.loadURL(appUrl);
    }, 500);
  });

  mainWindow.loadURL(appUrl);

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// IPC Window Controls
ipcMain.handle('window:minimize', () => {
  if (mainWindow) mainWindow.minimize();
});

ipcMain.handle('window:maximize', () => {
  if (mainWindow) {
    if (mainWindow.isMaximized()) {
      mainWindow.unmaximize();
    } else {
      mainWindow.maximize();
    }
  }
});

ipcMain.handle('window:close', () => {
  if (mainWindow) mainWindow.close();
});

ipcMain.handle('window:isMaximized', () => {
  return mainWindow ? mainWindow.isMaximized() : false;
});

ipcMain.handle('app:getDataDir', () => {
  return loctexDataDir;
});

// App Lifecycle
app.whenReady().then(async () => {
  startBackendServer();
  try {
    await waitForServer();
  } catch (err) {
    console.warn('Backend server readiness wait notice:', err.message);
  }
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('will-quit', () => {
  if (serverProcess) {
    try {
      if (process.platform === 'win32') {
        spawn('taskkill', ['/pid', String(serverProcess.pid), '/f', '/t']);
      } else {
        serverProcess.kill('SIGTERM');
      }
    } catch (_) {
      // Ignore cleanup error
    }
  }
});
