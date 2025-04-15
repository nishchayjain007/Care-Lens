"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface MedicationFormProps {
  onAddMedication: (medication: any) => void;
}

const MedicationForm: React.FC<MedicationFormProps> = ({ onAddMedication }) => {
  const [name, setName] = useState("");
  const [dosage, setDosage] = useState("");
  const [schedule, setSchedule] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name && dosage && schedule) {
      const newMedication = {
        id: Date.now(),
        name,
        dosage,
        schedule,
      };
      onAddMedication(newMedication);
      setName("");
      setDosage("");
      setSchedule("");
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Add Medication</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
          <Input
            type="text"
            placeholder="Medication Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <Input
            type="text"
            placeholder="Dosage"
            value={dosage}
            onChange={(e) => setDosage(e.target.value)}
          />
          <Input
            type="text"
            placeholder="Schedule"
            value={schedule}
            onChange={(e) => setSchedule(e.target.value)}
          />
          <Button type="submit">Add</Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default MedicationForm;
