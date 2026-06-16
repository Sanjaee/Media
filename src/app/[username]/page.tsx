import { getUserProfileByUsername } from "@/actions/user.actions";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Star, Home, Settings, Megaphone, Check } from "lucide-react";
import { getCloudinaryUrl } from "@/lib/utils";

interface PageProps {
  params: {
    username: string;
  };
}

export default async function UserProfilePage({ params }: PageProps) {
  const { username } = await params;
  const user = await getUserProfileByUsername(username);

  if (!user) {
    notFound();
  }

  // Determine VIP or normal status for colors
  const isVip = user.role === "admin" || user.role === "vip";
  const nameColor = isVip ? "text-[#00ff00]" : "text-[#aaaaaa]";
  const borderBadgeColor = isVip ? "border-[#00ff00]" : "border-[#aaaaaa]";
  
  const joinedDate = user.createdAt 
    ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', day: '2-digit', year: 'numeric' })
    : "Unknown";

  return (
    <main className="w-full flex flex-col bg-[#1a1a1a] text-[#cccccc] min-h-screen font-sans text-sm">
      {/* Top Breadcrumb */}
      <div className="flex items-center gap-2 p-3 bg-[#111111] border-b border-[#29557b]/30 text-xs">
        <Home size={14} className="text-[#888]" />
        <Link href="/" className="hover:text-white transition-colors">Home</Link>
        <span className="text-[#555]">&gt;</span>
        <span className="font-semibold text-white">Profile of {user.name}</span>
      </div>

      {/* Profile Header Banner */}
      <div className="w-full bg-[#1e1e1e] border-t-[6px] border-[#29557b] p-4 flex gap-4 mt-4 shadow-sm">
        <div className="shrink-0">
          <div className="w-20 h-20 bg-black rounded overflow-hidden border border-[#333]">
            {user.image ? (
              <Image 
                src={getCloudinaryUrl(user.image, "w_200,h_200,c_fill")} 
                alt={user.name || "User"} 
                width={80} 
                height={80} 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-3xl bg-slate-800 text-white">
                {user.name?.charAt(0).toUpperCase() || "U"}
              </div>
            )}
          </div>
        </div>
        
        <div className="flex flex-col justify-center gap-1">
          <div className="flex items-center gap-1">
            {isVip && <Star size={16} className="text-[#00ff00] fill-[#00ff00]" />}
            <h1 className={`text-xl font-bold ${nameColor}`}>{user.name}</h1>
          </div>
          <div className="text-xs text-white font-medium">
            {user.role === "admin" ? "Administrator" : isVip ? "VIP User" : "Member"}
          </div>
          <div className="text-xs text-[#888] mt-1">
            Status: (Hidden) (Last Visit: Hidden)
          </div>
        </div>
      </div>

      {/* Main 3 Columns */}
      <div className="flex flex-col md:flex-row gap-0 mt-4 border border-[#333] bg-[#1e1e1e] divide-y md:divide-y-0 md:divide-x divide-[#333]">
        
        {/* Column 1: Forum Info */}
        <div className="flex flex-col w-full md:w-[30%]">
          <div className="bg-[#29557b] text-white p-2 text-xs font-semibold">
            {user.name}'s Forum Info
          </div>
          <div className="p-4 flex flex-col gap-5 text-xs">
            <div className={`border w-full py-2 text-center font-bold tracking-widest ${borderBadgeColor} ${nameColor}`}>
              {user.role === "admin" ? "ADMIN" : isVip ? "VIP" : "MEMBER"}
            </div>

            <div>
              <div className="text-[#888] mb-0.5">Joined:</div>
              <div className="text-white">{joinedDate}</div>
            </div>

            <div>
              <div className="text-[#888] mb-0.5">Time Spent Online:</div>
              <div className="text-white">(Hidden)</div>
            </div>

            <div>
              <div className="text-[#888] mb-0.5">User Identifier:</div>
              <div className="text-white flex items-center gap-1">
                {user.id.substring(0, 8)} 
                <button className="text-[#4a90e2] hover:underline whitespace-nowrap ml-1">[Copy Profile Permalink]</button>
              </div>
            </div>
          </div>
        </div>

        {/* Column 2: Forum Statistics */}
        <div className="flex flex-col w-full md:w-[40%]">
          <div className="bg-[#29557b] text-white p-2 text-xs font-semibold">
            {user.name}'s Forum Statistics
          </div>
          <div className="p-4 flex flex-col gap-5 text-xs">
            <div>
              <div className="text-[#888] mb-0.5">Total Threads:</div>
              <div className="text-white">{user.stats.totalThreads} (0 threads per day | 0 percent of total threads)</div>
            </div>

            <div>
              <div className="text-[#888] mb-0.5">Total Posts:</div>
              <div className="text-white">{user.stats.totalPosts} (0 posts per day | 0 percent of total posts)</div>
            </div>

            <div>
              <div className="text-[#888] mb-0.5">Reputation:</div>
              <div className="flex justify-between items-center text-white">
                <span>{user.stats.reputation}</span>
                <button className="flex items-center gap-1 text-[#4a90e2] hover:underline">
                  <Settings size={12} /> Details
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Column 3: Awards */}
        <div className="flex flex-col w-full md:w-[30%]">
          <div className="bg-[#29557b] text-white p-2 text-xs font-semibold">
            {user.name}'s awards.
          </div>
          <div className="p-4 flex flex-col gap-4 text-xs">
            <div className="flex items-center justify-between">
              <Star size={16} className="text-[#00ff00] fill-[#00ff00]" />
              <span className="text-[#888]">{joinedDate}</span>
            </div>
            
            <div className="mt-4 pt-4 border-t border-[#333] text-center text-[#888]">
              No activities found from this user.
            </div>
          </div>
        </div>

      </div>

    </main>
  );
}
