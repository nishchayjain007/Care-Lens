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
          prompt: `Carefully extract all text from this image, prioritizing the medicine name and any dosage instructions. Ensure that the text is accurate and complete. Return only the extracted text.`,
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

const googleSearch = ai.defineTool(
    {
      name: 'googleSearch',
      description: 'Searches the internet for information using Google Search.',
      inputSchema: z.object({
        query: z.string().describe('The search query to use.'),
      }),
      outputSchema: z.string().describe('The results of the search.'),
    },
    async input => {
      try {
        // Call the Genkit model to extract text from the image
        const searchResult = await ai.callModel('googleai/gemini-pro', {
          prompt: `You will use Google Search tool to search the internet to gather information. Return the search results.
Search query: ${input.query}`,
        });

        // Return the extracted text
        return searchResult.output;
      } catch (error: any) {
        console.error("Error searching information:", error);
        return "Failed to search for information. Please try again.";
      }
    }
);

const extractMedicineInformation = ai.definePrompt({
  name: 'extractMedicineInformation',
  tools: [googleSearch],
  input: {
    schema: z.object({
      medicineName: z.string().describe('The name of the medicine extracted from the scanned text.'),
    }),
  },
  output: {
    schema: z.object({
      dosage: z.string().describe('Dosage information, e.g., "Take one tablet daily".'),
      instructions: z.string().describe('Usage instructions, e.g., "Take with food".'),
    }),
  },
  prompt: `You are an expert pharmacist. A user has scanned text from a medicine packaging. 
The name of the medicine is {{{medicineName}}}.

I want you to use the Google Search tool to search the internet to extract details to be displayed on the UI such as the dosage and instructions of the medicine.

Return the dosage and instruction information in a concise manner. 
If you cannot find specific information, state that it's unavailable.
Focus on extracting the medicine name, dosage, and usage instructions if available.`,
});

const extractMedicineName = ai.definePrompt({
  name: 'extractMedicineName',
  input: {
    schema: z.object({
      scannedText: z.string().describe('The extracted text from the scanned image.'),
    }),
  },
  output: {
    schema: z.object({
      medicineName: z.string().describe('The name of the medicine extracted from the scanned text.'),
    }),
  },
  prompt: `You are an expert pharmacist. A user has scanned text from a medicine packaging.
The scanned text is: {{{scannedText}}}.
Carefully extract the name of the medicine from the scanned text. 
Return just the medicine name. If you cannot find the name, return "N/A".`,
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

    const medicineNameResult = await extractMedicineName({ scannedText: ocrResult.extractedText });
    const medicineName = medicineNameResult.output?.medicineName;

    if (!medicineName || medicineName === "N/A") {
       return {
         medicineInfo: null,
         error: "Sorry, I wasn't able to extract the medicine name from the text in the image."
       };
    }

    const medicineInformation = await extractMedicineInformation({
      medicineName: medicineName
    });

    if (!medicineInformation.output) {
      return {
        medicineInfo: null,
        error: "Could not identify medicine information. Please try again with a clearer image."
      };
    }

    return {
      medicineInfo: {
        name: medicineName,
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
