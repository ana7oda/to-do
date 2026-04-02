import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

const api = {
  hideWindow: () => ipcRenderer.send('hide-window'),
  toggleCollapse: (isCollapsed: boolean) => ipcRenderer.send('toggle-collapse', isCollapsed),
  showNotification: (text: string) => ipcRenderer.send('show-notification', text),
  onNotificationData: (callback: (data: string) => void) => {
    ipcRenderer.on('notification-data', (_, data) => callback(data))
  }
}

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}