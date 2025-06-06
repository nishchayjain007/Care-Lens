"use client";

import { SidebarProvider } from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/toaster";
import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import WebSearchLink from "@/components/web-search-link";
import SOSButton from "@/components/sos-button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import MedicineInfo from "@/components/medicine-info";
import { Icons } from "@/components/icons";
import { useRouter } from 'next/navigation';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useTheme } from 'next-themes';
import { Separator } from "@/components/ui/separator";
import { MicrophoneAnimation } from "@/components/microphone-animation";
import { chatCompanion } from "@/ai/flows/chat-companion-flow";
import ReminderDialog from "@/components/reminder-dialog";
import Dashboard from "@/components/dashboard";
import { MedicationReminderAgent } from "@/components/medication-reminder-agent";
import { SafetyAgent } from "@/components/safety-agent";
import { Textarea } from "@/components/ui/textarea";
import { useToast} from "@/hooks/use-toast";
import MedicationForm from "@/components/medication-form";
import MedicationList from "@/components/medication-list";


// Dummy data for the medication list
const dummyMedications = [
    { id: 1, name: "Aspirin", dosage: "100mg", schedule: "Daily" },
    { id: 2, name: "Lipitor", dosage: "20mg", schedule: "Evening" },
];

export default function Home() {
    const [medicineInfo, setMedicineInfo] = useState<{
        name: string;
        dosage: string;
        instructions: string;
    } | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();
    const router = useRouter();
    const { setTheme, theme } = useTheme();
    const [fontSize, setFontSize] = useState(16);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [capturedImage, setCapturedImage] = useState<string | null>(null);
    const [isListening, setIsListening] = useState(false);
    const [medications, setMedications] = useState(dummyMedications);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [chatResponse, setChatResponse] = useState('');
    const [chatMessage, setChatMessage] = useState('');
    const [hasCameraPermission, setHasCameraPermission] = useState(false);
    const [alertSent, setAlertSent] = useState(false);

    const toggleSpeak = () => {
        if (!medicineInfo) {
            toast({
                title: "No medicine detected!",
                description: "Please identify a medicine first."
            });
            return;
        }

        if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(medicineInfo?.name + " " + medicineInfo?.dosage + " " + medicineInfo?.instructions);
            window.speechSynthesis.speak(utterance);
        } else {
            alert('Text-to-speech not supported in this browser.');
        }
        setIsSpeaking(!isSpeaking);
    };

    const handleSendMessage = async (msg: string = chatMessage) => {
        setIsLoading(true);
        try {
            const result = await chatCompanion({ message: msg });
            setChatResponse(result.response);
        } catch (error) {
            console.error("Error during chat:", error);
            setChatResponse("Sorry, I couldn't process your message. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const toggleListening = () => {
        setIsListening(prevIsListening => !prevIsListening);
    };

    const simulateFall = () => {
        // Simulate fall detection logic here
        setAlertSent(true);
        toast({
            title: "Fall Detected!",
            description: "Alert has been sent to emergency contacts.",
            duration: 5000,
        });
    };


    useEffect(() => {
        if (isListening) {
            // Start speech recognition
            // For simplicity, using a placeholder function
            startSpeechRecognition(setChatMessage, handleSendMessage, setIsListening);
        } else {
            // Stop speech recognition
            stopSpeechRecognition();
        }
        // Cleanup function to ensure speech recognition is stopped
        return () => stopSpeechRecognition();
    }, [isListening]);

    const addMedication = (newMedication: any) => {
        setMedications([...medications, newMedication]);
    };

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
                            <CardContent className="flex flex-col space-y-4">
                                <div className="flex space-x-2">
                                    <Button onClick={() => router.push('/medicine')}>
                                        <Icons.camera className="mr-2 h-4 w-4" />
                                        Identify Medicine
                                    </Button>

                                    <Button onClick={() => router.push('/scanned-medicines')}>
                                        <Icons.listChecks className="mr-2 h-4 w-4" />
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

                                <Card className="w-full max-w-md">
                                    <CardHeader>
                                        <CardTitle>Chat with Companion</CardTitle>
                                    </CardHeader>
                                    <CardContent className="grid gap-4">
                                        <div className="flex items-center">
                                            <Button onClick={toggleListening} disabled={isLoading}>
                                                {isListening ? 'Stop Listening' : 'Start Listening'}
                                                {isListening && <MicrophoneAnimation />}
                                            </Button>
                                        </div>
                                        <Textarea
                                            value={chatMessage}
                                            onChange={(e) => setChatMessage(e.target.value)}
                                            placeholder="Enter your message here..."
                                            className="resize-none"
                                        />
                                        <Button onClick={() => handleSendMessage()} disabled={isLoading}>
                                            {isLoading ? "Sending..." : "Send"}
                                        </Button>
                                        {chatResponse && (
                                            <div className="mt-2 p-3 rounded-md bg-secondary text-secondary-foreground">
                                                {chatResponse}
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                                <MedicationForm onAddMedication={addMedication} />
                                <MedicationList medications={medications} />

                                {medicineInfo && (
                                    <Card className="w-full max-w-md">
                                        <MedicineInfo
                                            name={medicineInfo.name}
                                            dosage={medicineInfo.dosage}
                                            instructions={medicineInfo.instructions}
                                        />
                                        <div className="flex justify-around mt-4">
                                            <WebSearchLink medicineName={medicineInfo.name} />
                                            <SOSButton />
                                        </div>

                                        <div className="flex justify-around mt-4">
                                            <Button onClick={toggleSpeak}>
                                                {isSpeaking ? (
                                                    "Stop Info"
                                                ) : (
                                                    "Speak Info"
                                                )}
                                            </Button>
                                            <ReminderDialog />
                                        </div>
                                    </Card>
                                )}
                                <Button onClick={simulateFall} disabled={alertSent}>
                                    {alertSent ? "Alert Sent!" : "Simulate Fall"}
                                </Button>
                            </CardContent>
                        </CardHeader>
                    </Card>
                    <Dashboard/>
                </main>
            </div>
            <Toaster />
        </SidebarProvider>
    );
}

function startSpeechRecognition(
    setChatMessage: (message: string) => void,
    handleSendMessage: (message: string) => void,
    setIsListening: (isListening: boolean) => void
) {
    console.log('Starting speech recognition (placeholder)');
    // Implement actual speech recognition logic here
}

function stopSpeechRecognition() {
    console.log('Stopping speech recognition (placeholder)');
    // Implement logic to stop speech recognition
}

