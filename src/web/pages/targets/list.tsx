import React, { useEffect, useState } from "react"
import { Link, useNavigate } from "react-router-dom"

import Icon from "@mdi/react"
import { mdiGithub } from "@mdi/js"

import {
  DeleteRegular,
  EditRegular,
  AddFilled,
  PlugConnectedRegular,
  PlugConnectedFilled,
  ListFilled,
  ArrowLeftFilled,
  ArrowRightFilled,
  DeleteFilled,
  DismissFilled,
} from "@fluentui/react-icons"
import Card from "../../components/card"
import { APP_NAME } from "../../../constants"
import { Popup } from "../../../@types/popup"

interface LoadingTargetListState {
  isLoading: true
}
interface LoadedTargetListState {
  isLoading: false
  targets: TargetCardData[]
  sessions: string[]
}

type TargetListState = LoadingTargetListState | LoadedTargetListState

const TargetList: React.FC<{
  setPopup: (popup: Popup) => void
}> = ({ setPopup }) => {
  const navigate = useNavigate()
  const [state, setState] = useState({
    isLoading: true,
  } as TargetListState)

  useEffect(() => {
    document.title = APP_NAME + " - Targets"
    const fetchTargets = async () => {
      const targets = await window.electron.targets.list()
      const sessions = await window.electron.sessions.getActive()
      setState({
        isLoading: false,
        sessions,
        targets: targets.map((target) => ({
          ...target,
          isUpdated: false,
        })),
      })
    }
    fetchTargets()
  }, [])

  let content: JSX.Element
  if (state.isLoading) {
    // Loading
    content = (
      <div className="flex flex-row flex-wrap animate-pulse">
        {[...Array(6)].map((_, i) => (
          <Card key={i} background={"bg-blue-50 dark:bg-blue-950"}>
            <div className="flex-row justify-between relative mb-8 opacity-0">
              <div className="">dummy</div>
              <div className="opacity-50 text-xs">dummy</div>
            </div>
            <div className="button-primary opacity-50 p-2 relative self-end text-white text-center cursor-pointer">
              <PlugConnectedFilled className="inline-block opacity-0" />
            </div>
          </Card>
        ))}
      </div>
    )
  } else if (state.targets.length === 0) {
    // No targets
    content = (
      <div className="flex flex-col text-xl">
        No targets found.
        <br />
        <Link className="text-blue-500 underline" to="/targets/new">
          Add a new target
        </Link>
      </div>
    )
  } else {
    // Target exists

    const moveTarget = (offset: number) => {
      return (event: React.MouseEvent<SVGElement>) => {
        const index = state.targets.findIndex(
          (target) =>
            target.id ===
            event.currentTarget.parentElement!.parentElement!.parentElement!.getAttribute(
              "data-id"
            )!
        )
        if (index + offset < 0 || index + offset >= state.targets.length) {
          return
        }
        const targets = [...state.targets]
        const newTarget = targets.splice(index, 1)[0]
        newTarget.isUpdated = true
        targets.splice(index + offset, 0, newTarget)
        setState({
          ...state,
          targets,
        })
        window.electron.targets.updateOrder(targets)
        setTimeout(() => {
          setState({
            ...state,
            targets: targets.map((target) => ({
              ...target,
              isUpdated: false,
            })),
          })
        }, 500)
      }
    }
    content = (
      <div className="flex flex-row flex-wrap">
        {state.targets.map((target: TargetCardData, index: number) => {
          const isUpdated = target.isUpdated
          target.isUpdated = false
          return (
            <Card
              key={target.id}
              background={`${
                isUpdated ? "card-updated" : "bg-blue-100 dark:bg-blue-900"
              }`}
              data-id={target.id}
            >
              <div className="flex-row justify-between relative mb-8">
                <div className="">{target.name}</div>
                <div className="opacity-50 text-xs">{target.id}</div>
              </div>
              <div className="w-24 h-6 absolute right-2 top-2 cursor-pointer">
                <ArrowLeftFilled
                  className={`inline-block ${
                    index === 0
                      ? "opacity-50 cursor-not-allowed"
                      : "hover:text-blue-800 dark:hover:text-blue-200"
                  }`}
                  width={24}
                  onClick={moveTarget(-1)}
                />
                <ArrowRightFilled
                  className={`inline-block ${
                    index === state.targets.length - 1
                      ? "opacity-50 cursor-not-allowed"
                      : "hover:text-blue-800 dark:hover:text-blue-200"
                  }`}
                  width={24}
                  onClick={moveTarget(1)}
                />
                <EditRegular
                  className="inline-block hover:text-blue-800 dark:hover:text-blue-200"
                  width={24}
                  onClick={() => {
                    navigate(`/targets/edit`, { state: { target } })
                  }}
                />
                <DeleteRegular
                  className="inline-block hover:text-red-800 dark:hover:text-red-200"
                  width={24}
                  onClick={() => {
                    setPopup({
                      isShown: true,
                      title: `Deleting ${target.name}`,
                      message: `Are you sure you want to delete the target "${target.name}"?  This action cannot be undone.`,
                      buttons: [
                        {
                          text: (
                            <>
                              <DeleteFilled className="inline-block" /> Delete
                            </>
                          ),
                          className: "button-danger text-white",
                          callback: () => {
                            window.electron.targets.delete(target.id)
                            setState({
                              ...state,
                              targets: state.targets.filter(
                                (t) => t.id !== target.id
                              ),
                            })
                          },
                        },
                        {
                          text: (
                            <>
                              <DismissFilled className="inline-block" /> Cancel
                            </>
                          ),
                          className: "button-secondary text-white",
                        },
                      ],
                    })
                  }}
                />
                {/* <MoreHorizontalFilled width={24} height={24} /> */}
                {/* <div className="absolute right-0 top-0">
                  <div
                    className={`${
                      showMore.includes(index) ? "" : "hidden"
                    } absolute top-0 right-0 bg-white dark:bg-gray-700 rounded p-2 shadow-md text-md w-20`}
                  >
                    <div>
                      <EditRegular className="inline-block" /> Edit
                    </div>
                    <div>
                      <DeleteRegular className="inline-block" /> Delete
                    </div>
                  </div>
                </div> */}
              </div>
              <div
                className="button-primary p-2 relative self-end text-white text-center cursor-pointer"
                onClick={() => {
                  navigate("/targets/view", { state: { target } })
                }}
              >
                {state.sessions.includes(target.id) ? (
                  <>
                    <PlugConnectedFilled className="inline-block" /> View
                  </>
                ) : (
                  <>
                    <PlugConnectedRegular className="inline-block" /> Connect
                  </>
                )}
              </div>
            </Card>
          )
        })}
        <Card background="bg-blue-100 dark:bg-blue-900">
          <div className="flex-row justify-between relative mb-8">
            <div className="">Add New Target</div>
            <div className="opacity-0 text-xs">|</div>
          </div>
          <Link to={"/targets/new"} className="">
            <div className="button-primary-outlined border-2 p-2 py-[6px] relative self-end text-center">
              <AddFilled className="inline-block" /> Add
            </div>
          </Link>
        </Card>
      </div>
    )
  }
  return (
    <>
      <h1 className="title">
        <ListFilled className="inline-block" /> Targets
      </h1>
      <div className="flex flex-col mt-4">{content}</div>
      <div className="w-full flex justify-center border-t-2 pt-4 border-slate-200 text-slate-500">
        <div className="text-center">
          SSH Log Viewer - v{VERSION}
          <br />
          <a
            href="https://github.com/sevenc-nanashi/ssh-log-viewer"
            target="_blank"
          >
            <Icon path={mdiGithub} size={1} className="inline" />{" "}
            <span className="underline">sevenc-nanashi/ssh-log-viewer</span>
          </a>
        </div>
      </div>
    </>
  )
}

export default TargetList
