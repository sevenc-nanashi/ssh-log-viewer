import React from "react"

const Card: React.FC<{
  children: JSX.Element[] | JSX.Element
  background: string
  [key: string]: unknown
}> = ({ children, background, ...props }) => {
  return (
    <div
      className="flex flex-col text-xl box-border relative mb-2 p-2 w-full sm:w-1/2 lg:w-1/3 xl:w-1/4 2xl:w-1/5"
      {...props}
    >
      <div className={`${background} p-2 relative rounded h-full flex-col`}>
        {children}
      </div>
    </div>
  )
}
export default Card
