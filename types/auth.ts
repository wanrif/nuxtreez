export interface IUser {
  id: string
  email: string
  name: string
  phone?: string
  location?: string
  website?: string
  bio?: string
  role: {
    id: string
    name: string
  } | null
}

export interface Token {
  accessToken: string
  refreshToken: string
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterCredentials {
  name: string
  email: string
  password: string
  confirmPassword: string
}

export interface ChangePasswordCredentials {
  oldPassword: string
  newPassword: string
  confirmNewPassword: string
}

export interface UpdateProfileCredentials {
  id?: string
  name: string
  email: string
  phone?: string
  location?: string
  website?: string
  bio?: string
}
