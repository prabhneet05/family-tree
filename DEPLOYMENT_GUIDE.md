# Family Tree Web Application - Deployment Guide

## 🎯 How to Host Your Family Tree for FREE with Cloud Storage

This guide provides step-by-step instructions for deploying your family tree application with **cloud-based data storage** that can be accessed from anywhere.

---

## 🔥 Step 1: Setup Firebase (Required for Cloud Storage)

Firebase provides free cloud database and storage for your family tree data.

### Create a Firebase Project

1. **Go to Firebase Console**
   - Visit: https://console.firebase.google.com
   - Sign in with your Google account (create one if needed)

2. **Create New Project**
   - Click "Add project" or "Create a project"
   - Project name: `family-tree` (or any name)
   - Disable Google Analytics (optional, not needed)
   - Click "Create project"
   - Wait for project creation (30 seconds)

3. **Setup Firestore Database**
   - In the left menu, click "Firestore Database"
   - Click "Create database"
   - Select **"Start in production mode"**
   - Choose your location (nearest to your family)
   - Click "Enable"

4. **Configure Security Rules**
   - In Firestore, go to "Rules" tab
   - Replace the rules with:
   ```
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /familyTrees/{treeId} {
         allow read, write: if true;
       }
     }
   }
   ```
   - Click "Publish"
   
   ⚠️ **Note:** This allows anyone to read/write. For better security, implement Firebase Authentication (advanced users).

5. **Get Your Firebase Configuration**
   - Click the gear icon ⚙️ next to "Project Overview"
   - Select "Project settings"
   - Scroll to "Your apps" section
   - Click the web icon `</>`
   - App nickname: `family-tree-app`
   - Don't check Firebase Hosting
   - Click "Register app"
   - **Copy the firebaseConfig object**
   
   It will look like:
   ```javascript
   const firebaseConfig = {
     apiKey: "AIzaSyXxXxXxXxXxXxXxXxXxXxXxXxXxXxX",
     authDomain: "your-project.firebaseapp.com",
     projectId: "your-project-id",
     storageBucket: "your-project.appspot.com",
     messagingSenderId: "123456789012",
     appId: "1:123456789012:web:abcdef123456"
   };
   ```

6. **Update Your Code**
   - Open `script.js` in a text editor
   - Find lines 4-11 (the firebaseConfig)
   - Replace `YOUR_API_KEY_HERE` and other placeholders with your actual values
   - Save the file

**Note:** Firebase Storage is NOT required. Photos are stored as base64 strings directly in Firestore, so you can skip Storage setup entirely. This avoids the billing upgrade requirement.

---

## 🌐 Step 2: Deploy Your Application

Choose one of these free hosting options:

---

### Option A: GitHub Pages (Recommended)

#### Prerequisites
- A GitHub account (free at github.com)
- Your Firebase configuration added to `script.js`

### Steps:

1. **Create a GitHub Account**
   - Go to https://github.com
   - Click "Sign up" and create a free account

2. **Create a New Repository**
   - Click the "+" icon in the top right
   - Select "New repository"
   - Name it: `family-tree` (or any name you prefer)
   - Make it **Public**
   - Click "Create repository"

3. **Upload Your Files**
   - Click "uploading an existing file"
   - Drag and drop these files:
     - `index.html`
     - `styles.css`
     - `script.js`
   - Click "Commit changes"

4. **Enable GitHub Pages**
   - Go to your repository Settings
   - Scroll down to "Pages" in the left sidebar
   - Under "Source", select "main" branch
   - Click "Save"
   - Wait 1-2 minutes for deployment

5. **Access Your Site**
   - Your site will be available at:
     `https://[your-username].github.io/family-tree/`
   - GitHub will show you the exact URL in the Pages settings

### Default Login Credentials
- **Username:** `admin`
- **Password:** `family2026`

⚠️ **Important:** Change these credentials in `script.js` (lines 27-30) before deploying!

---

### Option B: Netlify

#### Steps:

1. **Create a Netlify Account**
   - Go to https://netlify.com
   - Click "Sign up" (can use GitHub, email, etc.)

2. **Deploy Your Site**
   - Click "Add new site" → "Deploy manually"
   - Create a folder with your three files:
     - `index.html`
     - `styles.css`
     - `script.js`
   - Drag the folder to the Netlify drop zone
   - Wait 30 seconds for deployment

3. **Access Your Site**
   - Netlify will provide a URL like:
     `https://[random-name].netlify.app`
   - You can customize the subdomain in Site settings

4. **Optional: Custom Domain**
   - Go to Domain settings
   - You can connect your own domain or use Netlify's free subdomain

---

### Option C: Vercel

#### Steps:

1. **Create a Vercel Account**
   - Go to https://vercel.com
   - Click "Sign up" (GitHub login recommended)

2. **Deploy from GitHub**
   - Click "Add New Project"
   - Import your GitHub repository
   - Vercel will auto-detect it as a static site
   - Click "Deploy"

3. **Access Your Site**
   - Vercel provides a URL:
     `https://[project-name].vercel.app`
   - Deployment is automatic on every push to GitHub

---

### Option D: Render

#### Steps:

1. **Create a Render Account**
   - Go to https://render.com
   - Sign up for free

2. **Create a Static Site**
   - Click "New" → "Static Site"
   - Connect your GitHub repository
   - Set Build command: (leave empty)
   - Set Publish directory: `.` (current directory)
   - Click "Create Static Site"

3. **Access Your Site**
   - Render provides a URL:
     `https://[project-name].onrender.com`

---

## 🔒 Security Recommendations

### Firebase Security (Important!)

The current setup allows anyone with the URL to read/write data. For better security:

1. **Enable Firebase Authentication** (Recommended for family use)
   - Go to Firebase Console > Authentication
   - Click "Get started"
   - Enable "Email/Password" provider
   - Update Firestore rules to require authentication:
   ```
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /familyTrees/{treeId} {
         allow read, write: if request.auth != null;
       }
     }
   }
   ```
   - Update your code to use Firebase Auth (requires code changes)

2. **Use Environment Variables** (For advanced users)
   - Don't commit Firebase config to public repositories
   - Use GitHub Secrets or Netlify environment variables

### Before Deploying:

1. **Change Authentication Credentials**
   - Open `script.js`
   - Find lines 27-30:
   ```javascript
   const AUTH = {
       username: 'admin',
       password: 'family2026'
   };
   ```
   - Change to your own secure credentials

2. **Verify Firebase Configuration**
   - Ensure your Firebase config is properly set in `script.js`
   - Test locally before deploying

### After Deploying:

1. **Test Cloud Sync**
   - Login to your site
   - Add a family member
   - Check browser console (F12) for "☁️ Data saved to cloud"
   - Open site in different browser/device
   - Login and verify data appears

2. **Share Carefully**
   - Only share your site URL with trusted family members
   - Consider using Firebase Authentication for better security

3. **Regular Backups**
   - Use the "Export Data" button periodically
   - Save the JSON file in a secure location
   - Keep multiple backup versions

4. **Monitor Firebase Usage**
   - Firebase free tier limits:
     - 1GB stored data
     - 50K reads/day
     - 20K writes/day
   - More than enough for family use
   - Monitor in Firebase Console > Usage tab

---

## 📱 Mobile Access & Multi-Device Sync

### How Cloud Storage Works

- **Automatic Sync:** Data is saved to Firebase on every change
- **Access Anywhere:** Login from any device with internet
- **Real-time Updates:** Changes appear on all devices (after refresh)
- **Offline Fallback:** Works locally if Firebase is unreachable

### Using on Multiple Devices:

1. **First Device:**
   - Login and create family tree
   - Data automatically saves to cloud

2. **Additional Devices:**
   - Open the same website URL
   - Login with same credentials
   - All data loads automatically from cloud

3. **Sharing with Family:**
   - Share the website URL
   - Share the login credentials (securely)
   - Everyone sees the same data

---

## 💾 Data Persistence & Storage

### Cloud Storage (Firebase)

- **Primary Storage:** All data saved to Firebase Firestore
- **Global Access:** Available from any device, anywhere
- **Automatic Backup:** Firebase automatically backs up your data
- **No Size Limits:** (within Firebase's 1GB free tier)

### Local Storage (Backup)

- **Automatic Backup:** Also saves to browser localStorage
- **Offline Access:** Works if internet is down
- **Device-Specific:** Each browser stores its own copy

### Data Flow:

1. You make changes → Saves to Firebase ☁️
2. Also saves to localStorage 💾 (backup)
3. Other devices load from Firebase ☁️
4. If Firebase fails, uses localStorage 💾

### Important Notes:

- **Primary Source:** Firebase is the source of truth
- **First Load:** New devices load from Firebase
- **Sync:** Data syncs automatically when you make changes
- **No Manual Sync:** No need to export/import between your own devices

---

## 🔄 Export/Import vs Cloud Sync

### When to Use Export/Import:

- **Backup:** Create periodic backups for safety
- **Migration:** Moving to a different Firebase project
- **Sharing:** One-time data sharing with others
- **Archive:** Keeping historical snapshots

### When to Use Cloud Sync (Automatic):

- **Daily Use:** Your normal family tree updates
- **Multiple Devices:** Your phone, tablet, computer
- **Family Collaboration:** Multiple family members editing
- **No Action Needed:** Just login and it works

---

## 🛠️ Updating Your Site

### For GitHub Pages:
1. Edit `script.js` locally if needed
2. Go to your repository on GitHub
3. Click on the file to edit
4. Click the pencil icon
5. Make changes and commit
6. Changes reflect immediately (may take 1-2 minutes)

### For Netlify:
- Drag and drop updated files to deploy a new version
- Or connect to GitHub for automatic deployments

### For Vercel/Render:
- Push changes to GitHub
- Site updates automatically

### Updating Family Tree Data:
- **No code changes needed!**
- Just login and make changes
- Data saves to Firebase automatically
- All devices see updates after refresh

---

## ❓ Troubleshooting

### Firebase Issues

**"Firebase not configured" in console:**
- Check that you replaced ALL placeholder values in `script.js`
- Verify Firebase project is active in Firebase Console
- Check browser console (F12) for detailed errors

**Data not syncing:**
- Check Firebase Firestore rules are set correctly
- Verify internet connection
- Check Firebase Console > Firestore > Data tab
- Look for errors in browser console (F12)

**"Permission denied" errors:**
- Check Firestore security rules allow read/write
- Make sure rules are published
- Wait a few minutes after changing rules

## 🎨 Customization Tips

1. **Change Colors**
   - Edit `styles.css`
   - Search for color codes (e.g., `#667eea`)
   - Replace with your preferred colors

2. **Change Title**
   - Edit `index.html`
   - Change `<title>` and `<h1>` text

3. **Add More Fields**
   - Edit the form in `index.html`
   - Update save/load logic in `script.js`

---

### General Issues

**Site Not Loading?**
- Wait 2-3 minutes after deployment
- Check that all three files are uploaded
- Clear browser cache and try again
- Check browser console for errors

### Login Not Working?
- Check that `script.js` uploaded correctly
- Verify credentials in the code
- Try in incognito/private browsing mode

**Photos Not Displaying?**
- Photos are stored as base64 in the database
- Large photos may take time to load
- Check Firebase Storage is enabled
- Check browser console for errors

**Data Not Appearing on New Device?**
- Verify Firebase is configured correctly
- Check internet connection
- Look for "☁️ Data loaded from cloud" in console (F12)
- Try refreshing the page
- Check Firebase Console > Firestore > Data to verify data exists

**Changes Not Syncing?**
- Check for "☁️ Data saved to cloud" message in console
- Verify internet connection
- Refresh other devices to see updates
- Check Firebase usage limits aren't exceeded

---

## 📞 Support & Resources

### Firebase Documentation
- Firestore: https://firebase.google.com/docs/firestore
- Storage: https://firebase.google.com/docs/storage
- Pricing: https://firebase.google.com/pricing (Free tier details)

### Hosting Platforms
- **GitHub Pages:** https://docs.github.com/en/pages
- **Netlify:** https://docs.netlify.com
- **Vercel:** https://vercel.com/docs
- **Render:** https://render.com/docs

---

## ✅ Complete Setup Checklist

### Firebase Setup
- [ ] Create Firebase project
- [ ] Enable Firestore Database
- [ ] Configure Firestore security rules
- [ ] Copy Firebase configuration
- [ ] Update `script.js` with your Firebase config
- [ ] ~~Enable Firebase Storage~~ (NOT needed - photos stored in Firestore)

### Code Configuration
- [ ] Change default username/password in `script.js`
- [ ] Test Firebase connection locally
- [ ] Verify "☁️ Firebase connected" in console

### Deployment
- [ ] Choose hosting platform
- [ ] Create account on chosen platform
- [ ] Upload all three files (index.html, styles.css, script.js)
- [ ] Wait for deployment (1-3 minutes)

### Testing
- [ ] Open deployed site
- [ ] Test login with new credentials
- [ ] Add first family member
- [ ] Verify "☁️ Data saved to cloud" in console
- [ ] Open site in different browser/device
- [ ] Verify data loads from cloud
- [ ] Create a backup (Export Data)

### Sharing
- [ ] Share URL with family members
- [ ] Share login credentials (securely)
- [ ] Verify family members can access
- [ ] Test simultaneous editing (optional)

---

## 🎉 You're All Set!

Your family tree is now:
- ✅ Hosted online and accessible 24/7
- ✅ Storing data in the cloud (Firebase)
- ✅ Accessible from any device, anywhere
- ✅ Automatically syncing across all devices
- ✅ Protected with authentication
- ✅ Backed up automatically by Firebase

### Next Steps:

1. **Start Building:** Add your family members
2. **Invite Family:** Share the URL and credentials
3. **Regular Backups:** Export data monthly
4. **Enjoy:** Watch your family tree grow!

### Pro Tips:

- **Bookmark on Mobile:** Add to home screen for app-like experience
- **Set Reminders:** Monthly exports for extra security
- **Document Sources:** Use the notes field for genealogy sources
- **Take Your Time:** Build the tree gradually with family input
- **Share Photos:** Collect family photos and upload them

Remember:
- Data syncs automatically - no manual action needed
- Firebase free tier is generous (enough for hundreds of family members)
- Keep one exported backup per month for peace of mind
- Share responsibly - only with trusted family members

---

**Happy family tree building! 🌳👨‍👩‍👧‍👦**
