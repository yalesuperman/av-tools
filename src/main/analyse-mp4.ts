import { ipcMain } from 'electron';
// eslint-disable-next-line import/no-absolute-path
const addon = require("/Users/demon/Desktop/code/electron-addon/build/Debug/analyseMp4.node");

async function analyseMp4 (event: any, filePath: string) {
  console.log('filepath: ', filePath, event);
  return addon.analyseMp4(filePath);
}

export function bindHandle () {
  ipcMain.handle('analyseMp4', analyseMp4)
}