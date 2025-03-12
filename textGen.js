require("dotenv/config");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require("fs");

const genAI = new GoogleGenerativeAI(`${process.env.API_KEY}`);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

const prompt = "Explain how AI works";

const generateText = async () => {
  try {
    const result = await model.generateContent(prompt);
    console.log(result.response.text());
  } catch (error) {
    console.error(error);
  }
};

function fileToGenerativePart(path, mimeType) {
  return {
    inlineData: {
      data: Buffer.from(fs.readFileSync(path)).toString("base64"),
      mimeType,
    },
  };
}

const textWithImage = async () => {
  try {
    const prompt = "Describe how this product might be manufactured.";
    const imagePart = fileToGenerativePart(
      "./assets/download.png",
      "image/png"
    );

    const result = await model.generateContent([prompt, imagePart]);
    console.log(result.response.text());
  } catch (error) {
    console.error(error);
  }
};

const textStream = async () => {
  try {
    const result = await model.generateContentStream(prompt);

    for await (const chunk of result.stream) {
      const chunkText = chunk.text();
      process.stdout.write(chunkText);
    }
  } catch (error) {
    console.error(error);
  }
};

const chatConversation = async () => {
  const chat = model.startChat({
    history: [
      {
        role: "user",
        parts: [{ text: "Hello" }],
      },
      {
        role: "model",
        parts: [{ text: "Great to meet you. What would you like to know?" }],
      },
    ],
  });

  let result = await chat.sendMessage("I have 2 dogs in my house.");
  console.log(result.response.text());
  let result2 = await chat.sendMessage("How many paws are in my house?");
  console.log(result2.response.text());
};

const streamChatConversation = async () => {
  const chat = model.startChat({
    history: [
      {
        role: "user",
        parts: [{ text: "Hello" }],
      },
      {
        role: "model",
        parts: [{ text: "Great to meet you. What would you like to know?" }],
      },
    ],
  });

  let result = await chat.sendMessageStream("I have 2 dogs in my house.");
  for await (const chunk of result.stream) {
    const chunkText = chunk.text();
    process.stdout.write(chunkText);
  }
  let result2 = await chat.sendMessageStream("How many paws are in my house?");
  for await (const chunk of result2.stream) {
    const chunkText = chunk.text();
    process.stdout.write(chunkText);
  }
};

const generateConfiguration = async () => {
  const result = await model.generateContent({
    contents: [
      {
        role: "user",
        parts: [
          {
            text: "Explain how AI works",
          },
        ],
      },
    ],
    generationConfig: {
      maxOutputTokens: 1000,
      temperature: 0.1,
    },
  });

  console.log(result.response.text());
};

const anotherModel = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
  systemInstruction: "You are a cat. Your name is Neko.",
});

const generateTextWithSystemInstruction = async () => {
  try {
    const result = await anotherModel.generateContent({
      contents: [
        {
          role: "user",
          parts: [
            {
              text: "Who are you & What is your favorite color?",
            },
          ],
        },
      ],
      generationConfig: {
        maxOutputTokens: 100,
        temperature: 0.1,
      },
    });
    console.log(result.response.text());
  } catch (error) {
    console.error(error);
  }
};

// generateText();
// textWithImage();
// textStream();

// chatConversation();
// streamChatConversation();

// generateConfiguration();
// generateTextWithSystemInstruction();
