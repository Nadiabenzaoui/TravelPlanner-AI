"use client";

import React, { useEffect, useRef, useState } from "react";
import { useMapsLibrary } from "@vis.gl/react-google-maps";

interface Props {
    onPlaceSelect: (place: google.maps.places.PlaceResult | null) => void;
    placeholder?: string;
    className?: string;
}

export const GoogleMapsAutocomplete = ({ onPlaceSelect, placeholder, className }: Props) => {
    const [autocomplete, setAutocomplete] = useState<google.maps.places.Autocomplete | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const places = useMapsLibrary("places");

    useEffect(() => {
        if (!places || !inputRef.current) return;

        const options = {
            fields: ["formatted_address", "geometry", "name", "place_id"],
            types: ["(cities)"],
        };

        const newAutocomplete = new places.Autocomplete(inputRef.current, options);
        setAutocomplete(newAutocomplete);

        return () => {
            // Cleanup listener if needed, but Autocomplete doesn't have a direct removeListener for 'place_changed'
            // that is usually handled by the instance itself or not needed if input is unmounted
        };
    }, [places]);

    useEffect(() => {
        if (!autocomplete) return;

        const listener = autocomplete.addListener("place_changed", () => {
            onPlaceSelect(autocomplete.getPlace());
        });

        return () => {
            listener.remove();
        };
    }, [autocomplete, onPlaceSelect]);

    return (
        <input
            ref={inputRef}
            type="text"
            placeholder={placeholder}
            className={className}
        />
    );
};
