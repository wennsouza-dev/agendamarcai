import React, { useState } from 'react';
import { GalleryImage } from '../types';

interface GalleryDisplayProps {
    images: GalleryImage[];
    showAll?: boolean;
}

export const GalleryDisplay: React.FC<GalleryDisplayProps> = ({ images, showAll = false }) => {
    const [selectedImage, setSelectedImage] = useState<string | null>(null);

    if (!images || images.length === 0) return null;

    return (
        <>
            <div className="flex flex-col gap-6">
                <h2 className="text-xl font-bold flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">collections</span>
                    Galeria de Trabalhos
                </h2>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {(showAll ? images : images.slice(0, 8)).map(img => (
                        <button
                            key={img.id}
                            onClick={() => setSelectedImage(img.image_url)}
                            className="relative aspect-square rounded-xl overflow-hidden bg-gray-100 border border-gray-200 dark:border-gray-800 hover:opacity-90 transition-opacity focus:outline-none focus:ring-2 ring-primary/50"
                        >
                            <img src={img.image_url} alt="Trabalho" className="w-full h-full object-cover" />
                        </button>
                    ))}
                </div>
            </div>

            {/* Lightbox Modal */}
            {selectedImage && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 animate-in fade-in duration-200"
                    onClick={() => setSelectedImage(null)}
                >
                    <button
                        className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors"
                        onClick={() => setSelectedImage(null)}
                    >
                        <span className="material-symbols-outlined text-4xl">close</span>
                    </button>

                    <img
                        src={selectedImage}
                        alt="Zoom"
                        className="max-w-full max-h-[90vh] rounded-lg shadow-2xl animate-in zoom-in-95 duration-300"
                        onClick={(e) => e.stopPropagation()}
                    />
                </div>
            )}
        </>
    );
};
