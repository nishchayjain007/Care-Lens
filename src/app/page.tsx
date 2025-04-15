"use client";

import { SidebarProvider } from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/toaster";
import Camera from "@/components/ui/camera";
import MedicineInfo from "@/components/medicine-info";
import ReminderDialog from "@/components/reminder-dialog";
import WebSearchLink from "@/components/web-search-link";
import SOSButton from "@/components/sos-button";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export default function Home() {
  const [medicineInfo, setMedicineInfo] = useState(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);

  const handleImageCapture = (imageSrc: string) => {
    setCapturedImage(imageSrc);
    // TODO: Implement logic to send image to GenAI for medicine identification
    // For now, setting dummy medicine info
    setMedicineInfo({
      name: "Example Medicine",
      dosage: "Take one tablet daily",
      instructions: "Take with food",
      sideEffects: "Drowsiness",
      purpose: "For pain relief",
    });
  };

  return (
    <SidebarProvider>
      <div className="flex h-screen">
        {/* Sidebar Content Goes Here */}
        <main className="flex-1 p-4 flex flex-col items-center">
          {/* Main Content */}
          <h1>Welcome to PillPal</h1>
          <p>Your personal medication companion.</p>

          {capturedImage ? (
            <div className="mt-4">
              <img src={capturedImage} alt="Scanned Medicine" className="max-w-md" />
              {medicineInfo && (
                <div className="mt-4">
                  <MedicineInfo
                    name={medicineInfo.name}
                    dosage={medicineInfo.dosage}
                    instructions={medicineInfo.instructions}
                    sideEffects={medicineInfo.sideEffects}
                    purpose={medicineInfo.purpose}
                  />
                  <div className="flex justify-around mt-4">
                    <ReminderDialog />
                    <WebSearchLink medicineName={medicineInfo.name} />
                    <SOSButton />
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="mt-4">
              <Camera onCapture={handleImageCapture} />
            </div>
          )}
          {/* Show the button only when no image is captured */}
          {!capturedImage && (
            <Button onClick={() => {
              // Placeholder function to simulate medicine identification without camera
              setMedicineInfo({
                name: "Example Medicine",
                dosage: "Take one tablet daily",
                instructions: "Take with food",
                sideEffects: "Drowsiness",
                purpose: "For pain relief",
              });
              setCapturedImage("https://picsum.photos/400/300"); // set some image url
            }} className="mt-4">
              Simulate Medicine Identification
            </Button>
          )}
        </main>
      </div>
      <Toaster />
    </SidebarProvider>
  );
}

