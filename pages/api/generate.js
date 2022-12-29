import { Configuration, OpenAIApi } from 'openai';

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);
const basePromptPrefix =
`
Please write out a list of key concepts required to explain the topic to me like I am five years old (ELI5). By this I mean assume the list of key concepts should assume I have no prior knowledge about the topic and so it should be an exhaustive list.

Topic:
`

const generateAction = async (req, res) => {
  console.log(`API: ${basePromptPrefix}${req.body.userInput}`)

  const baseCompletion = await openai.createCompletion({
    model: 'text-davinci-003',
    prompt: `${basePromptPrefix}${req.body.userInput}`,
    temperature: 0.8,
    max_tokens: 250,
  });
  
  const basePromptOutput = baseCompletion.data.choices.pop();

  // I build Prompt #2.
  const secondPrompt = 
  `
  Please give a brief introduction of the topic. Then take the list of key concepts and the topic and generate explanations of each concept. Really dig into each concept and explain it fundamentally in a simple and easy to understand way, try to make it so that a five year old could attempt to understand it.

  Title: ${req.body.userInput}

  Key Concepts: ${basePromptOutput.text}

  Explanation:
  `
  
  // I call the OpenAI API a second time with Prompt #2
  const secondPromptCompletion = await openai.createCompletion({
    model: 'text-davinci-003',
    prompt: `${secondPrompt}`,
    // I set a higher temperature for this one. Up to you!
    temperature: 0.85,
		// I also increase max_tokens.
    max_tokens: 1250,
  });
  
  // Get the output
  const secondPromptOutput = secondPromptCompletion.data.choices.pop();

  // Send over the Prompt #2's output to our UI instead of Prompt #1's.
  res.status(200).json({ output: secondPromptOutput });
};

export default generateAction;