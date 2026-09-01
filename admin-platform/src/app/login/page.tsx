import { Suspense } from "react";
import { LoginForm } from "@/components/login-form";
export default function LoginPage(){return <Suspense fallback={<div className="grid min-h-screen place-items-center text-sm">Loading sign in…</div>}><LoginForm/></Suspense>}
