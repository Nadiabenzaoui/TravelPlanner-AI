"use client";

import { APIProvider, Map, AdvancedMarker, Pin } from "@vis.gl/react-google-maps";
import { useEffect, useState } from "react";

interface ItineraryMapProps {
    activities: {
        location: string;
        lat: number;
        lng: number;
        // Include full activity data to pass back on click
        [key: string]: any;
    }[];
    onMarkerClick?: (activity: any) => void;
}

export function ItineraryMap({ activities, onMarkerClick }: ItineraryMapProps) {
    const [center, setCenter] = useState({ lat: 0, lng: 0 });

    useEffect(() => {
        if (activities.length > 0) {
            // Calculate center
            const latSum = activities.reduce((acc, curr) => acc + curr.lat, 0);
            const lngSum = activities.reduce((acc, curr) => acc + curr.lng, 0);
            setCenter({
                lat: latSum / activities.length,
                lng: lngSum / activities.length
            });
        }
    }, [activities]);

    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

    if (!apiKey) {
        return (
            <div className="w-full h-full bg-surface rounded-3xl flex items-center justify-center border border-border">
                <p className="text-xs font-bold uppercase tracking-widest text-text-secondary">Map Key Missing</p>
            </div>
        );
    }

    if (activities.length === 0) {
        return (
            <div className="w-full h-full bg-surface rounded-3xl flex items-center justify-center border border-border">
                <p className="text-xs font-bold uppercase tracking-widest text-text-secondary opacity-50">Select a day to view map</p>
            </div>
        );
    }

    return (
        <div className="w-full h-full rounded-3xl overflow-hidden border border-border shadow-2xl">
            <APIProvider apiKey={apiKey}>
                <Map
                    mapId="DEMO_MAP_ID" // Required for AdvancedMarker
                    defaultCenter={center}
                    center={center}
                    defaultZoom={12}
                    gestureHandling={"greedy"}
                    disableDefaultUI={true}
                    className="w-full h-full"
                >
                    {activities.map((act, i) => (
                        <AdvancedMarker
                            key={i}
                            position={{ lat: act.lat, lng: act.lng }}
                            title={act.location}
                            onClick={() => onMarkerClick && onMarkerClick(act)}
                            className="cursor-pointer hover:scale-110 transition-transform"
                        >
                            <Pin background={"#000000"} glyphColor={"#ffffff"} borderColor={"#000000"} scale={1.2} />
                        </AdvancedMarker>
                    ))}
                </Map>
            </APIProvider>
        </div>
    );
}
