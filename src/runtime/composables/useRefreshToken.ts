import { useCookie, useRuntimeConfig } from '#app'

export const useRefreshToken = () => {
  const { nhost: { cookie: cookieOptions } } = useRuntimeConfig().public
  const cookieName = `${cookieOptions.name}-refresh-token`

  return useCookie(cookieName)
}
