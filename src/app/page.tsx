"use client";

import React, { useState, useEffect, useRef } from "react";
import { Toaster } from "@/components/ui/toaster";
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
import { useTheme } from 'next-themes';
import { Separator } from "@/components/ui/separator";
import { MicrophoneAnimation } from "@/components/microphone-animation";
import {chatCompanion} from "@/ai/flows/chat-companion-flow";
import ReminderDialog from "@/components/reminder-dialog";
import { useToast } from "@/hooks/use-toast";
import { SidebarProvider } from "@/components/ui/sidebar";
import {Textarea} from "@/components/ui/textarea";

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

    const toggleSpeak = () => {
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

    useEffect(() => {
        if (isListening) {
            startSpeechRecognition(setChatMessage, handleSendMessage, setIsListening);
        } else {
            stopSpeechRecognition();
        }
        return () => stopSpeechRecognition();
    }, [isListening]);

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
+                                      <Textarea
+                                          value={chatMessage}
+                                          onChange={(e) => setChatMessage(e.target.value)}
+                                          placeholder="Enter your message here..."
+                                          className="resize-none"
+                                      />
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

                                 {medicineInfo && (
                                     
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
                                     
                                 )}
                            </CardContent>
                        </CardHeader>
                    </Card>
                </main>
            </div>
            
            
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
