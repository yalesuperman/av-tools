import { dialog, ipcMain } from 'electron';

async function selectDirector () {
  const { canceled, filePaths } = await dialog.showOpenDialog({
    properties: ['openDirectory']
  });
  if (!canceled) {
    return filePaths[0]
  }
  return canceled
}

export function bindHandle() {
  ipcMain.handle('selectDirector', selectDirector)
}