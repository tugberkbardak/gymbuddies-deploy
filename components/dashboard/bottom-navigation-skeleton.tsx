export function BottomNavigationSkeleton() {
    return (
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-t border-gray-800/60">
        <div className="flex justify-around items-center h-14">
          {/* Five navigation items */}
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex flex-col items-center justify-center w-full h-full">
              <div className="h-5 w-5 bg-gray-700 rounded-sm opacity-50" />
            </div>
          ))}
        </div>
      </div>
    )
  }
  
  