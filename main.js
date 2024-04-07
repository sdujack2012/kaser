const puppeteer = require("puppeteer");

async function parseLogRocketBlogHome() {
    // Launch the browser
    const browser = await puppeteer.launch({ headless: true });

    // Open a new tab
    const page = await browser.newPage(); 


    // Visit the page and wait until network connections are completed
    await page.goto('https://www.alibaba.com/product-detail/Gold-jewelry-designs-for-girls-Royal_60628275515.html?spm=a2700.galleryofferlist.p_offer.d_image.2dac7236aERolB&s=p',
    { waitUntil: 'domcontentloaded' } );
    // Interact with the DOM to retrieve the titles
    // const titles = await page.evaluate(() => { 
    //     // Select all elements with crayons-tag class 
    //     return [...document.querySelectorAll('.product-title h1')].map(el => el.textContent);
    // });
    await page.waitForSelector("div.main-screen");    
    try {

        await page.click(".view-more");
        await page.click(".view-more");
        await page.click(".view-more");
    }
    catch(ex) {

    }
    const properties = await page.evaluate(async () => { 
        const productTitle = document.querySelector('div.product-title').textContent;
         const productPrice = document.querySelector('div.price-range span.price').textContent;
         const productUnit = document.querySelector('div.price-range span.unit').textContent;
         const productMinOrderQuantity = document.querySelector('div.price-range span.moq').textContent;
         const productPromotion = document.querySelector('div.detail-promotion').textContent;
         const productBuyerBenefits = document.querySelector('div.buyer-benefits').textContent;

         const productVariants = {};

         const productVariantSections =  document.querySelectorAll('div.sku-item');
         
         const productDetails =  document.querySelectorAll('.structure-row .col-left');
         productDetails.forEach(productDetail => {
            console.log(productDetail.textContent)
         })
         productVariantSections.forEach( productVariantSection => {
            const label = productVariantSection.querySelector("label").textContent;
            const productVariantOptionElements = productVariantSection.querySelectorAll(".sku-option");
            const productVariantOptions = []
            productVariantOptionElements.forEach(productVariantOption => {
                const image = productVariantOption.querySelector("img");
                const value = productVariantOption.querySelector("span.txt");
                const price = productVariantOption.querySelector("span.price");
                productVariantOptions.push( { image: image?.src, value:value?.textContent, value:price?.textContent})            
            })
            productVariants[label] = productVariantOptions;

         })

         const productImages = [];
         const productImageElements = document.querySelectorAll('div[class^="magic-"]  img');
         productImageElements.forEach( image => {
            productImages.push(image.getAttribute("data-src"))
         })
               
       
        return { productTitle, productPrice, productUnit, productMinOrderQuantity, productPromotion, productBuyerBenefits, productVariants, productImages};
    });
    // Don't forget to close the browser instance to clean up the memory
    await browser.close();
    console.log(properties);
    // Print the results
}

parseLogRocketBlogHome();