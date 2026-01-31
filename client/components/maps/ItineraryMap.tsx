"use client";

import React, { useMemo } from "react";
import { Map, Marker, useMap } from "@vis.gl/react-google-maps";

interface Activity {
    time: string;
    activity: string;
    location: string;
    lat: number;
    lng: number;
}

interface Day {
    dayNumber: number;
    theme: string;
    activities: Activity[];
}

interface Itinerary {
    tripTitle: string;
    destination: string;
    days: Day[];
    tips: string[];
}

interface Props {
    itinerary: Itinerary;
}

export const ItineraryMap = ({ itinerary }: Props) => {
    const allActivities = useMemo(() => {
        return itinerary.days.flatMap((day) => day.activities);
    }, [itinerary]);

    const center = useMemo(() => {
        if (allActivities.length === 0) return { lat: 0, lng: 0 };

        const validCoords = allActivities.filter(a => a.lat !== 0 && a.lng !== 0);
        if (validCoords.length === 0) return { lat: 0, lng: 0 };

        const sumLat = validCoords.reduce((acc, a) => acc + a.lat, 0);
        const sumLng = validCoords.reduce((acc, a) => acc + a.lng, 0);

        return {
            lat: sumLat / validCoords.length,
            lng: sumLng / validCoords.length,
        };
    }, [allActivities]);

    return (
        <div className="w-full h-full min-h-[400px] rounded-3xl overflow-hidden border border-border bg-surface relative shadow-2xl shadow-black/5">
            <Map
                defaultCenter={center}
                defaultZoom={12}
                gestureHandling={"greedy"}
                disableDefaultUI={true}
                mapId="DEMO_MAP_ID" // Replace with actual Map ID if available for styling
            >
                {allActivities.map((activity, index) => {
                    if (activity.lat === 0 && activity.lng === 0) return null;
                    return (
                        <Marker
                            key={index}
                            position={{ lat: activity.lat, lng: activity.lng }}
                            title={activity.location}
                        />
                    );
                })}
            </Map>
        </div>
    );
};
