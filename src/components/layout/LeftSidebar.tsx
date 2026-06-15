import Link from "next/link";
import { Home, Search, Bell, Mail, User } from "lucide-react";

export function LeftSidebar() {
  return (
    <aside className="hidden sm:flex flex-col w-20 xl:w-64 sticky top-0 h-screen overflow-y-auto p-4">
      <Link href="/" className="flex items-center gap-4 p-3 w-fit rounded-full hover:bg-accent transition">
        <span className="font-bold text-xl xl:block hidden">MediaApp</span>
        <span className="font-bold text-xl xl:hidden block">M</span>
      </Link>
      
      <nav className="mt-4 flex flex-col gap-2">
        <Link href="/" className="flex items-center gap-4 p-3 w-fit rounded-full hover:bg-accent transition">
          <Home className="w-6 h-6" />
          <span className="text-xl hidden xl:block">Home</span>
        </Link>
        <Link href="/explore" className="flex items-center gap-4 p-3 w-fit rounded-full hover:bg-accent transition">
          <Search className="w-6 h-6" />
          <span className="text-xl hidden xl:block">Explore</span>
        </Link>
        <Link href="/notifications" className="flex items-center gap-4 p-3 w-fit rounded-full hover:bg-accent transition">
          <Bell className="w-6 h-6" />
          <span className="text-xl hidden xl:block">Notifications</span>
        </Link>
        <Link href="/messages" className="flex items-center gap-4 p-3 w-fit rounded-full hover:bg-accent transition">
          <Mail className="w-6 h-6" />
          <span className="text-xl hidden xl:block">Messages</span>
        </Link>
        <Link href="/profile" className="flex items-center gap-4 p-3 w-fit rounded-full hover:bg-accent transition">
          <User className="w-6 h-6" />
          <span className="text-xl hidden xl:block">Profile</span>
        </Link>
      </nav>
    </aside>
  );
}
