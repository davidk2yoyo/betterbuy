console.log("✅ BetterBuy content script loaded on:", window.location.href);

// Currency and country detection helpers
const CURRENCY_MAP = {
  '.mx': { code: 'MXN', symbol: 'MXN $', flag: '🇲🇽', country: 'Mexico' },
  '.com.mx': { code: 'MXN', symbol: 'MXN $', flag: '🇲🇽', country: 'Mexico' },
  '.com': { code: 'USD', symbol: '$', flag: '🇺🇸', country: 'USA' },
  '.ca': { code: 'CAD', symbol: 'CAD $', flag: '🇨🇦', country: 'Canada' },
  '.co.uk': { code: 'GBP', symbol: '£', flag: '🇬🇧', country: 'UK' },
  '.uk': { code: 'GBP', symbol: '£', flag: '🇬🇧', country: 'UK' },
  '.de': { code: 'EUR', symbol: '€', flag: '🇩🇪', country: 'Germany' },
  '.fr': { code: 'EUR', symbol: '€', flag: '🇫🇷', country: 'France' },
  '.es': { code: 'EUR', symbol: '€', flag: '🇪🇸', country: 'Spain' },
  '.it': { code: 'EUR', symbol: '€', flag: '🇮🇹', country: 'Italy' },
  '.jp': { code: 'JPY', symbol: '¥', flag: '🇯🇵', country: 'Japan' },
  '.au': { code: 'AUD', symbol: 'AUD $', flag: '🇦🇺', country: 'Australia' },
  '.br': { code: 'BRL', symbol: 'R$', flag: '🇧🇷', country: 'Brazil' }
};

// Exchange rates cache (updates daily)
let exchangeRates = null;
let ratesLastFetched = null;

// Detect currency from URL
function detectCurrency(url) {
  try {
    const hostname = new URL(url).hostname;

    // Check for domain matches
    for (const [domain, info] of Object.entries(CURRENCY_MAP)) {
      if (hostname.endsWith(domain)) {
        return info;
      }
    }

    // Default to USD
    return CURRENCY_MAP['.com'];
  } catch (e) {
    return CURRENCY_MAP['.com'];
  }
}

// Fetch exchange rates (free API, no key needed)
async function getExchangeRates() {
  const ONE_DAY = 24 * 60 * 60 * 1000;

  // Check cache
  if (exchangeRates && ratesLastFetched && (Date.now() - ratesLastFetched < ONE_DAY)) {
    return exchangeRates;
  }

  try {
    const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
    const data = await response.json();
    exchangeRates = data.rates;
    ratesLastFetched = Date.now();
    return exchangeRates;
  } catch (error) {
    console.log("Could not fetch exchange rates, using fallback");
    // Fallback rates (approximate)
    return {
      USD: 1,
      MXN: 18,
      CAD: 1.35,
      GBP: 0.79,
      EUR: 0.92,
      JPY: 149,
      AUD: 1.52,
      BRL: 4.95
    };
  }
}

// Convert price to USD
async function convertToUSD(priceString, currencyCode) {
  // Extract numeric value from price string
  const numericPrice = parseFloat(priceString.replace(/[^0-9.]/g, ''));

  if (isNaN(numericPrice)) {
    return null;
  }

  if (currencyCode === 'USD') {
    return numericPrice;
  }

  const rates = await getExchangeRates();
  const rate = rates[currencyCode];

  if (!rate) {
    return null;
  }

  return numericPrice / rate;
}

// Create floating BetterBuy button
const btn = document.createElement("img");
btn.id = "betterbuy-btn";
btn.src = chrome.runtime.getURL("icons/icon48.png");
btn.alt = "BetterBuy";
document.body.appendChild(btn);

// Create popup menu
const menu = document.createElement("div");
menu.id = "betterbuy-menu";
menu.innerHTML = `
  <button id="bb-add">
    <span>➕</span>
    <span>Add to BB-Cart</span>
  </button>
  <button id="bb-compare">
    <span>⚖️</span>
    <span>Compare</span>
  </button>
`;
document.body.appendChild(menu);
menu.style.display = "none";

// Toggle menu on button click
btn.addEventListener("click", (e) => {
  e.stopPropagation();
  menu.style.display = menu.style.display === "none" ? "block" : "none";
});

// Close menu when clicking outside
document.addEventListener("click", (e) => {
  if (!menu.contains(e.target) && e.target.id !== "betterbuy-btn") {
    menu.style.display = "none";
  }
});

// Extract product information from page
async function extractProductInfo() {
  const url = window.location.href;

  // Try to extract structured product data (works for many shopping sites)
  let name = document.title;
  let price = "N/A";
  let description = "";
  let image = "";

  // Try common price selectors
  const priceSelectors = [
    '[class*="price"]',
    '[id*="price"]',
    '[data-price]',
    '.a-price .a-offscreen', // Amazon
    '.price', // Generic
    '[itemprop="price"]'
  ];

  for (const selector of priceSelectors) {
    const priceEl = document.querySelector(selector);
    if (priceEl) {
      price = priceEl.textContent.trim().replace(/\s+/g, ' ');
      break;
    }
  }

  // Try common product name selectors
  const nameSelectors = [
    'h1[class*="product"]',
    'h1[class*="title"]',
    '#productTitle', // Amazon
    '[itemprop="name"]',
    'h1'
  ];

  for (const selector of nameSelectors) {
    const nameEl = document.querySelector(selector);
    if (nameEl) {
      name = nameEl.textContent.trim();
      break;
    }
  }

  // Try to get product image - prioritize larger images and wait for lazy loading
  const imageSelectors = [
    '#landingImage', // Amazon main image
    '[itemprop="image"]',
    'img[class*="main"]',
    'img[class*="product"]',
    '[class*="product"] img[src*="http"]',
    'img[data-src*="http"]' // Lazy-loaded images
  ];

  let bestImage = null;
  let bestImageSize = 0;

  for (const selector of imageSelectors) {
    const images = document.querySelectorAll(selector);

    for (const imgEl of images) {
      // Check both src and data-src (for lazy-loaded images)
      let imgSrc = imgEl.src || imgEl.dataset.src || '';

      if (!imgSrc || !imgSrc.startsWith('http')) continue;

      // Wait for image to load if not already loaded
      if (!imgEl.complete && imgEl.src) {
        await new Promise(resolve => {
          imgEl.addEventListener('load', resolve, { once: true });
          setTimeout(resolve, 1000); // 1 second timeout
        });
      }

      // Get actual or natural dimensions
      let width = imgEl.naturalWidth || imgEl.width || 0;
      let height = imgEl.naturalHeight || imgEl.height || 0;

      // If dimensions are still 0, try to get from attributes
      if (width === 0 && imgEl.hasAttribute('width')) {
        width = parseInt(imgEl.getAttribute('width')) || 0;
      }
      if (height === 0 && imgEl.hasAttribute('height')) {
        height = parseInt(imgEl.getAttribute('height')) || 0;
      }

      const size = width * height;

      // Skip tiny images (thumbnails)
      if (width < 100 || height < 100) continue;

      // Keep track of the largest image
      if (size > bestImageSize) {
        bestImageSize = size;
        bestImage = imgSrc;
      }
    }

    // If we found a good image, stop searching
    if (bestImage) break;
  }

  image = bestImage || '';

  // Try to get description (prioritize meta description for better results)
  const descSelectors = [
    'meta[name="description"]',
    'meta[property="og:description"]',
    '#feature-bullets', // Amazon feature bullets
    '#productDescription', // Amazon description
    '[class*="product-description"]',
    '[class*="description"]',
    '[itemprop="description"]'
  ];

  for (const selector of descSelectors) {
    const descEl = document.querySelector(selector);
    if (descEl) {
      description = descEl.getAttribute('content') || descEl.textContent.trim();
      description = description.replace(/\s+/g, ' ').trim(); // Clean whitespace

      // Skip if too short (likely not a real description)
      if (description.length < 20) {
        continue;
      }

      description = description.substring(0, 800); // Increased limit for better context
      break;
    }
  }

  // Detect currency and country
  const currencyInfo = detectCurrency(url);

  // Convert price to USD
  let priceUSD = null;
  if (price !== "N/A") {
    priceUSD = await convertToUSD(price, currencyInfo.code);
  }

  return {
    name,
    price,
    priceUSD,
    currency: currencyInfo.code,
    currencySymbol: currencyInfo.symbol,
    countryFlag: currencyInfo.flag,
    description,
    image,
    url,
    timestamp: Date.now()
  };
}

// Handle Add to Cart with AI summarization
async function addProductToCart() {
  const addBtn = document.getElementById("bb-add");
  const originalHTML = addBtn.innerHTML;

  // Show loading state
  addBtn.innerHTML = '<span class="bb-loading"></span><span>Adding...</span>';
  addBtn.disabled = true;

  try {
    const product = await extractProductInfo();

    // Try to detect language, translate, and summarize description using Gemini Nano
    if (product.description && product.description.length > 50) {
      try {
        let textToSummarize = product.description;

        // Step 1: Detect language
        if ('LanguageDetector' in self) {
          const detector = await LanguageDetector.create();
          const results = await detector.detect(product.description);

          if (results && results.length > 0) {
            const topLanguage = results[0].detectedLanguage;
            console.log(`✅ Detected language: ${topLanguage} (confidence: ${results[0].confidence})`);

            // Step 2: Translate to English if needed
            if (topLanguage !== 'en' && results[0].confidence > 0.5) {
              if ('Translator' in self) {
                try {
                  const translator = await Translator.create({
                    sourceLanguage: topLanguage,
                    targetLanguage: 'en'
                  });
                  textToSummarize = await translator.translate(product.description);
                  console.log("✅ Description translated to English");
                  translator.destroy();
                } catch (transErr) {
                  console.log("Translation not available, using original text");
                }
              }
            }
          }
        }

        // Step 3: Summarize (now in English)
        if ('Summarizer' in self) {
          const availability = await Summarizer.availability();
          if (availability === 'readily') {
            const summarizer = await Summarizer.create({
              sharedContext: 'Product description for shopping comparison',
              type: 'tldr',
              format: 'plain-text',
              length: 'short'
            });
            const summarized = await summarizer.summarize(textToSummarize);
            product.description = summarized;
            summarizer.destroy();
            console.log("✅ Description summarized with AI");
          }
        }
      } catch (err) {
        console.log("AI processing not available, using original description", err);
      }
    }

    // Send to background script
    chrome.runtime.sendMessage({ action: "addItem", item: product }, (response) => {
      if (response && response.success) {
        addBtn.innerHTML = '<span>✅</span><span>Added!</span>';
        setTimeout(() => {
          addBtn.innerHTML = originalHTML;
          addBtn.disabled = false;
          menu.style.display = "none";
        }, 1500);
      } else {
        // Handle case where background script doesn't respond
        addBtn.innerHTML = '<span>✅</span><span>Added!</span>';
        setTimeout(() => {
          addBtn.innerHTML = originalHTML;
          addBtn.disabled = false;
          menu.style.display = "none";
        }, 1500);
      }
    });

  } catch (err) {
    console.error("Error adding product:", err);
    addBtn.innerHTML = '<span>❌</span><span>Error</span>';
    setTimeout(() => {
      addBtn.innerHTML = originalHTML;
      addBtn.disabled = false;
    }, 1500);
  }
}

// Handle button clicks
document.addEventListener("click", (e) => {
  if (e.target.closest("#bb-add")) {
    e.preventDefault();
    addProductToCart();
  }
  if (e.target.closest("#bb-compare")) {
    chrome.runtime.sendMessage({ action: "openCompare" });
    menu.style.display = "none";
  }
});
