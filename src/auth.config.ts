import type { NextAuthConfig } from 'next-auth'

export const authConfig = {
  pages: { signIn: '/login' },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn  = !!auth?.user
      const isLoginPage = nextUrl.pathname.startsWith('/login')
      const isAuthApi   = nextUrl.pathname.startsWith('/api/auth')

      if (isAuthApi) return true
      if (isLoginPage) {
        if (isLoggedIn) return Response.redirect(new URL('/cotizador', nextUrl))
        return true
      }
      return isLoggedIn
    },
  },
  providers: [],
} satisfies NextAuthConfig
