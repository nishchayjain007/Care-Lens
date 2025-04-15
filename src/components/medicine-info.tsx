"use client";

interface MedicineInfoProps {
    name: string;
    dosage: string;
    instructions: string;
    sideEffects: string;
    purpose: string;
}

const MedicineInfo = ({ name, dosage, instructions, sideEffects, purpose }: MedicineInfoProps) => {
    return (
        <div className="bg-secondary rounded-lg p-4">
            <h2 className="text-lg font-semibold">{name}</h2>
            <p><strong>Dosage:</strong> {dosage}</p>
            <p><strong>Instructions:</strong> {instructions}</p>
            <p><strong>Side Effects:</strong> {sideEffects}</p>
            <p><strong>Purpose:</strong> {purpose}</p>
        </div>
    );
};

export default MedicineInfo;
