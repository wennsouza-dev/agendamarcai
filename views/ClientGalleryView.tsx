import React from 'react';
import { GalleryDisplay } from '../components/GalleryDisplay';
import { Professional } from '../types';

interface ClientGalleryViewProps {
    professional: Professional;
    onBack: () => void;
}

export const ClientGalleryView: React.FC<ClientGalleryViewProps> = ({ professional, onBack }) => {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-background-dark pb-12">
            {/* Header */}
            <div className="bg-white dark:bg-surface-dark border-b border-gray-100 dark:border-gray-800 sticky top-0 z-30 shadow-sm">
                <div className="max-w-6xl mx-auto px-4 h-16 flex items-center gap-4">
                    <button
                        onClick={onBack}
                        className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    >
                        <span className="material-symbols-outlined text-text-secondary">arrow_back</span>
                    </button>

                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full overflow-hidden border border-gray-200 dark:border-gray-700">
                            <img
                                src={professional.image_url || 'https://via.placeholder.com/150'}
                                alt={professional.name}
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <div>
                            <h1 className="font-bold text-lg leading-tight">{professional.name}</h1>
                            <p className="text-xs text-text-secondary">Galeria de Trabalhos</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-6xl mx-auto px-4 py-8">
                {professional.gallery_images && professional.gallery_images.length > 0 ? (
                    <GalleryDisplay images={professional.gallery_images} showAll={true} />
                ) : (
                    <div className="text-center py-20">
                        <span className="material-symbols-outlined text-6xl text-gray-300 mb-4">photo_library</span>
                        <p className="text-xl font-medium text-text-secondary">Este profissional ainda não adicionou fotos.</p>
                    </div>
                )}
            </div>
        </div>
    );
};
