require("dotenv").config({ path: "./.env" });

async function listModels() {
  try {
    const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models?key=" + process.env.GEMINI_API_KEY);
    const data = await response.json();
    console.log("Available Models:");
    if (data.models) {
      data.models.forEach(model => {
        console.log(`- ${model.name}`);
      });
    } else {
      console.log(data);
    }
  } catch (error) {
    console.error("Error listing models:", error);
  }
}

listModels();
