import React, { useEffect } from "react"
import { Link } from "react-router-dom"
import { useNavigate, useLocation } from "react-router"
import { generate as generateUUID } from "short-uuid"
import {
  AddFilled,
  TagFilled,
  ServerFilled,
  UsbPlugFilled,
  PersonFilled,
  KeyFilled,
  // Password24Filled,
  DocumentOnePageRegular,
  DocumentOnePageFilled,
  AppsFilled,
  AppFolderFilled,
  AppGenericFilled,
  CodeFilled,
  DismissFilled,
  CheckmarkFilled,
  EditFilled,
} from "@fluentui/react-icons"
import { APP_NAME } from "../../../constants"

const NewTarget: React.FC<{ edit: boolean }> = ({ edit: isEdit }) => {
  const navigate = useNavigate()
  const location = useLocation()

  function showOptions(
    className: string,
    classPrefix: string,
    value: string
  ): void {
    ;[...document.querySelectorAll(`.${classPrefix}${value}`)].forEach((e) => {
      e.classList.remove("hidden")
    })
    ;[
      ...document.querySelectorAll(
        `.${className}:not(.${classPrefix}${value})`
      ),
    ].forEach((e) => {
      e.classList.add("hidden")
    })
  }
  useEffect(() => {
    document.title = APP_NAME + " - New Target"
    if (location.state) {
      const { target } = location.state as { target: Target | undefined }
      if (target) {
        for (const [key, value] of Object.entries(target)) {
          const element = document.querySelector(
            `[name="${key}"]`
          ) as HTMLInputElement | null
          if (element) {
            element.value = value
          }
        }
        showOptions("log-option", "show-log-", target.logType)
      }
    }
  })
  return (
    <form
      className="flex flex-col w-full min-h-full"
      onSubmit={(event: React.FormEvent<HTMLFormElement>) => {
        const visibleFields = [
          ...document.querySelectorAll<HTMLInputElement>(
            ".form-element:not(.hidden) input, .form-element:not(.hidden) select"
          ),
        ]
        let canSubmit = true
        const payload = { id: generateUUID() } as {
          [key: string]: string | null
        }
        visibleFields.forEach((e: HTMLInputElement) => {
          if (e.value.length === 0) {
            if (e.parentElement?.classList.contains("optional")) {
              payload[e.name] = null
            } else {
              e.classList.add("error")
              canSubmit = false
            }
          } else {
            payload[e.name] = e.value
            e.classList.remove("error")
          }
        })
        if (canSubmit) {
          if (isEdit) {
            window.electron.targets.updateTarget({
              // @ts-expect-error this is a valid target
              ...(payload as Target),
              id: (location.state as { target: Target }).target.id,
            })
            navigate("/targets")
          } else {
            navigate("/targets/validate", { state: { target: payload } })
          }
        } else {
          document.getElementById("error-message")?.classList.remove("hidden")
          event.preventDefault()
        }
      }}
    >
      <h1 className="title">
        {isEdit ? (
          <>
            <EditFilled className="inline-block" /> Edit
          </>
        ) : (
          <>
            <AddFilled className="inline-block" /> New
          </>
        )}{" "}
        Target
      </h1>
      <div className="flex flex-col w-full  pb-4">
        <div className="form-element">
          <h2 className="text-xl text-blue-500">
            <TagFilled className="inline-block" /> Name
          </h2>
          <p>
            The name of the target. This will be shown in the list of targets.
          </p>
          <input name="name" className="input" placeholder="My Website" />
        </div>
        <div className="form-element">
          <h2 className="text-xl text-blue-500">
            <ServerFilled className="inline-block" /> Host
          </h2>
          <p>The host of the target.</p>
          <input
            name="host"
            className="input font-mono"
            placeholder="127.0.0.1"
          />
        </div>
        <div className="form-element optional">
          <h2 className="text-xl text-blue-500">
            <UsbPlugFilled className="inline-block" /> Port (Optional)
          </h2>
          <p>The port of the target.</p>
          <input
            name="port"
            className="input font-mono"
            placeholder="22"
            defaultValue="22"
          />
        </div>
        <div className="form-element optional">
          <h2 className="text-xl text-blue-500">
            <PersonFilled className="inline-block" /> Username (Optional)
          </h2>
          <p>The name of the user to authenticate with.</p>
          <input
            name="username"
            className="input font-mono"
            placeholder="ubuntu"
          />
        </div>
        {/* <div className="form-element">
          <h2 className="text-xl text-blue-500">
            <KeyRegular className="inline-block" /> Authentication
          </h2>
          <p>The authentication method to use for the target.</p>
          <select
            className="input"
            name="authType"
            onChange={(event) => {
              ;[
                ...document.querySelectorAll(
                  `.show-auth-${event.target.value}`
                ),
              ].forEach((e) => {
                e.classList.remove("hidden")
              })
              ;[
                ...document.querySelectorAll(
                  `.auth-option:not(.show-auth-${event.target.value})`
                ),
              ].forEach((e) => {
                e.classList.add("hidden")
              })
            }}
            defaultValue="password"
          >
            <option value="password">Password</option>
            <option value="publickey">Public Key</option>
          </select>
        </div>
        <div className="form-element auth-option show-auth-password">
          <h2 className="text-xl text-blue-500">
            <Password24Filled className="inline-block" /> Password
          </h2>
          <p>The password to use for authentication.</p>
          <input
            name="password"
            className="input font-mono"
            placeholder="1337IsC00l"
          />
        </div> */}
        <div className="form-element auth-option optional">
          <h2 className="text-xl text-blue-500">
            <KeyFilled className="inline-block" /> Key Path (Optional)
          </h2>
          <p>The path to the public key to use for authentication.</p>
          <input
            name="keyPath"
            className="input font-mono"
            placeholder="~/.ssh/id_rsa"
          />
        </div>
        <div className="form-element">
          <h2 className="text-xl text-blue-500">
            <DocumentOnePageRegular className="inline-block" /> Log type
          </h2>
          <p>The log type to use for the target.</p>
          <select
            className="input"
            name="logType"
            onChange={(event) => {
              showOptions("log-option", "show-log-", event.target.value)
            }}
            defaultValue="systemd"
          >
            <option value="systemd">systemd (journalctl)</option>
            <option value="docker">Docker</option>
            <option value="docker_compose">Docker Compose</option>
            <option value="file">File</option>
            <option value="custom">Custom</option>
          </select>
        </div>
        <div className="form-element log-option show-log-systemd">
          <h2 className="text-xl text-blue-500">
            <AppGenericFilled className="inline-block" /> Service name
          </h2>
          <p>The service name of the target.</p>
          <input
            name="serviceName"
            type="text"
            className="input font-mono"
            placeholder="sshd"
          />
        </div>
        <div className="form-element log-option show-log-docker hidden">
          <h2 className="text-xl text-blue-500">
            <AppsFilled className="inline-block" /> Container name
          </h2>
          <p>The container name of the target.</p>
          <input
            name="containerName"
            className="input font-mono"
            placeholder="my-nginx"
          />
        </div>
        <div className="form-element log-option show-log-docker_compose hidden">
          <h2 className="text-xl text-blue-500">
            <AppFolderFilled className="inline-block" /> Project path
          </h2>
          <p>The path to the docker-compose project. Must be absolute.</p>
          <input
            name="composePath"
            className="input font-mono"
            placeholder="/home/ubuntu/my_web_service"
          />
        </div>
        <div className="form-element log-option show-log-file hidden">
          <h2 className="text-xl text-blue-500">
            <DocumentOnePageFilled className="inline-block" /> File path
          </h2>
          <p>The path to the log file. Must be absolute.</p>
          <input
            name="logPath"
            className="input font-mono"
            placeholder="/var/log/nginx/access.log"
          />
        </div>
        <div className="form-element log-option show-log-custom hidden">
          <h2 className="text-xl text-blue-500">
            <CodeFilled className="inline-block" /> Command
          </h2>
          <p>The command to run to get the logs.</p>
          <input
            name="command"
            className="input font-mono"
            placeholder="journalctl -u nginx -f"
          />
        </div>
        <div className="flex flex-row justify-end mt-4">
          <p className="hidden text-red-500 mt-2" id="error-message">
            Please fill out all fields.
          </p>
          <button
            className="button-primary text-white rounded p-2 px-4 mx-4"
            type="submit"
          >
            {isEdit ? (
              <>
                <CheckmarkFilled className="inline-block" /> Done
              </>
            ) : (
              <>
                <AddFilled className="inline-block" /> Add
              </>
            )}
          </button>
          <Link to="/">
            <button className="button-secondary rounded p-2 px-4">
              <DismissFilled className="inline-block" /> Cancel
            </button>
          </Link>
        </div>
      </div>
    </form>
  )
}

export default NewTarget
