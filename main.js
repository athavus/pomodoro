// main.js
const { app, BrowserWindow, Tray, Menu } = require('electron')
const path = require('node:path')

function createWindow () {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true
    }
  })

  win.loadFile('src/index.html')
}

function createTray() {
  const tray = new Tray(path.join(__dirname, 'assets/icon.png'))
  const contextMenu = Menu.buildFromTemplate([
    { label: 'Abrir', click: createWindow },
    { label: 'Sair', click: app.quit }
  ])
  tray.setToolTip('Pomodoro - Athavus')
  tray.setContextMenu(contextMenu)
}

app.whenReady().then(() => {
  createTray()
  
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