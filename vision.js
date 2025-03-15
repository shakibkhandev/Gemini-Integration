const { GoogleGenerativeAI } = require("@google/generative-ai");
const {
  GoogleAIFileManager,
  FileState,
} = require("@google/generative-ai/server");
const fs = require("fs");
require("dotenv/config");

const genAI = new GoogleGenerativeAI(process.env.API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

// Converts local file information to base64
function fileToGenerativePart(path, mimeType) {
  return {
    inlineData: {
      data: Buffer.from(fs.readFileSync(path)).toString("base64"),
      mimeType,
    },
  };
}

async function advertisement() {
  const prompt =
    "Write an advertising jingle showing how the product in the first image could solve the problems shown in the second two images.";

  const imageParts = [
    fileToGenerativePart("./assets/geometry-box.png", "image/jpeg"),
    fileToGenerativePart("./assets/math.png", "image/jpeg"),
  ];

  const generatedContent = await model.generateContent([prompt, ...imageParts]);

  console.log(generatedContent.response.text());
}

const base64 = async () => {
  const imageResp = await fetch(
    "https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/Palace_of_Westminster_from_the_dome_on_Methodist_Central_Hall.jpg/2560px-Palace_of_Westminster_from_the_dome_on_Methodist_Central_Hall.jpg"
  ).then((response) => response.arrayBuffer());

  const result = await model.generateContent([
    {
      inlineData: {
        data: Buffer.from(imageResp).toString("base64"),
        mimeType: "image/jpeg",
      },
    },
    "Caption this image.",
  ]);
  console.log(result.response.text());
};

const imagesObjects = async () => {
  const imageResp1 = await fetch(
    "https://fastly.picsum.photos/id/993/500/300.jpg?hmac=dxpuVzcuWl7qQyJFBmixQF24FncOuHA5TpxPaMOfkSM"
  ).then((response) => response.arrayBuffer());
  const imageResp2 = await fetch(
    "https://fastly.picsum.photos/id/212/500/300.jpg?hmac=kGG5x0AzfRQapGOPUYqQtNgk6pvUNVbGDDjBCY6hJlg"
  ).then((response) => response.arrayBuffer());

  const result = await model.generateContent([
    {
      inlineData: {
        data: Buffer.from(imageResp1).toString("base64"),
        mimeType: "image/jpeg",
      },
    },
    {
      inlineData: {
        data: Buffer.from(imageResp2).toString("base64"),
        mimeType: "image/jpeg",
      },
    },
    "Generate a list of all the objects contained in both images.",
  ]);
  console.log(result.response.text());
};

const uploadImageGenerateContent = async () => {
  const fileManager = new GoogleAIFileManager(process.env.API_KEY);
  const uploadResult = await fileManager.uploadFile(
    `./assets/geometry-box.png`,
    {
      mimeType: "image/jpeg",
      displayName: "Geometry Box Image",
    }
  );
  // View the response.
  console.log(
    `Uploaded file ${uploadResult.file.displayName} as: ${uploadResult.file.uri}`
  );

  // Polling getFile to check processing complete
  let file = await fileManager.getFile(uploadResult.file.name);
  while (file.state === FileState.PROCESSING) {
    process.stdout.write(".");
    // Sleep for 10 seconds
    await new Promise((resolve) => setTimeout(resolve, 10_000));
    // Fetch the file from the API again
    file = await fileManager.getFile(uploadResult.file.name);
  }
  if (file.state === FileState.FAILED) {
    throw new Error("Audio processing failed.");
  }

  const genAI = new GoogleGenerativeAI(process.env.API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  const result = await model.generateContent([
    "Tell me about this image.",
    {
      fileData: {
        fileUri: uploadResult.file.uri,
        mimeType: uploadResult.file.mimeType,
      },
    },
  ]);
  console.log(result.response.text());
};

const summarizeYoutubeVideo = async function () {
  const result = await model.generateContent([
    "Can you summarize this video?",
    {
      fileData: {
        fileUri: "https://www.youtube.com/watch?v=9hE5-98ZeCg",
      },
    },
  ]);
  console.log(result.response.text());
};

// advertisement();

// base64();

// imagesObjects();

// uploadImageGenerateContent();


summarizeYoutubeVideo();
