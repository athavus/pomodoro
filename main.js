const { app, BrowserWindow, Tray, Menu, screen } = require('electron');
const path = require('node:path');
const os = require('node:os');

let mainWindow;
let tray;

function createWindow() {
  const trayBounds = tray.getBounds();
  const screenWidth = screen.getPrimaryDisplay();

  mainWindow = new BrowserWindow({
    width: 320,
    height: 300,
    frame: false,
    autoHideMenuBar: true,
    resizable: true,
    movable: true,
    transparent: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  const x = screenWidth.size.width - 550
  let y;

  const os = detectOS();
  
  if (os === "Linux" || os === "macOS") {
    y = trayBounds.y < 100
    ? screenWidth.size.height - (screenWidth.size.height - 50)
    : screenWidth.size.height - 350;
  } else if (os === "Windows") {
    y = trayBounds.y < 0
    ? screenWidth.size.height - (screenWidth.size.height - 50)
    : screenWidth.size.height - 350;
  }

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

function detectOS() {
  const plataforma = os.platform();

  switch(plataforma) {
    case 'win32':
      return 'Windows';
    case 'darwin':
      return 'macOS';
    case 'linux':
      return 'Linux';
    default:
      return 'Sistema Operacional Desconhecido';
  }
}


function createTray() {
  try {
    tray = new Tray(path.join(__dirname, 'assets','images', 'icon.png'));

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