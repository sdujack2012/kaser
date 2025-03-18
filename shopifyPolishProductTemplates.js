import objectPath from "object-path";
import fs from "fs";
import {
  insertProductTemplate,
  updateProductTemplate,
  updateProductTitle,
  retrieveProducts,
  convertToShopifyUrl,
  retrieveProductTemplateFile,
  uploadImage,
  getImageById,
} from "./shopifyFunctions.js";
import { generateVerifiedContent } from "./generateText.js";

const systemMessage = {
  role: "system",
  content:
    "You are a world class copy writer, who creates high conversion copies for ecommerce website",
};
// Configuration
const CONFIG = {
  SHIPPING_CONTENT:
    "<p>Shipped from Sydney to all of Australia. Most orders arrive in 2-10 business days. Fast, reliable delivery to elevate your style! 🚚✨</p>",
  REFUND_CONTENT:
    "<p>We issue full refund for faulty products. For returns due to change of mind, the original shipping cost we pay is not refundable. Thank you for your understanding</p>",
  POLICY_CONTENT:
    '<p>We stand by the quality of our jewellery pieces, with each product carefully inspected before shipping. If you receive a faulty or damaged item, we offer a full refund, including original shipping costs, within 30 days of receipt. However, for change of mind returns, the original shipping cost is non-refundable. For details, please visit our <a href="https://kaserjewellery.com.au/pages/refund-return-policy" target="_blank" title="Refund Policy">return policy</a></p>',
  SYSTEM_MESSAGE: {
    role: "system",
    content:
      "You are a world class copy writer, who creates high conversion copies for ecommerce website",
  },
};

// Utility Functions
function getLastIndex(index, length) {
  return length > index ? index : length - 1;
}

function setMultiplePaths(productTemplate, paths) {
  paths.forEach(({ path, value }) => {
    objectPath.set(productTemplate, path, value);
  });
}

// Data Generation Functions
async function generateProductHeadings(product) {
  const prompt = {
    role: "user",
    content: `
      I need you to write the following copies for the product info provided - title: "${product.title}" and description: "${product.description}" 
      make sure all the following copies are relevant to the information provided and use AIDA copywriting framework
      Product title: Refine the existing product title , make it less than 10 words. Copy the style from the example: Celestial Radiance Hoops
      Product heading 1: Write a high conversion product heading , make it less than 5 words. Copy the style from the example: Ocean's Jewel Necklace
      Product heading 2: Write a high conversion product heading , make it less than 10 words. Copy the style from the example: Elevate your style with this stunning Ocean's Jewel Necklace
      Product description 1: Write a high conversion product description  , make it around 30 words
      Product description 2: Write a high conversion product description  , make it around 20 words
      Product description 3: Write a high conversion product description  , make it around 50 words

      output the copies in a json with the following shape { product_title: string, product_heading_1: string, product_heading_2: string,  product_description_1: string, product_description_2: string, product_description_3: string}
    `,
  };

  return await generateVerifiedContent(
    CONFIG.SYSTEM_MESSAGE,
    prompt,
    (copies) =>
      copies.product_title &&
      copies.product_heading_1 &&
      copies.product_heading_2 &&
      copies.product_description_1 &&
      copies.product_description_2 &&
      copies.product_description_3
  );
}

async function generateProductBenefits(product) {
  const prompt = {
    role: "user",
    content: `
      I need you to write the following copies for the jewellery piece arrangement - title: "${product.title}" and description: "${product.description}" 
      make sure all the following copies are relevant to the jewellery piece arrangement

      Think of 4 benefits, for each benefit, create a very short summary with less than 3 words, a more detailed description for the benefit with less than 8 words and a proper emoji for visualization

      output the copies in a json with the following shape [{benefit_summary, benefit_description, benefit_emoji}] 
    `,
  };

  return await generateVerifiedContent(
    CONFIG.SYSTEM_MESSAGE,
    prompt,
    (copies) =>
      copies.length === 4 &&
      copies.every(
        (copy) =>
          copy.benefit_summary &&
          copy.benefit_description &&
          copy.benefit_emoji &&
          copy.benefit_emoji.length < 4
      )
  );
}

async function generateProductReviews(product) {
  const prompt = {
    role: "user",
    content: `
      I need you to write the following copies for the jewellery piece arrangement - title: "${product.title}" and description: "${product.description}".
      make sure all the following copies are relevant to the jewellery piece arrangement
      Write 10 realistic product reviews from customers. Make it around 40 words for each review
      output the copies in a json with the following shape [string]
    `,
  };

  const originalProductReviews = JSON.parse(
    fs.readFileSync("./aliexpress.json")
  )[product.id];

  const productReviews = originalProductReviews
    ? originalProductReviews.reviews?.filter(
        (review) => review.stars >= 4 && review.images?.length
      )
    : [];

  if (productReviews?.length < 10) {
    const generatedReviews = (
      await generateVerifiedContent(
        systemMessage,
        prompt,
        (copies) =>
          copies.length > 5 &&
          copies.every(
            (copy) => typeof copy === "string" || copy instanceof String
          )
      )
    ).map((review) => ({
      review,
      stars: 5,
      images: [],
    }));
    productReviews.push(...generatedReviews);
  }

  // Set product reviews
  const fakeUsers = JSON.parse(fs.readFileSync("./fakeusers.json"));

  for (let productReview of productReviews) {
    const fakeUser = fakeUsers[Math.floor(Math.random() * 5000)];
    productReview.userProfileImageUrl = convertToShopifyUrl(
      fakeUser.shopifyImageUrl.url
    );
    productReview.userName = `${fakeUser.name.first} ${fakeUser.name.last.substring(0, 1)}`;
    if (productReview.images[0]) {
      const { id } = await uploadImage(productReview.images[0], ``).then(
        (data) => ({
          id: data.fileCreate.files[0].id,
          originalUrl: productReview.images[0],
        })
      );
      productReview.reviewImageId = id;
    }
  }

  let allUploaded = false;
  while (!allUploaded) {
    const pendingImageReviews = productReviews.filter(
      (productReview) =>
        productReview.reviewImageId && !productReview.reviewImageUrl
    );

    const reviewImageUrls = await Promise.all(
      pendingImageReviews.map(({ reviewImageId }) =>
        getImageById(reviewImageId).then((data) => ({
          shopifyImageUrl: data.node.image?.url,
          reviewImageId,
        }))
      )
    );
    console.log(reviewImageUrls);

    allUploaded = reviewImageUrls.every(
      (reviewImageUrl) => reviewImageUrl.shopifyImageUrl
    );

    pendingImageReviews.forEach((pendingImageReview) => {
      const imageUrl = reviewImageUrls.find(
        (reviewImageUrl) =>
          reviewImageUrl.reviewImageId === pendingImageReview.reviewImageId
      );
      pendingImageReview.shopifyImageUrl = imageUrl.shopifyImageUrl;
    });
  }

  return productReviews;
}

async function generateFAQs(product) {
  const prompt = {
    role: "user",
    content: `
      I need you to write the following copies for the jewellery piece arrangement - title: "${product.title}" and description: "${product.description}"
      make sure all the following copies are relevant to the jewellery piece arrangement
      Write 8 top frequently asked questions and their answers for the product
      output the copies in a json with the following shape [{question:string, answer:string}]
    `,
  };

  return await generateVerifiedContent(
    CONFIG.SYSTEM_MESSAGE,
    prompt,
    (copies) =>
      copies.length > 5 && copies.every((copy) => copy.question && copy.answer)
  );
}

// Main Function to Fill Product Template
async function fillProductTemplateWithCopies(product, productTemplate) {
  // Set static content
  setMultiplePaths(productTemplate, [
    {
      path: "sections.main.blocks.expandable_7osycv.settings.content",
      value: CONFIG.SHIPPING_CONTENT,
    },
    {
      path: "sections.main.blocks.expandable_012u3j.settings.content",
      value: CONFIG.REFUND_CONTENT,
    },
    {
      path: "sections.main.blocks.expandable_012u32.settings.content",
      value: CONFIG.POLICY_CONTENT,
    },
  ]);

  // Generate dynamic content
  console.log("generateProductHeadings");

  const productHeadingDescription = await generateProductHeadings(product);
  console.log("generateProductBenefits");

  const productBenefits = await generateProductBenefits(product);
  console.log("generateProductReviews ");

  const productReviews = await generateProductReviews(product);
  console.log("generateFAQs ");

  const faqs = await generateFAQs(product);

  // Set dynamic content

  // Set product headings and descriptions
  setMultiplePaths(productTemplate, [
    {
      path: "sections.main.blocks.review_numbers_3d09cr.settings.review_count",
      value: Math.floor(Math.random() * 20) + 30,
    },
    {
      path: `sections.image_with-text_gyqvd0.blocks.heading_6t989o.settings.heading`,
      value: `<strong>${productHeadingDescription.product_heading_1}</strong>`,
    },
    {
      path: `sections.image_with-text_gyqvd0.blocks.heading_6t989o.settings.decription`,
      value: `<strong>${productHeadingDescription.product_heading_1}</strong>`,
    },
    {
      path: `sections.image_with-text_gyqvd0.blocks.heading_6t989o.settings.heading`,
      value: `<strong>${productHeadingDescription.product_heading_2}</strong>`,
    },
    {
      path: `sections.image_with-text_gyqvd0.blocks.heading_6t989o.settings.text`,
      value: `<strong>${productHeadingDescription.product_heading_2}</strong>`,
    },
    {
      path: "sections.main.blocks.custom_liquid_4fWeNX.settings.content",
      value: `<div class="pp-text-base md:pp-text-lg pp-leading-7">${productHeadingDescription.product_description_3}</div>`,
    },
  ]);

  // Set product benefits
  const simpleBenefitPaths = [
    "sections.main.blocks.benefit_hw02kk.settings.text",
    "sections.main.blocks.benefit_tzl7fu.settings.text",
    "sections.main.blocks.benefit_aswetg.settings.text",
    "sections.main.blocks.benefit_qcjzvr.settings.text",
  ];

  simpleBenefitPaths.forEach((simpleBenefitPath, index) => {
    setMultiplePaths(productTemplate, [
      {
        path: simpleBenefitPath,
        value: `✔️ <strong>${productBenefits[index].benefit_summary}</strong>: ${productBenefits[index].benefit_description}`,
      },
    ]);
  });

  const benefitPaths = [
    "sections.image_with-benefits_4m5rdb.blocks.benefit_nuh0us.settings",
    "sections.image_with-benefits_4m5rdb.blocks.benefit_ymaamp.settings",
    "sections.image_with-benefits_4m5rdb.blocks.benefit_cyuytp.settings",
    "sections.image_with-benefits_4m5rdb.blocks.benefit_dj3ws0.settings",
  ];

  benefitPaths.forEach((benefitPath, index) => {
    setMultiplePaths(productTemplate, [
      {
        path: benefitPath,
        value: {
          title: productBenefits[index].benefit_summary,
          description: productBenefits[index].benefit_description,
          icon: productBenefits[index].benefit_emoji,
        },
      },
    ]);
  });

  objectPath.set(
    productTemplate,
    `sections.image_with-text_gyqvd0.settings.image`,
    convertToShopifyUrl(product.images[getLastIndex(1, product.images.length)])
  );
  objectPath.set(
    productTemplate,
    `sections.image_with-text_gyqvd0.settings.image_alt`,
    product.title
  );

  objectPath.set(
    productTemplate,
    `sections.image_with-benefits_4m5rdb.settings.image`,
    convertToShopifyUrl(product.images[getLastIndex(2, product.images.length)])
  );

  // Set product reviews - main review
  setMultiplePaths(productTemplate, [
    {
      path: "sections.main.blocks.review_block_h2mdvb.settings.review",
      value: `${productReviews[0].review}`,
    },
    {
      path: "sections.main.blocks.review_block_h2mdvb.settings.image",
      value: convertToShopifyUrl(productReviews[0].userProfileImageUrl),
    },
    {
      path: "sections.main.blocks.review_block_h2mdvb.settings.name",
      value: `userName<p>${productReviews[0].userName}<p>`,
    },
  ]);

  // Set product reviews - page bottom reviews
  const reviewPaths = [
    "sections.review_grid_iph8ys.blocks.review_adl94y.settings",
    "sections.review_grid_iph8ys.blocks.review_kx3v0j.settings",
    "sections.review_grid_iph8ys.blocks.review_bwyurs.settings",
    "sections.review_grid_iph8ys.blocks.review_bhpm2e.settings",
    "sections.review_grid_iph8ys.blocks.review_4oj3f9.settings",
  ];

  reviewPaths.forEach((reviewPath, index) => {
    setMultiplePaths(productTemplate, [
      {
        path: reviewPath,
        value: {
          name: productReviews[index].userName,
          verified_text: "Verified Buyer",
          rating: productReviews[index].stars,
          image: productReviews[index].shopifyImageUrl
            ? convertToShopifyUrl(productReviews[index].shopifyImageUrl)
            : null,
          review_text: productReviews[index].review,
        },
      },
    ]);
  });

  // Set FAQs
  setMultiplePaths(productTemplate, [
    {
      path: "sections.faqs_v2s84t.settings.heading",
      value: "Frequently Asked Questions",
    },
    { path: "sections.faqs_v2s84t.settings.description", value: "" },
  ]);

  const faqPaths = [
    "faq_dzsz77",
    "faq_a77wyw",
    "faq_5e1h8u",
    "faq_kw87jr",
    "faq_jrmtv4",
  ];

  faqPaths.forEach((faqPath, index) => {
    setMultiplePaths(productTemplate, [
      {
        path: `sections.faqs_v2s84t.blocks.${faqPath}`,
        value: {
          type: "faq_item",
          settings: {
            question: faqs[index].question,
            answer: faqs[index].answer,
          },
        },
      },
    ]);
  });

  return { title: productHeadingDescription.product_title, productTemplate };
}

// Update Product Function
async function updateProduct(product) {
  try {
    let productTemplate;
    if (product.templateSuffix === product.id) {
      productTemplate = JSON.parse(
        await retrieveProductTemplateFile(148587086038, product.id)
      );
    } else {
      productTemplate = JSON.parse(fs.readFileSync("./product_template.json"));
    }

    const { title, productTemplate: updatedTemplate } =
      await fillProductTemplateWithCopies(product, productTemplate);

    let data = await updateProductTitle(product.id, title);
    console.log(JSON.stringify(data, null, 4));

    data = await insertProductTemplate(
      148587086038,
      product.id,
      JSON.stringify(updatedTemplate).replace("👉🏻", "").replace("👉🏻", "")
    );
    console.log(JSON.stringify(data, null, 4));

    if (data.themeFilesUpsert.userErrors.length === 0) {
      const data = await updateProductTemplate(product.id);
      console.log(JSON.stringify(data, null, 4));
      return updatedTemplate;
    } else {
      throw new Error("Failed to update product template");
    }
  } catch (error) {
    console.error("Error updating product:", error);
    return null;
  }
}

// Update All Products Function
async function updateAllProducts() {
  const updatedProducts = JSON.parse(
    fs.readFileSync("./updated_products.json")
  );
  const products = await retrieveProducts();

  for (const product of products) {
    if (updatedProducts[product.id]) {
      console.log("Skipping:", product.id);
      continue;
    }

    const updatedTemplate = await updateProduct(product);
    if (updatedTemplate) {
      updatedProducts[product.id] = product.id;
      fs.writeFileSync(
        "./updated_products.json",
        JSON.stringify(updatedProducts),
        "utf8"
      );
    } else {
      break;
    }
  }
}

// Execute
updateAllProducts();
