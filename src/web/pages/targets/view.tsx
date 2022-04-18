import React, { useEffect, useMemo, useState } from "react"
import { Link } from "react-router-dom"
import { useLocation } from "react-router"
import Console from "../../components/console"
import {
  ArrowCounterclockwiseFilled,
  DismissFilled,
  PlugConnectedFilled,
} from "@fluentui/react-icons"
import { APP_NAME } from "../../../constants"

export default () => {
  const location = useLocation()
  const { target } = location.state as { target: Target }
  const [message, setMessage] = useState("")
  const [autoscroll, setAutoscroll] = useState(true)
  const [restartFlag, setRestartFlag] = useState(0)
  useEffect(() => {
    const consoleElement = document.getElementById("console")!
    const removeListener = window.electron.targets.onLogUpdated(
      ({ id, message }) => {
        if (id !== target.id) {
          return
        }
        setMessage((oldMessages) => `${oldMessages}${message}`)
      }
    )
    document.title = APP_NAME + ` - View: ${target.name}`
    window.electron.targets.startLogging(target)
    ;(async () => {
      const pastLog: string = await window.electron.targets.getLog(target.id)
      setMessage((oldMessages) => {
        const splited = `${pastLog}${oldMessages}`.split("\n")
        splited.splice(0, splited.length - 100)
        return splited.join("\n")
      })
    })()
    consoleElement.addEventListener("scroll", () => {
      setAutoscroll(
        consoleElement.clientHeight +
          consoleElement.scrollTop -
          consoleElement.scrollHeight >=
          -10
      )
    })

    return () => {
      removeListener()
    }
  }, [restartFlag])
  useEffect(() => {
    if (autoscroll) {
      const consoleElement = document.getElementById("console")!
      consoleElement.scrollTo(0, consoleElement.scrollHeight + 100)
    }
  }, [autoscroll, message])
  const handleCheckboxClick = useMemo(() => {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      setAutoscroll(e.target.checked)
    }
  }, [])
  return (
    <>
      <h1 className="title">
        <PlugConnectedFilled className="inline-block" /> Target: {target.name}
      </h1>
      <div className="flex flex-col w-full h-full relative overflow-y-hidden">
        <Console message={message} />
        <div className="flex flex-row justify-end">
          <p className="mt-2 mr-2" id="autoscroll">
            <label htmlFor="autoscroll-checkbox" className="cursor-pointer">
              <input
                type="checkbox"
                id="autoscroll-checkbox"
                className="cursor-pointer"
                onChange={handleCheckboxClick}
                checked={autoscroll}
              />{" "}
              Autoscroll
            </label>
          </p>
          <button
            className="button-secondary-outlined p-2 mr-4 px-4"
            onClick={async () => {
              window.electron.targets.stopLogging(target.id)
              setRestartFlag((oldRestartFlag) => oldRestartFlag + 1)
            }}
          >
            <ArrowCounterclockwiseFilled className="inline-block" /> Restart
          </button>
          <Link to="/">
            <button className="button-secondary rounded p-2 px-4">
              <DismissFilled className="inline-block" /> Back
            </button>
          </Link>
        </div>
      </div>
    </>
  )
}
