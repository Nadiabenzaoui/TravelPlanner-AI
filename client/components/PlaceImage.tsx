"use client";

import { useState, useEffect } from "react";
import { Image as ImageIcon, ImageOff } from "lucide-react";

interface PlaceImageProps {
    query: string;
    className?: string;
    width?: number;
    height?: number;
}

export function PlaceImage({ query, className, width = 800, height = 600 }: PlaceImageProps) {
    const [error, setError] = useState(false);

    // ... (omitted comments)

    // Fallback to "travel" if query is empty to avoid broken links
    const safeQuery = query?.trim() ? query : "travel";

    // ... (omitted keyword extraction)
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

    // Primary: LoremFlickr - Reliable stock photos based on keywords
    // We force "travel", "landmark", "tourism" to ensure the vibe matches the destination page
    const primaryUrl = `https://loremflickr.com/${width}/${height}/travel,landmark,tourism,${encodeURIComponent(keywords)}/all?lock=${seed}`;

    // Secondary: Pollinations AI - Generative fallback if stock photo fails
    const secondaryUrl = `https://pollinations.ai/p/${encodeURIComponent(safeQuery + " cinematic travel photography 4k")}?width=${width}&height=${height}&model=flux&seed=${seed}`;

    // Backup: Placehold.co - Last resort text placeholder
    const backupUrl = `https://placehold.co/${width}x${height}/EEE/31343C?text=${encodeURIComponent(safeQuery.substring(0, 30))}`;

    const [imgSrc, setImgSrc] = useState(primaryUrl);
    const [attempt, setAttempt] = useState(0);

    // Reset image source when query changes
    useEffect(() => {
        setImgSrc(primaryUrl);
        setAttempt(0);
        setError(false);
    }, [primaryUrl]);

    const handleError = () => {
        if (attempt === 0) {
            console.log("Primary (LoremFlickr) failed, switching to Pollinations for:", keywords);
            setImgSrc(secondaryUrl);
            setAttempt(1);
        } else if (attempt === 1) {
            console.log("Secondary (Pollinations) failed, switching to text placeholder for:", safeQuery);
            setImgSrc(backupUrl);
            setAttempt(2);
        } else {
            console.log("All image sources failed for:", safeQuery);
            setError(true);
        }
    };

    return (
        <div className={`relative overflow-hidden bg-surface ${className}`}>
            {!error ? (
                <img
                    src={imgSrc}
                    alt={query}
                    className="w-full h-full object-cover transition-transform duration-700 hover:scale-110"
                    onError={handleError}
                    loading="lazy"
                />
            ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-400">
                    {/* Fallback text if ALL images fail */}
                    <ImageOff className="w-8 h-8 mb-2 opacity-50" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-center px-2">{query || "Photo"}</span>
                </div>
            )}
        </div>
    );
}
