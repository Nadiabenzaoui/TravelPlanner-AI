"use client";

export interface PlaceResult {
    name?: string;
    formatted_address?: string;
    place_id?: string;
}

interface Props {
    onPlaceSelect: (place: PlaceResult | null) => void;
    placeholder?: string;
    className?: string;
    onChange?: (value: string) => void;
}

export const GoogleMapsAutocomplete = ({ placeholder, className, onChange }: Props) => {
    return (
        <input
            type="text"
            placeholder={placeholder}
            className={className}
            onChange={(e) => onChange?.(e.target.value)}
        />
    );
};
