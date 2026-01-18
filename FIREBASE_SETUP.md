# Firebase Setup Instructions

Your family tree application is configured to use Firebase, but you need to update the Firestore security rules to allow data access across devices.

## Current Issue
Data is not visible on different devices because Firebase Firestore security rules are blocking access.

## Solution: Update Firestore Security Rules

1. **Go to Firebase Console**
   - Visit: https://console.firebase.google.com/
   - Select your project: `family-tree-7e473`

2. **Navigate to Firestore Database**
   - In the left sidebar, click on "Firestore Database"
   - Click on the "Rules" tab at the top

3. **Update the Security Rules**
   
   Replace the existing rules with the following:

   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       // Allow read/write access to all tree auth data
       match /treeAuth/{treeId} {
         allow read: if true;
         allow write: if true;
       }
       
       // Allow read/write access to all family tree data
       match /familyTrees/{treeId} {
         allow read: if true;
         allow write: if true;
       }
     }
   }
   ```

4. **Publish the Rules**
   - Click the "Publish" button to save the changes

## Important Security Note

⚠️ **The above rules allow anyone to read and write data.** This is fine for personal use or development, but for production use, you should implement proper authentication-based security rules.

### Recommended Production Rules (More Secure)

For better security, you can use authentication and validate that users can only access trees they have credentials for. However, since your app uses custom username/password (not Firebase Auth), the simpler rules above are sufficient for now.

## Alternative: Use Test Mode Temporarily

If you want to quickly test:

1. Go to Firestore Database → Rules
2. Use these rules (expires after 30 days):
   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /{document=**} {
         allow read, write: if request.time < timestamp.date(2026, 2, 18);
       }
     }
   }
   ```

## Verify It's Working

After updating the rules:
1. Clear your browser cache (Ctrl+Shift+Delete)
2. Open the family tree app
3. Create or edit a tree
4. Check the browser console (F12) - you should see:
   - `☁️ Tree auth saved to cloud`
   - `☁️ Data saved to cloud`
5. Open the app on a different device with the same tree URL
6. The data should now be visible!

## Troubleshooting

If data still doesn't sync:

1. **Check Browser Console (F12)**
   - Look for Firebase errors
   - Verify you see "✅ Firebase connected - Cloud storage enabled"

2. **Check Firebase Console**
   - Go to Firestore Database → Data
   - Verify that collections `treeAuth` and `familyTrees` exist
   - Check if your data is being saved there

3. **Network Issues**
   - Ensure both devices have internet connectivity
   - Check if Firebase services are accessible (not blocked by firewall)

## Need Help?

If you continue having issues, check the browser console for error messages and verify that:
- Firebase is initialized successfully
- The security rules are published
- Your internet connection is working on both devices
