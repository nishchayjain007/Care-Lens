"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface Medication {
    id: number;
    name: string;
    dosage: string;
    schedule: string;
}

interface MedicationReminderAgentProps {
    medications: Medication[];
}

export const MedicationReminderAgent: React.FC<MedicationReminderAgentProps> = ({ medications }) => {
    const [reminders, setReminders] = useState<string[]>([]);

    useEffect(() => {
        const upcomingMedications = medications.map(med => `Take ${med.dosage} of ${med.name} ${med.schedule}`);
        setReminders(upcomingMedications);

        // Simulate setting up actual reminders (e.g., using setTimeout)
        const timeouts = upcomingMedications.map((reminder, index) => {
            return setTimeout(() => {
                alert(reminder); // Show a basic alert for demonstration
            }, (index + 1) * 5000); // Simulate different reminder times
        });

        return () => {
            // Clear timeouts when the component unmounts
            timeouts.forEach(timeout => clearTimeout(timeout));
        };
    }, [medications]);

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle>Medication Reminder Agent</CardTitle>
            </CardHeader>
            <CardContent>
                {reminders.length > 0 ? (
                    <ul>
                        {reminders.map((reminder, index) => (
                            <li key={index}>{reminder}</li>
                        ))}
                    </ul>
                ) : (
                    <p>No medications scheduled.</p>
                )}
            </CardContent>
        </Card>
    );
};

export default MedicationReminderAgent;
