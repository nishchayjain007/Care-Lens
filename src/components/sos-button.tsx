"use client";

import { Icons } from "@/components/icons";
import { Button } from "@/components/ui/button";

const SOSButton = () => {
    const handleSOS = () => {
        // Implement SOS functionality here, e.g., call ambulance
        alert("Calling for ambulance...");
    };

    return (
        <Button onClick={handleSOS} variant="destructive">
            <Icons.phoneCall className="mr-2 h-4 w-4" />
            Emergency SOS
        </Button>
    );
};

export default SOSButton;
