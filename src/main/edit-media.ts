import { ipcMain } from 'electron';
// eslint-disable-next-line import/no-absolute-path
const addon = require("/Users/demon/Desktop/code/electron-addon/build/Debug/editMedia.node");

async function editMedia (event: any, params: any) {
  return addon.editMedia(params);
}

export function bindHandle () {
  ipcMain.handle('editMedia', editMedia)
}