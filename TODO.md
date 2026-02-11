# Task: Update Gender Parsing for Captains Excel and Fix Player File Upload

- [x] Update AddTeamExcel.tsx to use flexible gender parsing logic (accept 'female', 'girl', 'f' as 'Female', others as 'Male') to match AddPlayerExcel.tsx
- [x] Add error handling to AddPlayerExcel.tsx handleFile function to catch and log parsing errors
- [x] Add error handling to AddTeamExcel.tsx handleFile function to catch and log parsing errors

# Task: Fix Data Persistence on Page Refresh

- [x] Create AuctionData model in server/models/AuctionData.js
- [x] Create auction routes in server/routes/auction.js
- [x] Update server/index.js to include auction routes
- [x] Remove Firebase imports from App.tsx
- [x] Update loadData function to use API instead of Firestore
- [x] Update saveData function to use API instead of Firestore
- [x] Update clearAllData function to use API instead of Firestore
- [x] Add proxy configuration to vite.config.ts for API calls
