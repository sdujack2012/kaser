import { uploadImage, getImageById } from "./shopifyFunctions.js";
import fs from "fs";

async function uploadProfileImages() {
  const allFakeUsers = JSON.parse(fs.readFileSync("./fakeusers.json"));
  for (let fakeUser of allFakeUsers) {
    if (fakeUser.shopifyImageId) continue;
    const data = await uploadImage(
      fakeUser.picture.large,
      `profile file for customer ${fakeUser.name.first + " " + fakeUser.name.last}`
    );

    fakeUser.shopifyImageId = data.fileCreate.files[0].id;
    await new Promise((r) => setTimeout(r, 500));
    fs.writeFileSync("./fakeusers.json", JSON.stringify(allFakeUsers), "utf8");
  }

  for (let fakeUser of allFakeUsers) {
    if (fakeUser.shopifyImageUrl) continue;
    let imageUrl = null;
    while (!imageUrl) {
      const data = await getImageById(fakeUser.shopifyImageId);

      if (data.node.image) {
        imageUrl = data.node.image;
        fakeUser.shopifyImageUrl = imageUrl;
        console.log(JSON.stringify(data, null, 4));
      }
      await new Promise((r) => setTimeout(r, 500));
    }

    fs.writeFileSync("./fakeusers.json", JSON.stringify(allFakeUsers), "utf8");
  }
}

uploadProfileImages();
