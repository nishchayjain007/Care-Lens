'use server';
/**
 * @fileOverview Extracts medicine information (dosage and instructions) from Gemini
 * based on the identified medicine name.
 */

import { ai } from '@/ai/ai-instance';
import { z } from 'genkit';

const ExtractMedicineInfoInputSchema = z.object({
  medicineName: z.string().describe('The name of the medicine to extract information for.'),
});
export type ExtractMedicineInfoInput = z.infer<typeof ExtractMedicineInfoInputSchema>;

const ExtractMedicineInfoOutputSchema = z.object({
  dosage: z.string().describe('Dosage information for the medicine.'),
  instructions: z.string().describe('Instructions for using the medicine.'),
});
export type ExtractMedicineInfoOutput = z.infer<typeof ExtractMedicineInfoOutputSchema>;

export async function extractMedicineInfo(input: ExtractMedicineInfoInput): Promise<ExtractMedicineInfoOutput> {
  return extractMedicineInfoFlow(input);
}

const medicineInfoPrompt = ai.definePrompt({
  name: 'medicineInfoPrompt',
  input: {
    schema: z.object({
      medicineName: z.string().describe('The name of the medicine.'),
    }),
  },
  output: {
    schema: z.object({
      dosage: z.string().describe('Dosage information for the medicine.'),
      instructions: z.string().describe('Instructions for using the medicine.'),
    }),
  },
  prompt: `You are an expert pharmacist. A user has provided the name of a medicine: {{medicineName}}.
Your task is to find the dosage and instructions for this medicine. Provide clear and concise information.
If the information is not available, state that it's unavailable.`,
});

const extractMedicineInfoFlow = ai.defineFlow<
  typeof ExtractMedicineInfoInputSchema,
  typeof ExtractMedicineInfoOutputSchema
>({
  name: 'extractMedicineInfoFlow',
  inputSchema: ExtractMedicineInfoInputSchema,
  outputSchema: ExtractMedicineInfoOutputSchema,
}, async input => {
  try {
    const medicineInformation = await medicineInfoPrompt({
      medicineName: input.medicineName
    });

    if (!medicineInformation.output) {
      return {
        dosage: "Dosage information not found.",
        instructions: "Instructions not found."
      };
    }

    return {
      dosage: medicineInformation.output.dosage,
      instructions: medicineInformation.output.instructions,
    };
  } catch (error: any) {
    console.error("Error extracting medicine information:", error);
    return {
      dosage: "Failed to retrieve dosage information. Please try again.",
      instructions: "Failed to retrieve instructions. Please try again."
    };
  }
});
