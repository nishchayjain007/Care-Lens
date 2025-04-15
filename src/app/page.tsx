"use client";

import { SidebarProvider } from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/toaster";
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import MedicineInfo from "@/components/medicine-info";
import WebSearchLink from "@/components/web-search-link";
import SOSButton from "@/components/sos-button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Icons } from "@/components/icons";
import { useRouter } from 'next/navigation';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { Progress } from "@/components/ui/progress";
import { MicrophoneAnimation } from "@/components/microphone-animation";
import { ChatCompanion } from "@/components/chat-companion";
import { useToast } from "@/hooks/use-toast";
import Dashboard from "@/components/dashboard";
import MedicationForm from "@/components/medication-form";
import MedicationList from "@/components/medication-list";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useTheme } from 'next-themes';
import { Separator } from "@/components/ui/separator";
import ReminderDialog from "@/components/reminder-dialog";

// Dummy data for the medication list
const dummyMedications = [
    { id: 1, name: "Aspirin", dosage: "100mg", schedule: "Daily" },
    { id: 2, name: "Lipitor", dosage: "20mg", schedule: "Evening" },
];

export default function Home() {
    const [medicineInfo, setMedicineInfo] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();
    const router = useRouter();
    const { theme, setTheme } = useTheme();
    const [fontSize, setFontSize] = useState(16);
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [capturedImage, setCapturedImage] = useState<string | null>(null);
    const [isListening, setIsListening] = useState(false);
    const [medications, setMedications] = useState(dummyMedications);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [hasCameraPermission, setHasCameraPermission] = useState(false);

    const toggleSpeak = () => {
        const message = medicineInfo
            ? `Name: ${medicineInfo.name}, Usage: ${medicineInfo.purpose}, Dosage: ${medicineInfo.dosage}, Schedule: ${medicineInfo.schedule}, Frequency: ${medicineInfo.frequency}, Duration: ${medicineInfo.duration}, Side Effects: ${medicineInfo.sideEffects}`
            : "No medicine information available.";

        if (!isSpeaking) {
            const utterance = new SpeechSynthesisUtterance(message);
            window.speechSynthesis.speak(utterance);
        } else {
            window.speechSynthesis.cancel();
        }
        setIsSpeaking(!isSpeaking);
    };

    useEffect(() => {
        return () => window.speechSynthesis.cancel(); // Cleanup on unmount
    }, []);

    return (
        <SidebarProvider>
            <div className="flex h-screen">
                <main className="flex-1 p-4 flex flex-col items-center space-y-4"
                      style={{
                          fontSize: `${fontSize}px`,
                      }}>
                    <Card className="w-full max-w-md">
                        <CardHeader>
                            <CardTitle>
                                Care Lens+
                                Your AI Powered Care Assistant
                            </CardTitle>
                        </CardHeader>
                    </Card>

                    <div className="flex space-x-2">
                        <Button onClick={() => router.push('/medicine')}>
                            <Icons.camera className="mr-2 h-4 w-4"/>
                            Identify Medicine
                        </Button>

                        <Button onClick={() => router.push('/scanned-medicines')}>
                            <Icons.listChecks className="mr-2 h-4 w-4"/>
                            View Scanned Medicines
                        </Button>
                    </div>

                    <div className="flex space-x-2">
                        <Button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
                            {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
                        </Button>
                    </div>

                    <div className="flex space-x-2">
                        <Button onClick={() => setFontSize(fontSize + 2)}>
                            A+
                        </Button>
                        <Button onClick={() => setFontSize(fontSize - 2)}>
                            A-
                        </Button>
                    </div>

                    {medicineInfo && (
                        <Card className="w-full max-w-md">
                            <MedicineInfo
                                name={medicineInfo.name}
                                dosage={medicineInfo.dosage}
                                instructions={medicineInfo.instructions}
                                sideEffects={medicineInfo.sideEffects}
                                purpose={medicineInfo.purpose}
                                schedule={medicineInfo.schedule}
                                frequency={medicineInfo.frequency}
                                duration={medicineInfo.duration}
                            />
                            <div className="flex justify-around mt-4">
                                <WebSearchLink medicineName={medicineInfo.name}/>
                                <SOSButton/>
                            </div>

                            <div className="flex justify-around mt-4">
                                <Button onClick={toggleSpeak}>
                                    {isSpeaking ? (
                                        Stop Info
                                    ) : (
                                        Speak Info
                                    )}
                                </Button>
                                <ReminderDialog/>
                            </div>
                        </Card>
                    )}
                </main>
            </div>
            <Toaster/>
        </SidebarProvider>
    );
}
