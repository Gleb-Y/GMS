import React, { useState } from 'react';
import type { FormEvent } from 'react';
import api from './api';
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Dumbbell, ArrowLeft } from "lucide-react";
import type { User } from '../App';

interface LoginPageProps {
    onLogin: (user: User) => void;
    onBack: () => void;
}


const LoginPage: React.FC<LoginPageProps> = ({ onLogin, onBack }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const response = await api.post<{ token: string; user: User }>(
                '/users/login',
                { email, password }
            );
            const { token, user } = response.data;
            if (token && user) {
                localStorage.setItem('token', token);
                onLogin(user);
            } else {
                setError('Ошибка: токен или пользователь не получены');
            }
        } catch (err: any) {
            if (err.response && err.response.data && err.response.data.message) {
                setError(err.response.data.message);
            } else {
                setError('Ошибка входа. Проверьте данные и попробуйте снова.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center px-6">
            <div className="w-full max-w-md">
                <button
                    onClick={onBack}
                    className="flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Home
                </button>

                <div className="bg-zinc-900 p-8 rounded-lg border border-zinc-800">
                    <div className="flex items-center gap-2 mb-8 justify-center">
                        <Dumbbell className="w-8 h-8 text-orange-500" />
                        <span className="text-2xl tracking-wide">GMS</span>
                    </div>

                    <h2 className="text-3xl mb-2 text-center">Welcome Back</h2>
                    <p className="text-gray-400 text-center mb-8">Login to access your account</p>

                    {error && (
                        <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded mb-6">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="your.email@example.com"
                                className="bg-zinc-800 border-zinc-700 focus:border-orange-500 mt-2"
                                required
                            />
                        </div>

                        <div>
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Enter your password"
                                className="bg-zinc-800 border-zinc-700 focus:border-orange-500 mt-2"
                                required
                            />
                        </div>

                        <Button
                            type="submit"
                            className="w-full bg-orange-500 hover:bg-orange-600"
                            disabled={loading}
                        >
                            {loading ? 'Вход...' : 'Login'}
                        </Button>
                    </form>

                    <div className="mt-8 pt-6 border-t border-zinc-800">
                        <p className="text-sm text-gray-400 text-center mb-4">Demo Credentials:</p>
                        <div className="space-y-2 text-sm">
                            <div className="bg-zinc-800 p-3 rounded">
                                <p className="text-orange-500">Admin:</p>
                                <p className="text-gray-300">admin@gms.com / password123</p>
                            </div>
                            <div className="bg-zinc-800 p-3 rounded">
                                <p className="text-orange-500">Member:</p>
                                <p className="text-gray-300">member@gms.com / password123</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;