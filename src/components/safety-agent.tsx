"use client";

import React, { useState } from 'react';
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

export const SafetyAgent = () => {
    const [alertSent, setAlertSent] = useState(false);
    const { toast } = useToast();

    const simulateFall = () => {
        // Simulate fall detection logic here
        setAlertSent(true);
        toast({
            title: "Fall Detected!",
            description: "Alert has been sent to emergency contacts.",
            duration: 5000,
        });
    };

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle>Safety Agent - Fall Detection Demo</CardTitle>
            </CardHeader>
            <CardContent>
                <Button onClick={simulateFall} disabled={alertSent}>
                    {alertSent ? "Alert Sent!" : "Simulate Fall"}
                </Button>
            </CardContent>
        </Card>
    );
};

export default SafetyAgent;
