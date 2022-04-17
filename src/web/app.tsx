import React, { useState } from "react"
import { createRoot } from "react-dom/client"
import { Route, Routes } from "react-router"
import { HashRouter } from "react-router-dom"
import { Popup } from "../@types/popup"
import { APP_NAME } from "../constants"

import Targets from "./pages/targets/list"
import NewTarget from "./pages/targets/new"
import Validate from "./pages/targets/validate"
import View from "./pages/targets/view"

import "./styles.css"

const App = (): JSX.Element => {
  const [popup, setPopup] = useState<Popup>({ isShown: false })
  return (
    <>
      <div className="flex flex-col h-screen w-screen p-4 overflow-x-hidden">
        <HashRouter>
          <Routes>
            <Route
              path="/"
              element={<Targets key="target-root" setPopup={setPopup} />}
            />
            <Route
              path="/targets"
              element={<Targets key="target-root" setPopup={setPopup} />}
            />
            <Route path="/targets/new" element={<NewTarget edit={false} />} />
            <Route path="/targets/edit" element={<NewTarget edit={true} />} />
            <Route path="/targets/validate" element={<Validate />} />
            <Route path="/targets/view" element={<View />} />
          </Routes>
        </HashRouter>
      </div>
      {popup.isShown && (
        <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center z-10">
          <div className="p-4 w-1/2 min-w-[20rem] bg-white dark:bg-gray-800 rounded-lg shadow-lg z-[20] flex flex-col">
            <div className="text-xl">{popup.title}</div>
            <div className="text-sm">{popup.message}</div>
            <div className="flex flex-col justify-end mt-4">
              {popup.buttons.map((button) => (
                <div
                  className={`mt-4 p-2 w-full cursor-pointer text-center text-lg rounded ${button.className}`}
                  onClick={() => {
                    if (button.callback) {
                      button.callback()
                    }
                    setPopup({ isShown: false })
                  }}
                >
                  {button.text}
                </div>
              ))}
            </div>
          </div>
          <div className="absolute top-0 right-0 w-full h-full z-[11] bg-black opacity-50" />
        </div>
      )}
    </>
  )
}

// const SideBar = (): JSX.Element => {
//   return (
//     <div className="flex flex-col h-full w-12 bg-blue-100">
//       <div>A</div>
//     </div>
//   );
// };

const container = document.getElementById("root")
const root = container && createRoot(container)
document.title = APP_NAME

root?.render(<App />)
