"use client";

import { useState } from "react";
import Camera from "@/components/camera";
import MedicineInfo from "@/components/medicine-info";
import WebSearchLink from "@/components/web-search-link";
import SOSButton from "@/components/sos-button";
import { identifyMedicine } from "@/ai/flows/identify-medicine";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Icons } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

const MedicineIdentificationPage = () => {
  const [medicineInfo, setMedicineInfo] = useState(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleImageCapture = async (imageSrc: string) => {
    setCapturedImage(imageSrc);
    setMedicineInfo(null);
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const result = await identifyMedicine({ photoUrl: imageSrc });
      setIsLoading(false);

      if (result.medicineInfo) {
        setMedicineInfo(result.medicineInfo);
      } else if (result.error) {
        setErrorMessage(result.error);
      } else {
        setErrorMessage("Could not identify medicine. Please try again.");
      }
    } catch (error) {
      console.error("Error identifying medicine:", error);
      setIsLoading(false);
      setErrorMessage("Failed to identify medicine. Please try again.");
    }
  };

  return (
    <div className="flex flex-col items-center p-4">
      <h1 className="text-2xl font-semibold mb-4">Medicine Identification</h1>
      {capturedImage ? (
        <div className="mt-4">
          <img src={capturedImage} alt="Scanned Medicine" className="max-w-md rounded-md shadow-md" />
        </div>
      ) : (
        <div className="mt-4">
          <Camera onCapture={handleImageCapture} />
        </div>
      )}

      {isLoading && <Progress className="w-full max-w-md mt-4" />}

      {errorMessage && (
        <Alert variant="destructive" className="w-full max-w-md mt-4">
          <Icons.close className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}

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
    </div>
  );
};

export default MedicineIdentificationPage;
