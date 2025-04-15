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
          prompt: `Carefully extract all text from this image, including the medicine name, dosage, and any instructions. Return the extracted text.`,
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

const extractMedicineName = ai.defineTool(
  {
    name: 'extractMedicineName',
    description: 'Extracts the medicine name from the extracted text using OCR. Be very precise and accurate in your response. Consider the text carefully. It is critical to extract the correct medicine name.',
    inputSchema: z.object({
      extractedText: z.string().describe('The extracted text from the image.'),
    }),
    outputSchema: z.string().describe('The extracted medicine name.'),
  },
  async input => {
    try {
      // Call the Genkit model to extract the medicine name from the extracted text
      const medicineNameResult = await ai.callModel('googleai/gemini-pro', {
        prompt: `Given the following text extracted from a medicine packaging, identify the medicine name. Respond only with the medicine name, nothing else. It is imperative to be accurate, so please double-check the text. \n\nExtracted Text: ${input.extractedText}`,
      });
      return medicineNameResult.output;
    } catch (error: any) {
      console.error("Error extracting medicine name from text:", error);
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
  Search for information about this medicine, focusing on dosage, instructions, side effects, and purpose.
  Ensure the information is accurate and concise.`,
});

const identifyMedicinePrompt = ai.definePrompt({
  name: 'identifyMedicinePrompt',
  tools: [extractMedicineName],
  input: {
    schema: z.object({
      photoBase64: z.string().describe('The base64 encoded string of the scanned medicine packaging image.'),
    }),
  },
  output: {
    schema: z.object({
      medicineName: z.string().describe('The identified medicine name.'),
    }),
  },
  prompt: `The user has scanned a medicine packaging.  The base64 encoded string of the image is at {{{photoBase64}}}. First, use OCR to extract all text from the image.  Then, use the extractMedicineName tool to extract the medicine name from the extracted text.`, // No Handlebars logic/await calls here!
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
      const { output: { medicineName } } = await identifyMedicinePrompt({ photoBase64: input.photoBase64 });

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
