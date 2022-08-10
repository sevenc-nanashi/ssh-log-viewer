import Store from "electron-store"

export function migrateStore(store: Store<StoreContent>) {
  if (store.get("version", 0) < 1) {
    if (store.has("targets")) {
      store.set(
        "targets",
        store.get("targets").map((t) => ({ ...t, useOldCompose: false }))
      )
    } else {
      store.set("targets", [])
    }
    store.set("version", 1)
  }
}

export interface StoreContent {
  targets: Target[]
  version: number
}
