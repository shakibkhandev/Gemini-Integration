const { GoogleGenerativeAI } = require("@google/generative-ai");
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

// advertisement();

// base64();

// imagesObjects();
