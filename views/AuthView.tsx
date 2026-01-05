import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';

interface AuthViewProps {
    onSuccess: () => void;
}

type AuthMode = 'LOGIN' | 'SIGNUP' | 'FORGOT_PASSWORD' | 'VERIFY_OTP';

export const AuthView: React.FC<AuthViewProps> = ({ onSuccess }) => {
    const [authMode, setAuthMode] = useState<AuthMode>('LOGIN');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [otpToken, setOtpToken] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    // Timer state
    const [timeLeft, setTimeLeft] = useState(0);

    useEffect(() => {
        if (timeLeft > 0) {
            const timerId = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
            return () => clearTimeout(timerId);
        }
    }, [timeLeft]);

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccessMessage(null);

        try {
            if (authMode === 'LOGIN') {
                const { error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });
                if (error) throw error;
                onSuccess();
            } else if (authMode === 'SIGNUP') {
                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                });
                if (error) throw error;
                setSuccessMessage("Verifique seu email para confirmar o cadastro.");
                setAuthMode('LOGIN');
            } else if (authMode === 'FORGOT_PASSWORD') {
                const { error } = await supabase.auth.signInWithOtp({
                    email,
                });
                if (error) throw error;

                setSuccessMessage("Código enviado para o seu email.");
                setAuthMode('VERIFY_OTP');
                setTimeLeft(60); // Start 60s countdown
            } else if (authMode === 'VERIFY_OTP') {
                // 1. Verify OTP
                // type: 'magiclink' corresponds to signInWithOtp flow
                const { data, error: verifyError } = await supabase.auth.verifyOtp({
                    email,
                    token: otpToken,
                    type: 'magiclink',
                });

                if (verifyError) throw verifyError;
                if (!data.session) throw new Error("Falha ao verificar sessão.");

                // 2. Update Password
                const { error: updateError } = await supabase.auth.updateUser({
                    password: newPassword
                });

                if (updateError) throw updateError;

                setSuccessMessage("Senha alterada com sucesso!");

                // Allow user to read the message briefly or just switch to login
                setTimeout(() => {
                    setAuthMode('LOGIN');
                    setSuccessMessage(null);
                    setPassword('');
                    setOtpToken('');
                    setNewPassword('');
                }, 2000);
            }
        } catch (err: any) {
            setError(err.message || "Ocorreu um erro. Tente novamente.");
        } finally {
            setLoading(false);
        }
    };

    const renderForm = () => {
        switch (authMode) {
            case 'LOGIN':
            case 'SIGNUP':
                return (
                    <>
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

                        {authMode === 'LOGIN' && (
                            <div className="flex items-center justify-between">
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
                                <button
                                    type="button"
                                    onClick={() => setAuthMode('FORGOT_PASSWORD')}
                                    className="text-sm text-primary font-bold hover:underline"
                                >
                                    Esqueceu a senha?
                                </button>
                            </div>
                        )}
                    </>
                );
            case 'FORGOT_PASSWORD':
                return (
                    <div>
                        <div className="mb-4 text-sm text-text-secondary text-center">
                            Digite seu email para receber um código de recuperação.
                        </div>
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
                );
            case 'VERIFY_OTP':
                return (
                    <>
                        <div className="mb-4 text-sm text-text-secondary text-center">
                            Digite o código enviado para <b>{email}</b> e sua nova senha.
                        </div>
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary mb-2">Código de Verificação</label>
                            <input
                                type="text"
                                required
                                value={otpToken}
                                onChange={(e) => setOtpToken(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-[#111418] border border-gray-200 dark:border-gray-800 focus:outline-none focus:border-primary transition-colors font-medium tracking-widest text-center text-lg"
                                placeholder="12345678"
                                maxLength={8}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary mb-2">Nova Senha</label>
                            <input
                                type="password"
                                required
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-[#111418] border border-gray-200 dark:border-gray-800 focus:outline-none focus:border-primary transition-colors font-medium"
                                placeholder="••••••••"
                                minLength={6}
                            />
                        </div>
                        {timeLeft > 0 && (
                            <div className="text-center text-xs text-text-secondary mt-2">
                                Código expira em: <span className="font-bold text-primary">{timeLeft}s</span>
                            </div>
                        )}
                        {timeLeft === 0 && (
                            <button
                                type="button"
                                onClick={() => setAuthMode('FORGOT_PASSWORD')}
                                className="w-full text-xs text-primary font-bold hover:underline mt-2 text-center"
                            >
                                Reenviar código
                            </button>
                        )}
                    </>
                );
        }
    };

    const getSubmitButtonText = () => {
        switch (authMode) {
            case 'LOGIN': return 'Entrar';
            case 'SIGNUP': return 'Criar Conta';
            case 'FORGOT_PASSWORD': return 'Enviar Código';
            case 'VERIFY_OTP': return 'Alterar Senha';
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
                        {authMode === 'LOGIN' ? 'Bem-vindo de volta!' :
                            authMode === 'SIGNUP' ? 'Crie sua conta gratuitamente' :
                                authMode === 'FORGOT_PASSWORD' ? 'Recuperação de Senha' :
                                    'Redefinir Senha'}
                    </p>
                </div>

                <form onSubmit={handleAuth} className="space-y-4">
                    {renderForm()}

                    {error && (
                        <div className="p-3 bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 rounded-xl text-xs font-bold text-red-600 dark:text-red-400">
                            {error}
                        </div>
                    )}

                    {successMessage && (
                        <div className="p-3 bg-green-50 dark:bg-green-500/10 border border-green-100 dark:border-green-500/20 rounded-xl text-xs font-bold text-green-600 dark:text-green-400">
                            {successMessage}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/20 hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed transition-all flex justify-center items-center gap-2"
                    >
                        {loading && <span className="material-symbols-outlined animate-spin text-sm">progress_activity</span>}
                        {getSubmitButtonText()}
                    </button>
                </form>

                <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-800 text-center">
                    <p className="text-sm text-text-secondary">
                        {authMode === 'LOGIN' ? 'Não tem uma conta?' : 'Já tem uma conta?'}
                        <button
                            onClick={() => {
                                setAuthMode(authMode === 'LOGIN' ? 'SIGNUP' : 'LOGIN');
                                setError(null);
                                setSuccessMessage(null);
                            }}
                            className="ml-2 text-primary font-bold hover:underline"
                        >
                            {authMode === 'LOGIN' ? 'Cadastre-se' : 'Fazer Login'}
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
};
