'use server';
/**
 * @fileOverview Identifies medicine from a scanned image and retrieves its information.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

const IdentifyMedicineInputSchema = z.object({
  photoBase64: z.string().describe('The base64 encoded string of the scanned medicine packaging image.'),
});
export type IdentifyMedicineInput = z.infer<typeof IdentifyMedicineInputSchema>;

const IdentifyMedicineOutputSchema = z.object({
  medicineInfo: z.nullable(z.object({
    name: z.string().describe('The name of the medicine.'),
    dosage: z.string().describe('Dosage information, e.g., "Take one tablet daily".'),
    instructions: z.string().describe('Usage instructions, e.g., "Take with food".'),
  })).describe('Information about the identified medicine, or null if not found.'),
  error: z.string().optional().describe('Error message if medicine identification fails.')
});
export type IdentifyMedicineOutput = z.infer<typeof IdentifyMedicineOutputSchema>;

export async function identifyMedicine(input: IdentifyMedicineInput): Promise<IdentifyMedicineOutput> {
  return identifyMedicineFlow(input);
}

const extractMedicineInformation = ai.definePrompt({
  name: 'extractMedicineInformation',
  input: {
    schema: z.object({
      photoBase64: z.string().describe('The base64 encoded string of the scanned medicine packaging image.'),
    }),
  },
  output: {
    schema: z.object({
      name: z.string().describe('The name of the medicine'),
      dosage: z.string().describe('Dosage information, e.g., "Take one tablet daily".'),
      instructions: z.string().describe('Usage instructions, e.g., "Take with food".'),
    }),
  },
  prompt: `You are an expert pharmacist. A user has provided an image of medicine packaging.
Analyze the image and extract the name of the medicine, dosage and instructions.

Here is the medicine packaging image: {{media url=photoBase64}}

Focus on extracting the medicine name, dosage, and usage instructions if available.

Return the information in a concise manner.
If you cannot find specific information, state that it's unavailable.`,
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
    const medicineInformation = await extractMedicineInformation({
      photoBase64: input.photoBase64
    });

    if (!medicineInformation.output) {
      return {
        medicineInfo: null,
        error: "Could not identify medicine information. Please try again with a clearer image."
      };
    }

    return {
      medicineInfo: {
        name: medicineInformation.output.name,
        dosage: medicineInformation.output.dosage,
        instructions: medicineInformation.output.instructions,
      }
    };
  } catch (error: any) {
    console.error("Error identifying medicine:", error);
    return {
      medicineInfo: null,
      error: "Failed to identify medicine. Please try again. Ensure the image is clear and well-lit."
    };
  }
});
