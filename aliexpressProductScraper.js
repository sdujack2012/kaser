import puppeteer from "puppeteer";

export async function scrapeAliexpressProductById(id) {
  // Launch the browser
  const browser = await puppeteer.launch({
    headless: true,
    args: [".disable notifications"],
  });
  const page = await browser.newPage();

  // Navigate to the AliExpress product page
  const productUrl = `https://www.aliexpress.com/item/${id}.html`; // Replace with the actual product URL
  // Get main product info
  const [productInfoResponse] = await Promise.all([
    page.waitForResponse(async (response) => {
      if (
        response.url().includes("acs.aliexpress.com") &&
        response.status() === 200
      ) {
        const text = await response.text();
        if (!text.includes("FAIL_SYS_TOKEN_EMPTY::令牌为空")) {
          return true;
        }
      }
      return false;
    }),
    page.goto(productUrl, { waitUntil: "domcontentloaded" }),
  ]);

  const text = await productInfoResponse.text();
  const res = JSON.parse(text.match(/\{[\s\S]{1,}\}/gm)[0]);

  const result = res.data.result;

  // Get product reviews
  const loadReviewSelector =
    "#nav-review .comet-v2-btn-important.comet-v2-btn-large";
  await page.waitForSelector(loadReviewSelector);
  await page.evaluate((loadReviewSelector) => {
    document.querySelector(loadReviewSelector).click();
  }, loadReviewSelector);

  const reviewResponsePromise = page.waitForResponse(async (response) => {
    if (
      response
        .url()
        .includes("eedback.aliexpress.com/pc/searchEvaluation.do") &&
      response.status() === 200
    ) {
      const reviews = await response.json();
      if (reviews.data.evaViewList) {
        return true;
      }
    }
    return false;
  });

  const reviewResponse = await reviewResponsePromise;

  const {
    data: { evaViewList: reviews },
  } = await reviewResponse.json();

  // Get description
  const loadMoreSelector = ".description--wrap--LscZ0He .comet-v2-btn";
  await page.waitForSelector(loadMoreSelector);
  await page.click(loadMoreSelector);

  const descriptionSelector = await page.waitForSelector(
    ".description--wrap--LscZ0He"
  );
  const description = await descriptionSelector?.evaluate(
    (el) => el.textContent
  );

  await browser.close();

  const skus = [];

  const options = result.SKU.skuProperties.map((skuProperty) => ({
    name: skuProperty.skuPropertyName,
    id: skuProperty.skuPropertyId,
    values: skuProperty.skuPropertyValues.map((skuPropertyValue) => ({
      value: skuPropertyValue.propertyValueDefinitionName,
      displayName: skuPropertyValue.propertyValueDisplayName,
      image: skuPropertyValue.skuPropertyImagePath,
      id: skuPropertyValue.propertyValueIdLong,
    })),
  }));

  result.SKU.skuPaths.forEach((skuPath) => {
    const sku = {
      id: skuPath.skuIdStr,
      stock: skuPath.skuStock,
      options: [],
      image: result.HEADER_IMAGE_PC.skuImagesMap[skuPath.skuIdStr][0],
      price: result.PRICE.skuIdStrPriceInfoMap[skuPath.skuIdStr].originalPrice,
    };

    const optionValueIds = skuPath.path.split(";");

    for (let optionValueId of optionValueIds) {
      const [optionId, valueId] = optionValueId.split(":");
      const option = options.find((option) => option.id == optionId);
      const value = option.values.find((value) => value.id == valueId);
      sku.options.push({ option, value });
    }

    skus.push(sku);
  });
  const productInfo = {
    images: result.HEADER_IMAGE_PC.imagePathList,
    title: result.PRODUCT_TITLE.text,
    description,
    skus,
    options,
    reviews: reviews.map((review) => ({
      stars: Math.floor(review.buyerEval / 20),
      review: review.buyerTranslationFeedback,
      images: review.images,
    })),
  };

  return productInfo;
}
