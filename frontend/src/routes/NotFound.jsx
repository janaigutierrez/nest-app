import { Link } from 'react-router-dom'

const NotFound = () => {
    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
            <div className="text-center max-w-md">
                <div className="text-8xl mb-4">🏠</div>
                <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
                <h2 className="text-2xl font-semibold text-gray-700 mb-4">Quest Not Found</h2>
                <p className="text-gray-600 mb-8">
                    This page seems to have wandered off on its own adventure.
                </p>
                <Link
                    to="/"
                    className="inline-block bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                >
                    🏠 Return Home
                </Link>
            </div>
        </div>
    )
}

export default NotFound