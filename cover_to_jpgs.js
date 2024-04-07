const fs = require("fs");
const sharp = require('sharp');


async function covertWebpToJpg() {
  const photos = fs.readdirSync("./pearl");
   
  for (let photo of photos) {
    
    if(photo.endsWith('.jpg') || photo.endsWith('.png') ) {
      await sharp('./pearl/' + photo).resize({ width: 750 }).jpeg({ mozjpeg: true }).toFile('./pearl/converted/' + photo.split(".")[0]+'.jpg');
    }
    
  }
}




// async function covertWebpToJpg() {
//   const photos = fs.readdirSync("./ocean");
   
//   for (let photo of photos) {
//     if(photo.endsWith('.webp')) {
//       await sharp('./ocean/' + photo).jpeg({ mozjpeg: true }).toFile('./ocean/converted/' + photo.replace('.webp', '.jpg'))
//     }

//     if(photo.endsWith('.png')) {
//       await sharp('./ocean/' + photo).jpeg({ mozjpeg: true }).toFile('./ocean/converted/' + photo.replace('.png', '.jpg'))
//     }
    
//   }
// }

covertWebpToJpg();