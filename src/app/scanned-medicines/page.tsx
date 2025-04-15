"use client";

import {Card, CardHeader, CardTitle, CardContent} from "@/components/ui/card";

const ScannedMedicinesPage = () => {
  return (
    <div className="flex flex-col items-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Scanned Medicines</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Feature in development: This page will display a list of previously scanned medicines.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default ScannedMedicinesPage;
