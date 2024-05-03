const fs = require("fs");
const OpenAI = require("openai");
const apiKey = fs.readFileSync("./apikey", "utf8");

const openai = new OpenAI({ apiKey });

async function generateArtilce() {
  var outline = JSON.parse(fs.readFileSync("outline.json", "utf8"));
  const article = {};
  const messages = [{ role: "system", content: `you are a expert on writing SEO optimised content 
  You are writing an article about "Best Chinese laptop brands" and below is the outline in json format ${JSON.stringify(
    outline
  )}`}];
  for (h2 of Object.keys(outline)) {
    if (outline[h2].length > 0) {
      for (h3 of outline[h2]) {
        const content = `
        now write "${h3}" section for heading "${h2}". please write at least 200 words. please use various formatting such as dot points, linebreak and any other formatting to enhance readibility where possible, in html. Please only output the content and DO NOT repeat the heading, section name or other unnecessary information. Please try to be in depth`;
        console.log(`Writing  ${h3} section for heading ${h2}`);
        messages.push({ role: "user", content });
        const completion = await openai.chat.completions.create({
          messages,
          model: "gpt-4-turbo-2024-04-09",
        });
        console.log("Finish writing:", completion.choices[0]);
        messages.push(completion.choices[0].message);
        article[h2] = [
          ...(article[h2] || []),
          { [h3]: completion.choices[0].message.content },
        ];
      }
    } else {
      const content = `now write content for heading "${h2}". please write at least 300 words. please use various formatting such as dot points, linebreak and any other formatting to enhance readibility where possible, in html. Please only output the content and DO NOT repeat the heading or other unnecessary information. Please try to be in depth`;
      console.log(`Writing content for heading ${h2}`);
      messages.push({ role: "user", content });
      const completion = await openai.chat.completions.create({
        messages,
        model: "gpt-4-turbo-2024-04-09",
      });
      console.log("Finish writing:", completion.choices[0]);
      messages.push(completion.choices[0].message);
      article[h2] = { content: completion.choices[0].message.content };
    }
  }
  fs.writeFileSync("./article.json", JSON.stringify(article));
}

generateArtilce();
