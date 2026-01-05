
import React, { useState, useEffect } from 'react';
import { MOCK_PROFESSIONALS } from '../constants';
import { getSmartSuggestions } from '../services/geminiService';
import { supabase } from '../services/supabase';

interface SearchViewProps {
  onSelectProfessional: (pro: any, service: any) => void;
  onViewGallery?: (pro: any) => void;
}

export const SearchView: React.FC<SearchViewProps> = ({ onSelectProfessional, onViewGallery }) => {
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
      .select('*, reviews(rating), professional_gallery(*)')

      // Only show valid professionals (expiration_date >= today)
      .gte('expiration_date', new Date().toISOString().split('T')[0]);

    if (data) {
      const processed = data.map(pro => {
        const reviews = pro.reviews || [];
        const avg = reviews.length > 0
          ? reviews.reduce((acc: number, r: any) => acc + r.rating, 0) / reviews.length
          : 5.0;

        // Map Supabase relationship to expected interface property
        // @ts-ignore
        const gallery = pro.professional_gallery || [];

        return {
          ...pro,
          rating: avg,
          reviewCount: reviews.length,
          gallery_images: gallery
        };
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

  const [selectedCity, setSelectedCity] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('');

  // Helper to normalize text (Title Case)
  const toTitleCase = (str: string) => {
    return str
      .toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  // Extract unique values for filters
  const uniqueCities = React.useMemo(() => {
    const cities = professionals.map(p => p.city).filter(Boolean);
    // Normalize to Title Case to dedup (e.g. "Juiz de Fora" vs "JUiZ de FOrA")
    const normalized = cities.map(c => toTitleCase(c.trim()));
    return Array.from(new Set(normalized)).sort();
  }, [professionals]);

  const uniqueSpecialties = React.useMemo(() => {
    const specialties = professionals.map(p => p.specialty || p.category).filter(Boolean);
    // Normalize to Title Case (e.g. "Cabeleireiro" vs "CABELEIREIRO")
    const normalized = specialties.map(s => toTitleCase(s.trim()));
    return Array.from(new Set(normalized)).sort();
  }, [professionals]);

  const filteredPros = professionals.filter(pro => {
    const matchesSearch =
      pro.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (pro.category && pro.category.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (pro.specialty && pro.specialty.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (pro.services && Array.isArray(pro.services) && pro.services.some((s: any) => s.name.toLowerCase().includes(searchTerm.toLowerCase())));

    const matchesCity = !selectedCity || (pro.city && pro.city.toLowerCase() === selectedCity.toLowerCase());
    const matchesSpecialty = !selectedSpecialty ||
      (pro.specialty && pro.specialty.toLowerCase() === selectedSpecialty.toLowerCase()) ||
      (pro.category && pro.category.toLowerCase() === selectedSpecialty.toLowerCase());

    return matchesSearch && matchesCity && matchesSpecialty;
  });

  return (
    <div className="max-w-6xl mx-auto px-6 py-12 flex flex-col gap-10">
      <div className="flex flex-col gap-6 text-center">
        <h1 className="text-3xl md:text-4xl font-bold">O que você precisa hoje?</h1>

        <div className="flex flex-col gap-4 max-w-4xl mx-auto w-full">
          {/* Main Search Bar */}
          <div className="relative w-full">
            <div className="flex items-center h-14 bg-white dark:bg-surface-dark rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm focus-within:border-primary transition-all px-4 z-10 relative">
              <span className="material-symbols-outlined text-text-secondary mr-3">search</span>
              <input
                type="text"
                placeholder="Buscar por nome, serviço ou salão..."
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

          {/* Filters Row */}
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary">
                <span className="material-symbols-outlined text-[20px]">location_on</span>
              </div>
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="w-full h-12 pl-11 pr-4 bg-white dark:bg-surface-dark border border-gray-200 dark:border-gray-800 rounded-xl appearance-none focus:ring-2 ring-primary/20 outline-none text-sm font-medium cursor-pointer"
              >
                <option value="">Todas as cidades</option>
                {uniqueCities.map(city => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-text-secondary">
                <span className="material-symbols-outlined text-[20px]">expand_more</span>
              </div>
            </div>

            <div className="relative flex-1">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary">
                <span className="material-symbols-outlined text-[20px]">content_cut</span>
              </div>
              <select
                value={selectedSpecialty}
                onChange={(e) => setSelectedSpecialty(e.target.value)}
                className="w-full h-12 pl-11 pr-4 bg-white dark:bg-surface-dark border border-gray-200 dark:border-gray-800 rounded-xl appearance-none focus:ring-2 ring-primary/20 outline-none text-sm font-medium cursor-pointer"
              >
                <option value="">Todas as especialidades</option>
                {uniqueSpecialties.map(spec => (
                  <option key={spec} value={spec}>{spec}</option>
                ))}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-text-secondary">
                <span className="material-symbols-outlined text-[20px]">expand_more</span>
              </div>
            </div>
          </div>
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
                  {pro.gallery_enabled && (
                    <button
                      onClick={() => onViewGallery?.(pro)}
                      className="w-full py-3 bg-white text-primary border-2 border-primary font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-primary/5 transition-all mb-3"
                    >
                      Conheça meu trabalho
                      <span className="material-symbols-outlined text-[18px]">photo_library</span>
                    </button>
                  )}
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
