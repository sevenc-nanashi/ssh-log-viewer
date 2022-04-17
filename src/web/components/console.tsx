import React from "react"
import { ansiColorToTailwind } from "../../constants"

const Console: React.FC<{ message: string }> = ({ message }) => {
  const currentAnsi = ["", ""]
  return (
    <div
      id="console"
      className="w-full overflow-x-hidden flex-shrink rounded font-mono bg-gray-50 dark:bg-gray-900 my-2 p-1 px-2 overflow-y-scroll break-all text-sm"
    >
      {message.split("\n").map((line, lineIndex) => (
        <>
          {line.split(/(?=\x1b\[)/).map((part, partIndex) => {
            const ansi = part.match(/^\x1b\[([0-9;]*)([^;0-9\x1b])/)
            if (ansi) {
              if (ansi[2] === "m") {
                if (ansi[1] === "" || ansi[1] === "0") {
                  currentAnsi[0] = ""
                  currentAnsi[1] = ""
                } else {
                  for (const singleAnsi of ansi[1].split(";")) {
                    const colorType = singleAnsi.substring(
                      0,
                      singleAnsi.length - 1
                    )
                    if (colorType === "3" || colorType === "9") {
                      currentAnsi[0] = ansiColorToTailwind[singleAnsi]
                    } else if (colorType === "4" || colorType === "10") {
                      currentAnsi[1] = ansiColorToTailwind[singleAnsi]
                    }
                  }
                }
              }
            }
            part = part.replace(/^\x1b\[[0-9;]*[^;0-9\x1b]/, "")
            return (
              <span
                key={`${lineIndex}-${partIndex}-${currentAnsi.join("-")}`}
                className={`${currentAnsi.join(" ")}`}
              >
                {part}
              </span>
            )
          })}
          <br key={`${lineIndex}-br-${currentAnsi.join("-")}`} />
        </>
      ))}
    </div>
  )
}

export default Console
