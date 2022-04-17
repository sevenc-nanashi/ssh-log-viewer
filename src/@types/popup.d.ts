interface PopupButton {
  text: string | JSX.Element | JSX.Element[]
  callback?: () => void
  className?: string
}

interface PopupShown {
  isShown: true
  title: string
  message: string
  buttons: PopupButton[]
}

interface PopupHidden {
  isShown: false
}

export type Popup = PopupShown | PopupHidden
