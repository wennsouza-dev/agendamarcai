import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';

interface AdminDashboardViewProps {
    userEmail: string;
}

export const AdminDashboardView: React.FC<AdminDashboardViewProps> = ({ userEmail }) => {
    const [professionals, setProfessionals] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingPro, setEditingPro] = useState<any>(null);

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        specialty: '',
        location: '',
        salon_name: '',
        reset_word: 'mudar123', // Default temp password
        expire_days: 30
    });

    const fetchProfessionals = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('professionals')
            .select('*')
            .order('created_at', { ascending: false });

        if (data) setProfessionals(data);
        if (error) console.error('Error fetching pros:', error);
        setLoading(false);
    };

    useEffect(() => {
        fetchProfessionals();
    }, []);

    const openModal = (pro?: any) => {
        if (pro) {
            setEditingPro(pro);
            setFormData({
                name: pro.name,
                email: pro.email || '',
                specialty: pro.category || '',
                location: pro.city || '',
                salon_name: pro.salon_name || '',
                reset_word: pro.reset_word || '',
                expire_days: pro.expire_days || 0
            });
        } else {
            setEditingPro(null);
            setFormData({
                name: '',
                email: '',
                specialty: '',
                location: '',
                salon_name: '',
                reset_word: 'mudar123',
                expire_days: 30
            });
        }
        setShowModal(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Tem certeza que deseja excluir este profissional?')) return;

        const { error } = await supabase.from('professionals').delete().eq('id', id);
        if (error) {
            alert('Erro ao excluir: ' + error.message);
        } else {
            alert('Profissional excluído com sucesso.');
            fetchProfessionals();
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const { name, email, specialty, location, salon_name, reset_word, expire_days } = formData;

        if (!name || !specialty) return;

        const proData = {
            name,
            email,
            category: specialty,
            city: location,
            salon_name,
            reset_word,
            expire_days: parseInt(expire_days as any),
        };

        let result;
        if (editingPro) {
            // Update
            result = await supabase.from('professionals').update(proData).eq('id', editingPro.id);
        } else {
            // Insert
            const slug = name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '') + '-' + Math.random().toString(36).substr(2, 5);
            result = await supabase.from('professionals').insert([{ ...proData, slug, rating: 5.0, services: [] }]);
        }

        if (result.error) {
            alert('Erro ao salvar: ' + result.error.message);
        } else {
            alert('Salvo com sucesso!');
            setShowModal(false);
            fetchProfessionals();
        }
    };

    const getStatus = (days: number) => {
        if (days > 0) return <span className="px-2 py-1 rounded bg-green-100 text-green-700 text-xs font-bold">ATIVO</span>;
        return <span className="px-2 py-1 rounded bg-red-100 text-red-700 text-xs font-bold">EXPIRADO</span>;
    };

    return (
        <div className="max-w-6xl mx-auto px-6 py-12 flex flex-col gap-10">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-bold uppercase tracking-wider mb-2">
                        Admin
                    </div>
                    <h1 className="text-3xl md:text-4xl font-black tracking-tight">Painel Administrativo</h1>
                    <p className="text-text-secondary">Gerencie os profissionais da plataforma.</p>
                </div>
                <button
                    onClick={() => openModal()}
                    className="px-6 py-3 bg-primary text-white font-bold rounded-xl flex items-center gap-2 shadow-lg shadow-primary/20 hover:bg-primary-hover transition-all"
                >
                    <span className="material-symbols-outlined text-lg">add</span>
                    Cadastrar Profissional
                </button>
            </header>

            <div className="bg-white dark:bg-surface-dark border border-gray-100 dark:border-gray-800 rounded-2xl shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
                    <h3 className="font-bold text-lg">Profissionais Cadastrados ({professionals.length})</h3>
                    <button onClick={fetchProfessionals} className="text-primary text-sm font-bold hover:underline">Atualizar</button>
                </div>

                {loading ? (
                    <div className="p-10 text-center text-text-secondary">Carregando...</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-gray-50 dark:bg-[#111418] text-text-secondary text-xs uppercase font-bold tracking-wider">
                                <tr>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4">Nome</th>
                                    <th className="px-6 py-4">Especialidade</th>
                                    <th className="px-6 py-4">Salão</th>
                                    <th className="px-6 py-4">Expira em</th>
                                    <th className="px-6 py-4 text-right">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                {professionals.map(pro => (
                                    <tr key={pro.id} className="hover:bg-gray-50 dark:hover:bg-[#111418] transition-colors">
                                        <td className="px-6 py-4">{getStatus(pro.expire_days)}</td>
                                        <td className="px-6 py-4 font-bold">
                                            {pro.name}
                                            <div className="text-xs text-text-secondary font-normal">{pro.email}</div>
                                        </td>
                                        <td className="px-6 py-4 text-text-secondary">{pro.category || '-'}</td>
                                        <td className="px-6 py-4 text-text-secondary">{pro.salon_name || '-'}</td>
                                        <td className="px-6 py-4 text-text-secondary font-mono">{pro.expire_days} dias</td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button onClick={() => openModal(pro)} className="text-primary font-bold hover:underline">Editar</button>
                                                <button onClick={() => handleDelete(pro.id)} className="text-red-500 font-bold hover:underline">Excluir</button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {professionals.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-10 text-center text-text-secondary">Nenhum profissional encontrado.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="w-full max-w-2xl bg-white dark:bg-surface-dark rounded-2xl shadow-2xl p-6 md:p-8 animate-in fade-in zoom-in duration-200 lg:max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold">{editingPro ? 'Editar Profissional' : 'Novo Profissional'}</h2>
                            <button onClick={() => setShowModal(false)} className="size-8 rounded-full bg-gray-100 dark:bg-[#283039] flex items-center justify-center hover:bg-gray-200 transition-colors">
                                <span className="material-symbols-outlined text-sm">close</span>
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary mb-2">Nome Completo</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-[#111418] border border-gray-200 dark:border-gray-800 focus:outline-none focus:border-primary transition-colors font-medium"
                                        placeholder="Ex: Maria Silva"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary mb-2">Email</label>
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-[#111418] border border-gray-200 dark:border-gray-800 focus:outline-none focus:border-primary transition-colors font-medium"
                                        placeholder="email@exemplo.com"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary mb-2">Especialidade</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.specialty}
                                        onChange={e => setFormData({ ...formData, specialty: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-[#111418] border border-gray-200 dark:border-gray-800 focus:outline-none focus:border-primary transition-colors font-medium"
                                        placeholder="Ex: Cabeleireira"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary mb-2">Nome do Salão</label>
                                    <input
                                        type="text"
                                        value={formData.salon_name}
                                        onChange={e => setFormData({ ...formData, salon_name: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-[#111418] border border-gray-200 dark:border-gray-800 focus:outline-none focus:border-primary transition-colors font-medium"
                                        placeholder="Ex: Studio Beauty"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary mb-2">Localização</label>
                                <input
                                    type="text"
                                    value={formData.location}
                                    onChange={e => setFormData({ ...formData, location: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-[#111418] border border-gray-200 dark:border-gray-800 focus:outline-none focus:border-primary transition-colors font-medium"
                                    placeholder="Ex: Savassi, Belo Horizonte"
                                />
                            </div>

                            <div className="p-4 bg-yellow-50 dark:bg-yellow-500/10 rounded-xl border border-yellow-100 dark:border-yellow-500/20">
                                <h4 className="font-bold text-yellow-800 dark:text-yellow-400 text-sm mb-3">Configurações de Acesso</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary mb-2">Senha Temporária</label>
                                        <input
                                            type="text"
                                            value={formData.reset_word}
                                            onChange={e => setFormData({ ...formData, reset_word: e.target.value })}
                                            className="w-full px-4 py-3 rounded-xl bg-white dark:bg-[#111418] border border-gray-200 dark:border-gray-800 focus:outline-none focus:border-primary transition-colors font-medium"
                                            placeholder="Ex: mudar123"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary mb-2">Dias para Expirar</label>
                                        <input
                                            type="number"
                                            value={formData.expire_days}
                                            onChange={e => setFormData({ ...formData, expire_days: parseInt(e.target.value) })}
                                            className="w-full px-4 py-3 rounded-xl bg-white dark:bg-[#111418] border border-gray-200 dark:border-gray-800 focus:outline-none focus:border-primary transition-colors font-medium"
                                            placeholder="30"
                                        />
                                        <p className="text-[10px] text-text-secondary mt-1">
                                            Se 0 ou menos, o profissional perderá o acesso.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-4 flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 py-3 bg-gray-100 dark:bg-[#283039] text-text-secondary font-bold rounded-xl hover:bg-gray-200 dark:hover:bg-[#343e4b] transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 py-3 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/20 hover:bg-primary-hover transition-colors"
                                >
                                    {editingPro ? 'Atualizar' : 'Salvar'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
