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

const ocrExtract = ai.defineFlow(
    {
      name: 'ocrExtract',
      inputSchema: z.object({
        photoUrl: z.string().describe('The URL of the scanned medicine packaging image.'),
      }),
      outputSchema: z.object({
        extractedText: z.string().describe('Text extracted from the image using OCR'),
      }),
    },
    async input => {
      try {
        // Call the Genkit model to extract text from the image
        const ocrResult = await ai.callModel('googleai/gemini-vision-pro', {
          prompt: `Extract all text from this image. Respond only with the extracted text, nothing else.`,
          input: {
            inlineData: {
              data: input.photoUrl,
              mimeType: 'image/png',
            },
          },
        });

        // Return the extracted text
        return { extractedText: ocrResult.output };
      } catch (error: any) {
        console.error("Error extracting text from image:", error);
        return { extractedText: "Failed to extract text from the image. Please try again." };
      }
    }
);

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
    // Call ocrExtract flow to get extracted text
    const ocrResult = await ocrExtract(input);
    if (ocrResult.extractedText) {
      console.log(`Extracted text: ${ocrResult.extractedText}`);
      return ocrResult.extractedText;
    } else {
      return 'Placeholder Medicine';
    }
  }
);

const medicineInfoPrompt = ai.definePrompt({
  name: 'medicineInfoPrompt',
  input: {
    schema: z.object({
      medicineName: z.string().describe('The name of the medicine.'),
    }),
  },
  output: {
    schema: z.object({
      dosage: z.string().describe('Dosage information, e.g., "Take one tablet daily".'),
      instructions: z.string().describe('Usage instructions, e.g., "Take with food".'),
      sideEffects: z.string().describe('Potential side effects, e.g., "Drowsiness".'),
      purpose: z.string().describe('The purpose of the medicine, e.g., "For pain relief".'),
    }),
  },
  prompt: `You are an expert pharmacist. A user has identified a medicine with the name {{{medicineName}}}.
Provide the dosage, instructions, side effects, and purpose of this medicine.
Ensure the information is accurate and concise.`,
});

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

    const medicineInformation = await medicineInfoPrompt({medicineName});

    return {
      medicineInfo: {
        name: medicineName,
        dosage: medicineInformation.output?.dosage || '',
        instructions: medicineInformation.output?.instructions || '',
        sideEffects: medicineInformation.output?.sideEffects || '',
        purpose: medicineInformation.output?.purpose || '',
      }
    };
  } catch (error: any) {
    console.error("Error identifying medicine:", error);
    return {
      medicineInfo: null,
      error: "Failed to identify medicine. Please try again."
    };
  }
});
