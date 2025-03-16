
import objectPath from "object-path";
import fs from "fs";
import { insertProductTemplate, updateProductTemplate, retrieveProducts, convertToShopifyUrl, retrieveProductTemplateFile } from "./shopifyFunctions.js";
import { generateVerifiedContent } from "./generateText.js";


const fakeUsers = JSON.parse(fs.readFileSync("./fakeusers.json"));

function getLastIndex(index, length) {
  return length > index ? index : length - 1;
}

async function fillProductTemplateWithCopies(product, productTemplate) {
  let prompt;

  const systemMessage = {
    role: "system",
    content: "You are a world class copy writer, who creates high conversion copies for ecommerce website",
  };

  prompt = {
    role: "user",
    content: `
      I need you to write the following copies for the everlasting flower arrangement - title: "${product.title}" and description: "${product.description}" 
      make sure all the following copies are relvant to the information provided and use AIDA copywriting framework
      Product heading 1: Write a high conversion product heading , make it less than 10 words. Copy the style from the example: Transform your space with these stunning and timeless everlasting flowers
      Product heading 2: Write a high conversion product heading , make it less than 5 words. Copy the style from the example: Elevate Your Beauty Game
      Product heading 3: Write a high conversion product heading , make it less than 8 words. Copy the style from the example: Revolutionize Your Skincare Routine with a Beauty Fridge
      Product description 1: Write a high conversion product description  , make it around 30 words
      Product description 2: Write a high conversion product description  , make it around 40 words
      Product description 3: Write a high conversion product description using use AIDA copywriting framework, make it around 80 words. 
      Size info: if size is provided in the description, output: <strong>Approximate size:<strong> [width] * [height]

      output the copies in a json with the following shape { product_heading_1: string, product_heading_2: string, product_heading_3: string, product_description_1: string, product_description_2: string, product_description_3: string, size_info:string}
      `,
  };
  const productHeadingDescription = await generateVerifiedContent(systemMessage, prompt, copies =>
    copies.product_heading_1 && copies.product_heading_2 && copies.product_heading_3 && copies.product_description_1 && copies.product_description_2 && copies.size_info);
  console.log(productHeadingDescription)
  
  
  objectPath.set(productTemplate, "sections.main.blocks.reviews_number_wmFXyt.settings.reviews_text", `${Math.floor(Math.random() * 30) + 30} Reviews`);
  objectPath.set(productTemplate, "sections.main.blocks.pp_text_VLf9ic.settings.pp_text", `<strong>${productHeadingDescription.product_heading_1}</strong>`);
  objectPath.set(productTemplate, "sections.pp_image_with_benefits_gkXTTj.settings.heading", `<strong>${productHeadingDescription.product_heading_2}</strong>`);
  objectPath.set(productTemplate, "sections.pp_image_with_benefits_gkXTTj.settings.text", `<p>${productHeadingDescription.product_description_1}</p>`);
  objectPath.set(productTemplate, "sections.pp_image_with_text_BVEaDq.blocks.heading_aFxCRe.settings.heading", `<strong>${productHeadingDescription.product_heading_3}</strong>`);
  objectPath.set(productTemplate, "sections.pp_image_with_text_BVEaDq.blocks.text_ifpgzE.settings.text", `<p>${productHeadingDescription.product_description_2}</p>`);
  objectPath.set(productTemplate, "sections.main.blocks.custom_liquid_4fWeNX", {
    "type": "custom_liquid",
    "settings": {
      "custom_liquid":
        `<div class="product__description rte quick-add-hidden">
          ${productHeadingDescription.product_description_3}<br />${productHeadingDescription.size_info}
        </div>`
    }
  });

  


  // prompt = {
  //   role: "user",
  //   content: `
  //     I need you to write the following copies for the everlasting flower arrangement - title: "${product.title}" and description: "${product.description}" 
  //     make sure all the following copies are relvant to the everlasting flower arrangement

  //     Think of 4 beneifts, for each benefits, create a very short summary with less than 3 words and a more detailed description for the benefit with less than 8 words 

  //     output the copies in a json with the following shape [{benefit_summary, benefit_description}] 
  //     `,
  // };
  // const productBenefits = await generateVerifiedContent(systemMessage, prompt, copies => copies.length === 4 && copies.every(copy => copy.benefit_summary && copy.benefit_description));

  // const productBenefits = [
  //   {
  //     benefit_summary: 'Everlasting beauty',
  //     benefit_description: 'No need for frequent replacements as Preserved flowers last over 100 times longer than fresh flowers.',
  //     benefit_emoji: "♾️",
  //   },
  //   {
  //     benefit_summary: 'Low maintenance',
  //     benefit_description: 'Set and forget - No watering, sunlight, or pruning required',
  //     benefit_emoji: "🙌",
  //   },
  //   {
  //     benefit_summary: 'Eco-friendly',
  //     benefit_description: 'Saves 10,000 liters of water per year compared to fresh flower farming.',
  //     benefit_emoji: "🌱",
  //   },
  //   {
  //     benefit_summary: 'Perfect gift',
  //     benefit_description: 'A timeless keepsake that stays vibrant for years, just like your most cherished memories',
  //     benefit_emoji: "🎁",
  //   }

  // ]

  // console.log(productBenefits)

  // objectPath.set(productTemplate, "sections.main.blocks.pp_benefits_Lfapdf.settings.pp_benefits_text1", `✔️ <strong>${productBenefits[0].benefit_summary}</strong>: ${productBenefits[0].benefit_description}`);
  // objectPath.set(productTemplate, "sections.main.blocks.pp_benefits_Lfapdf.settings.pp_benefits_text2", `✔️ <strong>${productBenefits[1].benefit_summary}</strong>: ${productBenefits[1].benefit_description}`);
  // objectPath.set(productTemplate, "sections.main.blocks.pp_benefits_Lfapdf.settings.pp_benefits_text3", `✔️ <strong>${productBenefits[2].benefit_summary}</strong>: ${productBenefits[2].benefit_description}`);
  // objectPath.set(productTemplate, "sections.main.blocks.pp_benefits_Lfapdf.settings.pp_benefits_text4", `✔️ <strong>${productBenefits[3].benefit_summary}</strong>: ${productBenefits[3].benefit_description}`);


  // objectPath.set(productTemplate, "sections.pp_image_with_benefits_gkXTTj.settings.image", convertToShopifyUrl(product.images[getLastIndex(1, product.images.length)]))
  // objectPath.set(productTemplate, "sections.pp_image_with_benefits_gkXTTj.blocks.benefit_7CB6Bn.settings.heading", `<strong>${productBenefits[0].benefit_summary}</strong>`);
  // objectPath.set(productTemplate, "sections.pp_image_with_benefits_gkXTTj.blocks.benefit_7CB6Bn.settings.text", `<p>${productBenefits[0].benefit_description}</p>`);
  // objectPath.set(productTemplate, "sections.pp_image_with_benefits_gkXTTj.blocks.benefit_7CB6Bn.settings.emoji", `<p>${productBenefits[0].benefit_emoji}</p>`);
  // objectPath.set(productTemplate, "sections.pp_image_with_benefits_gkXTTj.settings.text_alignment", "left");
  // objectPath.set(productTemplate, "sections.pp_image_with_benefits_gkXTTj.settings.text_mobilealignment", "left");

  
  // objectPath.set(productTemplate, "sections.pp_image_with_benefits_gkXTTj.blocks.benefit_7HpQgA.settings.heading", `<strong>${productBenefits[1].benefit_summary}</strong>`);
  // objectPath.set(productTemplate, "sections.pp_image_with_benefits_gkXTTj.blocks.benefit_7HpQgA.settings.text", `<p>${productBenefits[1].benefit_description}</p>`);
  // objectPath.set(productTemplate, "sections.pp_image_with_benefits_gkXTTj.blocks.benefit_7HpQgA.settings.emoji", `<p>${productBenefits[1].benefit_emoji}</p>`);

  // objectPath.set(productTemplate, "sections.pp_image_with_benefits_gkXTTj.blocks.benefit_erNb6q.settings.heading", `<strong>${productBenefits[2].benefit_summary}</strong>`);
  // objectPath.set(productTemplate, "sections.pp_image_with_benefits_gkXTTj.blocks.benefit_erNb6q.settings.text", `<p>${productBenefits[2].benefit_description}</p>`);
  // objectPath.set(productTemplate, "sections.pp_image_with_benefits_gkXTTj.blocks.benefit_erNb6q.settings.emoji", `<p>${productBenefits[2].benefit_emoji}</p>`);

  // objectPath.set(productTemplate, "sections.pp_image_with_benefits_gkXTTj.blocks.benefit_gJWaeR.settings.heading", `<strong>${productBenefits[3].benefit_summary}</strong>`);
  // objectPath.set(productTemplate, "sections.pp_image_with_benefits_gkXTTj.blocks.benefit_gJWaeR.settings.text", `<p>${productBenefits[3].benefit_description}</p>`);
  // objectPath.set(productTemplate, "sections.pp_image_with_benefits_gkXTTj.blocks.benefit_gJWaeR.settings.emoji", `<p>${productBenefits[3].benefit_emoji}</p>`);
  


  // prompt = {
  //   role: "user",
  //   content: `
  //     I need you to write the following copies for the everlasting flower arrangement - title: "${product.title}" and description: "${product.description}". 
  //     make sure all the following copies are relvant to the everlasting flower arrangement
  //     Write 10 realistic product reviews from customers. Make it around 40 words for each review
  //     output the copies in a json with the following shape [string] 
  //     `,
  // };
  // const productReviews = await generateVerifiedContent(systemMessage, prompt, copies => copies.length > 5 && copies.every(copy => typeof copy === 'string' || copy instanceof String));
  // console.log(productReviews)

  // const fakeUser = fakeUsers[Math.floor(Math.random() * 5000)];

  // objectPath.set(productTemplate, "sections.main.blocks.pp_review_DzipVt.settings.pp_review_text", `${productReviews[0]}`)
  // objectPath.set(productTemplate, "sections.main.blocks.pp_review_DzipVt.settings.pp_review_image", convertToShopifyUrl(fakeUser.shopifyImageUrl.url))
  // objectPath.set(productTemplate, "sections.main.blocks.pp_review_DzipVt.settings.pp_review_author_badge_text", `<p>${fakeUser.name.first} ${fakeUser.name.last.substring(0, 1)}<p>`)
  // objectPath.set(productTemplate, "sections.pp_reviews_dqQHmw.settings.text", `<p>Reviews from our happy customers</p>`);
  // const reviews = ["sections.pp_reviews_dqQHmw.blocks.review_h0ROJ1.settings",
  //   "sections.pp_reviews_dqQHmw.blocks.review_03zTee.settings",
  //   "sections.pp_reviews_dqQHmw.blocks.review_hQLmYM.settings",
  //   "sections.pp_reviews_dqQHmw.blocks.review_tUemu8.settings",
  //   "sections.pp_reviews_dqQHmw.blocks.review_J0mtgy.settings",
  // ];

  // for (let i = 0; i < reviews.length; i++) {
  //   const review = reviews[i];
  //   objectPath.set(productTemplate, review, {
  //     "image_border_radius": "low",
  //     "author_text": "Sophia M",
  //     "author_style": "subtitle",
  //     "author_color": "#000000",
  //     "author_badge_text": "Verified Purchase",
  //     "author_badge_text_style": "body",
  //     "author_badge_text_color": "#000000",
  //     "author_badge_color": "#2993f1",
  //     "stars_size": "sm",
  //     "stars_color": "#facc15",
  //     "stars_number": 5,
  //     "stars_alignment": "start",
  //     "stars_mobilealignment": "start",
  //     "review_text": "Amazing!!! 😍",
  //     "review_text_style": "body",
  //     "review_text_color": "#000000",
  //     "review_background_color": "#ffffff",
  //     "review_border_radius": "low"
  //   });
  //   objectPath.set(productTemplate, review + ".review_text", productReviews[i]);
  //   const fakeUser = fakeUsers[Math.floor(Math.random() * 5000)];
  //   objectPath.set(productTemplate, review + ".author_text", fakeUser.name.first + " " + fakeUser.name.last.substring(0, 1));
  // }


  // prompt = {
  //   role: "user",
  //   content: `
  //     I need you to write the following copies for the everlasting flower arrangement - title: "${product.title}" and description: "${product.description}". 
  //     make sure all the following copies are relvant to the everlasting flower arrangement
  //     Write 5 top things the customer would like about this everlasting flower arrangement. Make it less then 10 words for each
  //     output the copies in a json with the following shape [string] 
  //     `,
  // };
  // const productCustomerLikes = await generateVerifiedContent(systemMessage, prompt, copies => copies.length > 4 && copies.every(copy => copy));
  // const productCustomerLikes = [
  //   'Never fades, always fresh',
  //   'Unique and long-lasting decor',
  //   'Stylish light blue ceramic vase',
  //   'Perfect for home or as a gift',
  //   'Low maintenance, no watering needed'
  // ];

  // console.log(productCustomerLikes)
  // objectPath.set(productTemplate, "sections.pp_image_with_text_BVEaDq.settings.image", convertToShopifyUrl(product.images[getLastIndex(2, product.images.length)]))

  // objectPath.set(productTemplate, "sections.pp_image_with_percentage_fLf47C.blocks.heading_UYwMbc.settings.heading", `<strong>${product.title}</strong>`);
  // objectPath.set(productTemplate, "sections.pp_image_with_percentage_fLf47C.blocks.percent_MDgdzN.settings.text", `<p>${productCustomerLikes[0]}</p>`);
  // objectPath.set(productTemplate, "sections.pp_image_with_percentage_fLf47C.blocks.percent_DNwFD7.settings.text", `<p>${productCustomerLikes[1]}</p>`);
  // objectPath.set(productTemplate, "sections.pp_image_with_percentage_fLf47C.blocks.percent_Wh6UWW.settings.text", `<p>${productCustomerLikes[2]}</p>`);
  // objectPath.set(productTemplate, "sections.pp_image_with_percentage_fLf47C.settings.image", convertToShopifyUrl(product.images[getLastIndex(3, product.images.length)]))
  // objectPath.set(productTemplate, "sections.pp_image_with_percentage_fLf47C.blocks.percent_MDgdzN.settings.text_mobilealignment", "left");


  // prompt = {
  //   role: "user",
  //   content: `
  //     I need you to write the following copies for the everlasting flower arrangement - title: "${product.title}" and description: "${product.description}"
  //     make sure all the following copies are relvant to the everlasting flower arrangement
  //     Write 8 top frequently asked questions and their answers for the product
  //     output the copies in a json with the following shape [{question:string, answer:string}] 
  //     `,
  // };
  // const faqs = await generateVerifiedContent(systemMessage, prompt, copies => copies.length > 5 && copies.every(copy => copy.question && copy.answer));
  // const faqs = [

  //   {
  //     question: 'How long will the preserved flowers last?',
  //     answer: 'Preserved flowers typically last for several years with proper care, maintaining their beauty and color over time.'
  //   },
  //   {
  //     question: 'Is this arrangement suitable as a gift for someone?',
  //     answer: "Absolutely! This elegant arrangement makes a perfect gift for various occasions such as birthdays, anniversaries, or housewarmings. It's sure to be appreciated by anyone who loves lasting beauty."
  //   },

  //   {
  //     question: "What care tips do you have for maintaining the flowers' appearance?",
  //     answer: 'To keep your preserved flowers looking their best, avoid direct sunlight and moisture. Gently dust the flowers occasionally using a soft brush or cloth.'
  //   },
  //   {
  //     question: 'Are these flowers real or artificial?',
  //     answer: 'These are real flowers that have been specially preserved to maintain their natural color and texture, ensuring they last much longer than fresh flowers.'
  //   },
  //   {
  //     question: 'Can this product be shipped internationally?',
  //     answer: 'Unfortunately, we currently only offer shipping within our local region. Please check our website for international shipping options in the future.'
  //   }
  // ]
  // console.log(faqs)
  // objectPath.set(productTemplate, "sections.pp_faq_TtURdM", {
  //   "type": "pp-faq",
  //   "blocks": {
  //     "question_pDfeHc": {
  //       "type": "question",
  //       "settings": {
  //         "heading": "How long do preserved flowers last?",
  //         "heading_size": "h3",
  //         "heading_color": "#000000",
  //         "text": "<p>Preserved flowers can last anywhere from 1 to 3 years or even longer, depending on the preservation process and how well they are cared for. Unlike fresh flowers, which wilt within a week or two, preserved flowers maintain their appearance for a much longer time, making them a cost-effective and long-lasting alternative.</p>",
  //         "text_style": "body",
  //         "text_color": "#000000"
  //       }
  //     },
  //     "question_g9CWQL": {
  //       "type": "question",
  //       "settings": {
  //         "heading": "Are preserved flowers worth the price?",
  //         "heading_size": "h3",
  //         "heading_color": "#000000",
  //         "text": "<p>Yes, preserved flowers are typically twice the price of fresh flowers, but they last 100 times longer with minimal care. You won't need to replace them as often, making them a cost-effective option for home decor, events, or gifts.</p>",
  //         "text_style": "body",
  //         "text_color": "#000000"
  //       }
  //     },
  //     "question_mytQ4w": {
  //       "type": "question",
  //       "settings": {
  //         "heading": "Do preserved flowers look as good as fresh flowers?",
  //         "heading_size": "h3",
  //         "heading_color": "#000000",
  //         "text": "<p>Preserved flowers retain their natural look and feel, often appearing just as vibrant and beautiful as fresh flowers. The preservation process involves replacing the natural sap with a glycerin-based solution, which helps maintain the flower's texture and color. High-quality preserved flowers are almost indistinguishable from fresh ones.</p>",
  //         "text_style": "body",
  //         "text_color": "#000000"
  //       }
  //     },
  //     "question_ttcgg3": {
  //       "type": "question",
  //       "settings": {
  //         "heading": "What if I’m not satisfied with my purchase?",
  //         "heading_size": "h3",
  //         "heading_color": "#000000",
  //         "text": "<p>We stand by the quality of our everlasting flowers, with each product carefully inspected before shipping. If you receive a faulty or damaged item, we offer a full refund, including original shipping costs, within 30 days of receipt. However, for change of mind returns, the original shipping cost is non-refundable. For details, please visit our <a href=\"/pages/refund-return-policy\" target=\"_blank\" title=\"Refund & Return Policy\">return policy</a></p>",
  //         "text_style": "body",
  //         "text_color": "#000000"
  //       }
  //     },
  //     "question_rBC8jg": {
  //       "type": "question",
  //       "settings": {
  //         "heading": "Are preserved flowers safe for people with allergies?",
  //         "heading_size": "h3",
  //         "heading_color": "#000000",
  //         "text": "<p>Preserved flowers are generally safe for allergy sufferers as they don’t produce pollen, a common allergen. However, we recommend caution for individuals with a history of severe allergic reactions to flowers.</p>",
  //         "text_style": "body",
  //         "text_color": "#000000"
  //       }
  //     },
  //     "question_N8bj98": {
  //       "type": "question",
  //       "settings": {
  //         "heading": "How do I care for preserved flowers?",
  //         "heading_size": "h3",
  //         "heading_color": "#000000",
  //         "text": "<p>Caring for preserved flowers is simple. Keep them out of direct sunlight to prevent fading, avoid placing them in humid areas, and do not water them. Dusting them gently with a soft brush or using a hairdryer on a cool setting can help maintain their appearance.</p>",
  //         "text_style": "body",
  //         "text_color": "#000000"
  //       }
  //     },
  //     "question_QDbRCV": {
  //       "type": "question",
  //       "settings": {
  //         "heading": "Do preserved flowers have a scent?",
  //         "heading_size": "h3",
  //         "heading_color": "#000000",
  //         "text": "<p>Preserved flowers typically do not retain their natural scent. However, you can add a pleasant fragrance by placing scented sachets or essential oils nearby. This way, you can enjoy the visual beauty of the flowers along with a delightful aroma.</p>",
  //         "text_style": "body",
  //         "text_color": "#000000"
  //       }
  //     },
  //     "question_BXXXcA": {
  //       "type": "question",
  //       "settings": {
  //         "heading": "Are preserved flowers eco-friendly?",
  //         "heading_size": "h3",
  //         "heading_color": "#000000",
  //         "text": "<p>Preserved flowers are more eco-friendly than fresh flowers, especially if they are sourced sustainably. The preservation process can extend the life of the flowers, reducing the need for frequent replacements and the associated environmental impact of growing, harvesting, and transporting fresh flowers.</p>",
  //         "text_style": "body",
  //         "text_color": "#000000"
  //       }
  //     }
  //   },
  //   "block_order": [
  //     "question_pDfeHc",
  //     "question_g9CWQL",
  //     "question_mytQ4w",
  //     "question_ttcgg3",
  //     "question_rBC8jg",
  //     "question_N8bj98",
  //     "question_QDbRCV",
  //     "question_BXXXcA"
  //   ],
  //   "settings": {
  //     "heading": "Frequently Asked Questions",
  //     "heading_size": "h1",
  //     "heading_alignment": "center",
  //     "heading_mobilealignment": "center",
  //     "heading_color": "#000000",
  //     "text": "",
  //     "text_style": "subtitle",
  //     "text_alignment": "center",
  //     "text_mobilealignment": "center",
  //     "text_color": "#000000",
  //     "border_size": "small",
  //     "rounded_corners": "medium",
  //     "border_color": "#d0d5dd",
  //     "question_background_color": "#FAFAFA",
  //     "arrow_color": "#000000",
  //     "gradient": "",
  //     "padding_top": 0,
  //     "padding_bottom": 0,
  //     "margin_top": 0,
  //     "margin_bottom": 0
  //   }
  // });




  // objectPath.set(productTemplate, "sections.pp_guarantee_NNKyJ6.blocks.text_N44eGB.settings.text_alignment", "left");
  // objectPath.set(productTemplate, "sections.pp_guarantee_NNKyJ6.blocks.text_N44eGB.settings.text_mobilealignment", "left");
  // objectPath.set(productTemplate, "sections.pp_guarantee_NNKyJ6.blocks.heading_jfhp4z.settings.heading_alignment", "center");
  // objectPath.set(productTemplate, "sections.pp_guarantee_NNKyJ6.blocks.heading_jfhp4z.settings.heading_mobilealignment", "center");
  // objectPath.set(productTemplate, "sections.pp_guarantee_NNKyJ6.blocks.text_N44eGB.settings.text_alignment", "left");
  // objectPath.set(productTemplate, "sections.pp_guarantee_NNKyJ6.blocks.text_N44eGB.settings.heading_mobilealignment", "left");
  // objectPath.set(productTemplate, "sections.pp_guarantee_NNKyJ6.blocks.heading_jfhp4z.settings.heading", `Why does More Than Flowers stand out?`);
  // objectPath.set(productTemplate, "sections.pp_guarantee_NNKyJ6.blocks.text_N44eGB.settings.text", `<p>More Than Flowers offers a unique combination of timeless beauty, sustainability, and expertise that others lack. With over eight years of experience, we create everlasting floral arrangements that bring enduring elegance, while our eco-friendly approach ensures a positive impact on the planet. Each piece is designed to add a touch of sophistication to any space, making it perfect for both special occasions and everyday décor.</p>`);


  // objectPath.set(productTemplate, "sections.main.blocks.pp_expandable_r43w6T.settings.pp_expandable_title3", "🏅 30-Day Money Back Guarantee");
  // objectPath.set(productTemplate, "sections.main.blocks.pp_expandable_r43w6T.settings.pp_expandable_content3", `<p>We stand by the quality of our everlasting flowers, with each product carefully inspected before shipping. If you receive a faulty or damaged item, we offer a full refund, including original shipping costs, within 30 days of receipt. However, for change of mind returns, the original shipping cost is non-refundable. For details, please visit our <a href=\"https://morethanflowers.com.au/pages/refund-return-policy\" target=\"_blank\" title=\"Refund Policy\">return policy</a></p>`);




  // objectPath.set(productTemplate, "sections.main.block_order", [
  //   "reviews_number_wmFXyt",
  //   "product_title_DXtTRC",
  //   "price",
  //   "pp_text_VLf9ic",
  //   "pp_benefits_Lfapdf",
  //   "custom_liquid_4fWeNX",
  //   "variant_picker",
  //   "quantity_selector",
  //   "buy_buttons",
  //   "pp_guarantees_JzRPwy",
  //   "pp_review_DzipVt",
  //   "pp_expandable_r43w6T"
  // ]);

  return productTemplate;
}


async function updateProduct(product, fakeUsers) {
  let productTemplate;
  console.log(product);
  if (product.templateSuffix === product.id) {
    productTemplate = JSON.parse(await retrieveProductTemplateFile(148587086038, product.id));
  } else {
    productTemplate = JSON.parse(fs.readFileSync("./product_template.json"));
  }

  productTemplate = await fillProductTemplateWithCopies(product, productTemplate);

  const data = await insertProductTemplate(148587086038, product.id, JSON.stringify(productTemplate).replace("👉🏻", "").replace("👉🏻", ""));
  console.log(JSON.stringify(data, null, 4))

  if (data.themeFilesUpsert.userErrors.length === 0) {
    const data = await updateProductTemplate(product.id, product.id.toString());
    console.log(JSON.stringify(data, null, 4))
    return productTemplate;
  } else {
    return null;
  }
}


async function updateAllProducts() {
  const updatedProducts = JSON.parse(fs.readFileSync("./updated_products.json"));

  const products = await retrieveProducts();
  for (const product of products) {
    if (updatedProducts[product.id]) {
      console.log("skipping: ", product.id)
      continue;
    }
    const updatedTemplated = await updateProduct(product, fakeUsers)
    if (updatedTemplated) {
      updatedProducts[product.id] = product.id;
      fs.writeFileSync('./updated_products.json', JSON.stringify(updatedProducts), 'utf8');
    } else {
      break;
    }

  }
}

updateAllProducts();