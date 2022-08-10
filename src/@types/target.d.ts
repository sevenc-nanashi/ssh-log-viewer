interface Target {
  id: string
  name: string
  host: string
  port: string | null
  username: string | null
  // authMethod: "password" | "key"
  // password: string
  keyPath: string | null
  logType: "systemd" | "docker" | "docker_compose" | "file" | "custom"
  // -- systemd
  serviceName: string
  isUser: boolean
  // -- docker
  containerName: string
  // -- docker_compose
  composePath: string
  useOldCompose: boolean
  // -- file
  logPath: string
  // -- custom
  command: string
}

interface TargetCardData extends Target {
  isUpdated: boolean
}

interface TargetBase {
  id: string
}

interface TargetValidationProgress {
  id: string
  step: "connect" | "log" | "done"
  status: "progress" | "success" | "failure"
  message: string
}
