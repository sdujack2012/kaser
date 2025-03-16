import {
  uploadImage,
  getImageById,
  createProduct,
  createProductWithImagesAndVariants,
} from "./shopifyFunctions.js";
import fs from "fs";
import { scrapeAliexpressProductById } from "./aliexpressProductScraper.js";

async function uploadAliexpressToShopify() {
  if (!process.argv[2]) {
    console.log("No product id provided");
    return;
  }

  const productInfo = await scrapeAliexpressProductById(process.argv[2]);

  const product = await createProductWithImagesAndVariants(
    {
      title: productInfo.title,
      description: productInfo.description || "test",
      productOptions: productInfo.options.map((option) => ({
        name: option.name,
        values: option.values.map((value) => ({ name: value.displayName })),
      })),
    },
    productInfo.images,
    productInfo.skus.map((sku) => ({
      price: sku.price.value,
      optionValues: sku.options.map((option) => ({
        name: option.value.displayName,
        optionName: option.option.name,
      })),
      imageUrl: sku.image,
    }))
  );
  let aliexpressProducts = {};
  const aliExpressProductFile = "./aliexpress.json";
  if (fs.existsSync(aliExpressProductFile)) {
    aliexpressProducts = JSON.parse(
      fs.readFileSync(aliExpressProductFile, "utf8")
    );
  }
  console.log("product", product);
  aliexpressProducts[product.id] = productInfo;

  fs.writeFileSync(aliExpressProductFile, JSON.stringify(aliexpressProducts));
}

uploadAliexpressToShopify();
