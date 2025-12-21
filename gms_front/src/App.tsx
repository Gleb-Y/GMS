import { useState, useEffect } from 'react';
import api from './components/api';
import { HomePage } from './components/HomePage';
import LoginPage from './components/LoginPage';
import { AdminDashboard } from './components/AdminDashboard';
import { MemberDashboard } from './components/MemberDashboard';
import type { UserRewards } from './components/RewardsSection';
import type { ProgressData } from './components/ProgressTracking';
import { Toaster } from './components/ui/sonner';

export type User = {
    id: string;
    email: string;
    name: string;
    role: 'admin' | 'member';
    membership?: {
        plan: string;
        startDate: string;
        endDate: string;
    };
    rewards?: UserRewards;
    progressData?: ProgressData;
};


export default function App() {
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [showLogin, setShowLogin] = useState(false);
    const [loading, setLoading] = useState(true);

    // Проверка токена при запуске
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            api.get<User>('/users/me')
                .then(res => {
                    setCurrentUser(res.data);
                })
                .catch(() => {
                    localStorage.removeItem('token');
                    setCurrentUser(null);
                })
                .then(() => setLoading(false));
        } else {
            setLoading(false);
        }
    }, []);

    const handleLogin = (user: User) => {
        setCurrentUser(user);
        setShowLogin(false);
    };

    const handleLogout = () => {
        setCurrentUser(null);
        setShowLogin(false);
        localStorage.removeItem('token');
    };

    if (loading) {
        return <div className="flex items-center justify-center min-h-screen text-white">Загрузка...</div>;
    }
    return (
        <>
            {showLogin ? (
                <LoginPage
                    onLogin={handleLogin}
                    onBack={() => setShowLogin(false)}
                />
            ) : currentUser ? (
                currentUser.role === 'admin' ? (
                    <AdminDashboard user={currentUser} onLogout={handleLogout} />
                ) : (
                    <MemberDashboard user={currentUser} onLogout={handleLogout} />
                )
            ) : (
                <HomePage onLoginClick={() => setShowLogin(true)} />
            )}
            <Toaster />
        </>
    );
}