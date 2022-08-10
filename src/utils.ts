import { ChildProcess, spawn } from "child_process"

export function getCommand(target: Target, lines: number) {
  switch (target.logType) {
    case "systemd":
      return `journalctl -f -n ${lines} -u ${JSON.stringify(
        target.serviceName
      )}${target.isUser ? " --user" : ""}`
    case "docker":
      return `docker logs -n ${lines} -f ${JSON.stringify(
        target.containerName
      )}`
    case "docker_compose":
      return `cd ${target.composePath} && ${
        target.useOldCompose ? "docker-compose" : "docker compose"
      } logs -f --tail ${lines}`
    case "file":
      return `tail -f ${JSON.stringify(target.logPath)} -n ${lines}`
    case "custom":
      return target.command
    default:
      throw new Error(`Unknown logType: ${target.logType}`)
  }
}

export function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export function spawnSsh(target: Target, logLines: number) {
  const connectArgs = ["-o StrictHostKeyChecking=no", "-t", "-t"]
  if (target.port) {
    connectArgs.push(`-p${target.port}`)
  }
  if (target.username) {
    connectArgs.push(`-l${target.username}`)
  }
  if (target.keyPath) {
    connectArgs.push(`-i${target.keyPath}`)
  }
  const logCommand = getCommand(target, logLines)
  const command = `echo -e "\\e[92m== Successfully connected to target.\\e[m" && echo -e "\\e[94m==> ${JSON.stringify(
    logCommand
  ).replace(/^"|"$/g, "")}\\e[m" && ${logCommand}\n`
  const b64command = Buffer.from(command).toString("base64")
  const args = [
    target.host,
    ...connectArgs,
    `/usr/bin/env bash -c 'base64 -d <<< "${b64command}" | bash'`,
  ]
  return spawn("ssh", args)
}

export function getProcessCommand(process: ChildProcess) {
  const args = process.spawnargs
  const processName = args.shift()
  return `${processName} ${args
    .map((arg: string) => JSON.stringify(arg))
    .join(" ")}`
}
