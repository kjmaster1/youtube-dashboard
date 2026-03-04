export default function LoginPage() {
    const apiBase = import.meta.env.VITE_API_URL ?? 'http://localhost:3001';

    return (
        <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
            <div className="text-center">
                <h1 className="text-4xl font-bold mb-4">YouTube Dashboard</h1>
                <a
                    href={`${apiBase}/api/auth/login`}
                    className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                >
                    Sign in with Google
                </a>
            </div>
        </div>
    );
}