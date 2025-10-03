// Debug script - run this in DevTools Console to check BetterBuy status

console.log("🔍 BetterBuy Debug Check Starting...\n");

// Check 1: Extension loaded
const button = document.getElementById("betterbuy-btn");
const menu = document.getElementById("betterbuy-menu");

console.log("1️⃣ Floating Button Present:", button ? "✅ YES" : "❌ NO");
console.log("2️⃣ Menu Present:", menu ? "✅ YES" : "❌ NO");

if (button) {
  console.log("   Button visible:", button.style.display !== "none" ? "✅ YES" : "❌ NO");
  console.log("   Button src:", button.src);
}

// Check 2: Storage
chrome.storage.local.get("cart", (data) => {
  console.log("3️⃣ Saved Products:", data.cart ? data.cart.length : 0);
  if (data.cart && data.cart.length > 0) {
    console.log("   Last product:", data.cart[data.cart.length - 1].name);
  }
});

// Check 3: AI Status
(async () => {
  try {
    const capabilities = await ai.languageModel.capabilities();
    console.log("4️⃣ AI Language Model:", capabilities.available);
  } catch (err) {
    console.log("4️⃣ AI Language Model: ❌ Error:", err.message);
  }

  try {
    const sumCapabilities = await ai.summarizer.capabilities();
    console.log("5️⃣ AI Summarizer:", sumCapabilities.available);
  } catch (err) {
    console.log("5️⃣ AI Summarizer: ❌ Error:", err.message);
  }
})();

// Check 4: Current page info
console.log("\n📄 Current Page Info:");
console.log("   URL:", window.location.href.substring(0, 100) + "...");
console.log("   Title:", document.title);

console.log("\n✅ Debug check complete!");
