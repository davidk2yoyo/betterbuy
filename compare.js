let cart = [];
let selectedProducts = new Set();

// Load and render cart
async function loadCart() {
  const data = await chrome.storage.local.get("cart");
  cart = data.cart || [];

  updateProductCount();
  renderProducts();
  updateCompareButton();
}

// Update product count in header
function updateProductCount() {
  const countEl = document.getElementById("product-count");
  const count = cart.length;
  const selectedCount = selectedProducts.size;

  if (count === 0) {
    countEl.textContent = "No products saved yet";
  } else {
    countEl.textContent = `${count} product${count !== 1 ? 's' : ''} saved${selectedCount > 0 ? ` · ${selectedCount} selected` : ''}`;
  }
}

// Render products grid
function renderProducts() {
  const container = document.getElementById("cart-container");

  if (cart.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <h2>🛍️ Your cart is empty</h2>
        <p>Start adding products from shopping sites to compare them here!</p>
      </div>
    `;
    return;
  }

  const grid = document.createElement("div");
  grid.className = "products-grid";

  cart.forEach(product => {
    const card = createProductCard(product);
    grid.appendChild(card);
  });

  container.innerHTML = "";
  container.appendChild(grid);
}

// Create individual product card
function createProductCard(product) {
  const card = document.createElement("div");
  card.className = "product-card";
  card.dataset.id = product.id;

  if (selectedProducts.has(product.id)) {
    card.classList.add("selected");
  }

  const imageUrl = product.image || 'icons/icon128.png';

  // Extract store name from URL
  const storeName = extractStoreName(product.url);

  // Format price display with currency conversion
  let priceDisplay = product.price;
  if (product.priceUSD && product.currency !== 'USD') {
    priceDisplay = `
      <div class="price-original">${product.currency} ${product.price} ${product.countryFlag || ''}</div>
      <div class="price-converted">≈ USD $${product.priceUSD.toFixed(2)}</div>
    `;
  } else if (product.countryFlag) {
    priceDisplay = `${product.countryFlag} ${product.price}`;
  }

  card.innerHTML = `
    <img src="${imageUrl}" alt="${product.name}" class="product-image" onerror="this.src='icons/icon128.png'">
    <div class="product-content">
      <div class="product-header">
        <input type="checkbox" class="product-checkbox" data-id="${product.id}" ${selectedProducts.has(product.id) ? 'checked' : ''}>
        <h3 class="product-title">${product.name}</h3>
      </div>
      <span class="store-badge">${product.countryFlag || ''} ${storeName}</span>
      <div class="product-price">${priceDisplay}</div>
      <p class="product-description">${product.description || 'No description available'}</p>
      <div class="product-footer">
        <button class="btn btn-small btn-visit" data-url="${product.url}">
          🔗 Visit
        </button>
        <button class="btn btn-small btn-delete" data-id="${product.id}">
          🗑️ Delete
        </button>
      </div>
    </div>
  `;

  return card;
}

// Extract store name from URL
function extractStoreName(url) {
  try {
    const hostname = new URL(url).hostname;

    // Remove www. and common TLDs
    let storeName = hostname
      .replace(/^www\./, '')
      .replace(/\.(com|org|net|io|co|uk|ca|au)$/, '');

    // Capitalize first letter
    storeName = storeName.charAt(0).toUpperCase() + storeName.slice(1);

    return storeName;
  } catch (e) {
    return 'Unknown';
  }
}

// Handle product selection
document.addEventListener("change", (e) => {
  if (e.target.classList.contains("product-checkbox")) {
    const productId = parseFloat(e.target.dataset.id);
    const card = e.target.closest(".product-card");

    if (e.target.checked) {
      selectedProducts.add(productId);
      card.classList.add("selected");
    } else {
      selectedProducts.delete(productId);
      card.classList.remove("selected");
    }

    updateProductCount();
    updateCompareButton();
  }
});

// Update compare button state
function updateCompareButton() {
  const compareBtn = document.getElementById("compare-selected");
  compareBtn.disabled = selectedProducts.size < 2;
}

// Handle button clicks
document.addEventListener("click", async (e) => {
  // Visit product
  if (e.target.classList.contains("btn-visit")) {
    const url = e.target.dataset.url;
    window.open(url, "_blank");
  }

  // Delete product
  if (e.target.classList.contains("btn-delete")) {
    const productId = parseFloat(e.target.dataset.id);
    if (confirm("Delete this product from your cart?")) {
      chrome.runtime.sendMessage({ action: "deleteItem", itemId: productId }, () => {
        selectedProducts.delete(productId);
        loadCart();
      });
    }
  }

  // Clear all
  if (e.target.closest("#clear-all")) {
    if (confirm("Clear all products from your cart?")) {
      chrome.runtime.sendMessage({ action: "clearCart" }, () => {
        selectedProducts.clear();
        loadCart();
        document.getElementById("ai-result").innerHTML = "";
      });
    }
  }

  // AI Compare
  if (e.target.closest("#compare-selected")) {
    await runAIComparison();
  }
});

// Run AI-powered comparison
async function runAIComparison() {
  const selectedItems = cart.filter(p => selectedProducts.has(p.id));

  if (selectedItems.length < 2) {
    alert("Please select at least 2 products to compare");
    return;
  }

  const resultDiv = document.getElementById("ai-result");
  resultDiv.innerHTML = `
    <div class="ai-comparison">
      <h2>
        <span>✨</span>
        <span>AI-Powered Comparison</span>
        <span class="loading"></span>
      </h2>
      <div class="ai-comparison-content">Analyzing products...</div>
    </div>
  `;

  try {
    // Check if AI is available
    const availability = await LanguageModel.availability();

    if (availability === 'unavailable') {
      throw new Error("AI not available");
    }

    // Create prompt for comparison with USD prices for fair comparison
    const productsInfo = selectedItems.map((p, i) => {
      let priceInfo;
      if (p.priceUSD && p.currency !== 'USD') {
        priceInfo = `USD $${p.priceUSD.toFixed(2)} (original: ${p.currency} ${p.price})`;
      } else if (p.priceUSD) {
        priceInfo = `USD $${p.priceUSD.toFixed(2)}`;
      } else {
        priceInfo = p.price;
      }

      return `Product ${i + 1}:
Name: ${p.name}
Price: ${priceInfo}
Description: ${p.description || 'N/A'}`;
    }).join("\n\n");

    const prompt = `You are a helpful shopping assistant. Compare these products and provide a recommendation on which one offers the best value.

${productsInfo}

Please provide:
1. A brief comparison of key features
2. Price analysis (all prices are already converted to USD for fair comparison)
3. Your recommendation and why
4. Any important considerations

Keep your response concise and helpful.`;

    // Use Chrome's built-in Language Model API (correct syntax)
    const session = await LanguageModel.create({
      initialPrompts: [
        { role: "system", content: "You are a helpful shopping assistant that provides honest, concise product comparisons." }
      ]
    });

    const result = await session.prompt(prompt);

    // Convert markdown-style text to HTML
    const formattedResult = result
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')  // Bold
      .replace(/\* /g, '<br>• ')  // Bullet points
      .replace(/\n/g, '<br>');  // Line breaks

    resultDiv.innerHTML = `
      <div class="ai-comparison">
        <h2>
          <span>✨</span>
          <span>AI-Powered Comparison</span>
          <span class="badge">${selectedItems.length} products</span>
        </h2>
        <div class="ai-comparison-content">${formattedResult}</div>
      </div>
    `;

    session.destroy();

  } catch (error) {
    console.log("AI comparison not available, showing basic comparison");

    // Fallback to basic comparison
    const fallbackComparison = generateBasicComparison(selectedItems);

    // Create elements safely to avoid HTML injection issues
    resultDiv.innerHTML = '';
    const comparisonDiv = document.createElement('div');
    comparisonDiv.className = 'ai-comparison';

    const heading = document.createElement('h2');
    heading.innerHTML = `
      <span>📊</span>
      <span>Basic Comparison</span>
      <span class="badge">AI unavailable</span>
    `;

    const contentDiv = document.createElement('div');
    contentDiv.className = 'ai-comparison-content';
    contentDiv.textContent = fallbackComparison; // Use textContent for plain text

    comparisonDiv.appendChild(heading);
    comparisonDiv.appendChild(contentDiv);
    resultDiv.appendChild(comparisonDiv);
  }
}

// Fallback comparison when AI is not available
function generateBasicComparison(products) {
  // Create a clean table format
  let comparison = "╔══════════════════════════════════════════════════════════════════════════════╗\n";
  comparison += "║                         PRODUCT COMPARISON TABLE                             ║\n";
  comparison += "╚══════════════════════════════════════════════════════════════════════════════╝\n\n";

  products.forEach((p, i) => {
    comparison += `┌─ Product ${i + 1} `;
    comparison += "─".repeat(70 - `Product ${i + 1} `.length) + "┐\n";
    comparison += `│ NAME:  ${p.name.substring(0, 70)}\n`;
    comparison += `│ PRICE: ${p.price}\n`;

    if (p.description && p.description.length > 5) {
      const desc = p.description.substring(0, 200);
      comparison += `│ INFO:  ${desc}${desc.length >= 200 ? '...' : ''}\n`;
    } else {
      comparison += `│ INFO:  No description available\n`;
    }

    comparison += `└${"─".repeat(76)}┘\n\n`;
  });

  // Find cheapest product
  const prices = products.map(p => {
    const match = p.price.match(/[\d,.]+/);
    return match ? parseFloat(match[0].replace(',', '')) : Infinity;
  });
  const cheapestIndex = prices.indexOf(Math.min(...prices));

  comparison += "\n📊 QUICK ANALYSIS:\n";
  comparison += "─".repeat(78) + "\n";
  comparison += `💰 Best Price: Product ${cheapestIndex + 1} (${products[cheapestIndex].price})\n`;
  comparison += `📦 Total Products Compared: ${products.length}\n\n`;

  comparison += "💡 NOTE: AI comparison is currently unavailable.\n";
  comparison += "   To enable Chrome's built-in AI:\n";
  comparison += "   1. Visit: chrome://flags/#optimization-guide-on-device-model\n";
  comparison += "   2. Set to: 'Enabled BypassPerfRequirement'\n";
  comparison += "   3. Visit: chrome://flags/#prompt-api-for-gemini-nano\n";
  comparison += "   4. Set to: 'Enabled'\n";
  comparison += "   5. Restart Chrome and wait for AI model to download (~10-15 min)\n";

  return comparison;
}

// Initialize on load
loadCart();
