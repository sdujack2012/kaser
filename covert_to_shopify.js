const fs = require("fs");
const createCsvWriter = require("csv-writer").createObjectCsvWriter;
const csv = require("csvtojson");

//Title,Subtitle,Description,ribbon_text,price,discount,weight,sku,image_link
const csvWriter = createCsvWriter({
  path: "./shopify_products.csv",
  header: [
    { id: "Handle", title: "Handle" },
    { id: "Title", title: "Title" },
    { id: "Body (HTML)", title: "Body (HTML)" },
    { id: "Vendor", title: "Vendor" },
    { id: "Product Category", title: "Product Category" },
    { id: "Type", title: "Type" },
    { id: "Tags", title: "Tags" },
    { id: "Published", title: "Published" },
    { id: "Option1 Name", title: "Option1 Name" },
    { id: "Option1 Value", title: "Option1 Value" },
    { id: "Option2 Name", title: "Option2 Name" },
    { id: "Option2 Value", title: "Option2 Value" },
    { id: "Option3 Name", title: "Option3 Name" },
    { id: "Option3 Value", title: "Option3 Value" },
    { id: "Variant SKU", title: "Variant SKU" },
    { id: "Variant Grams", title: "Variant Grams" },
    { id: "Variant Inventory Tracker", title: "Variant Inventory Tracker" },
    { id: "Variant Inventory Qty", title: "Variant Inventory Qty" },
    { id: "Variant Inventory Policy", title: "Variant Inventory Policy" },
    { id: "Variant Fulfillment Service", title: "Variant Fulfillment Service" },
    { id: "Variant Price", title: "Variant Price" },
    { id: "Variant Compare At Price", title: "Variant Compare At Price" },
    { id: "Variant Requires Shipping", title: "Variant Requires Shipping" },
    { id: "Variant Taxable", title: "Variant Taxable" },
    { id: "Variant Barcode", title: "Variant Barcode" },
    { id: "Image Src", title: "Image Src" },
    { id: "Image Position", title: "Image Position" },
    { id: "Image Alt Text", title: "Image Alt Text" },
    { id: "Gift Card", title: "Gift Card" },
    { id: "SEO Title", title: "SEO Title" },
    { id: "SEO Description", title: "SEO Description" },
    {
      id: "Google Shopping / Google Product Category",
      title: "Google Shopping / Google Product Category",
    },
    { id: "Google Shopping / Gender", title: "Google Shopping / Gender" },
    { id: "Google Shopping / Age Group", title: "Google Shopping / Age Group" },
    { id: "Google Shopping / MPN", title: "Google Shopping / MPN" },
    {
      id: "Google Shopping / AdWords Grouping",
      title: "Google Shopping / AdWords Grouping",
    },
    {
      id: "Google Shopping / AdWords Labels",
      title: "Google Shopping / AdWords Labels",
    },
    { id: "Google Shopping / Condition", title: "Google Shopping / Condition" },
    {
      id: "Google Shopping / Custom Product",
      title: "Google Shopping / Custom Product",
    },
    {
      id: "Google Shopping / Custom Label 0",
      title: "Google Shopping / Custom Label 0",
    },
    {
      id: "Google Shopping / Custom Label 1",
      title: "Google Shopping / Custom Label 1",
    },
    {
      id: "Google Shopping / Custom Label 2",
      title: "Google Shopping / Custom Label 2",
    },
    {
      id: "Google Shopping / Custom Label 3",
      title: "Google Shopping / Custom Label 3",
    },
    {
      id: "Google Shopping / Custom Label 4",
      title: "Google Shopping / Custom Label 4",
    },
    { id: "Variant Image", title: "Variant Image" },
    { id: "Variant Weight Unit", title: "Variant Weight Unit" },
    { id: "Variant Tax Code", title: "Variant Tax Code" },
    { id: "Cost per item", title: "Cost per item" },
    { id: "Price / International", title: "Price / International" },
    {
      id: "Compare At Price / International",
      title: "Compare At Price / International",
    },
    { id: "Status", title: "Status" },
  ],
});

async function readProductCatalogCSVs() {
  //"Product Name","Product URL","Price","Product Description","Product Image"
  return await csv().fromFile("./wc-product-export-10-3-2025-1741578205395.csv");
}

async function convertToProducts() {
  const originalProducts = await readProductCatalogCSVs();
  const products = [];
  for (let originalProduct of originalProducts) {
    const product = {};
    console.log(originalProduct)
    product["Handle"] = originalProduct["Name"];
    product["Title"] = originalProduct["Name"];
    product["Body (HTML)"] = originalProduct["Description"];
    
    product["Variant Price"] = originalProduct["Sale price"] || originalProduct["Regular price"] ;
    product["Published"] = "TRUE";
    product["Status"] = "active";
    product["Variant Fulfillment Service"] = "manual";
    product["Variant Inventory Policy"] = "deny";

    product["Vendor"] = "";
    product["Product Category"] = "";
    product["Type"] = "";
    product["Tags"] = "";
    product["Option1 Name"] = "";
    product["Option1 Value"] = "";
    product["Option2 Name"] = "";
    product["Option2 Value"] = "";
    product["Option3 Name"] = "";
    product["Option3 Value"] = "";
    product["Variant SKU"] = originalProduct["SKU"];
    product["Variant Grams"] = "";
    product["Variant Inventory Tracker"] = "";
    product["Variant Inventory Qty"] = "";
    product["Variant Compare At Price"] = "";
    product["Variant Requires Shipping"] = "true";
    product["Variant Taxable"] = "";
    product["Variant Barcode"] = "";
    product["Image Position"] = "";
    product["Image Alt Text"] = "";
    product["Gift Card"] = "";
    product["SEO Title"] = "";
    product["SEO Description"] = "";
    product["Google Shopping / Google Product Category"] = "";
    product["Google Shopping / Gender"] = "";
    product["Google Shopping / Age Group"] = "";
    product["Google Shopping / MPN"] = "";
    product["Google Shopping / AdWords Grouping"] = "";
    product["Google Shopping / AdWords Labels"] = "";
    product["Google Shopping / Condition"] = "";
    product["Google Shopping / Custom Product"] = "";
    product["Google Shopping / Custom Label 0"] = "";
    product["Google Shopping / Custom Label 1"] = "";
    product["Google Shopping / Custom Label 2"] = "";
    product["Google Shopping / Custom Label 3"] = "";
    product["Google Shopping / Custom Label 4"] = "";
    product["Variant Image"] = "";
    product["Variant Weight Unit"] = "1kg";
    product["Variant Tax Code"] = "";
    product["Cost per item"] = "";
    product["Price / International"] = "";
    product["Compare At Price / International"] = "";

    let hasImage = false;
    const images = originalProduct["Images"]?.split(",")
   let posision = 1;
   products.push(product);
    for (let image of images) {
      if (image.trim()) {
        hasImage = true
        products.push({
          "Handle": originalProduct["Name"],
          "Image Src": image.trim(),
          "Image Position": posision++
        });
      }
    }

    // const typeCount = 3;
    // for (let i = 1; i <= typeCount; i++) {
    //   if (originalProduct["Collection" + i]) {
    //     products.push({
    //       Title: originalProduct["Title"],
    //       Handle: originalProduct["Title"],
    //       "Variant Price": originalProduct["Price"],
    //       "Variant Fulfillment Service": "manual",
    //       "Variant Inventory Policy": "deny",
    //       Status: "active",
    //       Type: originalProduct["Collection" + i],
    //     });
    //   }
    // }
    
  }

  await csvWriter
    .writeRecords(products) // returns a promise
    .then(() => {
      console.log("...Done");
    });
}

convertToProducts();
