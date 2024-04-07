const axios = require("axios");
const fs = require("fs");
const createCsvWriter = require("csv-writer").createObjectCsvWriter;
const csv = require("csvtojson");

const csvWriter = createCsvWriter({
  path: "./woo_products.csv",
  header: [
    { id: "ID", title: "ID" },
    { id: "Type", title: "Type" },
    { id: "SKU", title: "SKU" },
    { id: "Name", title: "Name" },
    { id: "Published", title: "Published" },
    { id: "Is featured?", title: "Is featured?" },
    { id: "Visibility in catalog", title: "Visibility in catalog" },
    { id: "Short description", title: "Short description" },
    { id: "Description", title: "Description" },
    { id: "Date sale price starts", title: "Date sale price starts" },
    { id: "Date sale price ends", title: "Date sale price ends" },
    { id: "Tax status", title: "Tax status" },
    { id: "Tax class", title: "Tax class" },
    { id: "In stock?", title: "In stock?" },
    { id: "Stock", title: "Stock" },
    { id: "Low stock amount", title: "Low stock amount" },
    { id: "Backorders allowed?", title: "Backorders allowed?" },
    { id: "Sold individually?", title: "Sold individually?" },
    { id: "Weight (kg)", title: "Weight (kg)" },
    { id: "Length (cm)", title: "Length (cm)" },
    { id: "Width (cm)", title: "Width (cm)" },
    { id: "Height (cm)", title: "Height (cm)" },
    { id: "Allow customer reviews?", title: "Allow customer reviews?" },
    { id: "Purchase note", title: "Purchase note" },
    { id: "Sale price", title: "Sale price" },
    { id: "Regular price", title: "Regular price" },
    { id: "Categories", title: "Categories" },
    { id: "Tags", title: "Tags" },
    { id: "Shipping class", title: "Shipping class" },
    { id: "Images", title: "Images" },
    { id: "Download limit", title: "Download limit" },
    { id: "Download expiry days", title: "Download expiry days" },
    { id: "Parent", title: "Parent" },
    { id: "Grouped products", title: "Grouped products" },
    { id: "Upsells", title: "Upsells" },
    { id: "Cross-sells", title: "Cross-sells" },
    { id: "External URL", title: "External URL" },
    { id: "Button text", title: "Button text" },
    { id: "Position", title: "Position" },
    { id: "Meta: site-sidebar-layout", title: "Meta: site-sidebar-layout" },
    { id: "Meta: site-content-layout", title: "Meta: site-content-layout" },
    {
      id: "Meta: theme-transparent-header-meta",
      title: "Meta: theme-transparent-header-meta",
    },
    {
      id: "Meta: _yoast_wpseo_content_score",
      title: "Meta: _yoast_wpseo_content_score",
    },
    { id: "Meta: _wxr_import_user_slug", title: "Meta: _wxr_import_user_slug" },
    {
      id: "Meta: _astra_sites_imported_post",
      title: "Meta: _astra_sites_imported_post",
    },
    { id: "Meta: _uag_css_file_name", title: "Meta: _uag_css_file_name" },
    {
      id: "Meta: _astra_sites_enable_for_batch",
      title: "Meta: _astra_sites_enable_for_batch",
    },
    {
      id: "Meta: _yoast_wpseo_primary_product_cat",
      title: "Meta: _yoast_wpseo_primary_product_cat",
    },
    {
      id: "Meta: yikes_woo_products_tabs",
      title: "Meta: yikes_woo_products_tabs",
    },
  ],
});

async function readProductCatalogCSVs() {
  return await csv().fromFile("./Kaser Jewelry catalog - lastest.csv");
}

async function readNameUrls() {
  const nameUrls = (await csv().fromFile("./name_url.csv"))
    .filter((nameUrl) => nameUrl.name.trim() && nameUrl.url.trim())
    .map((nameUrl) => ({ name: nameUrl.name.trim(), url: nameUrl.url.trim() }));
  nameUrls.sort((a, b) => (a < b ? 1 : -1));

  return nameUrls;
}

async function convertToWooProducts() {
  const products = await readProductCatalogCSVs();
  const nameUrls = await readNameUrls();
  const wooProducts = [];
  for (let product of products) {
    if (product.published !== "Yes") continue;

    const wooProduct = {};
    //wooProduct["ID"] = product["Spec/Specs"];
    wooProduct["Type"] = "simple";
    wooProduct["SKU"] = product["Spec/Specs"];
    wooProduct["Name"] = product["Product name"] || product["Spec/Specs"];

    wooProduct["Published"] = 1;
    wooProduct["Is featured?"] = 0;
    wooProduct["Visibility in catalog"] = "visible";
    wooProduct["Short description"] = product["product description"];
    wooProduct["Description"] = product["product description"];
    wooProduct["Date sale price starts"] = "";
    wooProduct["Date sale price ends"] = "";
    wooProduct["Tax status"] = "taxable";
    wooProduct["Tax class"] =
    wooProduct["In stock?"] = 1;
    wooProduct["Stock"] = product["Current Quantity"];
    wooProduct["Low stock amount"] = 0;
    wooProduct["Backorders allowed?"] = 0;
    wooProduct["Sold individually?"] = 0;
    wooProduct["Weight (kg)"] = "";
    wooProduct["Length (cm)"] = "";
    wooProduct["Width (cm)"] = "";
    wooProduct["Height (cm)"] = "";
    wooProduct["Allow customer reviews?"] = 1;
    wooProduct["Purchase note"] = "";
    wooProduct["Sale price"] = "";
    wooProduct["Regular price"] = product["Price(AUD)"].replace("$", "");

    // categories
    let categories = [];
    const contentList = [wooProduct["Name"], wooProduct["Description"]];
    if (
      contentList.some(
        (text) =>
          text.toLowerCase().includes("hoop") ||
          text.toLowerCase().includes("earring") ||
          text.toLowerCase().includes("hugging")
      )
    ) {
      categories.push("Gold Plated Earring");
    } else if (
      contentList.some((text) => text?.toLowerCase().includes("necklace"))
    ) {
      categories.push("Gold Plated Necklace");
    } else if (
      contentList.some((text) => text?.toLowerCase().includes("bracelet"))
    ) {
      categories.push("Gold Plated Bracelet");
    }

    wooProduct["Categories"] = categories.join(",");
    wooProduct["Tags"] = "";
    wooProduct["Shipping class"] = "";
    wooProduct["Images"] = nameUrls
    .filter(
      (nameUrl) =>
        nameUrl.name.split("#")[0]?.toLowerCase() ===
        product["Spec/Specs"].toLowerCase()
    )
    .map((nameUrl) => "https://static.wixstatic.com/media/" + nameUrl.url)
    .join(",");

    wooProduct["Download limit"] = "";
    wooProduct["Download expiry days"] = "";
    wooProduct["Parent"] = "";
    wooProduct["Grouped products"] = "";
    wooProduct["Upsells"] = "";
    wooProduct["Cross-sells"] = "";
    wooProduct["External URL"] = "";
    wooProduct["Button text"] = "";
    wooProduct["Position"] = 0
    wooProduct["Meta: site-sidebar-layout"] = "default";
    wooProduct["Meta: site-content-layout"] = "default";
    wooProduct["Meta: theme-transparent-header-meta"] = "default";
    wooProduct["Meta: _yoast_wpseo_content_score"] = 30;
    wooProduct["Meta: _wxr_import_user_slug"] = "ramak";
    wooProduct["Meta: _astra_sites_imported_post"] = 1
    wooProduct["Meta: _uag_css_file_name"] = "";
    wooProduct["Meta: _astra_sites_enable_for_batch"] = 1
    wooProduct["Meta: _yoast_wpseo_primary_product_cat"] = "";
    wooProduct["Meta: yikes_woo_products_tabs"] = `a:1:{i:0;a:3:{s:5:"title";s:10:"Custom tab";s:2:"id";s:10:"custom-tab";s:7:"content";s:10:"<p>tab</p>";}}`;


    wooProducts.push(wooProduct);
  }
  await csvWriter
    .writeRecords(wooProducts) // returns a promise
    .then(() => {
      console.log("...Done");
    });
}

convertToWooProducts();
