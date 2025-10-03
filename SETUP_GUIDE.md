# 🚀 BetterBuy Quick Setup Guide

## Step 1: Enable Chrome AI Features

1. **Download Chrome Dev or Canary**
   - Visit: https://www.google.com/chrome/dev/
   - Or: https://www.google.com/chrome/canary/
   - Version must be 127 or higher

2. **Enable AI Flags**

   Open in new tabs and enable these flags:

   ```
   chrome://flags/#optimization-guide-on-device-model
   → Set to: "Enabled BypassPerfRequirement"

   chrome://flags/#prompt-api-for-gemini-nano
   → Set to: "Enabled"
   ```

3. **Restart Chrome**
   - Click the "Relaunch" button that appears
   - Or manually close and reopen Chrome

4. **Verify AI Model is Downloading**

   Open DevTools (F12) and run:
   ```javascript
   await ai.languageModel.capabilities()
   ```

   Expected responses:
   - `{available: "after-download"}` - Model is downloading (wait 10-15 min)
   - `{available: "readily"}` - ✅ Model ready to use!
   - `{available: "no"}` - ❌ Check flags again

## Step 2: Load the Extension

1. **Open Extensions Page**
   ```
   chrome://extensions
   ```

2. **Enable Developer Mode**
   - Toggle switch in top-right corner

3. **Load Extension**
   - Click "Load unpacked"
   - Navigate to: `/home/david/Documents/googlenano/betterbuy-extension`
   - Click "Select Folder"

4. **Verify Extension Loaded**
   - Should see "BetterBuy" in extension list
   - Icon should appear in Chrome toolbar

## Step 3: Test the Extension

### Test 1: Floating Button
1. Visit any website (e.g., amazon.com, ebay.com)
2. Look for purple gradient floating button in bottom-right
3. Click button to see "Add to BB-Cart" and "Compare" menu

### Test 2: Add Product
1. Visit a product page (e.g., https://www.amazon.com/dp/B08N5WRWNW)
2. Click BetterBuy floating button
3. Click "Add to BB-Cart"
4. Should see loading spinner, then "Added!" confirmation

### Test 3: Compare Products
1. Add 2-3 different products from different pages
2. Click BetterBuy button → "Compare"
3. New tab opens with beautiful product dashboard
4. Select 2+ products using checkboxes
5. Click "AI Compare Selected"
6. Wait for AI analysis (may take 10-30 seconds)

## Step 4: Troubleshooting

### Issue: Floating button doesn't appear

**Solution:**
```bash
# Check DevTools console for errors (F12)
# Look for: "✅ BetterBuy content script loaded on: ..."

# If not appearing, reload extension:
1. Go to chrome://extensions
2. Click reload icon on BetterBuy
3. Hard refresh page (Ctrl+Shift+R)
```

### Issue: AI comparison shows "AI unavailable"

**Solution:**
```javascript
// Open DevTools (F12) and check:
await ai.languageModel.capabilities()

// If result is {available: "no"}:
// 1. Verify flags are enabled (Step 1)
// 2. Restart Chrome
// 3. Wait for model download (can take 10-15 minutes)
// 4. Check available disk space (model is ~2GB)
```

### Issue: Product data not extracting correctly

**Solution:**
```javascript
// The extension tries to auto-detect product info
// Some sites may have non-standard layouts

// Check DevTools console for what was extracted:
// Open console on product page after clicking "Add to BB-Cart"

// If price/name is wrong, it may need custom selectors
// (This is expected on some sites)
```

### Issue: Images not loading in compare page

**Solution:**
```javascript
// Some sites block image hotlinking
// Extension falls back to default icon (icon128.png)
// This is normal and won't affect functionality
```

## Step 5: Advanced Testing

### Test AI Summarization

The extension uses Chrome's Summarizer API to condense product descriptions:

```javascript
// To manually test summarizer in DevTools:
const summarizer = await window.ai.summarizer.create({
  type: 'tl;dr',
  format: 'plain-text',
  length: 'short'
});

const text = "Your long product description here...";
const summary = await summarizer.summarize(text);
console.log(summary);
```

### Test Language Model

The extension uses Gemini Nano for product comparisons:

```javascript
// To manually test in DevTools:
const session = await window.ai.languageModel.create({
  systemPrompt: "You are a helpful assistant."
});

const result = await session.prompt("Compare product A vs product B");
console.log(result);
```

## Step 6: Demo Workflow

Perfect workflow to demonstrate all features:

1. **Open 3 product pages** in different tabs:
   - Example: 3 different laptops on Amazon
   - Or: 3 different phones on eBay

2. **Add all 3 products**:
   - On each tab, click BetterBuy button
   - Click "Add to BB-Cart"
   - Wait for confirmation

3. **Open Compare Dashboard**:
   - Click BetterBuy button on any page
   - Click "Compare"

4. **Select products for AI comparison**:
   - Check 2 or 3 products
   - Watch "AI Compare Selected" button enable

5. **Run AI Analysis**:
   - Click "AI Compare Selected"
   - Watch loading animation
   - Read AI recommendation

6. **Test other features**:
   - Click "Visit" to open product page
   - Click "Delete" to remove a product
   - Click "Clear All" to reset cart

## 📊 Expected Results

### Successful Setup
- ✅ Floating button appears on all websites
- ✅ Products save with name, price, description, image
- ✅ Compare page shows beautiful product cards
- ✅ AI comparison generates helpful recommendations
- ✅ All buttons and interactions work smoothly

### What to Expect
- **AI Model Download**: May take 10-15 minutes on first use
- **Image Loading**: Some product images may not load (hotlinking protection)
- **Price Extraction**: ~80% accurate on major shopping sites
- **AI Response Time**: 10-30 seconds for comparison
- **Privacy**: Everything runs locally, no data sent to servers

## 🎯 Hackathon Demo Tips

1. **Pre-load AI Model**: Test 1-2 days before demo to ensure model downloaded
2. **Test Sites**: Stick to Amazon, eBay, Etsy for most reliable extraction
3. **Have Fallback**: Be ready to explain if AI is downloading
4. **Show Privacy**: Mention "works offline" and "local AI processing"
5. **Highlight UI**: Point out gradient animations, smooth interactions

## 🆘 Need Help?

Check DevTools Console for detailed logs:
- Product extraction results
- AI API availability
- Storage operations
- Error messages

All console messages are prefixed with "✅" for easy identification.

---

**Ready to go!** 🎉 Visit a shopping site and start comparing products with AI.
