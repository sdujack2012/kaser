import axios from "axios";

export async function generateTextOllama(messages, model) {
  const response = await axios.post(
    `http://localhost:11434/api/chat`,
    {
      messages: messages,
      model,
      stream: false,
      keep_alive: "1200s",
    },
    {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    }
  );
  return response.data.message;
}

export async function generateVerifiedContent(systemMessage, prompt, verifyFunc) {
  let done = false;
  let retry = 0;
  const retryLimit = 10;

  const messages = [systemMessage, prompt];
  while (!done && retry < retryLimit) {
    const message = await generateTextOllama(messages, "deepseek-r1:14b");
    try {
      let copies = JSON.parse(message.content.match(/^[\{\[][\s\S]*[\}\]]$/gmi)[0]);
      if (verifyFunc(copies)) {
        done = true;
        return {
          ...copies,
        };
      } else {
        console.log("retried", copies);
        retry++;
      }
    } catch (ex) {
      console.log("invalid json", ex);
      if (retry > retryLimit) {
        throw "retry limit reached";
      }
    }
  }
}