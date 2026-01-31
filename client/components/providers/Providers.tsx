"use client";

import { APIProvider } from "@vis.gl/react-google-maps";

export function Providers({ children }: { children: React.ReactNode }) {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

    // Si pas de clé API Google Maps, rendre les enfants sans le provider
    if (!apiKey) {
        return <>{children}</>;
    }

    return (
        <APIProvider apiKey={apiKey}>
            {children}
        </APIProvider>
    );
}
