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

export default function Home() {
  const [medicineInfo, setMedicineInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  return (
    <SidebarProvider>
      <div className="flex h-screen">
        <main className="flex-1 p-4 flex flex-col items-center space-y-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="text-lg">Welcome to PillPal</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Your personal medication companion.</p>
            </CardContent>
          </Card>

          <Button onClick={() => router.push('/medicine')}>
            <Icons.camera className="mr-2 h-4 w-4" />
            Identify Medicine
          </Button>

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
