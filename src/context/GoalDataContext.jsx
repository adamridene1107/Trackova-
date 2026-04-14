import { createContext, useContext } from "react"
import { useSupabaseData } from "../hooks/useSupabaseData"

const GoalDataContext = createContext(null)

export function GoalDataProvider({ userId, children }) {
  const goalData = useSupabaseData(userId)
  return <GoalDataContext.Provider value={goalData}>{children}</GoalDataContext.Provider>
}

export function useGoalData() {
  const ctx = useContext(GoalDataContext)
  if (!ctx) {
    throw new Error("useGoalData must be used inside a GoalDataProvider")
  }
  return ctx
}
