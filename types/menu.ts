export interface MenuItem {
  label: string
  icon: string
  to?: string
  subMenu?: {
    label: string
    to: string
    icon: string
  }[]
}

export interface ProfileItem {
  label: string
  icon: string
  to?: string
  action?: () => void
}
