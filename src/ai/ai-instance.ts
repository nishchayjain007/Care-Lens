import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

export const ai = genkit({
  promptDir: './prompts',
  plugins: [
    googleAI({
      apiKey: 'AIzaSyBVUALcAAU_B18yO_368fY_yG_VtLLjUFA',
    }),
  ],
  model: 'googleai/gemini-2.0-flash',
});
