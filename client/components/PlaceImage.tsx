"use client";

import { useState, useEffect } from "react";
import { ImageOff } from "lucide-react";
import { useMapsLibrary } from "@vis.gl/react-google-maps";

interface PlaceImageProps {
    query: string;
    className?: string;
    width?: number;
    height?: number;
    priority?: boolean; // If true, prefers high-quality stock like Unsplash if Google fails
}

export function PlaceImage({ query, className, width = 800, height = 600, priority = false }: PlaceImageProps) {
    const placesLib = useMapsLibrary("places");
    const [imageSrc, setImageSrc] = useState<string | null>(null);
    const [error, setError] = useState(false);
    const [loading, setLoading] = useState(true);

    // Common Fallbacks
    const safeQuery = query?.trim() ? query : "travel";

    // Keyword extraction for better fallbacks
    const keywords = safeQuery
        .replace(/\([^)]*\)/g, "")
        .replace(/Arrive at|Transfer to|Check into|Visit|Explore|Lunch at|Dinner at|Walk around/gi, "")
        .replace(/[^\w\s,]/g, "")
        .trim()
        .split(" ")
        .slice(0, 3)
        .join(",");

    const getSeed = (str: string) => {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return Math.abs(hash);
    };
    const seed = getSeed(safeQuery);

    // Fallback URLs
    // We append "cinematic travel photography 4k" to ensure high quality style
    const pollinationsUrl = `https://pollinations.ai/p/${encodeURIComponent(safeQuery + " cinematic travel photography 4k")}?width=${width}&height=${height}&model=flux&seed=${seed}`;

    // 0 = Google, 1 = Unsplash Proxy, 2 = Pollinations
    // If priority is true, we skip Google (0) and start with Unsplash (1)
    const [attempt, setAttempt] = useState(priority ? 1 : 0);

    // Effect to try Google Places API first
    useEffect(() => {
        let isMounted = true;

        if (!placesLib || !query) {
            // If library not loaded yet or no query, just wait or if no API key standard fallback
            if (!placesLib && attempt === 0) {
                // If we've waited too long or decided Google isn't working, we can skip to next
                // For now, let's assume if placesLib is missing we skip straight to polliniations if we want to be fast
                // But typically it loads fast.
                // If apiKey is missing in Provider, useMapsLibrary might return null forever?
                // Let's set a timeout or check if we should fallback immediately if no placesLib after some time?
                // Actually, simpler: Start with attempt 0. If placesLib exists, try it. 
                // If it fails or returns no results, setAttempt(1).
                return;
            }
            return;
        }

        if (attempt !== 0) return; // Already moved to fallback

        setLoading(true);
        const svc = new placesLib.PlacesService(document.createElement('div'));

        const request = {
            query: query,
            fields: ['photos', 'name'] // We primarily need photos
        };

        svc.textSearch(request, (results, status) => {
            if (!isMounted) return;

            if (status === placesLib.PlacesServiceStatus.OK && results && results.length > 0 && results[0].photos && results[0].photos.length > 0) {
                // Get the first photo
                const photoUrl = results[0].photos[0].getUrl({ maxWidth: width, maxHeight: height });
                setImageSrc(photoUrl);
                setLoading(false);
            } else {
                console.log("Google Places found no photos for:", query);
                setAttempt(1); // Move to next fallback
            }
        });

        return () => { isMounted = false; };
    }, [placesLib, query, attempt, width, height]);

    // Effect to handle fallbacks when attempt changes
    useEffect(() => {
        let isMounted = true;

        const fetchUnsplash = async () => {
            try {
                // Remove specific activity verbs for better stock results
                const cleanQuery = safeQuery
                    .replace(/Arrive at|Transfer to|Check into|Visit|Explore|Lunch at|Dinner at|Walk around/gi, "")
                    .replace(/[^\w\s]/g, "")
                    .trim();

                const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
                const res = await fetch(`${apiUrl}/api/images/unsplash?query=${encodeURIComponent(cleanQuery)}`);

                if (!res.ok) throw new Error("Unsplash failed");

                const data = await res.json();
                if (isMounted) {
                    setImageSrc(data.url);
                    setLoading(false);
                }
            } catch (err) {
                console.warn("Unsplash fallback failed, moving to Pollinations");
                if (isMounted) setAttempt(2);
            }
        };

        if (attempt === 1) {
            fetchUnsplash();
        } else if (attempt === 2) {
            setImageSrc(pollinationsUrl);
            setLoading(false);
        } else if (attempt > 2) {
            setError(true);
        }

        return () => { isMounted = false; };
    }, [attempt, pollinationsUrl, safeQuery]);


    // Handle image load error (for the <img> tag)
    const handleImgError = () => {
        console.log(`Image source failed at attempt ${attempt}`);
        setAttempt(prev => prev + 1);
    };

    // If Google Places is taking too long (e.g. no API key), fallback after timeout?
    // Doing a simple check: if no API key is provided, useMapsLibrary likely returns null or throws.
    // Ideally we'd detect that. For now, rely on standard behavior.
    // If the imageSrc is set (either from Google or fallback), show it.

    return (
        <div className={`relative overflow-hidden bg-surface ${className}`}>
            {!error && imageSrc ? (
                <img
                    src={imageSrc}
                    alt={query}
                    className={`w-full h-full object-cover transition-transform duration-700 hover:scale-110 ${loading ? 'opacity-0' : 'opacity-100'}`}
                    onError={handleImgError}
                    onLoad={() => setLoading(false)}
                />
            ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-400">
                    <ImageOff className="w-8 h-8 mb-2 opacity-50" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-center px-2">{query || "Photo"}</span>
                </div>
            )}

            {/* Simple Skeleton layout while loading initial Google Maps or first image */}
            {loading && !error && (
                <div className="absolute inset-0 bg-gray-200 animate-pulse" />
            )}
        </div>
    );
}
