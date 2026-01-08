# Phase 4: Feature Refactoring - Detailed Plan

## Overview
This phase breaks down large components into smaller, maintainable pieces following project standards:
- Maximum 200 lines per component
- English-only code and UI text
- Dedicated CSS files for all components
- Logic extracted to hooks/services

---

## Task List

### Priority 1: CaddieManager Refactoring (572 → multiple <200 line files)

**Current Issues:**
- 572 lines (needs to be <200)
- All UI text in Spanish
- No dedicated CSS file
- Business logic embedded in component
- No TypeScript types file

**Refactor Into:**
1. `CaddieManager.tsx` - Main component (<150 lines)
2. `CaddieManager.types.ts` - TypeScript types
3. `CaddieManager.css` - Styles
4. `CaddieSearchBar.tsx` - Search and filter controls
5. `CaddieFilters.tsx` - Filter dropdown
6. `CaddieTable.tsx` - Table display
7. `CaddieTableRow.tsx` - Individual row component
8. `CaddieEditModal.tsx` - Edit/Create modal
9. `CaddieAvailabilityEditor.tsx` - Availability form
10. `CaddieStats.tsx` - Statistics display

---

### Priority 2: ListManager Refactoring (380 → multiple <200 line files)

**Current Issues:**
- 380 lines (needs to be <200)
- All UI text in Spanish
- No dedicated CSS file
- Business logic embedded in component
- No TypeScript types file

**Refactor Into:**
1. `ListManager.tsx` - Main component (<150 lines)
2. `ListManager.types.ts` - TypeScript types
3. `ListManager.css` - Styles
4. `ListTabs.tsx` - Tab navigation
5. `ListQuickDispatch.tsx` - Bulk dispatch controls
6. `CaddieQueue.tsx` - Queue display
7. `CaddieQueueItem.tsx` - Queue item component
8. `ListSettingsPanel.tsx` - Settings panel
9. `ManualReorder.tsx` - Manual reorder controls

---

### Priority 3: Other Components Refactoring

**Components to Refactor:**
1. **PublicQueue** (178 lines → 3 files):
   - `PublicQueue.tsx` (<150 lines)
   - `PublicQueue.css` (update existing)
   - `QueueCategory.tsx` - Category display
   - `QueueCaddieRow.tsx` - Caddie row
   - `DispatchPopup.tsx` - Popup notification

2. **WeeklyDraw** (needs to read and refactor)

3. **WeeklyMonitor** (needs to read and refactor)

4. **Reports** (needs to read and refactor)

5. **Dashboard** (needs to read and refactor)

6. **Messaging** (needs to read and refactor)

7. **Login** (already small, add CSS if needed)

8. **MonitorNavBar** (already small, add CSS if needed)

---

## Implementation Strategy

### Step 1: Read All Components
Read and analyze existing components to understand:
- Business logic that needs extraction
- Spanish text that needs translation
- Styles that need extraction

### Step 2: Create TypeScript Type Files
Create `.types.ts` files for complex components

### Step 3: Extract Business Logic
Create hooks for:
- Filtering and sorting logic
- Modal management
- Form validation

### Step 4: Create CSS Files
Extract styles from Tailwind to dedicated `.css` files using BEM naming

### Step 5: Create Subcomponents
Break down large components into smaller, focused pieces

### Step 6: Translate to English
Convert all UI text, comments, and labels to English

---

## Success Criteria
Each component must:
- [ ] Under 200 lines
- [ ] English-only code and UI text
- [ ] Dedicated CSS file with BEM naming
- [ ] TypeScript with strict types
- [ ] No business logic (in hooks/services)
- [ ] Uses new UI component library
- [ ] Uses custom hooks where appropriate

---

## Estimated Timeline
- CaddieManager: 8 hours
- ListManager: 6 hours
- Other components: 4 hours each
- Total: ~20-24 hours

## Next Action
Start with Priority 1: CaddieManager refactoring by:
1. Reading and analyzing the component
2. Creating the refactor plan
3. Breaking down into smaller components
