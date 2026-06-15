export function RightSidebar() {
  return (
    <aside className="hidden lg:flex flex-col w-80 sticky top-0 h-screen overflow-y-auto p-4 gap-4">
      <div className="bg-muted/50 rounded-xl p-4">
        <h2 className="font-bold text-xl mb-4">Sponsored (Iklan)</h2>
        <div className="aspect-video bg-muted rounded-lg mb-2"></div>
        <p className="text-sm text-muted-foreground">Ad description goes here...</p>
      </div>

      <div className="bg-muted/50 rounded-xl p-4">
        <h2 className="font-bold text-xl mb-4">What's happening</h2>
        <div className="flex flex-col gap-4">
          <div>
            <p className="text-xs text-muted-foreground">Trending in Indonesia</p>
            <p className="font-bold">React Next.js</p>
            <p className="text-xs text-muted-foreground">10.5K posts</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Trending in Indonesia</p>
            <p className="font-bold">Tailwind CSS</p>
            <p className="text-xs text-muted-foreground">5,234 posts</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
