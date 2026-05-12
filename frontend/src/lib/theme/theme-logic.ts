export type ThemeMode = "light" | "dark"

type UiFn = (action: string, value?: string) => string

interface ThemeEnvironment {
  ui: UiFn
  storage: Pick<Storage, "getItem" | "setItem">
  bodyClassList: DOMTokenList
}

function asThemeMode(value: string | null | undefined): ThemeMode | null {
  if (value === "light" || value === "dark") {
    return value
  }

  return null
}

function setBodyTheme(bodyClassList: DOMTokenList, mode: ThemeMode) {
  bodyClassList.remove("light", "dark")
  bodyClassList.add(mode)
}

export function nextThemeMode(currentMode: ThemeMode): ThemeMode {
  return currentMode === "dark" ? "light" : "dark"
}

export function initializeTheme(env: ThemeEnvironment): ThemeMode {
  const savedMode = asThemeMode(env.storage.getItem("mode"))

  if (savedMode) {
    env.ui("mode", savedMode)
    setBodyTheme(env.bodyClassList, savedMode)
    return savedMode
  }

  env.ui("mode", "auto")
  const uiMode = asThemeMode(env.ui("mode")) ?? "dark"
  setBodyTheme(env.bodyClassList, uiMode)
  return uiMode
}

export function toggleTheme(env: ThemeEnvironment, currentMode: ThemeMode): ThemeMode {
  const mode = nextThemeMode(currentMode)

  env.ui("mode", mode)
  setBodyTheme(env.bodyClassList, mode)
  env.storage.setItem("mode", mode)

  return mode
}
