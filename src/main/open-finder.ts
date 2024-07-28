import { shell, ipcMain } from 'electron';

function openFinder (event: any, filePath: string) {
  const res = shell.showItemInFolder(filePath);
  return res;
}

export function bindHandle() {
  ipcMain.handle('openFinder', openFinder)
}