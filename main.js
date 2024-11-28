const { app, BrowserWindow, Tray, Menu } = require('electron')
const path = require('node:path')
const fs = require('node:fs')

const iconPath = path.join(__dirname, 'assets', 'icon.png');

// Adicione uma verificação de existência do arquivo
if (!fs.existsSync(iconPath)) {
  console.error('Arquivo de ícone não encontrado:', iconPath);
  // Você pode definir um caminho alternativo ou usar um ícone padrão
}

function createWindow() {
  const win = new BrowserWindow({
    width: 320,
    height: 260,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false 
    }
  })
  win.loadFile('index.html')
}

function createTray() {
  try {
    const tray = new Tray(iconPath)
    const contextMenu = Menu.buildFromTemplate([
      { label: 'Abrir', click: createWindow },
      { label: 'Sair', click: () => app.quit() }
    ])
    tray.setToolTip('Pomodoro - Athavus')
    tray.setContextMenu(contextMenu)
    return tray
  } catch (error) {
    console.error('Erro ao criar bandeja:', error);
  }
}

app.whenReady().then(() => {
  createTray()
  createWindow()
  
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})