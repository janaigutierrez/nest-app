import { Link } from 'react-router-dom'

function Landing() {
    return (
        <div
            className="min-h-screen flex items-center justify-center relative overflow-hidden"
            style={{
                backgroundImage: `url('https://images.unsplash.com/photo-1578662996442-48f60103fc96?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3')`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat'
            }}
        >
            <div className="absolute inset-0 bg-gradient-to-b from-purple-900/70 via-purple-800/60 to-indigo-900/80"></div>

            <div className="relative z-10 text-center px-4 max-w-lg">
                <div className="mb-8">
                    <img
                        src="/icon.png"
                        alt="Nest Logo"
                        className="w-32 h-32 mx-auto drop-shadow-2xl filter brightness-110 hover:scale-110 transition-all duration-300"
                        style={{
                            filter: 'drop-shadow(0 0 20px rgba(255, 255, 255, 0.3))'
                        }}
                    />
                </div>

                <h1 className="text-6xl font-bold text-white mb-6 drop-shadow-lg">
                    Nest
                </h1>

                <p className="text-white/90 text-lg mb-8 drop-shadow-md">
                    Transform your daily tasks into epic quests
                </p>

                <div className="space-y-4">
                    <Link
                        to="/register"
                        className="block bg-white/95 backdrop-blur-sm text-purple-700 px-8 py-4 rounded-xl font-bold text-lg shadow-2xl hover:shadow-white/25 hover:bg-white transform hover:scale-105 transition-all duration-200 border border-white/20"
                    >
                        ⚔️ Join the Realm
                    </Link>

                    <Link
                        to="/login"
                        className="block bg-purple-700/90 backdrop-blur-sm text-white px-8 py-4 rounded-xl font-bold text-lg shadow-2xl hover:shadow-purple-400/50 hover:bg-purple-600 transform hover:scale-105 transition-all duration-200 border border-purple-400/30"
                    >
                        🏰 Resume Adventure
                    </Link>
                </div>

                <div className="mt-8 text-white/60 text-sm">
                    <div className="flex justify-center space-x-6">
                        <span>🤖 AI Quests</span>
                        <span>⭐ Level Up</span>
                        <span>🎯 Achievements</span>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Landing