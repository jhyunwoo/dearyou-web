import { createContext, useContext, useEffect, useState } from "react"
import { useRouter } from "next/router"
import pb from "../lib/pocketbase"
import errorTransmission from "@/lib/errorTransmission"
import va from "@vercel/analytics"

const AuthContext = createContext(null)

const AuthWrapper = ({ children }) => {
  const router = useRouter()

  const [user, setUser] = useState(null)
  const [kakaoAuthProvider, setKakaoAuthProvider] = useState(null)

  useEffect(() => {
    const initAuth = async () => {
      try {
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
      } catch (e) {
        errorTransmission(e)
      }
    }

    initAuth()

    async function getUserData() {
      try {
        if (pb.authStore.model) {
          const userData = await pb
            .collection("users")
            .getOne(pb.authStore.model.id)
          setUserData(userData)
        }
      } catch (e) {
        errorTransmission(e)
      }
    }
    getUserData()
  }, [])

  const setUserData = (pbUser) => {
    setUser(pbUser)
  }

  const kakaoSignIn = () => {
    signOut()
    localStorage.setItem("provider", JSON.stringify(kakaoAuthProvider))
    const redirectUrl = `${location.origin}/signin`
    const url = kakaoAuthProvider?.authUrl + redirectUrl
    router.push(url)
    va.track("Signup")
  }

  const signOut = () => {
    setUser(null)
    pb.authStore.clear()
    va.track("Signout")
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
