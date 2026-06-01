export interface GoogleUserProfile {
  googleId: string
  email: string
  name: string | null
  emailVerified: boolean
}

export interface GoogleLoginBody {
  idToken?: string
  locale?: string
}
