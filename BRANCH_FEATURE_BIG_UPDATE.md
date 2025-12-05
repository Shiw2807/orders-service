# Branch: feature/big-update

This file documents the changes that would be in the `feature/big-update` branch.
This simulates a large PR with multiple unrelated changes mixed together.

## Changes in this branch (all in one PR):

### 1. Style Changes
- Updated code formatting in multiple files
- Changed indentation style
- Added/removed whitespace
- Reorganized imports

### 2. Logic Changes  
- Added new validation for order items
- Modified order status workflow
- Added new utility functions
- Changed error handling

### 3. Documentation Changes
- Updated README
- Added JSDoc comments
- Updated API documentation
- Added inline comments

### 4. Bug Fixes
- Fixed edge case in validation
- Corrected typo in error messages

### 5. New Features
- Added order search functionality
- Added bulk order creation

---

## Why this is problematic:

1. **Hard to review**: Mixing style, logic, and docs makes it difficult to focus on what matters
2. **Risk of bugs**: Logic changes hidden among style changes can be missed
3. **Difficult to revert**: If one change causes issues, hard to revert without losing other changes
4. **Merge conflicts**: Large PRs are more likely to have conflicts
5. **Testing complexity**: Hard to know what specifically needs testing

## Better approach:

Split into separate PRs:
- PR #1: Style/formatting changes only
- PR #2: Documentation updates
- PR #3: New validation logic
- PR #4: Order search feature
- PR #5: Bulk order creation
