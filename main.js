const { app, BrowserWindow, Tray, Menu } = require('electron');
const path = require('node:path');
const fs = require('node:fs');
const iconPath = path.join(__dirname, 'assets', 'icon.png');

if (!fs.existsSync(iconPath)) {
  console.error('Arquivo de ícone não encontrado:', iconPath);
}

let mainWindow;
let tray;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 320,
    height: 275,
    frame: false,
    autoHideMenuBar: true,
    resizable: false,
    transparent: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });
  
  mainWindow.loadFile('index.html');

  mainWindow.on('blur', () => {
    mainWindow.hide();
  });

  mainWindow.on('close', (event) => {
    event.preventDefault();
    mainWindow.hide();
  });
}

function createTray() {
  try {
    tray = new Tray(iconPath);

    const contextMenu = Menu.buildFromTemplate([
      {
        label: 'Show',
        click: () => {
          if (!mainWindow) {
            createWindow();
          } else {
            mainWindow.show();
          }
        },
      },
      {
        label: 'Exit',
        click: () => {
          app.quit();
        },
      },
    ]);

    tray.setToolTip('Pomodoro - Athavus');
    tray.setContextMenu(contextMenu);

    tray.on('click', () => {
      if (mainWindow && !mainWindow.isVisible()) {
        mainWindow.show();
      } else {
        mainWindow.hide();
      }
    });
  } catch (error) {
    console.error('Erro ao criar bandeja:', error);
  }
}

app.whenReady().then(() => {
  createTray();
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});