import Link from "next/link";
import { Home, TrendingUp, Newspaper, Mail, User } from "lucide-react";
import { auth } from "@/auth";

export async function LeftSidebar() {
  const session = await auth();

  return (
    <aside className="hidden sm:flex flex-col w-20 xl:w-64 sticky top-16 h-[calc(100vh-64px)] overflow-y-auto p-4"> 
      <nav className="flex flex-col gap-2">
        <Link href="/" className="flex items-center gap-4 p-3 w-fit rounded-full hover:bg-accent transition">
          <Home className="w-6 h-6" />
          <span className="text-xl hidden xl:block">Home</span>
        </Link>
        <Link href="/explore" className="flex items-center gap-4 p-3 w-fit rounded-full hover:bg-accent transition">
          <TrendingUp className="w-6 h-6" />
          <span className="text-xl hidden xl:block">Trending</span>
        </Link>
        <Link href="/notifications" className="flex items-center gap-4 p-3 w-fit rounded-full hover:bg-accent transition">
          <Newspaper className="w-6 h-6" />
          <span className="text-xl hidden xl:block">News</span>
        </Link>
        <Link href="/messages" className="flex items-center gap-4 p-3 w-fit rounded-full hover:bg-accent transition">
          <Mail className="w-6 h-6" />
          <span className="text-xl hidden xl:block">Messages</span>
        </Link>
        <Link href={`/${(session?.user as any)?.username || 'profile'}`} className="flex items-center gap-4 p-3 w-fit rounded-full hover:bg-accent transition">
          <User className="w-6 h-6" />
          <span className="text-xl hidden xl:block">Profile</span>
        </Link>
      </nav>
    </aside>
  );
}
