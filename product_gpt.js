const axios = require("axios");
const fs = require("fs");
var os = require("os");
const createCsvWriter = require("csv-writer").createObjectCsvWriter;
const csv = require("csvtojson");
const csvWriter = createCsvWriter({
  path: "./2023_sizePrice_number.csv",
  header: [
    { id: "ProductID", title: "ProductID" },
    { id: "Description", title: "Description" },
    { id: "Price", title: "Price" },
    { id: "Cost", title: "Cost" },
    { id: "Images", title: "Images" },
  ],
});

async function refineProductDescription(description) {
  const content =
  ``;
  return await axios
    .post(
      "https://api.openai.com/v1/chat/completions",
      // '{\n     "model": "gpt-3.5-turbo",\n     "messages": [{"role": "user", "content": "Say this is a test!"}],\n     "temperature": 0.7\n   }',
      {
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "user",
            content: content,
          },
        ],
        temperature: 0.7,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization:
            "Bearer " + "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",
        },
      }
    )
    .then((response) => {
      console.log("Success ");
      return response.data.choices[0].message.content;
    })
    .catch(function (error) {
      console.error("error " + error);
      console.error("failed description: " + description);
    });
}

async function processCSVs() {
  return await csv().fromFile("./Kaser Jewelry catalog - Sheet1.csv");
}

async function refineProducts() {
  const products = await processCSVs();
  for (let product of products) {
    if (product["product description"]) {
      console.log("Before: ", product["product description"]);
      product["product description"] = await refineProductDescription(
        product["product description"]
      );
      console.log("After: ", product["product description"]);
    }
  }

  var json = JSON.stringify(products);
  fs.writeFile("products_lastest.json", json, function (err) {
    if (err) throw err;
    console.log("complete");
  });
}

refineProducts();
