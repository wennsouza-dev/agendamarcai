
import React, { useState, useEffect } from 'react';
import { MOCK_PROFESSIONALS } from '../constants';
import { getSmartSuggestions } from '../services/geminiService';

interface SearchViewProps {
  onSelectProfessional: (pro: any, service: any) => void;
}

import { supabase } from '../services/supabase';

interface SearchViewProps {
  onSelectProfessional: (pro: any, service: any) => void;
}

export const SearchView: React.FC<SearchViewProps> = ({ onSelectProfessional }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [professionals, setProfessionals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);

  useEffect(() => {
    fetchProfessionals();
  }, []);

  const fetchProfessionals = async () => {
    setLoading(true);
    // Fetch professionals and their reviews for dynamic rating calculation
    const { data } = await supabase
      .from('professionals')
      .select('*, reviews(rating)')
      .neq('expire_days', 0);

    if (data) {
      const processed = data.map(pro => {
        const reviews = pro.reviews || [];
        const avg = reviews.length > 0
          ? reviews.reduce((acc: number, r: any) => acc + r.rating, 0) / reviews.length
          : 5.0;
        return { ...pro, rating: avg, reviewCount: reviews.length };
      });
      setProfessionals(processed);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (searchTerm.length > 3) {
      const timer = setTimeout(async () => {
        setIsLoadingSuggestions(true);
        // We can keep AI suggestions or adapt them
        const smart = await getSmartSuggestions(searchTerm);
        setSuggestions(smart);
        setIsLoadingSuggestions(false);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      setSuggestions([]);
    }
  }, [searchTerm]);

  const filteredPros = professionals.filter(pro =>
    pro.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (pro.category && pro.category.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (pro.services && Array.isArray(pro.services) && pro.services.some((s: any) => s.name.toLowerCase().includes(searchTerm.toLowerCase())))
  );

  return (
    <div className="max-w-6xl mx-auto px-6 py-12 flex flex-col gap-10">
      <div className="flex flex-col gap-6 text-center">
        <h1 className="text-3xl md:text-4xl font-bold">O que você precisa hoje?</h1>
        <div className="relative max-w-2xl mx-auto w-full">
          <div className="flex items-center h-14 bg-white dark:bg-surface-dark rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm focus-within:border-primary transition-all px-4">
            <span className="material-symbols-outlined text-text-secondary mr-3">search</span>
            <input
              type="text"
              placeholder="Buscar serviços ou profissionais..."
              className="flex-1 bg-transparent border-none focus:ring-0 text-lg"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {isLoadingSuggestions && <div className="animate-spin rounded-full h-5 w-5 border-2 border-primary border-t-transparent"></div>}
          </div>

          {suggestions.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2 justify-center">
              <span className="text-xs text-text-secondary py-1.5">Sugestões inteligentes:</span>
              {suggestions.map((s, idx) => (
                <button
                  key={idx}
                  onClick={() => setSearchTerm(s)}
                  className="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium hover:bg-primary/20"
                >
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center p-12">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-primary border-t-transparent"></div>
        </div>
      ) : filteredPros.length === 0 ? (
        <div className="text-center py-12 text-text-secondary">
          Nenhum profissional encontrado.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPros.map(pro => (
            <div key={pro.id} className="bg-white dark:bg-surface-dark rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden group hover:border-primary/40 transition-all shadow-sm">
              <div className="relative h-48 bg-gray-200">
                <img
                  src={pro.image_url || 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=800'}
                  className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500"
                  alt={pro.name}
                />
                <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-sm px-2 py-1 rounded-lg flex items-center gap-1">
                  <span className="material-symbols-outlined text-yellow-400 text-sm fill-1">star</span>
                  <span className="text-white text-xs font-bold">{pro.rating?.toFixed(1) || '5.0'}</span>
                </div>
              </div>
              <div className="p-5 flex flex-col gap-4">
                <div>
                  <h3 className="text-lg font-bold group-hover:text-primary transition-colors">{pro.name}</h3>
                  <p className="text-sm text-text-secondary font-medium">{pro.category} • {pro.distance || '0.5km'}</p>
                  {pro.salon_name && <p className="text-xs text-text-secondary font-medium mt-1">{pro.salon_name}</p>}
                </div>
                <div className="flex flex-wrap gap-2">
                  {pro.services && pro.services.slice(0, 3).map((s: any, idx: number) => (
                    <span key={idx} className="px-2 py-1 bg-gray-100 dark:bg-[#283039] rounded text-[10px] font-bold uppercase tracking-wider">
                      {s.name || s}
                    </span>
                  ))}
                </div>
                <div className="pt-2">
                  <p className="text-xs text-text-secondary mb-3 flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">location_on</span>
                    {pro.city || pro.location || 'Local não informado'}
                  </p>
                  <button
                    onClick={() => onSelectProfessional(pro, pro.services?.[0])}
                    className="w-full py-3 bg-primary text-white font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-primary-hover transition-all"
                  >
                    Ver horários
                    <span className="material-symbols-outlined text-[18px]">calendar_month</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
