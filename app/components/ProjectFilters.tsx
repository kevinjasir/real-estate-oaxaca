"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, useCallback } from "react";

interface ProjectFiltersProps {
    locations: string[];
    minPrice: number;
    maxPrice: number;
    minSize: number;
    maxSize: number;
}

export default function ProjectFilters({
    locations,
    minPrice,
    maxPrice,
    minSize,
    maxSize,
}: ProjectFiltersProps) {
    const router = useRouter();
    const searchParams = useSearchParams();

    // Local state for filters
    const [location, setLocation] = useState(searchParams.get("location") || "");
    const [priceRange, setPriceRange] = useState<[number, number]>([
        Number(searchParams.get("minPrice")) || minPrice,
        Number(searchParams.get("maxPrice")) || maxPrice,
    ]);
    const [sizeRange, setSizeRange] = useState<[number, number]>([
        Number(searchParams.get("minSize")) || minSize,
        Number(searchParams.get("maxSize")) || maxSize,
    ]);
    const [projectStatus, setProjectStatus] = useState(searchParams.get("status") || "");

    // Debounce helper
    const createQueryString = useCallback(
        (name: string, value: string) => {
            const params = new URLSearchParams(searchParams.toString());
            if (value) {
                params.set(name, value);
            } else {
                params.delete(name);
            }
            return params.toString();
        },
        [searchParams]
    );

    const applyFilters = () => {
        const params = new URLSearchParams();
        if (location) params.set("location", location);
        if (priceRange[0] > minPrice) params.set("minPrice", priceRange[0].toString());
        if (priceRange[1] < maxPrice) params.set("maxPrice", priceRange[1].toString());
        if (sizeRange[0] > minSize) params.set("minSize", sizeRange[0].toString());
        if (sizeRange[1] < maxSize) params.set("maxSize", sizeRange[1].toString());
        if (projectStatus) params.set("status", projectStatus);

        router.push(`/proyectos?${params.toString()}`, { scroll: false });
    };

    const resetFilters = () => {
        setLocation("");
        setPriceRange([minPrice, maxPrice]);
        setSizeRange([minSize, maxSize]);
        setProjectStatus("");
        router.push("/proyectos", { scroll: false });
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
            <div className="flex flex-col md:flex-row gap-6 items-end">
                {/* Location Filter */}
                <div className="w-full md:w-1/4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Ubicación
                    </label>
                    <select
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    >
                        <option value="">Todas las ubicaciones</option>
                        {locations.map((loc) => (
                            <option key={loc} value={loc}>
                                {loc}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Price Range */}
                <div className="w-full md:w-1/4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Precio Máximo: ${priceRange[1].toLocaleString()}
                    </label>
                    <input
                        type="range"
                        min={minPrice}
                        max={maxPrice}
                        step={10000}
                        value={priceRange[1]}
                        onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                    />
                </div>

                {/* Size Range */}
                <div className="w-full md:w-1/4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tamaño Mínimo: {sizeRange[0]} m²
                    </label>
                    <input
                        type="range"
                        min={minSize}
                        max={maxSize}
                        step={10}
                        value={sizeRange[0]}
                        onChange={(e) => setSizeRange([parseInt(e.target.value), sizeRange[1]])}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                    />
                </div>

                {/* Buttons */}
                <div className="w-full md:w-1/4 flex gap-2">
                    <button
                        onClick={applyFilters}
                        className="flex-1 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors font-medium"
                    >
                        Filtrar
                    </button>
                    <button
                        onClick={resetFilters}
                        className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                        Limpiar
                    </button>
                </div>
            </div>
        </div>
    );
}
