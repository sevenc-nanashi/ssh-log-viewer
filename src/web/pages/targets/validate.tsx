import React, { useEffect, useState } from "react"
import { useLocation, useNavigate } from "react-router"
import Console from "../../components/console"
import {
  ArrowCounterclockwiseFilled,
  CheckmarkFilled,
  DismissFilled,
} from "@fluentui/react-icons"
import { generate as generateUUID } from "short-uuid"
import { APP_NAME } from "../../../constants"

export default () => {
  const location = useLocation()
  const navigate = useNavigate()
  const [target, _setTarget] = useState(
    (location.state as { target: Target }).target
  )
  const [message, setMessage] = useState("")
  const [retryFlag, setRetryFlag] = useState(0)
  useEffect(() => {
    document.title = APP_NAME + " - Check new target"
  }, [])
  useEffect(() => {
    setMessage("")
    const removeListener = window.electron.targets.onValidationUpdated(
      (progress: TargetValidationProgress) => {
        const consoleElement = document.getElementById("console")!
        if (
          consoleElement.clientHeight +
            consoleElement.scrollTop -
            consoleElement.scrollHeight >
          -10
        ) {
          consoleElement.classList.add("scrolled-to-bottom")
        } else {
          consoleElement.classList.remove("scrolled-to-bottom")
        }
        setMessage((oldMessages) => `${oldMessages}${progress.message}`)

        if (progress.status === "success") {
          const finishButton = document.getElementById("finish-button")!
          finishButton.classList.remove("opacity-50")
          finishButton.classList.remove("cursor-not-allowed")
        }
      }
    )
    window.electron.targets.startValidation({
      ...target,
      id: generateUUID(),
    })

    return () => {
      removeListener()
    }
  }, [retryFlag])
  useEffect(() => {
    const consoleElement = document.getElementById("console")!

    if (consoleElement.classList.contains("scrolled-to-bottom")) {
      consoleElement.scrollTop = consoleElement.scrollHeight
    }
  }, [message])
  const finish = async () => {
    const finishButton = document.getElementById("finish-button")!
    if (!finishButton.classList.contains("opacity-50")) {
      window.electron.targets.register(target)
      navigate("/targets")
    }
  }
  return (
    <>
      <h1 className="title">Test Target</h1>
      <div className="flex flex-col w-full h-full relative overflow-y-hidden">
        <Console message={message} />
        <div className="flex flex-row justify-end">
          <button
            id="finish-button"
            className="opacity-50 button-primary p-2 px-4 mx-4 cursor-not-allowed"
            onClick={finish}
          >
            <CheckmarkFilled className="inline-block" /> Finish
          </button>
          <button
            className="button-secondary-outlined p-2 mr-4 px-4"
            onClick={() => {
              setRetryFlag((oldRetryFlag) => oldRetryFlag + 1)
            }}
          >
            <ArrowCounterclockwiseFilled className="inline-block" /> Retry
          </button>
          <button
            className="button-secondary p-2 px-4"
            onClick={() => {
              navigate("/targets/new", { state: { target } })
            }}
          >
            <DismissFilled className="inline-block" /> Cancel
          </button>
        </div>
      </div>
    </>
  )
}
