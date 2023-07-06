import { createContext, useContext, useEffect, useState } from "react"
import { useRouter } from "next/router"
import pb from "../lib/pocketbase"

const AuthContext = createContext(null)

const AuthWrapper = ({ children }) => {
  const router = useRouter()

  const [user, setUser] = useState(null)
  const [kakaoAuthProvider, setKakaoAuthProvider] = useState(null)

  useEffect(() => {
    const initAuth = async () => {
      const authMethods = await pb
        .collection("users")
        .listAuthMethods()
        .then((methods) => methods)
        .catch((err) => {
          console.error(err)
        })

      if (authMethods)
        for (const provider of authMethods.authProviders) {
          if (provider.name === "kakao") setKakaoAuthProvider(provider)
        }
    }

    initAuth()

    if (pb.authStore.model) setUserData(pb.authStore.model)
  }, [])

  const setUserData = (pbUser) => {
    const { id, name, email, username, studentId, avatarUrl } = pbUser
    setUser({ id, name, email, username, studentId, avatarUrl })
  }

  const kakaoSignIn = () => {
    signOut()
    localStorage.setItem("provider", JSON.stringify(kakaoAuthProvider))
    const redirectUrl = `${location.origin}/signin`
    const url = kakaoAuthProvider?.authUrl + redirectUrl
    router.push(url)
  }

  const signOut = () => {
    setUser(null)
    pb.authStore.clear()
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        setUserData,
        signOut,
        kakaoSignIn,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const usePbAuth = () => useContext(AuthContext)
export default AuthWrapper
