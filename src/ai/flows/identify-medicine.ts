'use server';
/**
 * @fileOverview Identifies medicine from a scanned image and retrieves its information.
 *
 * - identifyMedicine - A function that handles the medicine identification process.
 * - IdentifyMedicineInput - The input type for the identifyMedicine function.
 * - IdentifyMedicineOutput - The return type for the identifyMedicine function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';
import {getMedicineInfo, Medicine} from '@/services/medicine-database';

const IdentifyMedicineInputSchema = z.object({
  photoUrl: z.string().describe('The URL of the scanned medicine packaging image.'),
});
export type IdentifyMedicineInput = z.infer<typeof IdentifyMedicineInputSchema>;

const IdentifyMedicineOutputSchema = z.object({
  medicineInfo: z.nullable(z.object({
    name: z.string().describe('The name of the medicine.'),
    dosage: z.string().describe('Dosage information, e.g., "Take one tablet daily".'),
    instructions: z.string().describe('Usage instructions, e.g., "Take with food".'),
    sideEffects: z.string().describe('Potential side effects, e.g., "Drowsiness".'),
    purpose: z.string().describe('The purpose of the medicine, e.g., "For pain relief".'),
  })).describe('Information about the identified medicine, or null if not found.'),
  error: z.string().optional().describe('Error message if medicine identification fails.')
});
export type IdentifyMedicineOutput = z.infer<typeof IdentifyMedicineOutputSchema>;

export async function identifyMedicine(input: IdentifyMedicineInput): Promise<IdentifyMedicineOutput> {
  return identifyMedicineFlow(input);
}

const extractMedicineName = ai.defineTool(
  {
    name: 'extractMedicineName',
    description: 'Extracts the medicine name from the scanned image using OCR.',
    inputSchema: z.object({
      photoUrl: z.string().describe('The URL of the scanned medicine packaging image.'),
    }),
    outputSchema: z.string().describe('The extracted medicine name.'),
  },
  async input => {
    // TODO: Implement OCR logic to extract text from the image.
    // For now, return a placeholder medicine name.
    // IMPORTANT: Using a consistent placeholder to prevent issues with the medicine database lookup.
    // return 'Placeholder Medicine';
    // Implement OCR logic here
    // Use the AI to extract the medicine name from the image
    // This is a placeholder, replace with actual Genkit OCR call
    const medicineName = await ai.callModel('googleai/gemini-vision-pro', {
      prompt: `Extract the medicine name from this image. Be very precise.
      Respond only with the medicine name, nothing else.`,
      input: {
        inlineData: {
          data: input.photoUrl,
          mimeType: 'image/png',
        },
      },
    });
    console.log(`Extracted medicine name: ${medicineName.output}`);
    return medicineName.output;
  }
);

const identifyMedicinePrompt = ai.definePrompt({
  name: 'identifyMedicinePrompt',
  tools: [extractMedicineName],
  input: {
    schema: z.object({
      photoUrl: z.string().describe('The URL of the scanned medicine packaging image.'),
    }),
  },
  output: {
    schema: z.object({
      medicineName: z.string().describe('The identified medicine name.'),
    }),
  },
  prompt: `The user has scanned a medicine packaging.  The URL of the image is at {{{photoUrl}}}.  Extract the medicine name from the image using the extractMedicineName tool.`, // No Handlebars logic/await calls here!
});

const identifyMedicineFlow = ai.defineFlow<
  typeof IdentifyMedicineInputSchema,
  typeof IdentifyMedicineOutputSchema
>({
  name: 'identifyMedicineFlow',
  inputSchema: IdentifyMedicineInputSchema,
  outputSchema: IdentifyMedicineOutputSchema,
}, async input => {
  try {
    const {output: {medicineName}} = await identifyMedicinePrompt(input);

    const medicineInfo: Medicine | null = await getMedicineInfo(medicineName);

    return {
      medicineInfo: medicineInfo
        ? {
          name: medicineInfo.name,
          dosage: medicineInfo.dosage,
          instructions: medicineInfo.instructions,
          sideEffects: medicineInfo.sideEffects,
          purpose: medicineInfo.purpose,
        }
        : null,
    };
  } catch (error: any) {
    console.error("Error identifying medicine:", error);
    return {
      medicineInfo: null,
      error: "Failed to identify medicine. Please try again."
    };
  }
});
