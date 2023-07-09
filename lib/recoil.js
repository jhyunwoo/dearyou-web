import { atom } from "recoil"

const modalState = atom({
  key: "modalState",
  default: "",
})

const isNoti = atom({
  key: "isNoti",
  default: false,
})

export { modalState, isNoti }
