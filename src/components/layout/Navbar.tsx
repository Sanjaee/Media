import Link from "next/link"
import { auth } from "@/auth"
import { SignInButton } from "@/components/auth/SignInButton"
import { UserDropdown } from "@/components/auth/UserDropdown"

export async function Navbar() {
  const session = await auth()

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-14 items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center space-x-2">
            <span className="font-bold sm:inline-block">MediaApp</span>
          </Link>
        </div>
        <div className="flex items-center gap-4">
          {session?.user ? (
            <UserDropdown user={session.user} />
          ) : (
            <SignInButton />
          )}
        </div>
      </div>
    </header>
  )
}
