"use client";

import { useState } from 'react';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

const ReminderDialog = () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
            <AlertDialogTrigger className="px-4 py-2 bg-accent text-accent-foreground rounded-md hover:bg-accent/80">
                Set Reminder
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Set Daily Reminder</AlertDialogTitle>
                    <AlertDialogDescription>
                        Configure the daily reminder for taking your medicine.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <div className="grid gap-4 py-4">
                    {/* Add reminder configuration UI here */}
                </div>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction>Save</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
};

export default ReminderDialog;
