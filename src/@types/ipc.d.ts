import { LogUpdate } from "./log"

declare global {
  interface Window {
    electron: ElectronApi
  }
}
export interface ElectronApi {
  targets: {
    list: () => Promise<Target[]>
    startValidation: (target: Target) => void
    startLogging: (target: Target) => void
    delete: (id: string) => void
    register: (target: Target) => void
    getLog: (id: string) => Promise<string>
    stopLogging: (id: string) => void
    updateTarget: (target: Target) => void
    updateOrder: (targets: Target[]) => void

    onValidationUpdated: (
      callback: (target: TargetValidationProgress) => void
    ) => () => void
    onLogUpdated: (callback: (data: LogUpdate) => void) => () => void
  }
  sessions: {
    getActive: () => Promise<string[]>
  }
}
