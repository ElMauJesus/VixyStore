'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Banner {
    id: number;
    imagen_url: string;
    titulo?: string;
    subtitulo?: string;
    texto_boton?: string;
    enlace_boton?: string;
    orden: number;
}

interface BannerCarouselProps {
    banners: Banner[];
    intervalo?: number;
}

export default function BannerCarousel({ banners, intervalo = 5000 }: BannerCarouselProps) {
    const [current, setCurrent] = useState(0);

    useEffect(() => {
        if (banners.length <= 1) return;
        const timer = setInterval(() => {
            setCurrent((prev) => (prev + 1) % banners.length);
        }, intervalo);
        return () => clearInterval(timer);
    }, [banners.length, intervalo]);

    const next = () => setCurrent((prev) => (prev + 1) % banners.length);
    const prev = () => setCurrent((prev) => (prev - 1 + banners.length) % banners.length);

    if (banners.length === 0) return null;

    return (
        <div className="relative w-full h-64 md:h-96 lg:h-[420px] rounded-3xl overflow-hidden shadow-lg">
            {banners.map((banner, index) => (
                <div
                    key={banner.id}
                    className={`absolute inset-0 transition-opacity duration-700 ${index === current ? 'opacity-100 z-10' : 'opacity-0 z-0'
                        }`}
                >
                    <Image
                        src={banner.imagen_url}
                        alt={banner.titulo || 'Banner'}
                        fill
                        className="object-cover"
                        priority={index === 0}
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/30 to-transparent p-8 md:p-12 flex flex-col justify-center">
                        {banner.titulo && (
                            <h1 className="text-white text-2xl md:text-4xl font-black uppercase leading-tight mb-2">
                                {banner.titulo}
                            </h1>
                        )}
                        {banner.subtitulo && (
                            <p className="text-white/90 text-sm md:text-base mb-4 max-w-lg">
                                {banner.subtitulo}
                            </p>
                        )}
                        {banner.texto_boton && banner.enlace_boton && (
                            <Link
                                href={banner.enlace_boton}
                                className="inline-flex items-center gap-2 bg-[#5A20CB] hover:bg-[#4715c0] text-white text-sm font-bold px-5 py-2.5 rounded-xl self-start transition-colors"
                            >
                                {banner.texto_boton}
                                <ChevronRight className="w-4 h-4" />
                            </Link>
                        )}
                    </div>
                </div>
            ))}

            {/* Controles */}
            {banners.length > 1 && (
                <>
                    <button
                        onClick={prev}
                        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/20 hover:bg-white/40 backdrop-blur-sm text-white flex items-center justify-center transition-colors"
                        aria-label="Anterior"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                        onClick={next}
                        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/20 hover:bg-white/40 backdrop-blur-sm text-white flex items-center justify-center transition-colors"
                        aria-label="Siguiente"
                    >
                        <ChevronRight className="w-5 h-5" />
                    </button>

                    {/* Indicadores */}
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-2">
                        {banners.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => setCurrent(index)}
                                className={`w-2 h-2 rounded-full transition-all ${index === current ? 'bg-white w-6' : 'bg-white/50'
                                    }`}
                                aria-label={`Banner ${index + 1}`}
                            />
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}