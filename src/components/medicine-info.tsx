"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface MedicineInfoProps {
  name: string;
  dosage: string;
  instructions: string;
}

const MedicineInfo = ({
  name,
  dosage,
  instructions,
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
            <strong>Dosage:</strong> {dosage}
          </p>
          <p>
            <strong>Instructions:</strong> {instructions}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default MedicineInfo;

