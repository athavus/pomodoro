const { app, BrowserWindow, Tray, Menu, screen, ipcMain } = require('electron');
const path = require('node:path');
const os = require('node:os');

let mainWindow;
let tray;
let isQuitting = false;

function createWindow() {
  const primaryDisplay = screen.getPrimaryDisplay();
  const { width, height } = primaryDisplay.workAreaSize;

  mainWindow = new BrowserWindow({
    width: 380,
    height: 380,
    frame: false,
    autoHideMenuBar: true,
    resizable: false,
    movable: true,
    transparent: true,
    skipTaskbar: false, // Importante para Hyprland
    alwaysOnTop: true,
    type: 'toolbar', // Dica para window managers tratarem como floating
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      devTools: true,
    },
  });

  // Posição inicial no canto superior direito com margem
  const x = width - 400;
  const y = 20;
  
  mainWindow.setPosition(x, y);
  mainWindow.loadFile('index.html');

  // Remover o comportamento de esconder ao perder foco
  // Isso é problemático em window managers tiling
  mainWindow.on('blur', () => {
    // Não faz nada - deixa a janela visível
  });

  mainWindow.on('close', (event) => {
    if (!isQuitting) {
      event.preventDefault();
      mainWindow.hide();
    }
  });

  // Handler para minimizar via IPC (se você quiser adicionar um botão)
  ipcMain.on('minimize-window', () => {
    mainWindow.hide();
  });

  // Handler para fechar via IPC
  ipcMain.on('close-window', () => {
    isQuitting = true;
    app.quit();
  });

  // Handler para alternar always on top
  ipcMain.on('toggle-always-on-top', () => {
    const isOnTop = mainWindow.isAlwaysOnTop();
    mainWindow.setAlwaysOnTop(!isOnTop);
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
    const iconPath = path.join(__dirname, 'assets', 'images', 'icon.png');
    tray = new Tray(iconPath);
    
    const contextMenu = Menu.buildFromTemplate([
      {
        label: 'Mostrar/Ocultar',
        click: () => {
          if (!mainWindow) {
            createWindow();
          } else {
            mainWindow.isVisible() ? mainWindow.hide() : mainWindow.show();
          }
        },
      },
      {
        label: 'Sempre no Topo',
        type: 'checkbox',
        checked: true,
        click: (menuItem) => {
          if (mainWindow) {
            mainWindow.setAlwaysOnTop(menuItem.checked);
          }
        },
      },
      {
        type: 'separator',
      },
      {
        label: 'Sair',
        click: () => {
          isQuitting = true;
          app.quit();
        },
      },
    ]);

    tray.setToolTip('Pomodoro Timer');
    tray.setContextMenu(contextMenu);
    
    tray.on('click', () => {
      if (!mainWindow) {
        createWindow();
      } else {
        mainWindow.isVisible() ? mainWindow.hide() : mainWindow.show();
      }
    });
  } catch (error) {
    console.error('Erro ao criar tray:', error);
  }
}

// Configurações específicas para Linux/Hyprland
if (process.platform === 'linux') {
  app.commandLine.appendSwitch('enable-transparent-visuals');
  app.commandLine.appendSwitch('disable-gpu');
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

app.on('before-quit', () => {
  isQuitting = true;
});
