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
import {chatCompanion} from "@/ai/flows/chat-companion-flow";
import ReminderDialog from "@/components/reminder-dialog";
import {Textarea} from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import Dashboard from "@/components/dashboard";
import { MedicationReminderAgent } from "@/components/medication-reminder-agent";
import { SafetyAgent } from "@/components/safety-agent";

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
     const [isSpeakingChatResponse, setIsSpeakingChatResponse] = useState(false);
     const [chatResponse, setChatResponse] = useState('');
     const [chatMessage, setChatMessage] = useState('');
     const [hasCameraPermission, setHasCameraPermission] = useState(false);

    const toggleSpeak = () => {
        if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(medicineInfo?.name + " " + medicineInfo?.dosage + " " + medicineInfo?.instructions);
            window.speechSynthesis.speak(utterance);

            utterance.onstart = () => setIsSpeaking(true);
            utterance.onend = () => setIsSpeaking(false);
            utterance.onerror = () => setIsSpeaking(false);

        } else {
            console.warn('Speech synthesis is not supported in this browser.');
            toast({title: 'Speech synthesis not supported', description: 'Your browser does not support text to speech.'});
            setIsSpeaking(false);
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

   const speak = (text: string) => {
        if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(text);
            window.speechSynthesis.speak(utterance);

            utterance.onstart = () => setIsSpeakingChatResponse(true);
            utterance.onend = () => setIsSpeakingChatResponse(false);
            utterance.onerror = () => setIsSpeakingChatResponse(false);

        } else {
            console.warn('Speech synthesis is not supported in this browser.');
            toast({title: 'Speech synthesis not supported', description: 'Your browser does not support text to speech.'});
            setIsSpeakingChatResponse(false);
        }
    };

    const toggleListening = () => {
        setIsListening(prevIsListening => !prevIsListening);
    };

    useEffect(() => {
        let recognition: SpeechRecognition | null = null;

        if ('webkitSpeechRecognition' in window) {
            recognition = new webkitSpeechRecognition();
            recognition.continuous = false;
            recognition.interimResults = false;
            recognition.lang = 'en-US';

            recognition.onstart = () => {
                setIsListening(true);
                setChatMessage('');
            };

            recognition.onresult = (event) => {
                const transcript = Array.from(event.results)
                    .map(result => result[0])
                    .map(result => result.transcript)
                    .join('');

                setChatMessage(transcript);
                 handleSendMessage(transcript);
            };

            recognition.onend = () => {
                setIsListening(false);
            };

            recognition.onerror = (event) => {
                console.error('Speech recognition error:', event.error);
                setIsListening(false);
            };
        } else {
            console.warn('Web Speech API is not supported in this browser.');
        }

        const startListening = () => {
            if (recognition) {
                try {
                    recognition.start();
                } catch (error) {
                    console.error('Error starting recognition:', error);
                    setIsListening(false);
                }
            }
        };

        const stopListening = () => {
            if (recognition && isListening) {
                recognition.stop();
            }
        };

        if (isListening && recognition) {
            startListening();
        }

        return () => {
            stopListening();
            if (recognition) {
                recognition.onstart = null;
                recognition.onresult = null;
                recognition.onend = null;
                recognition.onerror = null;
            }
        };
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
                        </CardHeader>
                        <CardContent className="flex flex-col space-y-4">
                                 <Dashboard />

                                 <MedicationReminderAgent medications={medications} />

                                  <SafetyAgent />

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
+                                          <Button onClick={toggleSpeakChatResponse} disabled={isLoading}>
+                                            {isSpeakingChatResponse ? (
+                                                "Stop Speaking"
+                                            ) : "Speak Info"}
+                                        </Button>
                                     </CardContent>
                                 </Card>
 
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
@@ -270,3 +312,4 @@
     );
 }
 
+
+