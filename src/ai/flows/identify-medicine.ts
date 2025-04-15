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
          prompt: `Carefully extract all text from this image.`,
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
      medicineName: z.string().describe('The name of the medicine.'),
    }),
  },
  output: {
    schema: z.object({
      medicineInfo: z.string().describe('Information about the medicine'),
    }),
  },
  prompt: `You are an expert pharmacist. A user is requesting information about the medicine: {{{medicineName}}}.
  Use your knowledge and search the internet to extract details to be displayed on the UI such as the medicine dosage, instructions, side effects, and purpose of the medicine.
  Return the information in a concise manner. If you cannot find specific information, state that it's unavailable.`,
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
        error: "Could not extract text from the image. Please try again."
      };
    }

    // Attempt to extract the medicine name from the extracted text
    const extractedText = ocrResult.extractedText;
    const medicineNameMatch = extractedText.match(/([A-Za-z]+)/); // This regex looks for the first word to be used as medicine name
    const medicineName = medicineNameMatch ? medicineNameMatch[1].trim() : null;

    if (!medicineName) {
      return {
        medicineInfo: null,
        error: "Sorry, I wasn't able to extract the medicine name from the text in the image.",
      };
    }

    const medicineInformation = await extractMedicineInformation({ medicineName: medicineName });

    if (!medicineInformation.output?.medicineInfo) {
      return {
        medicineInfo: null,
        error: "Could not identify medicine. Please try again."
      };
    }

    // Split the information into sections based on common keywords
    const medicineInfoString = medicineInformation.output.medicineInfo;

    const nameMatch = medicineInfoString.match(/Name:\s*([^\n]+)/);
    const dosageMatch = medicineInfoString.match(/Dosage:\s*([^\n]+)/);
    const instructionsMatch = medicineInfoString.match(/Instructions:\s*([^\n]+)/);
    const sideEffectsMatch = medicineInfoString.match(/Side Effects:\s*([^\n]+)/);
    const purposeMatch = medicineInfoString.match(/Purpose:\s*([^\n]+)/);

    const name = medicineName; // Use extracted medicine name
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
      error: "Failed to identify medicine. Please try again."
    };
  }
});
