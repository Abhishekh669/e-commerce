import { usePathname, useSearchParams } from "next/navigation"

export function useRedirectPath() {
     const pathname = usePathname()
    const searchParams = useSearchParams()

    const callbackFromParam = searchParams.get("callback")

    if (pathname === "/login" || pathname === "/register") {
        return callbackFromParam || "/"
    }

    return pathname
}

