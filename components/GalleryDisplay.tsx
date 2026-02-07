import React, { useState } from 'react';
import { GalleryImage } from '../types';

interface GalleryDisplayProps {
    images: GalleryImage[];
    showAll?: boolean;
    mode?: 'grid' | 'carousel';
}

export const GalleryDisplay: React.FC<GalleryDisplayProps> = ({ images, showAll = false, mode = 'grid' }) => {
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const scrollRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        if (mode !== 'carousel') return;

        const interval = setInterval(() => {
            if (scrollRef.current) {
                const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
                // Check if we are close to the end (allow some buffer)
                if (scrollLeft + clientWidth >= scrollWidth - 10) {
                    scrollRef.current.scrollTo({ left: 0, behavior: 'smooth' });
                } else {
                    // Scroll by one item width + gap (approx 256px + 16px)
                    // Or let's just scroll by 200px to ensure movement, snap-x will handle alignment
                    scrollRef.current.scrollBy({ left: 272, behavior: 'smooth' });
                }
            }
        }, 3000);

        return () => clearInterval(interval);
    }, [mode, images]);

    if (!images || images.length === 0) return null;

    return (
        <div className="flex flex-col gap-4">
            {mode === 'grid' && (
                <h2 className="text-xl font-bold flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">collections</span>
                    Galeria de Trabalhos
                </h2>
            )}
            {/* If carousel mode, we might want a different header or none at all as per design */}
            {mode === 'carousel' && (
                <div className="flex items-center gap-2 mb-2">
                    <span className="material-symbols-outlined text-primary">collections</span>
                    <h2 className="font-bold text-lg">Galeria de Trabalhos</h2>
                </div>
            )}

            {mode === 'grid' ? (
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
            ) : (
                <div
                    ref={scrollRef}
                    className="flex overflow-x-auto snap-x snap-mandatory gap-4 pb-4 -mx-4 px-4 scrollbar-hide"
                >
                    {images.map(img => (
                        <button
                            key={img.id}
                            onClick={() => setSelectedImage(img.image_url)}
                            className="flex-shrink-0 w-64 h-64 snap-center rounded-2xl overflow-hidden bg-gray-100 border border-gray-200 dark:border-gray-800 shadow-sm hover:opacity-90 transition-opacity focus:outline-none focus:ring-2 ring-primary/50"
                        >
                            <img src={img.image_url} alt="Trabalho" className="w-full h-full object-cover" />
                        </button>
                    ))}
                </div>
            )}

            {/* Lightbox Modal */}
            {selectedImage && (
                <div
                    className="fixed inset-0 z-[60] flex items-center justify-center bg-black/95 backdrop-blur-sm p-4 animate-in fade-in duration-200"
                    onClick={() => setSelectedImage(null)}
                >
                    <button
                        className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors bg-white/10 rounded-full p-2"
                        onClick={(e) => {
                            e.stopPropagation();
                            setSelectedImage(null);
                        }}
                    >
                        <span className="material-symbols-outlined text-2xl">close</span>
                    </button>

                    <div className="relative w-full max-w-4xl flex items-center justify-center">
                        {/* Prev Button (Optional, but good for navigation) */}
                        <button
                            className="absolute left-0 p-2 text-white/70 hover:text-white bg-black/20 rounded-full hover:bg-black/40 transition-all backdrop-blur-sm"
                            onClick={(e) => {
                                e.stopPropagation();
                                const currentIndex = images.findIndex(img => img.image_url === selectedImage);
                                const prevIndex = (currentIndex - 1 + images.length) % images.length;
                                setSelectedImage(images[prevIndex].image_url);
                            }}
                        >
                            <span className="material-symbols-outlined text-3xl">chevron_left</span>
                        </button>

                        <img
                            src={selectedImage}
                            alt="Zoom"
                            className="max-w-full max-h-[85vh] rounded-lg shadow-2xl animate-in zoom-in-95 duration-300 object-contain mx-12"
                            onClick={(e) => e.stopPropagation()}
                        />

                        {/* Next Button */}
                        <button
                            className="absolute right-0 p-2 text-white/70 hover:text-white bg-black/20 rounded-full hover:bg-black/40 transition-all backdrop-blur-sm"
                            onClick={(e) => {
                                e.stopPropagation();
                                const currentIndex = images.findIndex(img => img.image_url === selectedImage);
                                const nextIndex = (currentIndex + 1) % images.length;
                                setSelectedImage(images[nextIndex].image_url);
                            }}
                        >
                            <span className="material-symbols-outlined text-3xl">chevron_right</span>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
