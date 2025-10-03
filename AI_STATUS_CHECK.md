# 🤖 How to Check AI Status & Enable Gemini Nano

## Quick AI Status Check

Open DevTools Console (F12) on any page and run:

```javascript
// Check Language Model availability
await ai.languageModel.capabilities()
```

### Possible Results:

1. **`{available: "readily"}`** ✅
   - AI is ready to use!
   - You should get AI-powered comparisons

2. **`{available: "after-download"}`** ⏳
   - AI model is downloading in background
   - Wait 10-15 minutes and check again
   - Model is ~2GB, download can take time

3. **`{available: "no"}`** ❌
   - AI features not enabled
   - Follow setup steps below

4. **`Error: ai is not defined`** ❌
   - Chrome version too old OR flags not enabled
   - Follow setup steps below

---

## 🔧 Complete Setup Steps

### Step 1: Check Chrome Version
```
chrome://version
```
**Required**: Chrome Dev or Canary version **127 or higher**

If you don't have it:
- Download Chrome Dev: https://www.google.com/chrome/dev/
- Or Chrome Canary: https://www.google.com/chrome/canary/

---

### Step 2: Enable AI Flags

Copy and paste these URLs into new tabs, one at a time:

#### Flag 1: Enable On-Device Model
```
chrome://flags/#optimization-guide-on-device-model
```
- Set to: **"Enabled BypassPerfRequirement"**
- Click "Relaunch" button

#### Flag 2: Enable Prompt API
```
chrome://flags/#prompt-api-for-gemini-nano
```
- Set to: **"Enabled"**
- Click "Relaunch" button

---

### Step 3: Restart Chrome
- Fully close Chrome (all windows)
- Reopen Chrome
- Wait 2-3 minutes for initialization

---

### Step 4: Trigger AI Model Download

Open DevTools Console (F12) and run:

```javascript
// This will trigger the model download
const session = await ai.languageModel.create();
console.log("✅ AI session created! Model downloading...");
```

If you see an error, the flags aren't enabled properly.

---

### Step 5: Wait for Download

The AI model is ~2GB and downloads in the background.

**Check download progress:**
```javascript
// Run this every few minutes
await ai.languageModel.capabilities()
```

- **"after-download"**: Still downloading, be patient ⏳
- **"readily"**: Download complete! ✅

**Typical download time**: 10-15 minutes on fast internet

---

### Step 6: Verify AI Works

Once status shows `"readily"`, test it:

```javascript
const session = await ai.languageModel.create();
const result = await session.prompt("Hello, are you working?");
console.log(result);
session.destroy();
```

You should see a response from Gemini Nano!

---

## 🔍 Troubleshooting

### Issue: "ai is not defined"
**Solution:**
1. Check Chrome version (must be 127+)
2. Verify both flags are enabled
3. Fully restart Chrome
4. Try in Incognito mode (extensions disabled)

### Issue: Stuck on "after-download"
**Solution:**
1. Check your internet connection
2. Make sure you have 3GB+ free disk space
3. Keep Chrome running (model downloads in background)
4. Check Task Manager - should see "Optimization Guide" process

### Issue: "available: no"
**Solution:**
1. Your device might not meet requirements
2. Try "BypassPerfRequirement" flag
3. Make sure you're on Chrome Dev/Canary, not stable Chrome

### Issue: Downloads then disappears
**Solution:**
1. Chrome might be clearing the model
2. Visit `chrome://components`
3. Look for "Optimization Guide On Device Model"
4. Click "Check for update"

---

## 📊 System Requirements

- **Chrome**: Dev or Canary 127+
- **RAM**: 4GB+ recommended
- **Disk Space**: 3GB+ free
- **OS**: Windows 10+, macOS 13+, or Linux

---

## 🎯 Quick Reference Commands

```javascript
// Check if AI is available
await ai.languageModel.capabilities()

// Check Summarizer API
await ai.summarizer.capabilities()

// Force create session (triggers download)
const session = await ai.languageModel.create()

// Test summarization
const summarizer = await ai.summarizer.create({
  sharedContext: 'Test',
  type: 'tl;dr',
  format: 'plain-text',
  length: 'short',
  language: 'en'
})
const result = await summarizer.summarize("This is a very long text that needs to be summarized into something shorter and more concise.")
console.log(result)
```

---

## ✅ When AI is Ready

You'll know AI is working when:
1. `ai.languageModel.capabilities()` returns `{available: "readily"}`
2. You can create sessions without errors
3. BetterBuy shows **"AI-Powered Comparison"** instead of "Basic Comparison"
4. The badge says **number of products** instead of "AI unavailable"
5. You get detailed AI recommendations instead of simple tables

---

## 🚀 Expected AI Output

When working, the AI comparison will look like:

```
✨ AI-Powered Comparison [2 products]

Based on the products you've selected:

Product Analysis:
- The Mouse Ear decoration ($18.99) is a decorative accessory
  for the Echo Spot, not a standalone product
- The Echo Spot ($49.99) is the actual smart speaker device

Recommendation:
If you want a smart alarm clock with Alexa, go with Product 2
(Echo Spot). Product 1 is just a decoration ring for it.

The Echo Spot offers better value as a functional smart home
device, while the decoration is purely aesthetic.
```

Much better than the basic table! 🎯

---

**Current Status**: If you see "AI unavailable", Chrome hasn't downloaded the Gemini Nano model yet. Follow the steps above!
