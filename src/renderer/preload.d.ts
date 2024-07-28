import { ElectronHandler } from '../main/preload';

declare global {
  // eslint-disable-next-line no-unused-vars
  interface Window {
    electron: ElectronHandler;
    ffmpeg: {
      analyseMp4: (filePath: string) => any;
      editMedia: (params: any) => any;
      selectDirector: () => any,
      openFinder: (filePath: string) => any
    }
  }
}

export {};
