import { NavLink } from 'react-router-dom';

interface LayoutProps {
    children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
    return (
        <div className="min-h-screen bg-gray-950 text-white flex">
            <aside className="w-56 bg-gray-900 border-r border-gray-800 flex flex-col p-4 fixed h-full">
                <div className="mb-8">
                    <h1 className="text-lg font-bold text-white">YT Dashboard</h1>
                    <p className="text-xs text-gray-500 mt-1">KJModsMinecraft</p>
                </div>
                <nav className="flex flex-col gap-1">
                    <NavLink
                        to="/dashboard"
                        className={({ isActive }) =>
                            `px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                                isActive
                                    ? 'bg-red-600 text-white'
                                    : 'text-gray-400 hover:text-white hover:bg-gray-800'
                            }`
                        }
                    >
                        Dashboard
                    </NavLink>
                    <NavLink
                        to="/videos"
                        className={({ isActive }) =>
                            `px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                                isActive
                                    ? 'bg-red-600 text-white'
                                    : 'text-gray-400 hover:text-white hover:bg-gray-800'
                            }`
                        }
                    >
                        Videos
                    </NavLink>
                    <NavLink
                        to="/insights"
                        className={({ isActive }) =>
                            `px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                                isActive
                                    ? 'bg-red-600 text-white'
                                    : 'text-gray-400 hover:text-white hover:bg-gray-800'
                            }`
                        }
                    >
                        Insights
                    </NavLink>
                </nav>
                <div className="mt-auto">

                    <a
                    href="http://localhost:3001/api/auth/logout"
                    className="px-3 py-2 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-gray-800 transition-colors block"
                    >
                    Sign out
                    </a>
                </div>
            </aside>
            <main className="ml-56 flex-1 p-8">
                {children}
            </main>
        </div>
    );
}