"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface MedicineInfoProps {
  name: string;
  dosage: string;
  instructions: string;
  sideEffects: string;
  purpose: string;
  schedule: string;
  frequency: string;
  duration: string;
}

const MedicineInfo = ({
  name,
  dosage,
  instructions,
  sideEffects,
  purpose,
  schedule,
  frequency,
  duration,
}: MedicineInfoProps) => {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Detected: {name}</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="grid gap-2">
          <p>
            <strong>Name:</strong> {name}
          </p>
          <p>
            <strong>Usage:</strong> {purpose}
          </p>
          <p>
            <strong>Dosage:</strong> {dosage}
          </p>
          <p>
            <strong>Schedule:</strong> {schedule}
          </p>
          <p>
            <strong>Frequency:</strong> {frequency}
          </p>
          <p>
            <strong>Duration:</strong> {duration}
          </p>
          <p>
            <strong>Side Effects:</strong> {sideEffects}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default MedicineInfo;
