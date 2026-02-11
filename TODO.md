# Fix Data Persistence on Refresh

## Backend Changes
- [x] Server is already set up with MongoDB persistence

## Frontend Changes
- [ ] Modify auction-react/src/App.tsx to add localStorage fallback
  - [ ] Update loadData function to try server first, fallback to localStorage
  - [ ] Update saveData function to save to both server and localStorage
  - [ ] Ensure dataLoaded flag works with localStorage

## Testing
- [ ] Test data persistence on refresh with server running
- [ ] Test data persistence on refresh with server down
