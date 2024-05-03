const { parse } = require("node-html-parser");
const fs = require("fs").promises;
const  OpenAI = require("openai");

const openai = new OpenAI();

async function convertFromHtmlToJson() {
  const apiKey = await fs.readFile("./apikey", "utf8");
  process.env.OPENAI_API_KEY = apiKey;
  const html = await fs.readFile("./outilne.html", "utf8");
  const root = parse(html);
  const outline = {};
  let currentHeading = undefined;
  root.querySelectorAll("h2, h3").forEach((userItem) => {
    if (userItem.tagName === "H2") {
      currentHeading = userItem.textContent;
      outline[currentHeading] = [];
    } else if (currentHeading || userItem.tagName === "H3") {
      console.log(userItem.textContent);
      outline[currentHeading] = [
        ...outline[currentHeading],
        userItem.textContent,
      ];
    } else {
      console.log(
        `Expected empty ${currentHeading} for ${userItem.textContent}`
      );
    }
  });
  await fs.writeFile("./outline.json", JSON.stringify(outline));
}


convertFromHtmlToJson();
