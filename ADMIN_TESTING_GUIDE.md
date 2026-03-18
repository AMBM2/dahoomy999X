# Admin Dashboard Testing Guide

## Overview
The admin dashboard allows you to manage custom categories and questions dynamically. The system uses browser localStorage to persist data.

---

## Testing Steps

### Step 1: Login and Access Admin Dashboard
1. **Open the app**: http://localhost:3000
2. **Login with Discord** using the admin account (Discord ID: `1048826906261594283`)
3. **Navigate to Game Board** or category selection
4. **Look for the "لوحة التحكم" (Admin Dashboard) button** - it should appear in the top-right area
5. **Click the button** to open the admin dashboard

### Step 2: Add a New Category
1. **In the Admin Dashboard**, go to the **"الفئات المخصصة" (Categories)** tab
2. **Enter a category name** in the input field (e.g., "ألعاب الفيديو" or "الفنون")
3. **Click the "إضافة فئة" (Add Category) button**
4. **Expected Result**: 
   - Toast notification says "تمت إضافة فئة: [name]"
   - Category appears in the list below
   - Category is saved to localStorage

### Step 3: Add a Question to the Category
1. **Go to the "الأسئلة" (Questions)** tab
2. **Select the category** you just created from the dropdown
3. **Enter a question** in the text area
4. **Enter the correct answer**
5. **Leave "نوع السؤال" as "نص" (Text) or change to "خيارات" (Multiple Choice)**
6. **If multiple choice**: Enter at least 2 options in the input fields
7. **Set points** (default: 100)
8. **Click "إضافة السؤال" (Add Question)**
9. **Expected Result**:
   - Toast notification says "تمت إضافة السؤال بنجاح"
   - Question appears in the list below
   - Question is saved to localStorage

### Step 4: Verify the Category on Main Page
1. **Close the admin dashboard**
2. **Go back to the main game page**
3. **Look for your new category** in the categories grid
4. **Click the category** to verify the question appears

---

## Debugging Checklist

### If Nothing is Saving:

#### 1. **Check Browser Console for Errors**
- Press `F12` to open Developer Tools
- Go to **Console** tab
- Try adding a category and look for any red error messages
- Common errors:
  - `localStorage is not available` → Browser in private mode
  - `QuotaExceededError` → localStorage storage limit reached
  - `Undefined` errors → Window object not available on server

#### 2. **Check Application Storage**
- In Developer Tools, go to **Application** tab
- Look for **localStorage** in the left panel
- You should see keys like:
  - `dahoomy_categories` - List of custom categories
  - `dahoomy_questions` - List of custom questions
- If these keys are empty or missing, data is not being saved

#### 3. **Clear localStorage and Retry**
```javascript
// In browser console, run:
localStorage.clear()
// Then reload the page and try again
```

#### 4. **Check if Admin ID Matches**
- The current admin Discord ID is: `1048826906261594283`
- Make sure you're logged in with this account
- Verify in browser console: `console.log(session?.user?.id)`

---

## Expected localStorage Structure

When data is saved correctly, your localStorage should contain:

```json
{
  "dahoomy_categories": [
    {
      "id": "1773419948665_custom_cat1",
      "name": "الفنون",
      "group": "custom",
      "timestamp": 1773419948665
    }
  ],
  "dahoomy_questions": [
    {
      "id": "1773419948666_q1",
      "category": "1773419948665_custom_cat1",
      "question": "ما هو لون السماء؟",
      "answer": "أزرق",
      "type": "text",
      "points": 100
    }
  ]
}
```

---

## Common Issues & Solutions

### Issue: Admin Button Not Showing
**Solution**: 
- Verify you're logged in with Discord ID `1048826906261594283`
- Check console: `session?.user?.id` should match the admin ID
- Try logging out and back in

### Issue: Categories Not Appearing in Dropdown
**Solution**:
- The dropdown should show BOTH built-in categories AND your custom ones
- If custom categories don't appear:
  - Check localStorage contains `dahoomy_categories`
  - Try refreshing the page
  - Click the refresh button (⟳) in the admin dashboard

### Issue: Adding Category/Question Shows Toast but Data Disappears
**Solution**:
- This indicates localStorage save is failing
- Check browser console (F12) for errors
- Try in incognito/private mode (might fix some issues)
- Check if localStorage is at quota limit

### Issue: New Questions Don't Appear on Main Page
**Solution**:
- Close and reopen the admin dashboard to refresh data
- Make sure you selected the correct category
- Clear browser cache and reload
- Check localStorage has the questions saved

---

## Quick Console Commands

Use these in the browser console (F12 → Console) to debug:

```javascript
// Check if localStorage is available
typeof(Storage) !== "undefined" ? console.log("✓ localStorage available") : console.log("✗ localStorage NOT available");

// View all stored categories
console.log(JSON.parse(localStorage.getItem('dahoomy_categories') || '[]'));

// View all stored questions
console.log(JSON.parse(localStorage.getItem('dahoomy_questions') || '[]'));

// Check current user ID
console.log("Current User ID:", document.cookie);

// Clear all custom data (WARNING: deletes all custom categories and questions)
localStorage.removeItem('dahoomy_categories');
localStorage.removeItem('dahoomy_questions');
console.log("Custom data cleared");
```

---

## Architecture Notes

### Data Flow:
1. **User adds category** → `admin-dashboard.tsx` calls `addCategory()`
2. **addCategory() saves to localStorage** via `setToStorage()` helper
3. **loadData() called** to refresh the categories list
4. **On main page**, `getDynamicCategories()` retrieves from localStorage
5. **Categories displayed** in the grid alongside built-in categories

### Key Files:
- **lib/dynamic-data.ts** - All localStorage operations (add, delete, retrieve)
- **components/admin-dashboard.tsx** - Admin UI and form handling
- **components/category-selector.tsx** - Main page showing all categories

---

## Success Indicators

✅ **Category successfully added when:**
- Toast notification appears: "تمت إضافة فئة: [name]"
- Category appears in the list in categories tab
- Category is visible in Application → localStorage in DevTools
- Refresh button works without error

✅ **Question successfully added when:**
- Toast notification appears: "تمت إضافة السؤال بنجاح"
- Question appears in the list under the selected category
- Questions appear in localStorage under `dahoomy_questions`
- Can see the question when selecting that category on main page

---

## Performance Notes

- Categories and questions are loaded into React state on dashboard open
- Maximum recommended: 100 categories and 500 questions (browser localStorage quotas)
- Data persists across page refreshes and browser sessions
- No server database required - all data stored locally in browser
