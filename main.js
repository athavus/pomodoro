const { app, BrowserWindow, Tray, Menu, screen } = require('electron');
const path = require('node:path');
const fs = require('node:fs');
const iconPath = path.join(__dirname, 'assets', 'icon.png');

if (!fs.existsSync(iconPath)) {
  console.error('Arquivo de ícone não encontrado:', iconPath);
}

let mainWindow;
let tray;

function createWindow() {
  const trayBounds = tray.getBounds();
  const screenWidth = screen.getPrimaryDisplay();

  mainWindow = new BrowserWindow({
    width: 320,
    height: 275,
    frame: false,
    autoHideMenuBar: true,
    resizable: false,
    movable: true,
    transparent: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  const x = screenWidth.size.width - 550

  const y = trayBounds.y < 100 
  ? screenWidth.size.height - (screenWidth.size.height - 50)
  : screenWidth.size.height - 50;

  mainWindow.setPosition(x, y);

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

    tray.setToolTip('pomodoro');
    tray.setContextMenu(contextMenu);

    tray.on('click', () => {
      mainWindow.isVisible() ? mainWindow.hide() : mainWindow.show();
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