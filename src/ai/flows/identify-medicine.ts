'use server';
/**
 * @fileOverview Identifies medicine from a scanned image, extracts the medicine name,
 * and retrieves its information (dosage and instructions) using Gemini.
 */

import { ai } from '@/ai/ai-instance';
import { z } from 'genkit';
import { extractMedicineInfo } from './extract-medicine-info'; // Import the new flow

const IdentifyMedicineInputSchema = z.object({
  photoBase64: z.string().describe('The base64 encoded string of the scanned medicine packaging image.'),
});
export type IdentifyMedicineInput = z.infer<typeof IdentifyMedicineInputSchema>;

const IdentifyMedicineOutputSchema = z.object({
  name: z.string().describe('The name of the medicine extracted from the image.'),
  dosage: z.string().describe('Dosage information, e.g., "Take one tablet daily".'),
  instructions: z.string().describe('Usage instructions, e.g., "Take with food".'),
  error: z.string().optional().describe('Error message if medicine identification fails.')
});
export type IdentifyMedicineOutput = z.infer<typeof IdentifyMedicineOutputSchema>;

export async function identifyMedicine(input: IdentifyMedicineInput): Promise<IdentifyMedicineOutput> {
  return identifyMedicineFlow(input);
}

const ocrExtract = ai.definePrompt({
  name: 'ocrExtract',
  input: {
    schema: z.object({
      photoBase64: z.string().describe('The base64 encoded string of the scanned medicine packaging image.'),
    }),
  },
  output: {
    schema: z.object({
      text: z.string().describe('The extracted text from the image.'),
    }),
  },
  prompt: `You are an OCR (Optical Character Recognition) expert. You will be given an image of medicine packaging.
Your task is to extract all the text from the image.

Here is the medicine packaging image: {{media url=photoBase64}}

Extracted text:`,
});

const extractMedicineName = ai.definePrompt({
  name: 'extractMedicineName',
  input: {
    schema: z.object({
      text: z.string().describe('The extracted text from the image.'),
    }),
  },
  output: {
    schema: z.object({
      medicineName: z.string().describe('The name of the medicine.'),
    }),
  },
  prompt: `You are a medical expert. A user has provided the following text extracted from medicine packaging:
{{text}}

Your task is to identify the name of the medicine from the text.
Medicine Name:`,
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
    // 1. Extract text from the image using OCR
    const ocrResult = await ocrExtract({
      photoBase64: input.photoBase64
    });

    if (!ocrResult.output) {
      return {
        name: "N/A",
        dosage: "N/A",
        instructions: "N/A",
        error: "Could not extract text from the image. Please try again with a clearer image."
      };
    }

    // 2. Extract the medicine name from the extracted text
    const medicineNameResult = await extractMedicineName({
      text: ocrResult.output.text
    });

    if (!medicineNameResult.output) {
      return {
        name: "N/A",
        dosage: "N/A",
        instructions: "N/A",
        error: "Sorry, I wasn't able to extract the medicine name from the text in the image."
      };
    }

    const medicineName = medicineNameResult.output.medicineName;

    // 3. Get dosage and instructions from extractMedicineInfoFlow
    const medicineInfo = await extractMedicineInfo({
      medicineName: medicineName
    });

    return {
      name: medicineName,
      dosage: medicineInfo.dosage,
      instructions: medicineInfo.instructions,
      error: "" // Clear any previous errors
    };
  } catch (error: any) {
    console.error("Error identifying medicine:", error);
    return {
      name: "N/A",
      dosage: "N/A",
      instructions: "N/A",
      error: "Failed to identify medicine. Please try again. Ensure the image is clear and well-lit."
    };
  }
});
