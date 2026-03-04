import {Navigate, Route, Routes} from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import VideosPage from './pages/VideosPage';
import InsightsPage from './pages/InsightsPage';
import ShowcasePage from './pages/ShowcasePage';

function App() {
    return (
        <Routes>
            <Route path="/" element={<LoginPage/>}/>
            <Route path="/dashboard" element={<DashboardPage/>}/>
            <Route path="/videos" element={<VideosPage/>}/>
            <Route path="/insights" element={<InsightsPage/>}/>
            <Route path="/showcase" element={<ShowcasePage/>}/>
            <Route path="*" element={<Navigate to="/" replace/>}/>
        </Routes>
    )
}

export default App;