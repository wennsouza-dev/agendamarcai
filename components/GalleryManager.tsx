import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { GalleryImage } from '../types';

interface GalleryManagerProps {
    professionalId: string;
}

export const GalleryManager: React.FC<GalleryManagerProps> = ({ professionalId }) => {
    const [images, setImages] = useState<GalleryImage[]>([]);
    const [uploading, setUploading] = useState(false);
    const [loading, setLoading] = useState(true);

    const MAX_IMAGES = 10;

    useEffect(() => {
        fetchGallery();
    }, [professionalId]);

    const fetchGallery = async () => {
        const { data } = await supabase
            .from('professional_gallery')
            .select('*')
            .eq('professional_id', professionalId)
            .order('created_at', { ascending: false });

        if (data) setImages(data);
        setLoading(false);
    };

    const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        if (images.length >= MAX_IMAGES) {
            alert(`Você atingiu o limite de ${MAX_IMAGES} fotos.`);
            return;
        }

        try {
            setUploading(true);
            if (!event.target.files || event.target.files.length === 0) {
                throw new Error('Selecione uma imagem para enviar.');
            }

            // const file = event.target.files[0]; // Already defined above
            const fileExt = file.name.split('.').pop();
            const fileName = `${professionalId}/${Math.random()}.${fileExt}`;
            const filePath = `${fileName}`;

            // 1. Upload to Storage
            const { error: uploadError } = await supabase.storage
                .from('gallery')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            // 2. Get Public URL
            const { data: { publicUrl } } = supabase.storage
                .from('gallery')
                .getPublicUrl(filePath);

            // 3. Save to Database
            const { error: dbError } = await supabase
                .from('professional_gallery')
                .insert({
                    professional_id: professionalId,
                    image_url: publicUrl
                });

            if (dbError) throw dbError;

            await fetchGallery();
            alert('Imagem adicionada com sucesso!');
        } catch (error: any) {
            alert('Erro ao enviar imagem: ' + error.message);
        } finally {
            setUploading(false);
            // Construct a new Input element to reset value? 
            // Easier to just let React re-render or not care about clearing input manually for now.
        }
    };

    const handleDelete = async (img: GalleryImage) => {
        if (!confirm('Tem certeza que deseja excluir esta foto?')) return;

        try {
            // 1. Delete from DB
            const { error: dbError } = await supabase
                .from('professional_gallery')
                .delete()
                .eq('id', img.id);

            if (dbError) throw dbError;

            // 2. Delete from Storage (Optional optimization, good practice)
            // Extract path from URL
            const path = img.image_url.split('/gallery/')[1];
            if (path) {
                await supabase.storage.from('gallery').remove([path]);
            }

            setImages(images.filter(image => image.id !== img.id));
        } catch (error: any) {
            alert('Erro ao excluir: ' + error.message);
        }
    };

    if (loading) return <div className="p-4 text-center animate-pulse">Carregando galeria...</div>;

    return (
        <div className="bg-white dark:bg-surface-dark p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm mt-8">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary">photo_library</span>
                        Galeria de Fotos
                    </h2>
                    <p className="text-xs text-text-secondary mt-1">
                        {images.length} de {MAX_IMAGES} fotos
                    </p>
                </div>
                <div>
                    <label className={`cursor-pointer bg-primary text-white px-4 py-2 rounded-xl font-bold hover:bg-primary-dark transition-all flex items-center gap-2 ${uploading || images.length >= MAX_IMAGES ? 'opacity-50 cursor-not-allowed' : ''}`}>
                        <span className="material-symbols-outlined">{uploading ? 'upload' : 'add_a_photo'}</span>
                        {uploading ? 'Enviando...' : 'Adicionar Foto'}
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleUpload}
                            disabled={uploading || images.length >= MAX_IMAGES}
                            className="hidden"
                        />
                    </label>
                </div>
            </div>

            {images.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 dark:bg-gray-900/40 rounded-2xl border border-dashed border-gray-200 dark:border-gray-800">
                    <span className="material-symbols-outlined text-4xl text-gray-300 mb-2">burst_mode</span>
                    <p className="text-text-secondary">Sua galeria está vazia. Adicione sua primeira foto!</p>
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {images.map(img => (
                        <div key={img.id} className="group relative aspect-square rounded-xl overflow-hidden bg-gray-100 border border-gray-200 dark:border-gray-800">
                            <img src={img.image_url} alt="Galeria" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <button
                                    onClick={() => handleDelete(img)}
                                    className="bg-red-500 text-white p-2 rounded-lg hover:bg-red-600 transition-colors transform scale-0 group-hover:scale-100 duration-200"
                                    title="Excluir foto"
                                >
                                    <span className="material-symbols-outlined">delete</span>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
