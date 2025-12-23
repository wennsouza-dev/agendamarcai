
import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';

interface ReviewViewProps {
    appointmentId: string;
    onSuccess: () => void;
}

export const ReviewView: React.FC<ReviewViewProps> = ({ appointmentId, onSuccess }) => {
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [appointment, setAppointment] = useState<any>(null);
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [error, setError] = useState('');
    const [finished, setFinished] = useState(false);

    useEffect(() => {
        const fetchAppointment = async () => {
            const { data, error } = await supabase
                .from('appointments')
                .select(`
          *,
          professional:professional_id (
            name,
            specialty
          )
        `)
                .eq('id', appointmentId)
                .single();

            if (error) {
                setError('Agendamento não encontrado.');
            } else {
                setAppointment(data);
            }
            setLoading(false);
        };

        if (appointmentId) fetchAppointment();
    }, [appointmentId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setError('');

        try {
            const { error } = await supabase
                .from('reviews')
                .insert([
                    {
                        appointment_id: appointmentId,
                        professional_id: appointment.professional_id,
                        client_name: appointment.client_name,
                        rating,
                        comment
                    }
                ]);

            if (error) throw error;
            setFinished(true);
        } catch (err: any) {
            setError(err.message || 'Erro ao enviar avaliação.');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center p-6 text-text-secondary">Carregando formulário...</div>;

    if (finished) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
                <div className="bg-white p-8 rounded-3xl shadow-xl max-w-md w-full text-center animate-in zoom-in duration-300">
                    <div className="size-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
                        <span className="material-symbols-outlined text-4xl">check_circle</span>
                    </div>
                    <h2 className="text-2xl font-black mb-2">Obrigado!</h2>
                    <p className="text-text-secondary mb-8">Sua avaliação é muito importante para nós e ajuda outros clientes.</p>
                    <button
                        onClick={onSuccess}
                        className="w-full py-4 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/20 hover:bg-primary-hover transition-all"
                    >
                        Voltar ao Início
                    </button>
                </div>
            </div>
        );
    }

    if (error || !appointment) {
        return (
            <div className="min-h-screen flex items-center justify-center p-6 text-center">
                <div>
                    <span className="material-symbols-outlined text-4xl text-red-500 mb-4">error</span>
                    <p className="text-lg font-bold">{error || 'Link inválido.'}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-[#0a0c10] py-12 px-6">
            <div className="max-w-md mx-auto">
                <div className="bg-white dark:bg-surface-dark rounded-3xl shadow-xl overflow-hidden border border-gray-100 dark:border-gray-800">
                    <div className="bg-primary p-8 text-white text-center">
                        <h1 className="text-2xl font-black mb-1">Avaliação</h1>
                        <p className="text-white/80 text-sm">Conte-nos como foi seu atendimento</p>
                    </div>

                    <div className="p-8">
                        <div className="flex items-center gap-4 mb-8 p-4 bg-gray-50 dark:bg-[#111418] rounded-2xl">
                            <div className="size-12 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                                <span className="material-symbols-outlined">person</span>
                            </div>
                            <div>
                                <h4 className="font-bold text-sm">{appointment.professional?.name}</h4>
                                <p className="text-[10px] text-text-secondary uppercase tracking-wider">{appointment.service_name}</p>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label className="block text-center text-xs font-black uppercase tracking-widest text-text-secondary mb-4">Sua Nota</label>
                                <div className="flex justify-center gap-2">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            type="button"
                                            onClick={() => setRating(star)}
                                            className="transition-transform active:scale-95"
                                        >
                                            <span className={`material-symbols-outlined text-4xl ${star <= rating ? 'text-yellow-400 fill-star' : 'text-gray-200'}`} style={{ fontVariationSettings: star <= rating ? '"FILL" 1' : '"FILL" 0' }}>
                                                star
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-black uppercase tracking-widest text-text-secondary mb-2">Comentário (Opcional)</label>
                                <textarea
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                    className="w-full h-32 bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl p-4 outline-none focus:ring-2 ring-primary/20 transition-all text-sm resize-none"
                                    placeholder="Escreva como foi sua experiência..."
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={submitting}
                                className="w-full py-4 bg-primary text-white font-bold rounded-2xl shadow-xl shadow-primary/20 hover:bg-primary-hover disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                            >
                                {submitting ? 'Enviando...' : (
                                    <>
                                        <span className="material-symbols-outlined">send</span>
                                        Enviar Avaliação
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};
