"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface MedicationListProps {
  medications: { id: number; name: string; dosage: string; schedule: string }[];
}

const MedicationList: React.FC<MedicationListProps> = ({ medications }) => {
  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Medication List</CardTitle>
      </CardHeader>
      <CardContent>
        {medications.length > 0 ? (
          <ul className="list-none space-y-2">
            {medications.map((medication) => (
              <li key={medication.id} className="border rounded-md p-2">
                <p>
                  <strong>Name:</strong> {medication.name}
                </p>
                <p>
                  <strong>Dosage:</strong> {medication.dosage}
                </p>
                <p>
                  <strong>Schedule:</strong> {medication.schedule}
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <p>No medications added yet.</p>
        )}
      </CardContent>
    </Card>
  );
};

export default MedicationList;

