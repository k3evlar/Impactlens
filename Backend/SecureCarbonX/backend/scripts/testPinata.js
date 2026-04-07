require("dotenv").config({ path: "securecarbonx.env" });
const pinataSDK = require("@pinata/sdk");

const pinata = new pinataSDK(
  process.env.PINATA_API_KEY,
  process.env.PINATA_SECRET_API_KEY
);

console.log("Checking Pinata Authentication...");
pinata.testAuthentication()
  .then(res => {
    console.log("✅ Pinata Connected Successfully!");
    console.log("Response:", res);
  })
  .catch(err => {
    console.error("❌ Pinata Auth Failed. Check your API Keys in .env.");
    console.error(err);
  });
