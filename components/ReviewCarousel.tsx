
import React from 'react';
import { Review } from '../types';

interface ReviewCarouselProps {
    reviews: Review[];
}

export const ReviewCarousel: React.FC<ReviewCarouselProps> = ({ reviews }) => {
    const [currentIndex, setCurrentIndex] = React.useState(0);

    if (!reviews || reviews.length === 0) return null;

    const next = () => setCurrentIndex((prev) => (prev + 1) % reviews.length);
    const prev = () => setCurrentIndex((prev) => (prev - 1 + reviews.length) % reviews.length);

    return (
        <div className="bg-primary/5 dark:bg-primary/10 rounded-2xl p-6 border border-primary/10 relative overflow-hidden group">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-black text-primary uppercase tracking-wider flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm">stars</span>
                    Avaliações dos Clientes
                </h3>
                <div className="flex gap-2">
                    <button onClick={prev} className="size-8 rounded-full bg-white dark:bg-gray-800 flex items-center justify-center text-primary shadow-sm hover:bg-primary hover:text-white transition-all">
                        <span className="material-symbols-outlined text-sm">chevron_left</span>
                    </button>
                    <button onClick={next} className="size-8 rounded-full bg-white dark:bg-gray-800 flex items-center justify-center text-primary shadow-sm hover:bg-primary hover:text-white transition-all">
                        <span className="material-symbols-outlined text-sm">chevron_right</span>
                    </button>
                </div>
            </div>

            <div className="relative h-24">
                {reviews.map((review, idx) => (
                    <div
                        key={review.id}
                        className={`absolute inset-0 transition-all duration-500 transform ${idx === currentIndex ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-12 pointer-events-none'
                            }`}
                    >
                        <div className="flex gap-1 mb-2">
                            {[...Array(5)].map((_, i) => (
                                <span key={i} className={`material-symbols-outlined text-sm ${i < review.rating ? 'text-yellow-400' : 'text-gray-300'}`}>
                                    star
                                </span>
                            ))}
                        </div>
                        <p className="text-sm font-medium italic text-text-secondary line-clamp-2 mb-2">"{review.comment}"</p>
                        <p className="text-[10px] font-bold uppercase text-primary">— {review.client_name}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};
