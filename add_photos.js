const axios = require("axios");
const fs = require("fs");
const createCsvWriter = require("csv-writer").createObjectCsvWriter;
const csv = require("csvtojson");

const csvWriter = createCsvWriter({
    path: "./temp.csv",
    header: [
      { id: "ProductID", title: "ProductID" },
      { id: "Description", title: "Description" },
      { id: "Price", title: "Price" },
      { id: "Cost", title: "Cost" },
      { id: "Images", title: "Images" },
    ]
  });

async function processCSVs() {
    return await csv().fromFile("./Kaser Jewelry catalog - Sheet1.csv");
}


async function refineProducts() {
  const products = await processCSVs();
  const photos = fs.readdirSync("./photos");
  
  for (let product of products) {
    const productPhotos = photos.filter(photo => photo.includes(product.ProductID) && !photo.endsWith('.webp'));
    product.Images = productPhotos.join(",");
  }

  await csvWriter
    .writeRecords(products) // returns a promise
    .then(() => {
      console.log("...Done");
    });
}

refineProducts();