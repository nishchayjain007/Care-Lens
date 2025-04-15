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
import { VoiceCommandAgent } from "@/components/voice-command-agent";
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
import { ReminderDialog } from "@/components/reminder-dialog";

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
  const [medications, setMedications] = useState(dummyMedications);
  const [fontSize, setFontSize] = useState(16); // Default font size
  const { theme, setTheme } = useTheme();
  const [isSpeaking, setIsSpeaking] = useState(false);

  const handleAddMedication = (newMedication: any) => {
    setMedications([...medications, newMedication]);
  };

    const toggleSpeak = () => {
        if (!medicineInfo) return;

        const message = `Medicine Name: ${medicineInfo.name}, Usage: ${medicineInfo.instructions}, Dosage: ${medicineInfo.dosage}, Schedule: ${medicineInfo.schedule}, Frequency: ${medicineInfo.frequency}, Duration: ${medicineInfo.duration}, Side Effects: ${medicineInfo.sideEffects}`;

        if (isSpeaking) {
            window.speechSynthesis.cancel();
        } else {
            const utterance = new SpeechSynthesisUtterance(message);
            window.speechSynthesis.speak(utterance);
        }

        setIsSpeaking(!isSpeaking);
    };

  useEffect(() => {
    return () => window.speechSynthesis.cancel(); // Cleanup on unmount
  }, []);

  return (
    <SidebarProvider>
      <div className="flex h-screen">
        <main className="flex-1 p-4 flex flex-col items-center space-y-4" style={{ fontSize: `${fontSize}px` }}>
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="text-lg">Welcome to Care Lens+</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Your AI Powered Care Assistant.</p>
            </CardContent>
          </Card>

          <div className="flex space-x-2">
              <Button onClick={() => router.push('/medicine')}>
                  <Icons.camera className="mr-2 h-4 w-4" />
                  Identify Medicine
              </Button>

              <Button onClick={() => { /* Navigate to scanned medicines */ }}>
                  <Icons.listChecks className="mr-2 h-4 w-4" />
                  View Scanned Medicines
              </Button>
          </div>

            <div className="flex items-center space-x-2">
                <Button size="sm" onClick={() => setFontSize(fontSize - 2)}>A-</Button>
                <Button size="sm" onClick={() => setFontSize(fontSize + 2)}>A+</Button>
            </div>

            <div className="flex items-center space-x-2">
                <Label htmlFor="dark-mode">Dark Mode</Label>
                <Switch
                    id="dark-mode"
                    checked={theme === 'dark'}
                    onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
                />
            </div>

          <Dashboard />

          <MedicationForm onAddMedication={handleAddMedication} />
          <MedicationList medications={medications} />

            <Button onClick={toggleSpeak} disabled={!medicineInfo}>
                {isSpeaking ? 'Stop Info' : 'Speak Info'}
            </Button>
            <ReminderDialog />

          {isLoading && <Progress />}

          {medicineInfo && (
            <div className="mt-4 w-full max-w-md">
              <MedicineInfo
                name={medicineInfo.name}
                dosage={medicineInfo.dosage}
                instructions={medicineInfo.instructions}
                sideEffects={medicineInfo.sideEffects}
                purpose={medicineInfo.purpose}
              />
              <div className="flex justify-around mt-4">
                <WebSearchLink medicineName={medicineInfo.name} />
                <SOSButton />
              </div>
            </div>
          )}
           <VoiceCommandAgent/>

           <MicrophoneAnimation />
           <ChatCompanion/>
        </main>
      </div>
      <Toaster />
    </SidebarProvider>
  );
}
