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
        photoBase64: z.string().describe('The base64 encoded string of the scanned medicine packaging image.'),
      }),
      outputSchema: z.object({
        extractedText: z.string().describe('Text extracted from the image using OCR'),
      }),
    },
    async input => {
      try {
        // Call the Genkit model to extract text from the image
        const ocrResult = await ai.callModel('googleai/gemini-vision-pro', {
          prompt: `Carefully extract all text from this image. Ensure that the text is accurate and complete.`,
          input: {
            inlineData: {
              data: input.photoBase64,
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

const extractMedicineInformation = ai.definePrompt({
  name: 'extractMedicineInformation',
  input: {
    schema: z.object({
      scannedText: z.string().describe('The extracted text from the scanned image.'),
    }),
  },
  output: {
    schema: z.object({
      medicineInfo: z.string().describe('Information about the medicine, including name, dosage, instructions, side effects, and purpose.'),
    }),
  },
  prompt: `You are an expert pharmacist. A user has scanned text from a medicine packaging and is requesting information.
  The scanned text is: {{{scannedText}}}.
  Use your knowledge and search the internet to extract details to be displayed on the UI such as the medicine name, dosage, instructions, side effects, and purpose of the medicine.
  Return the information in a concise manner. If you cannot find specific information, state that it's unavailable.
  Focus on extracting the medicine name, dosage, and usage instructions if available.`,
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
    const ocrResult = await ocrExtract(input);
    if (!ocrResult.extractedText) {
      return {
        medicineInfo: null,
        error: "Could not extract text from the image. Please try again. Ensure the image is clear and well-lit."
      };
    }

    const medicineInformation = await extractMedicineInformation({ scannedText: ocrResult.extractedText });

    if (!medicineInformation.output?.medicineInfo) {
      return {
        medicineInfo: null,
        error: "Could not identify medicine information. Please try again with a clearer image."
      };
    }

    const medicineInfoString = medicineInformation.output.medicineInfo;

    // Improved parsing logic
    const nameMatch = medicineInfoString.match(/Name:\s*([^\n]+)/i);
    const dosageMatch = medicineInfoString.match(/Dosage:\s*([^\n]+)/i);
    const instructionsMatch = medicineInfoString.match(/Instructions:\s*([^\n]+)/i);
    const sideEffectsMatch = medicineInfoString.match(/Side Effects:\s*([^\n]+)/i);
    const purposeMatch = medicineInfoString.match(/Purpose:\s*([^\n]+)/i);

    const name = nameMatch ? nameMatch[1].trim() : "N/A";
    const dosage = dosageMatch ? dosageMatch[1].trim() : "N/A";
    const instructions = instructionsMatch ? instructionsMatch[1].trim() : "N/A";
    const sideEffects = sideEffectsMatch ? sideEffectsMatch[1].trim() : "N/A";
    const purpose = purposeMatch ? purposeMatch[1].trim() : "N/A";

    return {
      medicineInfo: {
        name: name,
        dosage: dosage,
        instructions: instructions,
        sideEffects: sideEffects,
        purpose: purpose,
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
