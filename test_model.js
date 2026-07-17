require("dotenv").config({ path: "./.env" });

async function testModel() {
  const data = {
    contents: [{ parts: [{ text: "Hello! Format as JSON: { \"greeting\": \"\" }" }] }],
    generationConfig: { responseMimeType: "application/json" }
  };

  try {
    const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-pro-preview:generateContent?key=" + process.env.GEMINI_API_KEY, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });
    const result = await response.json();
    console.log("Status:", response.status);
    console.log(JSON.stringify(result, null, 2));
  } catch (error) {
    console.error("Error:", error);
  }
}

testModel();
