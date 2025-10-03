// Message handler for content scripts
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.action === "addItem") {
    // Load existing cart from storage
    chrome.storage.local.get("cart", (data) => {
      const cart = data.cart || [];

      // Add new item to cart (with unique ID)
      const newItem = {
        id: Date.now() + Math.random(), // Unique ID
        ...msg.item
      };

      cart.push(newItem);

      // Save updated cart
      chrome.storage.local.set({ cart }, () => {
        console.log("✅ Product added to cart:", newItem.name);
        sendResponse({ success: true });
      });
    });

    return true; // Keep message channel open for async response
  }

  if (msg.action === "openCompare") {
    chrome.tabs.create({ url: chrome.runtime.getURL("compare.html") });
  }

  if (msg.action === "deleteItem") {
    chrome.storage.local.get("cart", (data) => {
      const cart = data.cart || [];
      const updatedCart = cart.filter(item => item.id !== msg.itemId);
      chrome.storage.local.set({ cart: updatedCart }, () => {
        sendResponse({ success: true });
      });
    });
    return true;
  }

  if (msg.action === "clearCart") {
    chrome.storage.local.set({ cart: [] }, () => {
      sendResponse({ success: true });
    });
    return true;
  }
});
