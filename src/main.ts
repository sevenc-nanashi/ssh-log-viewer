import path from "path"
import {
  BrowserWindow,
  app,
  ipcMain,
  IpcMainInvokeEvent,
  shell,
} from "electron"
import Store from "electron-store"
import { getCommand, getProcessCommand, sleep, spawnSsh } from "./utils"
import "@colors/colors"

const store = new Store()
const activeSessions = new Set<string>()
const activeSessionResolvers = new Map<string, () => void>()
const logs = new Map<string, string>()

if (process.env.NODE_ENV === "development") {
  const execPath =
    process.platform === "win32"
      ? "../node_modules/electron/dist/electron.exe"
      : "../node_modules/.bin/electron"

  // eslint-disable-next-line @typescript-eslint/no-var-requires
  require("electron-reload")(__dirname, {
    electron: path.resolve(__dirname, execPath),
  })
}

const createWindow = () => {
  const mainWindow = new BrowserWindow({
    webPreferences: {
      preload: path.resolve(__dirname, "preload.js"),
    },
    icon: path.resolve(__dirname, "../asset/icon_window.png"),
  })
  mainWindow.removeMenu()
  if (process.env.NODE_ENV === "development") {
    mainWindow.webContents.openDevTools()
  }
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url)
    return { action: "deny" }
  })

  // レンダラープロセスをロード
  mainWindow.loadFile("dist/index.html")

  ipcMain.handle("targets:list", (_event: IpcMainInvokeEvent): Target[] => {
    if (!store.has("targets")) {
      store.set("targets", [])
    }
    return store.get("targets") as Target[]
  })

  ipcMain.handle(
    "targets:register",
    (_event: IpcMainInvokeEvent, target: Target): void => {
      store.set("targets", [...(store.get("targets") as Target[]), target])
    }
  )

  ipcMain.handle(
    "targets:startValidation",
    async (_event: IpcMainInvokeEvent, target: Target): Promise<void> => {
      let buffer = ""
      let nonceResolve: () => void
      let isNonceReceived = false
      const nonceReceived = new Promise<void>((resolve) => {
        nonceResolve = resolve
      })
      const logReceived = new Promise<void>((resolve) => {
        nonceReceived.then(() => {
          sleep(5000).then(() => {
            resolve()
          })
        })
      })
      console.log("startValidation", target)
      mainWindow.webContents.send("targets:onValidationUpdated", {
        id: target.id,
        status: "progress",
        step: "connect",
        message: `== Connecting to ${target.host}:${target.port}...\n`
          .brightMagenta,
      } as TargetValidationProgress)
      const ssh = spawnSsh(target, 10)
      mainWindow.webContents.send("targets:onValidationUpdated", {
        id: target.id,
        status: "progress",
        step: "connect",
        message: `==> ${getProcessCommand(ssh)}\n`.brightBlue,
      } as TargetValidationProgress)
      const processData = (data: string) => {
        buffer += data.toString()
        if (
          !isNonceReceived &&
          buffer.includes(`Successfully connected to target`)
        ) {
          isNonceReceived = true
          nonceResolve()
        }
        const bufferLines = buffer.split("\n")

        bufferLines.splice(0, bufferLines.length - 1).forEach((line) => {
          if (line.length > 0) {
            mainWindow.webContents.send("targets:onValidationUpdated", {
              id: target.id,
              status: "progress",
              step: "connect",
              message: line + "\n",
            } as TargetValidationProgress)
          }
        })
        buffer = bufferLines[0]
      }
      ssh.stdout.on("data", processData)
      ssh.stderr.on("data", processData)
      await Promise.race([
        new Promise((resolve) => {
          ssh.once("exit", resolve)
        }),
        logReceived,
      ])
      if (ssh.exitCode) {
        // Error
        if (ssh.exitCode === 255) {
          // Error: Connection refused
          mainWindow.webContents.send("targets:onValidationUpdated", {
            id: target.id,
            status: "failure",
            step: "connect",
            message:
              `== Failed to connect to ${target.host}:${target.port} with code ${ssh.exitCode}\n`
                .brightRed,
          } as TargetValidationProgress)
        } else {
          // Logging error
          mainWindow.webContents.send("targets:onValidationUpdated", {
            id: target.id,
            status: "failure",
            step: "log",
            message: `== Getting log failed with command ${getCommand(
              target,
              10
            )} with exit code ${ssh.exitCode}`.brightRed,
          } as TargetValidationProgress)
        }
      } else {
        ssh.kill()
        mainWindow.webContents.send("targets:onValidationUpdated", {
          id: target.id,
          status: "success",
          step: "done",
          message: `== Successfully tested ${target.host}:${target.port}`
            .brightGreen,
        } as TargetValidationProgress)
      }
    }
  )

  ipcMain.handle(
    "targets:getLog",
    (_event: IpcMainInvokeEvent, target: string): string => {
      return logs.get(target) || ""
    }
  )

  ipcMain.handle(
    "targets:stopLogging",
    (_event: IpcMainInvokeEvent, target: string): void => {
      activeSessionResolvers.get(target)?.()
    }
  )

  ipcMain.handle(
    "targets:updateOrder",
    (_event: IpcMainInvokeEvent, targets: Target[]): void => {
      store.set("targets", targets)
    }
  )

  ipcMain.handle(
    "targets:updateTarget",
    (_event: IpcMainInvokeEvent, target: Target): void => {
      store.set(
        "targets",
        (store.get("targets") as Target[]).map((t) =>
          t.id === target.id ? target : t
        )
      )
    }
  )

  ipcMain.handle(
    "targets:startLogging",
    async (_event: IpcMainInvokeEvent, target: Target): Promise<void> => {
      if (activeSessions.has(target.id)) {
        return
      }
      activeSessions.add(target.id)
      logs.set(target.id, "")
      console.log("startLogging", target)
      mainWindow.webContents.send("targets:onLogUpdated", {
        id: target.id,
        message: `== Connecting to ${target.host}:${target.port}...\n`
          .brightMagenta,
      })
      const ssh = spawnSsh(target, 10)
      mainWindow.webContents.send("targets:onLogUpdated", {
        id: target.id,
        message: `==> ${getProcessCommand(ssh)}\n`.brightCyan,
      })
      const processData = (data: string) => {
        logs.set(target.id, logs.get(target.id) + data.toString())
        if (logs.get(target.id)!.split("\n").length > 100) {
          const log = logs.get(target.id)!
          const logLines = log.split("\n")
          logs.set(target.id, logLines.slice(logLines.length - 100).join("\n"))
        }
        mainWindow.webContents.send("targets:onLogUpdated", {
          id: target.id,
          message: data.toString(),
        })
      }
      ssh.stdout.on("data", processData)
      ssh.stderr.on("data", processData)
      // if (target.authMethod === "password") {
      //   ssh.stdin.write(`${target.password}\n`)
      // }
      await new Promise<void>((resolve): void => {
        activeSessionResolvers.set(target.id, resolve)
        ssh.once("exit", resolve)
      })
      activeSessions.delete(target.id)
      if (ssh.exitCode != null) {
        mainWindow.webContents.send("targets:onLogUpdated", {
          id: target.id,
          message: `== Process finished with exit code ${ssh.exitCode}\n`
            .brightRed,
        })
      } else {
        ssh.kill()
        mainWindow.webContents.send("targets:onLogUpdated", {
          id: target.id,
          message: `== Process was killed by user.\n`.red,
        })
      }
    }
  )

  ipcMain.handle(
    "targets:delete",
    (_event: IpcMainInvokeEvent, id: string): void => {
      store.set(
        "targets",
        (store.get("targets") as Target[]).filter((target) => target.id !== id)
      )
    }
  )

  ipcMain.handle(
    "sessions:getActive",
    (_event: IpcMainInvokeEvent): string[] => {
      return Array.from(activeSessions)
    }
  )
}

// アプリの起動イベント発火で上の関数を実行
app.whenReady().then(createWindow)

// すべてのウィンドウが閉じられたらアプリを終了する
app.once("window-all-closed", () => app.quit())
