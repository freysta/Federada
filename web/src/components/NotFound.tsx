export default function NotFound() {
  return (
    <div className="min-h-screen bg-blue-900 text-white font-mono flex flex-col items-center justify-center p-8 selection:bg-white selection:text-blue-900">
      <div className="max-w-3xl w-full space-y-8">
        <h1 className="text-8xl md:text-9xl mb-4">:(</h1>
        
        <p className="text-xl md:text-2xl">
          Your PC ran into a problem and needs to restart. We're just collecting some error info, and then we'll restart for you.
        </p>
        
        <p className="text-xl md:text-2xl">
           0% complete
        </p>

        <div className="flex flex-col md:flex-row items-start md:items-center gap-8 mt-12 pt-8 border-t border-white/20">
            <div className="w-24 h-24 bg-white p-2">
                {/* QR Code Placeholder */}
                <div className="w-full h-full bg-blue-900/20 grid grid-cols-5 grid-rows-5 gap-1">
                    {Array.from({length: 25}).map((_, i) => (
                        <div key={i} className={`bg-blue-900 ${Math.random() > 0.5 ? 'opacity-100' : 'opacity-0'}`}></div>
                    ))}
                </div>
            </div>
            
            <div className="space-y-2 text-sm md:text-base">
                <p>For more information about this issue and possible fixes, visit https://federada.com/stopcode</p>
                <p>If you call a support person, give them this info:</p>
                <p>Stop code: 404_PAGE_NOT_FOUND</p>
            </div>
        </div>

        <div className="fixed bottom-8 left-8 text-xs opacity-50">
            driver_irql_not_less_or_equal (federada.sys)
        </div>
      </div>
    </div>
  );
}
