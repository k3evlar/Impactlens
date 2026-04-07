const pinataSDK = require("@pinata/sdk");

const apiKey = process.argv[2];
const apiSecret = process.argv[3];

if (!apiKey || !apiSecret) {
  console.error("❌ Error: Please provide API Key and Secret as arguments.");
  console.log("Usage: node scripts/testPinataDirect.js <KEY> <SECRET>");
  process.exit(1);
}

const pinata = new pinataSDK(apiKey, apiSecret);

console.log(`Checking Pinata Authentication for Key: ${apiKey.substring(0, 5)}...`);
pinata.testAuthentication()
  .then(res => {
    console.log("✅ Pinata Connected Successfully via Direct Keys!");
    console.log("Response:", res);
  })
  .catch(err => {
    console.error("❌ Pinata Auth Failed with these specific keys:");
    console.error(err);
  });
