# ✅ BetterBuy Testing Checklist

Use this checklist to verify all features work correctly before demo/submission.

## 🔧 Setup Tests

- [ ] Chrome Dev/Canary version 127+
- [ ] Flag `chrome://flags/#optimization-guide-on-device-model` enabled
- [ ] Flag `chrome://flags/#prompt-api-for-gemini-nano` enabled
- [ ] Chrome restarted after enabling flags
- [ ] Extension loaded at `chrome://extensions`
- [ ] Developer mode enabled
- [ ] No errors in extension details page

## 🤖 AI Model Tests

Open DevTools Console (F12) and verify:

- [ ] `await ai.languageModel.capabilities()` returns `{available: "readily"}` or `{available: "after-download"}`
- [ ] `await ai.summarizer.capabilities()` returns available status
- [ ] If "after-download", wait 10-15 minutes for model download
- [ ] Enough disk space (~2GB for AI model)

## 🎨 UI Tests - Floating Button

Visit any website (e.g., https://amazon.com):

- [ ] Purple gradient floating button appears in bottom-right
- [ ] Button shows icon48.png image correctly
- [ ] Clicking button opens menu with slide-up animation
- [ ] Menu shows "➕ Add to BB-Cart" button
- [ ] Menu shows "⚖️ Compare" button
- [ ] Buttons have hover effect (gradient purple, transform)
- [ ] Clicking outside menu closes it
- [ ] Button has hover effect (scale up, shadow)

## 🛍️ Product Extraction Tests

Visit a product page (e.g., https://www.amazon.com/dp/B08N5WRWNW):

- [ ] Click BetterBuy button → "Add to BB-Cart"
- [ ] Button shows loading spinner
- [ ] Button text changes to "Adding..."
- [ ] Console logs: "✅ BetterBuy content script loaded on: ..."
- [ ] Product name extracted correctly (check console)
- [ ] Product price extracted correctly
- [ ] Product image extracted
- [ ] Product description extracted
- [ ] AI summarization runs (or falls back gracefully)
- [ ] Button shows "✅ Added!" confirmation
- [ ] Menu closes after 1.5 seconds

## 📦 Storage Tests

After adding 2-3 products:

- [ ] Open DevTools → Application → Storage → Local Storage
- [ ] Find extension ID in left sidebar
- [ ] Click on "cart" key
- [ ] Verify JSON array with multiple products
- [ ] Each product has: id, name, price, description, image, url, timestamp
- [ ] Products are NOT overwriting (array grows)
- [ ] Each product has unique ID

## 🎯 Compare Page Tests

Click BetterBuy button → "Compare":

- [ ] New tab opens with compare.html
- [ ] Header shows biglogo.png on left
- [ ] Header shows "BetterBuy Cart" title
- [ ] Header shows product count (e.g., "3 products saved")
- [ ] Header has "Clear All" button (gray)
- [ ] Header has "AI Compare Selected" button (purple, disabled initially)
- [ ] Products display in grid layout
- [ ] Cards show product images (or fallback icon)
- [ ] Cards show product name (max 2 lines)
- [ ] Cards show price in large purple text
- [ ] Cards show description (max 3 lines)
- [ ] Each card has checkbox (unchecked by default)
- [ ] Each card has "Visit" button
- [ ] Each card has "Delete" button
- [ ] Cards have hover effect (lift up, shadow)

## ✅ Selection Tests

On compare page:

- [ ] Check 1 product → card gets purple outline
- [ ] Header updates: "3 products saved · 1 selected"
- [ ] "AI Compare Selected" button still disabled (need 2+)
- [ ] Check 2nd product → both cards outlined
- [ ] Header updates: "3 products saved · 2 selected"
- [ ] "AI Compare Selected" button now enabled (not grayed)
- [ ] Uncheck product → outline removed
- [ ] Selection count decreases

## 🗑️ Delete Tests

- [ ] Click "Delete" on one product
- [ ] Confirmation dialog appears
- [ ] Click "OK" → product card disappears
- [ ] Product count updates
- [ ] Refresh page → product still gone (persisted)
- [ ] Click "Clear All" button
- [ ] Confirmation dialog appears
- [ ] Click "OK" → all products disappear
- [ ] Empty state shows: "🛍️ Your cart is empty"
- [ ] Message: "Start adding products..."

## 🔗 Visit Tests

- [ ] Click "Visit" button on product card
- [ ] New tab opens with product URL
- [ ] URL matches original product page
- [ ] Compare tab stays open

## 🤖 AI Comparison Tests

Add 2-3 products, then:

- [ ] Select 2+ products using checkboxes
- [ ] Click "AI Compare Selected" button
- [ ] AI result section appears above products
- [ ] Shows "✨ AI-Powered Comparison" heading
- [ ] Shows loading spinner initially
- [ ] Shows "Analyzing products..." text
- [ ] After 10-30 seconds, spinner disappears
- [ ] AI-generated comparison text appears
- [ ] Comparison mentions product names
- [ ] Comparison analyzes prices
- [ ] Comparison provides recommendation
- [ ] Text is well-formatted and readable
- [ ] Badge shows number of products (e.g., "2 products")

## ❌ Fallback Tests (if AI unavailable)

If AI model not ready:

- [ ] Comparison shows "📊 Basic Comparison" heading
- [ ] Badge shows "AI unavailable"
- [ ] Shows list of products with details
- [ ] Shows helpful message about enabling AI
- [ ] Provides link to chrome://flags
- [ ] No errors in console

## 🧪 Edge Cases

- [ ] Add same product twice → creates 2 separate entries (OK)
- [ ] Add product with no price → shows "N/A"
- [ ] Add product with no image → shows fallback icon
- [ ] Add product with very long name → truncates to 2 lines with "..."
- [ ] Add product with very long description → truncates to 3 lines
- [ ] Select 0 products → Compare button disabled
- [ ] Select 1 product → Compare button disabled
- [ ] Select 10 products → AI comparison handles all
- [ ] Image fails to load → onerror shows fallback icon

## 🌐 Multi-Site Tests

Test on different shopping sites:

### Amazon
- [ ] Visit: https://www.amazon.com/dp/B08N5WRWNW
- [ ] Floating button appears
- [ ] Product name extracts correctly
- [ ] Price extracts correctly (including $ sign)
- [ ] Image extracts (main product image)
- [ ] Description extracts from meta or product description

### eBay
- [ ] Visit any eBay product page
- [ ] Product data extracts
- [ ] At minimum: name and URL work

### Etsy
- [ ] Visit any Etsy product page
- [ ] Product data extracts
- [ ] At minimum: name and URL work

### Generic Site
- [ ] Visit any website with `<h1>` tag
- [ ] Floating button appears (works on all sites)
- [ ] Extracts at least page title and URL
- [ ] No crashes or errors

## 🎨 Visual Tests

- [ ] Gradient background is purple-blue
- [ ] Buttons have rounded corners (8px)
- [ ] Cards have rounded corners (16px)
- [ ] Shadows are visible but not too dark
- [ ] Fonts are readable and consistent
- [ ] Colors match design system (purple #667eea)
- [ ] Animations are smooth (not janky)
- [ ] Layout is responsive (try resizing window)
- [ ] No text overflow or broken layouts

## 📱 Responsive Tests

Resize browser window to different widths:

- [ ] 1400px+ → 4 cards per row
- [ ] 1000px → 3 cards per row
- [ ] 700px → 2 cards per row
- [ ] 400px → 1 card per row
- [ ] Header wraps on small screens
- [ ] Buttons stack vertically if needed
- [ ] Logo scales appropriately

## 🐛 Console Tests

Check DevTools Console for:

- [ ] "✅ BetterBuy content script loaded" on every page
- [ ] "✅ Product added to cart: [name]" when adding
- [ ] No red errors (except expected image 404s)
- [ ] AI API calls logged (if debugging enabled)
- [ ] No undefined variables
- [ ] No promise rejections

## ⚡ Performance Tests

- [ ] Page load not slowed by extension
- [ ] Floating button appears within 1 second
- [ ] Menu opens instantly on click
- [ ] Product card rendering is fast (even with 10+ products)
- [ ] AI comparison completes in under 60 seconds
- [ ] No memory leaks (check Task Manager)
- [ ] Extension size under 5MB

## 🔒 Privacy Tests

- [ ] No network requests in DevTools Network tab (except image loads)
- [ ] No data sent to external servers
- [ ] All AI processing happens locally
- [ ] Storage is local only (chrome.storage.local)
- [ ] No tracking or analytics

## 📄 Documentation Tests

- [ ] README.md exists and is comprehensive
- [ ] SETUP_GUIDE.md has clear installation steps
- [ ] IMPROVEMENTS.md documents changes
- [ ] Code comments explain complex logic
- [ ] Console logs help with debugging

## 🎯 Final Acceptance Tests

- [ ] Extension installs without errors
- [ ] All features work end-to-end
- [ ] UI looks professional and polished
- [ ] AI integration works (or fails gracefully)
- [ ] No console errors during normal usage
- [ ] Ready for hackathon demo
- [ ] Ready for submission

---

## 📊 Test Results

**Date Tested**: _____________

**Chrome Version**: _____________

**AI Model Status**: ☐ Ready ☐ Downloading ☐ Unavailable

**Pass Rate**: _____ / _____ tests passed

**Issues Found**:
-
-
-

**Overall Status**: ☐ Ready to Demo ☐ Needs Fixes ☐ Not Ready

---

## 🎉 When All Tests Pass

You're ready to:
1. Record demo video
2. Submit to hackathon
3. Show to friends/judges
4. Deploy and share

**Congratulations!** 🚀
