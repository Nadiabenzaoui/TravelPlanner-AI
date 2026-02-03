"use client";

import { useState, useEffect } from "react";
import { Image as ImageIcon, ImageOff } from "lucide-react";

interface PlaceImageProps {
    query: string;
    className?: string;
}

export function PlaceImage({ query, className }: PlaceImageProps) {
    const [error, setError] = useState(false);

    // Using unslash source for simple keyword based fetching
    // Format: https://source.unsplash.com/800x600/?keyword
    // Note: source.unsplash.com is deprecated but often still works for demos. 
    // Ideally we would use the API or a different placeholder service if it fails.
    // Fallback: https://images.unsplash.com/photo-1... (static) or similar based on simple logic.

    // Better Approach for Production: Use standard Unsplash API or a proxied service. 
    // For this prototype, we'll try a direct search url structure or a reliable placeholder service with keywords.
    // Let's use `pollinations.ai` or similar simple generative/search placeholder if unsplash source is down, 
    // OR just use unsplash source and handle error.

    // Fallback to "travel" if query is empty to avoid broken links
    const safeQuery = query?.trim() ? query : "travel";

    // Clean and truncate query to avoid URL length issues or invalid segments
    // 1. Remove brackets/parentheses and their content often containing extra details
    // 2. Limit to first 60 chars to be safe
    const cleanPrompt = safeQuery
        .replace(/\([^)]*\)/g, "") // Remove (text)
        .replace(/[^\w\s,]/g, "") // Remove special chars
        .split(" ").slice(0, 6).join(" ") // Keep first 6 words
        .trim();

    // Generate a deterministic seed from the query string
    // This ensures consistent images for the same activity, but unique images for different activities
    // avoiding the "same random image" issue on re-renders or hydration
    const getSeed = (str: string) => {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return Math.abs(hash);
    };
    const seed = getSeed(cleanPrompt);

    // Primary: Pollinations AI - High quality generative
    // We add the seed to verify uniqueness
    const primaryUrl = `https://pollinations.ai/p/${encodeURIComponent(cleanPrompt + " travel photography")}?width=800&height=600&model=flux&seed=${seed}`;

    // Secondary: LoremFlickr - Reliable keyword based stock photos
    // We use the deterministic seed for the lock, ensuring unique images per activity
    const secondaryUrl = `https://loremflickr.com/800/600/${encodeURIComponent(cleanPrompt.replace(/ /g, ","))}/all?lock=${seed}`;

    // Backup: Placehold.co - Last resort text placeholder
    const backupUrl = `https://placehold.co/800x600/EEE/31343C?text=${encodeURIComponent(cleanPrompt.substring(0, 30))}`;

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
            console.log("Primary image failed, switching to LoremFlickr for:", cleanPrompt);
            setImgSrc(secondaryUrl);
            setAttempt(1);
        } else if (attempt === 1) {
            console.log("Secondary image failed, switching to text placeholder for:", cleanPrompt);
            setImgSrc(backupUrl);
            setAttempt(2);
        } else {
            console.log("All image sources failed for:", cleanPrompt);
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
