"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { authApi, ApiError } from "@/lib/curriculum/api";
import type { User } from "@/lib/curriculum/types";
const AuthContext=createContext<{user:User|null;loading:boolean;logout:()=>Promise<void>}>({user:null,loading:true,logout:async()=>{}});export const useAuth=()=>useContext(AuthContext);
export function AuthProvider({children}:{children:React.ReactNode}){const[user,setUser]=useState<User|null>(null);const[loading,setLoading]=useState(true);const router=useRouter();const pathname=usePathname();useEffect(()=>{authApi.me().then(setUser).catch((error)=>{if(error instanceof ApiError&&error.status===401)router.replace(`/login?next=${encodeURIComponent(pathname)}`)}).finally(()=>setLoading(false))},[pathname,router]);const logout=async()=>{await authApi.logout();setUser(null);router.replace("/login")};return <AuthContext.Provider value={{user,loading,logout}}>{children}</AuthContext.Provider>}
