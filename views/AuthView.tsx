import React, { useState } from 'react';
import { supabase } from '../services/supabase';

interface AuthViewProps {
    onSuccess: () => void;
}

export const AuthView: React.FC<AuthViewProps> = ({ onSuccess }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            if (isLogin) {
                // Supabase uses localStorage by default. 
                // Dynamic persistence toggling requires complex client re-initialization, 
                // so we will stick to default behavior for now to prevent crashes.

                const { error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });
                if (error) throw error;
            } else {
                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                });
                if (error) throw error;
                else {
                    setError("Verifique seu email para confirmar o cadastro.");
                    setLoading(false);
                    return;
                }
            }
            onSuccess();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#111418] px-6">
            <div className="w-full max-w-md bg-white dark:bg-surface-dark rounded-2xl shadow-xl p-8 border border-gray-100 dark:border-gray-800">
                <div className="flex flex-col items-center mb-8 gap-3">
                    <div className="flex items-center justify-center size-12 rounded-xl bg-primary text-white">
                        <span className="material-symbols-outlined text-2xl">schedule</span>
                    </div>
                    <h1 className="text-2xl font-black tracking-tight">MarcAI</h1>
                    <p className="text-text-secondary text-sm">
                        {isLogin ? 'Bem-vindo de volta!' : 'Crie sua conta gratuitamente'}
                    </p>
                </div>

                <form onSubmit={handleAuth} className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary mb-2">Email</label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-[#111418] border border-gray-200 dark:border-gray-800 focus:outline-none focus:border-primary transition-colors font-medium"
                            placeholder="seu@email.com"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary mb-2">Senha</label>
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-[#111418] border border-gray-200 dark:border-gray-800 focus:outline-none focus:border-primary transition-colors font-medium"
                            placeholder="••••••••"
                        />
                    </div>

                    {isLogin && (
                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="rememberMe"
                                checked={rememberMe}
                                onChange={(e) => setRememberMe(e.target.checked)}
                                className="rounded border-gray-300 text-primary focus:ring-primary"
                            />
                            <label htmlFor="rememberMe" className="text-sm text-text-secondary cursor-pointer select-none">Manter conectado</label>
                        </div>
                    )}

                    {error && (
                        <div className="p-3 bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 rounded-xl text-xs font-bold text-red-600 dark:text-red-400">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/20 hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed transition-all flex justify-center items-center gap-2"
                    >
                        {loading && <span className="material-symbols-outlined animate-spin text-sm">progress_activity</span>}
                        {isLogin ? 'Entrar' : 'Criar Conta'}
                    </button>
                </form>

                <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-800 text-center">
                    <p className="text-sm text-text-secondary">
                        {isLogin ? 'Não tem uma conta?' : 'Já tem uma conta?'}
                        <button
                            onClick={() => setIsLogin(!isLogin)}
                            className="ml-2 text-primary font-bold hover:underline"
                        >
                            {isLogin ? 'Cadastre-se' : 'Fazer Login'}
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
};
