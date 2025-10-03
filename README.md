# 🛍️ BetterBuy - AI-Powered Shopping Assistant

A Chrome extension for the Google Chrome Built-in AI Hackathon that helps you make smarter shopping decisions using Chrome's Gemini Nano AI APIs.

## ✨ Features

### 🎯 Smart Product Collection
- **Floating Button**: Beautiful gradient floating button appears on all shopping sites
- **Auto-Extraction**: Automatically extracts product name, price, description, and images
- **AI Summarization**: Uses Chrome's Summarizer API to condense product descriptions
- **Multi-Product Storage**: Save multiple products without overwriting

### 🤖 AI-Powered Comparison
- **Gemini Nano Integration**: Uses Chrome's built-in Language Model API for product comparisons
- **Smart Recommendations**: AI analyzes features, pricing, and value to recommend the best option
- **Privacy-First**: All AI processing happens locally in your browser
- **Offline-Capable**: Works even without internet connection (once AI model is downloaded)

### 🎨 Modern UI
- **Gradient Design**: Beautiful purple-blue gradient theme
- **Responsive Cards**: Product cards with hover effects and smooth animations
- **Interactive Selection**: Checkbox-based product selection with visual feedback
- **Clean Dashboard**: Professional comparison page with biglogo.png branding

## 🚀 Installation

1. **Enable Chrome AI Features**:
   - Use Chrome Dev or Canary (version 127+)
   - Visit `chrome://flags/#optimization-guide-on-device-model`
   - Set to "Enabled BypassPerfRequirement"
   - Visit `chrome://flags/#prompt-api-for-gemini-nano`
   - Set to "Enabled"
   - Restart Chrome

2. **Load Extension**:
   - Open `chrome://extensions`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select the `betterbuy-extension` folder

3. **Verify AI Model**:
   - Open DevTools Console
   - Type: `await ai.languageModel.capabilities()`
   - Should return `{available: "readily"}`

## 📁 Project Structure

```
betterbuy-extension/
├── manifest.json           # Extension configuration
├── background.js          # Service worker for storage management
├── content.js             # Injected script for floating button
├── styles.css             # Floating button & menu styles
├── compare.html           # Comparison dashboard UI
├── compare.js             # Comparison logic & AI integration
└── icons/
    ├── icon16.png         # Extension icon (16x16)
    ├── icon48.png         # Extension icon (48x48)
    ├── icon128.png        # Extension icon (128x128)
    └── biglogo.png        # Dashboard logo
```

## 🎯 How It Works

### 1. Adding Products
```javascript
// Extracts product data from page
const product = {
  name: "Product Title",
  price: "$99.99",
  description: "AI-summarized description",
  image: "https://...",
  url: "https://...",
  timestamp: 1234567890
};

// Saved to chrome.storage.local
chrome.storage.local.set({ cart: [...cart, product] });
```

### 2. AI Summarization
```javascript
// Uses Chrome's Summarizer API
const summarizer = await window.ai.summarizer.create({
  sharedContext: 'Product description for shopping comparison',
  type: 'tl;dr',
  format: 'plain-text',
  length: 'short',
  language: 'en'
});

const summary = await summarizer.summarize(description);
```

### 3. AI Comparison
```javascript
// Uses Chrome's Language Model API
const session = await window.ai.languageModel.create({
  systemPrompt: "You are a helpful shopping assistant..."
});

const result = await session.prompt(comparisonPrompt);
```

## 🔧 API Usage

### Summarizer API
- **Purpose**: Condense long product descriptions
- **Language**: `en` (English - required for optimal quality)
- **Type**: `tl;dr` for short summaries
- **Format**: `plain-text`
- **Length**: `short` (can be `short`, `medium`, or `long`)
- **Shared Context**: Provides context for better summarization

### Language Model API (Gemini Nano)
- **Purpose**: Generate product comparisons and recommendations
- **System Prompt**: Defines AI assistant role
- **User Prompt**: Contains product details and comparison request
- **Streaming**: Supports real-time streaming responses

### Future API Integrations
- **Rewriter API**: Reformat product specs consistently
- **Proofreader API**: Fix typos in product descriptions
- **Translator API**: Translate products from international sites

## 🎨 UI Components

### Floating Button
- Gradient purple-blue background
- 60x60px circular design
- Hover effects with scale animation
- Fixed bottom-right positioning

### Floating Menu
- Slide-up animation
- Two buttons: "Add to BB-Cart" and "Compare"
- Gradient hover effects
- Click-outside to close

### Compare Dashboard
- Responsive grid layout (320px min card width)
- Product cards with images, price, description
- Checkbox selection with outline feedback
- AI comparison section with loading spinner
- Delete and visit buttons per product

## 📊 Storage Format

```javascript
{
  cart: [
    {
      id: 1234567890.123,
      name: "Product Name",
      price: "$99.99",
      description: "AI-summarized description",
      image: "https://example.com/image.jpg",
      url: "https://example.com/product",
      timestamp: 1234567890
    },
    // ... more products
  ]
}
```

## 🛠️ Development

### Testing Product Extraction
The extension tries multiple selectors to extract product data:

**Price Selectors**:
- `[class*="price"]`, `[id*="price"]`, `[data-price]`
- `.a-price .a-offscreen` (Amazon)
- `[itemprop="price"]`

**Name Selectors**:
- `h1[class*="product"]`, `h1[class*="title"]`
- `#productTitle` (Amazon)
- `[itemprop="name"]`

**Image Selectors**:
- `[class*="product"] img[src*="http"]`
- `#landingImage` (Amazon)
- `[itemprop="image"]`

### Adding New Site Support
To improve extraction for specific sites, add custom selectors in `content.js`:

```javascript
const priceSelectors = [
  // ... existing selectors
  '.your-site-price-class',  // Add site-specific selector
];
```

## 🐛 Troubleshooting

### Floating Button Not Appearing
- Check DevTools console for errors
- Verify `web_accessible_resources` in manifest.json
- Reload extension and refresh page

### AI Features Not Working
- Verify Chrome version (127+ Dev/Canary)
- Check `chrome://flags` settings
- Run `await ai.languageModel.capabilities()` in console
- May need to wait for AI model download (can take 10+ minutes)

### Product Data Not Extracting
- Open DevTools and check console logs
- Verify page has structured product data
- Add site-specific selectors if needed

## 🎯 Hackathon Submission Checklist

- [x] Uses Chrome's built-in AI APIs (Summarizer + Language Model)
- [x] Privacy-focused (all processing is local)
- [x] Works offline (after AI model download)
- [x] Modern, polished UI
- [x] Practical use case (shopping comparison)
- [x] Multiple AI API demonstrations
- [x] Error handling and fallbacks
- [x] Clean code structure

## 📝 Future Enhancements

1. **Price Tracking**: Monitor saved products for price drops
2. **Category Filters**: Filter products by type/category
3. **Export/Import**: Share product lists with friends
4. **Browser History**: Track previously compared products
5. **Advanced AI**: Use Rewriter/Translator APIs for international shopping
6. **Price Charts**: Visual price comparison graphs
7. **Reviews Summary**: Aggregate and summarize user reviews with AI

## 📄 License

Built for the Google Chrome Built-in AI Hackathon 2025

## 🙏 Credits

- Chrome Built-in AI Team for Gemini Nano APIs
- Icon design and gradient theme inspired by modern material design
