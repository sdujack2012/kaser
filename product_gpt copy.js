

const createCsvWriter = require("csv-writer").createObjectCsvWriter;

const csvWriter = createCsvWriter({
  path: "./2023_sizePrice_number.csv",
  header: [
    { id: "size", title: "size" },
    { id: "price", title: "price" },
    { id: "vendorPrice", title: "vendorPrice" },
    { id: "replace", title: "replace" },
    { id: "delete", title: "delete" },
  ]
});

const fs = require("fs");
const csv = require("csvtojson");

async function processCSVs() {
  const newSizePrice = {};
  const sizeToRemove = {};
  const sizeToReplace = {};
  (await csv().fromFile(
    "./2023_size_refind.csv"
  )).forEach(row => {
    const size = row.size.trim();
    
    if(row.price) {
      newSizePrice[size] = row.price;
    } else if(row.replacement) {
      sizeToReplace[size] = row.replacement;
    } else {
      sizeToRemove[size] = 'Yes';
    }
  });

  var records = JSON.parse(fs.readFileSync('refineJson_new.json', 'utf8'));
	

	const sizeAndPrices = {};

	records.forEach(record => {
		record.sizePrices.forEach(sizePrice => {
      const simpleSize = sizePrice.size
      .replace(/\*/g, 'x')
      .replace(/cm/g, ' ')
      .replace(/\(/g, 'x')
      .replace(/\)/g, ' ')
      .replace(/  /g, ' ')
      .replace(/ x/g, 'x')
      .replace(/pc/g, ' ')
      .replace(/  /g, ' ')
      .replace(/  /g, ' ')
      .trim();


			sizeAndPrices[simpleSize] = {
        size: simpleSize,
        price: sizePrice.price,
        vendorPrice: newSizePrice[simpleSize],
        delete: sizeToRemove[simpleSize],
        replace: sizeToReplace[simpleSize],
      }
		});
	});

  let rows = Object.values(sizeAndPrices);

  csvWriter
    .writeRecords(rows) // returns a promise
    .then(() => {
      console.log("...Done");
    });

}

processCSVs();