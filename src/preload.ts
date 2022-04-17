import { contextBridge, ipcRenderer } from "electron"
import { ElectronApi } from "./@types/ipc"
import { LogUpdate } from "./@types/log"

contextBridge.exposeInMainWorld("electron", {
  targets: {
    list: async () => await ipcRenderer.invoke("targets:list"),
    startValidation: (target: Target) =>
      ipcRenderer.invoke("targets:startValidation", target),
    startLogging: (target: Target) =>
      ipcRenderer.invoke("targets:startLogging", target),
    delete: (id: string) => ipcRenderer.invoke("targets:delete", id),
    register: (target: Target) =>
      ipcRenderer.invoke("targets:register", target),
    getLog: (id: string) => ipcRenderer.invoke("targets:getLog", id),
    stopLogging: (id: string) => ipcRenderer.invoke("targets:stopLogging", id),
    updateTarget: (target: Target) =>
      ipcRenderer.invoke("targets:updateTarget", target),
    updateOrder: (target: Target[]) =>
      ipcRenderer.invoke("targets:updateOrder", target),

    onValidationUpdated: (
      callback: (target: TargetValidationProgress) => void
    ) => {
      ipcRenderer.on(
        "targets:onValidationUpdated",
        (event, target: TargetValidationProgress) => callback(target)
      )
      return () => ipcRenderer.removeAllListeners("targets:onValidationUpdated")
    },
    onLogUpdated: (callback: (data: LogUpdate) => void) => {
      ipcRenderer.on("targets:onLogUpdated", (event, data: LogUpdate) =>
        callback(data)
      )
      return () => ipcRenderer.removeAllListeners("targets:onLogUpdated")
    },
  },
  sessions: {
    getActive: async () => await ipcRenderer.invoke("sessions:getActive"),
  },
} as ElectronApi)
