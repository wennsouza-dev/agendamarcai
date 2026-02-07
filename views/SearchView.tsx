
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
              {/* Cover Image */}
              <div className="h-32 bg-[#E0F2FE] dark:bg-[#1E252B] relative overflow-hidden group-hover:bg-[#dbeafe] transition-colors">
                {/* Solid light blue background as requested */}
              </div>

              <div className="px-5 pb-5 relative">
                {/* Avatar & Rating Container */}
                <div className="absolute -top-10 left-4 flex flex-col items-center z-10 w-20">
                  {/* Circular Avatar */}
                  <div className="size-20 rounded-full border-4 border-white dark:border-[#1E252B] overflow-hidden shadow-md bg-white">
                    <img
                      src={pro.image_url || 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=800'}
                      className="w-full h-full object-cover"
                      alt={pro.name}
                    />
                  </div>
                  {/* Rating Badge - Below Photo */}
                  <div className="mt-1 bg-white dark:bg-[#283039] px-2 py-0.5 rounded-full border border-gray-100 dark:border-gray-700 shadow-sm flex items-center gap-1">
                    <span className="material-symbols-outlined text-yellow-400 text-xs fill-1">star</span>
                    <span className="text-xs font-bold text-slate-700 dark:text-gray-200">{pro.rating?.toFixed(1) || '5.0'}</span>
                  </div>
                </div>

                {/* Content - Information (Aligned right of avatar) */}
                <div className="pl-24 pt-1">
                  <div>
                    <h3 className="text-lg font-bold group-hover:text-primary transition-colors leading-tight">{pro.name}</h3>

                    {pro.salon_name && pro.salon_name !== 'N/A' && (
                      <p className="text-sm font-bold text-text-secondary mt-0.5">{pro.salon_name}</p>
                    )}

                    <p className="text-sm text-text-secondary font-medium mt-0.5">
                      {pro.specialty || pro.category}
                    </p>

                    <p className="text-sm text-text-secondary font-medium mt-0.5 capitalize">
                      {pro.city || pro.location || 'Local não informado'}
                    </p>
                  </div>
                </div>

                {/* Action Buttons & Links */}
                <div className="pt-5 flex flex-col gap-2">
                  {/* WhatsApp Button "Fale comigo" */}
                  {pro.whatsapp && (
                    <a
                      href={`https://wa.me/55${pro.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent("Olá, vim pelo MarcAI Agenda. Gostaria de mais informações.")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-2 bg-emerald-50 text-emerald-600 border border-emerald-200 font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-emerald-100 transition-all text-sm mb-1"
                    >
                      <span className="material-symbols-outlined text-[18px]">chat</span>
                      Fale comigo
                    </a>
                  )}

                  {/* Location Link (Google Maps) */}
                  <a
                    href={pro.address || pro.city || pro.location ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${pro.address ? `${pro.address} - ` : ''}${pro.city || pro.location}`)}` : '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-text-secondary hover:text-primary transition-colors flex items-center justify-center gap-1 text-center mb-2"
                    onClick={(e) => !(pro.address || pro.city || pro.location) && e.preventDefault()}
                  >
                    <span className="material-symbols-outlined text-sm shrink-0">location_on</span>
                    <span className="truncate max-w-[250px]">
                      {pro.address ? `${pro.address} - ` : ''}{pro.city || pro.location || 'Endereço não informado'}
                    </span>
                  </a>

                  {pro.gallery_enabled && pro.gallery_images?.length > 0 && (
                    <button
                      onClick={() => onViewGallery?.(pro)}
                      className="w-full py-3 bg-white dark:bg-transparent text-primary border-2 border-primary font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-primary/5 transition-all text-sm"
                    >
                      Galeria de Fotos
                      <span className="material-symbols-outlined text-[18px]">photo_library</span>
                    </button>
                  )}
                  <button
                    onClick={() => onSelectProfessional(pro, pro.services?.[0])}
                    className="w-full py-3 bg-primary text-white font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-primary-hover transition-all text-sm"
                  >
                    Agendar Horário
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
