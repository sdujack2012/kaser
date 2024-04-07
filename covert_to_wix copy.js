const axios = require("axios");
const fs = require("fs");
const createCsvWriter = require("csv-writer").createObjectCsvWriter;
const csv = require("csvtojson");

const csvWriter = createCsvWriter({
  path: "./wix_products.csv",
  header: [
    { id: "handleId", title: "handleId" },
    { id: "fieldType", title: "fieldType" },
    { id: "name", title: "name" },
    { id: "description", title: "description" },
    { id: "productImageUrl", title: "productImageUrl" },
    { id: "collection", title: "collection" },
    { id: "sku", title: "sku" },
    { id: "ribbon", title: "ribbon" },
    { id: "price", title: "price" },
    { id: "surcharge", title: "surcharge" },
    { id: "visible", title: "visible" },
    { id: "discountMode", title: "discountMode" },
    { id: "discountValue", title: "discountValue" },
    { id: "inventory", title: "inventory" },
    { id: "weight", title: "weight" },
    { id: "cost", title: "cost" },
    { id: "productOptionName1", title: "productOptionName1" },
    { id: "productOptionType1", title: "productOptionType1" },
    { id: "productOptionDescription1", title: "productOptionDescription1" },
    { id: "productOptionName2", title: "productOptionName2" },
    { id: "productOptionType2", title: "productOptionType2" },
    { id: "productOptionDescription2", title: "productOptionDescription2" },
    { id: "productOptionName3", title: "productOptionName3" },
    { id: "productOptionType3", title: "productOptionType3" },
    { id: "productOptionDescription3", title: "productOptionDescription3" },
    { id: "productOptionName4", title: "productOptionName4" },
    { id: "productOptionType4", title: "productOptionType4" },
    { id: "productOptionDescription4", title: "productOptionDescription4" },
    { id: "productOptionName5", title: "productOptionName5" },
    { id: "productOptionType5", title: "productOptionType5" },
    { id: "productOptionDescription5", title: "productOptionDescription5" },
    { id: "productOptionName6", title: "productOptionName6" },
    { id: "productOptionType6", title: "productOptionType6" },
    { id: "productOptionDescription6", title: "productOptionDescription6" },
    { id: "additionalInfoTitle1", title: "additionalInfoTitle1" },
    { id: "additionalInfoDescription1", title: "additionalInfoDescription1" },
    { id: "additionalInfoTitle2", title: "additionalInfoTitle2" },
    { id: "additionalInfoDescription2", title: "additionalInfoDescription2" },
    { id: "additionalInfoTitle3", title: "additionalInfoTitle3" },
    { id: "additionalInfoDescription3", title: "additionalInfoDescription3" },
    { id: "additionalInfoTitle4", title: "additionalInfoTitle4" },
    { id: "additionalInfoDescription4", title: "additionalInfoDescription4" },
    { id: "additionalInfoTitle5", title: "additionalInfoTitle5" },
    { id: "additionalInfoDescription5", title: "additionalInfoDescription5" },
    { id: "additionalInfoTitle6", title: "additionalInfoTitle6" },
    { id: "additionalInfoDescription6", title: "additionalInfoDescription6" },
    { id: "customTextField1", title: "customTextField1" },
    { id: "customTextCharLimit1", title: "customTextCharLimit1" },
    { id: "customTextMandatory1", title: "customTextMandatory1" },
    { id: "customTextField2", title: "customTextField2" },
    { id: "customTextCharLimit2", title: "customTextCharLimit2" },
    { id: "customTextMandatory2", title: "customTextMandatory2" },
    { id: "brand", title: "brand" },
  ],
});

async function readProductCatalogCSVs() {
  return await csv().fromFile("./Kaser Jewelry catalog - Sheet1.csv");
}

async function readNameUrlLookup() {
  const nameUrlLookup = {};
  const nameUrls = (await csv().fromFile("./name_url.csv")).filter(nameUrl =>nameUrl.name.trim() && nameUrl.url.trim() );
  
  nameUrls.forEach(nameUrl => {
    nameUrlLookup[nameUrl.name.trim()] = nameUrl.url.trim();
  })
 
  return nameUrlLookup;
}

async function convertToWixProducts() {
  const products = await readProductCatalogCSVs();
  const nameUrlLookup = await readNameUrlLookup();
  console.log(nameUrlLookup)
  const wixProducts = [];
  for (let product of products) {
    const wixProduct = {};
    wixProduct["handleId"] = product["ProductID"];
    wixProduct["fieldType"] = "Product";

    wixProduct["name"] = product["Title"] || product["ProductID"];
    wixProduct["description"] = product["Description"];

    wixProduct["productImageUrl"] = product["Images"] ? product["Images"].split(",").map(imageName => "https://static.wixstatic.com/media/" + nameUrlLookup[imageName.trim()]).join(";") : "";
    wixProduct["price"] = product["Price"].replace("$", "");
    wixProduct["visible"] = "true";
    wixProduct["sku"] = product["ProductID"];

    wixProduct["discountMode"] = "PERCENT";
    wixProduct["discountValue"] = "0.0";
    wixProduct["inventory"] = "InStock";
    wixProduct["cost"] = product["Cost"].replace("$", "");

    wixProduct["additionalInfoTitle1"] = "PRODUCT INFO";
    wixProduct["additionalInfoDescription1"] =
      "I'm a product detail. I'm a great place to add more information about your product such as sizing, material, care and cleaning instructions. This is also a great space to write what makes this product special and how your customers can benefit from this item.";
      wixProducts.push(wixProduct);
    }

  await csvWriter
    .writeRecords(wixProducts) // returns a promise
    .then(() => {
      console.log("...Done");
    });
}

convertToWixProducts();
