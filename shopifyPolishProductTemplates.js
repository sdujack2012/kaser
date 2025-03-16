import objectPath from "object-path";
import fs from "fs";
import {
  insertProductTemplate,
  updateProductTemplate,
  retrieveProducts,
  convertToShopifyUrl,
  retrieveProductTemplateFile,
} from "./shopifyFunctions.js";
import { generateVerifiedContent } from "./generateText.js";

const fakeUsers = JSON.parse(fs.readFileSync("./fakeusers.json"));

function getLastIndex(index, length) {
  return length > index ? index : length - 1;
}

async function fillProductTemplateWithCopies(product, productTemplate) {
  let prompt;

  objectPath.set(
    productTemplate,
    "sections.main.blocks.expandable_7osycv.settings.content",
    "<p>Shipped from Sydney to all of Australia. Most orders arrive in 2-10 business days. Fast, reliable delivery to elevate your style! 🚚✨</p>"
  );
  objectPath.set(
    productTemplate,
    "sections.main.blocks.expandable_012u3j.settings.content",
    "<p>We issue full refund for faulty products. For returns due to change of mind, the original shipping cost we pay is not refundable. Thank you for your understanding</p>"
  );
  objectPath.set(
    productTemplate,
    "sections.main.blocks.expandable_012u32.settings.content",
    '<p>We stand by the quality of our jewellery pieces, with each product carefully inspected before shipping. If you receive a faulty or damaged item, we offer a full refund, including original shipping costs, within 30 days of receipt. However, for change of mind returns, the original shipping cost is non-refundable. For details, please visit our <a href="https://kaserjewellery.com.au/pages/refund-return-policy" target="_blank" title="Refund Policy">return policy</a></p>'
  );

  const systemMessage = {
    role: "system",
    content:
      "You are a world class copy writer, who creates high conversion copies for ecommerce website",
  };

  prompt = {
    role: "user",
    content: `
      I need you to write the following copies for the product info provided - title: "${product.title}" and description: "${product.description}" 
      make sure all the following copies are relvant to the information provided and use AIDA copywriting framework
      Product heading 1: Write a high conversion product heading , make it less than 5 words. Copy the style from the example: Ocean's Jewel Necklace
      Product heading 2: Write a high conversion product heading , make it less than 10 words. Copy the style from the example: Elevate your style with this stunning Ocean's Jewel Necklace
      Product description 1: Write a high conversion product description  , make it around 30 words
      Product description 2: Write a high conversion product description  , make it around 20 words
      Product description 3: Write a high conversion product description  , make it around 50 words

      output the copies in a json with the following shape { product_heading_1: string, product_heading_2: string,  product_description_1: string, product_description_2: string, product_description_2: string}
      `,
  };
  const productHeadingDescription = await generateVerifiedContent(
    systemMessage,
    prompt,
    (copies) =>
      copies.product_heading_1 &&
      copies.product_heading_2 &&
      copies.product_description_1 &&
      copies.product_description_2
  );
  console.log(productHeadingDescription);

  objectPath.set(
    productTemplate,
    "sections.main.blocks.review_numbers_3d09cr.settings.review_count",
    Math.floor(Math.random() * 20) + 30
  );
  objectPath.set(
    productTemplate,
    `sections.image_with-text_gyqvd0.blocks.heading_6t989o.settings.heading`,
    `<strong>${productHeadingDescription.product_heading_1}</strong>`
  );
  objectPath.set(
    productTemplate,
    `sections.image_with-text_gyqvd0.blocks.heading_6t989o.settings.decription`,
    `<strong>${productHeadingDescription.product_heading_1}</strong>`
  );

  objectPath.set(
    productTemplate,
    `sections.image_with-text_gyqvd0.blocks.heading_6t989o.settings.heading`,
    `<strong>${productHeadingDescription.product_heading_2}</strong>`
  );
  objectPath.set(
    productTemplate,
    `sections.image_with-text_gyqvd0.blocks.heading_6t989o.settings.text`,
    `<strong>${productHeadingDescription.product_heading_2}</strong>`
  );

  objectPath.set(
    productTemplate,
    "sections.main.blocks.custom_liquid_4fWeNX.settings.content",
    `<div class="pp-text-base md:pp-text-lg pp-leading-7">
          ${productHeadingDescription.product_description_3}
        </div>`
  );

  prompt = {
    role: "user",
    content: `
      I need you to write the following copies for the jewellery piece arrangement - title: "${product.title}" and description: "${product.description}" 
      make sure all the following copies are relvant to the jewellery piece arrangement

      Think of 4 beneifts, for each benefits, create a very short summary with less than 3 words, a more detailed description for the benefit with less than 8 words and a proper emoji for visualisation

      output the copies in a json with the following shape [{benefit_summary, benefit_description, benefit_emoji}] 
      `,
  };
  const productBenefits = await generateVerifiedContent(
    systemMessage,
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

  // const productBenefits = [{
  //   benefit_summary: "Durability & Shine",
  //   benefit_description: "Made with high-quality gold plating, this piece resists tarnishing and maintains its luxurious shine for years.",
  //   benefit_emoji: "🛡",
  // },
  // {
  //   benefit_summary: "Luxury Look, Affordable Price",
  //   benefit_description: "Get the premium feel of high-end jewelry without the hefty price tag.",
  //   benefit_emoji: "💎",
  // },
  // {
  //   benefit_summary: "Perfect for Any Occasion",
  //   benefit_description: "Whether casual or formal, it’s the ultimate style upgrade.",
  //   benefit_emoji: "✨",
  // },
  // {
  //   benefit_summary: "Confidence in Quality",
  //   benefit_description: "Backed by a satisfaction guarantee or replacement policy for peace of mind.",
  //   benefit_emoji: "💯",
  // }];

  console.log(productBenefits);

  objectPath.set(
    productTemplate,
    "sections.main.blocks.benefit_hw02kk.settings.text",
    `✔️ <strong>${productBenefits[0].benefit_summary}</strong>: ${productBenefits[0].benefit_description}`
  );
  objectPath.set(
    productTemplate,
    "sections.main.blocks.benefit_tzl7fu.settings.text",
    `✔️ <strong>${productBenefits[1].benefit_summary}</strong>: ${productBenefits[1].benefit_description}`
  );
  objectPath.set(
    productTemplate,
    "sections.main.blocks.benefit_aswetg.settings.text",
    `✔️ <strong>${productBenefits[2].benefit_summary}</strong>: ${productBenefits[2].benefit_description}`
  );
  objectPath.set(
    productTemplate,
    "sections.main.blocks.benefit_qcjzvr.settings.text",
    `✔️ <strong>${productBenefits[3].benefit_summary}</strong>: ${productBenefits[3].benefit_description}`
  );

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

  objectPath.set(
    productTemplate,
    `sections.image_with-benefits_4m5rdb.blocks.benefit_nuh0us.settings.title`,
    `<strong>${productBenefits[0].benefit_summary}</strong>`
  );
  objectPath.set(
    productTemplate,
    `sections.image_with-benefits_4m5rdb.blocks.benefit_nuh0us.settings.description`,
    `<p>${productBenefits[0].benefit_description}</p>`
  );
  objectPath.set(
    productTemplate,
    `sections.image_with-benefits_4m5rdb.blocks.benefit_nuh0us.settings.icon`,
    `<p>${productBenefits[0].benefit_emoji}</p>`
  );

  objectPath.set(
    productTemplate,
    `sections.image_with-benefits_4m5rdb.blocks.benefit_ymaamp.settings.title`,
    `<strong>${productBenefits[1].benefit_summary}</strong>`
  );
  objectPath.set(
    productTemplate,
    `sections.image_with-benefits_4m5rdb.blocks.benefit_ymaamp.settings.description`,
    `<p>${productBenefits[1].benefit_description}</p>`
  );
  objectPath.set(
    productTemplate,
    `sections.image_with-benefits_4m5rdb.blocks.benefit_ymaamp.settings.icon`,
    `<p>${productBenefits[1].benefit_emoji}</p>`
  );

  objectPath.set(
    productTemplate,
    `sections.image_with-benefits_4m5rdb.blocks.benefit_cyuytp.settings.title`,
    `<strong>${productBenefits[2].benefit_summary}</strong>`
  );
  objectPath.set(
    productTemplate,
    `sections.image_with-benefits_4m5rdb.blocks.benefit_cyuytp.settings.description`,
    `<p>${productBenefits[2].benefit_description}</p>`
  );
  objectPath.set(
    productTemplate,
    `sections.image_with-benefits_4m5rdb.blocks.benefit_cyuytp.settings.icon`,
    `<p>${productBenefits[2].benefit_emoji}</p>`
  );

  objectPath.set(
    productTemplate,
    `sections.image_with-benefits_4m5rdb.blocks.benefit_dj3ws0.settings.title`,
    `<strong>${productBenefits[3].benefit_summary}</strong>`
  );
  objectPath.set(
    productTemplate,
    `sections.image_with-benefits_4m5rdb.blocks.benefit_dj3ws0.settings.description`,
    `<p>${productBenefits[3].benefit_description}</p>`
  );
  objectPath.set(
    productTemplate,
    `sections.image_with-benefits_4m5rdb.blocks.benefit_dj3ws0.settings.icon`,
    `<p>${productBenefits[3].benefit_emoji}</p>`
  );

  prompt = {
    role: "user",
    content: `
      I need you to write the following copies for the jewellery piece arrangement - title: "${product.title}" and description: "${product.description}".
      make sure all the following copies are relvant to the jewellery piece arrangement
      Write 10 realistic product reviews from customers. Make it around 40 words for each review
      output the copies in a json with the following shape [string]
      `,
  };
  const productReviews = await generateVerifiedContent(
    systemMessage,
    prompt,
    (copies) =>
      copies.length > 5 &&
      copies.every((copy) => typeof copy === "string" || copy instanceof String)
  );
  console.log(productReviews);

  const fakeUser = fakeUsers[Math.floor(Math.random() * 5000)];

  objectPath.set(
    productTemplate,
    "sections.main.blocks.review_block_h2mdvb.settings.review",
    `${productReviews[0]}`
  );
  objectPath.set(
    productTemplate,
    "sections.main.blocks.review_block_h2mdvb.settings.image",
    convertToShopifyUrl(fakeUser.shopifyImageUrl.url)
  );
  objectPath.set(
    productTemplate,
    "sections.main.blocks.review_block_h2mdvb.settings.name",
    `<p>${fakeUser.name.first} ${fakeUser.name.last.substring(0, 1)}<p>`
  );

  const reviews = [
    "sections.review_grid_iph8ys.blocks.review_adl94y.settings",
    "sections.review_grid_iph8ys.blocks.review_kx3v0j.settings",
    "sections.review_grid_iph8ys.blocks.review_bwyurs.settings",
    "sections.review_grid_iph8ys.blocks.review_bhpm2e.settings",
    "sections.review_grid_iph8ys.blocks.review_4oj3f9.settings",
  ];

  for (let i = 0; i < reviews.length; i++) {
    const review = reviews[i];
    objectPath.set(productTemplate, review, {
      type: "review",
      settings: {
        name: "Evelyn",
        verified_text: "Verified Buyer",
        rating: 5,
        review_text: "Feels luxurious yet affordable.",
      },
    });
    objectPath.set(productTemplate, review + ".review_text", productReviews[i]);
    const fakeUser = fakeUsers[Math.floor(Math.random() * 5000)];
    objectPath.set(
      productTemplate,
      review + ".name",
      fakeUser.name.first + " " + fakeUser.name.last.substring(0, 1)
    );
  }

  // prompt = {
  //   role: "user",
  //   content: `
  //     I need you to write the following copies for the jewellery piece arrangement - title: "${product.title}" and description: "${product.description}".
  //     make sure all the following copies are relvant to the jewellery piece arrangement
  //     Write 5 top things the customer would like about this jewellery piece arrangement. Make it less then 10 words for each
  //     output the copies in a json with the following shape [string]
  //     `,
  // };
  // const productCustomerLikes = await generateVerifiedContent(
  //   systemMessage,
  //   prompt,
  //   (copies) => copies.length > 4 && copies.every((copy) => copy)
  // );
  // const productCustomerLikes = [
  //   "Never fades, always fresh",
  //   "Unique and long-lasting decor",
  //   "Stylish light blue ceramic vase",
  //   "Perfect for home or as a gift",
  //   "Low maintenance, no watering needed",
  // ];

  // console.log(productCustomerLikes);
  // objectPath.set(
  //   productTemplate,
  //   "sections.pp_image_with_text_BVEaDq.settings.image",
  //   convertToShopifyUrl(product.images[getLastIndex(2, product.images.length)])
  // );

  // objectPath.set(
  //   productTemplate,
  //   "sections.pp_image_with_percentage_fLf47C.blocks.heading_UYwMbc.settings.heading",
  //   `<strong>${product.title}</strong>`
  // );
  // objectPath.set(
  //   productTemplate,
  //   "sections.pp_image_with_percentage_fLf47C.blocks.percent_MDgdzN.settings.text",
  //   `<p>${productCustomerLikes[0]}</p>`
  // );
  // objectPath.set(
  //   productTemplate,
  //   "sections.pp_image_with_percentage_fLf47C.blocks.percent_DNwFD7.settings.text",
  //   `<p>${productCustomerLikes[1]}</p>`
  // );
  // objectPath.set(
  //   productTemplate,
  //   "sections.pp_image_with_percentage_fLf47C.blocks.percent_Wh6UWW.settings.text",
  //   `<p>${productCustomerLikes[2]}</p>`
  // );
  // objectPath.set(
  //   productTemplate,
  //   "sections.pp_image_with_percentage_fLf47C.settings.image",
  //   convertToShopifyUrl(product.images[getLastIndex(3, product.images.length)])
  // );
  // objectPath.set(
  //   productTemplate,
  //   "sections.pp_image_with_percentage_fLf47C.blocks.percent_MDgdzN.settings.text_mobilealignment",
  //   "left"
  // );

  prompt = {
    role: "user",
    content: `
      I need you to write the following copies for the jewellery piece arrangement - title: "${product.title}" and description: "${product.description}"
      make sure all the following copies are relvant to the jewellery piece arrangement
      Write 8 top frequently asked questions and their answers for the product
      output the copies in a json with the following shape [{question:string, answer:string}]
      `,
  };
  const faqs = await generateVerifiedContent(
    systemMessage,
    prompt,
    (copies) =>
      copies.length > 5 && copies.every((copy) => copy.question && copy.answer)
  );
  // const faqs = [
  //   {
  //     question: "How long will the jewellery piece last?",
  //     answer:
  //       "jewellery piece typically last for several years with proper care, maintaining their beauty and color over time.",
  //   },
  //   {
  //     question: "Is this arrangement suitable as a gift for someone?",
  //     answer:
  //       "Absolutely! This elegant arrangement makes a perfect gift for various occasions such as birthdays, anniversaries, or housewarmings. It's sure to be appreciated by anyone who loves lasting beauty.",
  //   },

  //   {
  //     question:
  //       "What care tips do you have for maintaining the jewellery piece' appearance?",
  //     answer:
  //       "To keep your jewellery piece looking their best, avoid direct sunlight and moisture. Gently dust the jewellery piece occasionally using a soft brush or cloth.",
  //   },
  //   {
  //     question: "Are these jewellery piece real or artificial?",
  //     answer:
  //       "These are real jewellery piece that have been specially preserved to maintain their natural color and texture, ensuring they last much longer than fresh jewellery piece.",
  //   },
  //   {
  //     question: "Can this product be shipped internationally?",
  //     answer:
  //       "Unfortunately, we currently only offer shipping within our local region. Please check our website for international shipping options in the future.",
  //   },
  // ];
  console.log(faqs);

  objectPath.set(
    productTemplate,
    "sections.faqs_v2s84t.settings.heading",
    "Frequently Asked Questions"
  );
  objectPath.set(
    productTemplate,
    "sections.faqs_v2s84t.settings.description",
    ""
  );

  objectPath.set(productTemplate, "sections.faqs_v2s84t.blocks", {
    faq_dzsz77: {
      type: "faq_item",
      settings: {
        question: "Is the necklace suitable for daily wear?",
        answer:
          "Yes, it's crafted with durability in mind, making it perfect for everyday elegance and special occasions alike.",
      },
    },
    faq_a77wyw: {
      type: "faq_item",
      settings: {
        question: "What materials are used in the necklace?",
        answer:
          "The necklace features fine gold plating and vivid blue gemstones, ensuring elegance and durability.",
      },
    },
    faq_5e1h8u: {
      type: "faq_item",
      settings: {
        question: "How should I care for the necklace?",
        answer:
          "Simply wipe with a soft cloth to maintain its shine. Store separately to avoid scratches.",
      },
    },
    faq_kw87jr: {
      type: "faq_item",
      settings: {
        question: "Does it come with a warranty?",
        answer:
          "Yes, we offer a 30-day money-back guarantee to ensure your satisfaction.",
      },
    },
    faq_jrmtv4: {
      type: "faq_item",
      settings: {
        question: "Can it be worn with any outfit?",
        answer:
          "Absolutely! Its versatile design complements both casual and formal attire, adding a touch of elegance.",
      },
    },
  });

  // objectPath.set(
  //   productTemplate,
  //   "sections.pp_guarantee_NNKyJ6.blocks.text_N44eGB.settings.text_alignment",
  //   "left"
  // );
  // objectPath.set(
  //   productTemplate,
  //   "sections.pp_guarantee_NNKyJ6.blocks.text_N44eGB.settings.text_mobilealignment",
  //   "left"
  // );
  // objectPath.set(
  //   productTemplate,
  //   "sections.pp_guarantee_NNKyJ6.blocks.heading_jfhp4z.settings.heading_alignment",
  //   "center"
  // );
  // objectPath.set(
  //   productTemplate,
  //   "sections.pp_guarantee_NNKyJ6.blocks.heading_jfhp4z.settings.heading_mobilealignment",
  //   "center"
  // );
  // objectPath.set(
  //   productTemplate,
  //   "sections.pp_guarantee_NNKyJ6.blocks.text_N44eGB.settings.text_alignment",
  //   "left"
  // );
  // objectPath.set(
  //   productTemplate,
  //   "sections.pp_guarantee_NNKyJ6.blocks.text_N44eGB.settings.heading_mobilealignment",
  //   "left"
  // );
  // objectPath.set(
  //   productTemplate,
  //   "sections.pp_guarantee_NNKyJ6.blocks.heading_jfhp4z.settings.heading",
  //   `Why does More Than jewellery piece stand out?`
  // );
  // objectPath.set(
  //   productTemplate,
  //   "sections.pp_guarantee_NNKyJ6.blocks.text_N44eGB.settings.text",
  //   `<p>More Than jewellery piece offers a unique combination of timeless beauty, sustainability, and expertise that others lack. With over eight years of experience, we create everlasting floral arrangements that bring enduring elegance, while our eco-friendly approach ensures a positive impact on the planet. Each piece is designed to add a touch of sophistication to any space, making it perfect for both special occasions and everyday décor.</p>`
  // );

  return productTemplate;
}

async function updateProduct(product, fakeUsers) {
  let productTemplate;
  console.log(product);
  if (product.templateSuffix === product.id) {
    productTemplate = JSON.parse(
      await retrieveProductTemplateFile(148587086038, product.id)
    );
  } else {
    productTemplate = JSON.parse(fs.readFileSync("./product_template.json"));
  }

  productTemplate = await fillProductTemplateWithCopies(
    product,
    productTemplate
  );

  const data = await insertProductTemplate(
    148587086038,
    product.id,
    JSON.stringify(productTemplate).replace("👉🏻", "").replace("👉🏻", "")
  );
  console.log(JSON.stringify(data, null, 4));

  if (data.themeFilesUpsert.userErrors.length === 0) {
    const data = await updateProductTemplate(product.id, product.id.toString());
    console.log(JSON.stringify(data, null, 4));
    return productTemplate;
  } else {
    return null;
  }
}

async function updateAllProducts() {
  const updatedProducts = JSON.parse(
    fs.readFileSync("./updated_products.json")
  );

  const products = await retrieveProducts();
  for (const product of products) {
    if (updatedProducts[product.id]) {
      console.log("skipping: ", product.id);
      continue;
    }
    const updatedTemplated = await updateProduct(product, fakeUsers);
    if (updatedTemplated) {
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

updateAllProducts();
