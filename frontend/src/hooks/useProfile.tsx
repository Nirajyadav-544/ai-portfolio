import { createContext, ReactNode, useContext } from "react";
import { api } from "../services/api";
import type { Profile } from "../types";
import { useAsync } from "./useAsync";

const Ctx = createContext<Profile | null>(null);

export function ProfileProvider({ children }: { children: ReactNode }) {
  const { data } = useAsync(() => api.profile(), []);
  return <Ctx.Provider value={data}>{children}</Ctx.Provider>;
}

/** Returns null until loaded (or if the API is unreachable). */
export const useProfile = () => useContext(Ctx);
