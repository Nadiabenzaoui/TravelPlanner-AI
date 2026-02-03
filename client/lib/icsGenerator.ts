export interface Activity {
    time: string;
    activity: string;
    location: string;
}

export interface Day {
    dayNumber: number;
    activities: Activity[];
}

export interface Itinerary {
    tripTitle: string;
    destination: string;
    days: Day[];
}

const formatDate = (date: Date): string => {
    return date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
};

export const generateICS = (itinerary: Itinerary, startDate: Date): string => {
    let icsContent = [
        "BEGIN:VCALENDAR",
        "VERSION:2.0",
        "PRODID:-//TravelPlannerAI//Itinerary//EN",
        "CALSCALE:GREGORIAN",
        "METHOD:PUBLISH"
    ].join("\r\n");

    itinerary.days.forEach((day) => {
        const dayDate = new Date(startDate);
        dayDate.setDate(startDate.getDate() + (day.dayNumber - 1));

        day.activities.forEach((activity, index) => {
            // Parse time (e.g., "09:00" or "Morning")
            // Default to 9:00 if parsing fails
            let hour = 9;
            let minute = 0;

            const timeMatch = activity.time.match(/(\d{1,2}):(\d{2})/);
            if (timeMatch) {
                hour = parseInt(timeMatch[1], 10);
                minute = parseInt(timeMatch[2], 10);
            }

            const startTime = new Date(dayDate);
            startTime.setHours(hour, minute, 0);

            // Default duration: 2 hours
            const endTime = new Date(startTime);
            endTime.setHours(hour + 2, minute, 0);

            const event = [
                "BEGIN:VEVENT",
                `UID:${Date.now()}-${day.dayNumber}-${index}@travelplanner.ai`,
                `DTSTAMP:${formatDate(new Date())}`,
                `DTSTART:${formatDate(startTime)}`,
                `DTEND:${formatDate(endTime)}`,
                `SUMMARY:${activity.activity}`,
                `DESCRIPTION:Activity in ${itinerary.destination}. Location: ${activity.location}`,
                `LOCATION:${activity.location}, ${itinerary.destination}`,
                "STATUS:CONFIRMED",
                "END:VEVENT"
            ].join("\r\n");

            icsContent += "\r\n" + event;
        });
    });

    icsContent += "\r\nEND:VCALENDAR";
    return icsContent;
};
