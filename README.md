# Family Tree Web Application

A beautiful, interactive family tree web application with **cloud storage**, authentication, photo support, and real-time data synchronization.

## ✨ Features

- **☁️ Cloud Storage** - Data stored in Firebase, accessible from anywhere
- **🔄 Auto-Sync** - Automatically syncs across all your devices
- **🔒 Secure Authentication** - Basic login system to protect your family data
- **👨‍👩‍👧‍👦 Interactive Tree View** - Visual family tree with clear parent-child and spouse relationships
- **📸 Photo Support** - Upload and display photos for each family member
- **➕ Easy Management** - Add parents, spouses, and children with simple buttons
- **🔄 Collapse/Expand** - Collapse branches to focus on specific family lines
- **💾 Data Export/Import** - Backup and share your family tree data
- **📱 Responsive Design** - Works on desktop, tablet, and mobile devices
- **🎨 Beautiful UI** - Modern, gradient design with smooth animations
- **🌐 Multi-Device Access** - Access your tree from any device with internet

## 🚀 Quick Start

### Prerequisites

1. **Firebase Account** (Free)
   - Required for cloud storage
   - See [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) for setup

### Setup Steps

1. **Setup Firebase** (15 minutes)
   - Follow Firebase setup in [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)
   - Get your Firebase configuration
   - Update `script.js` with your config

2. **Configure Authentication**
   - Open `script.js`
   - Change default credentials (lines 27-30)

3. **Deploy** (5 minutes)
   - Choose a hosting platform (GitHub Pages, Netlify, etc.)
   - Upload your three files
   - Access from anywhere!

### Local Development

1. **Download the files** to a folder
2. **Update Firebase config** in `script.js` (lines 4-11)
3. **Open `index.html`** in a web browser
4. **Login** with your credentials

⚠️ **Important:** Without Firebase configuration, the app will work in local-only mode (no cloud sync).

## 📖 How to Use

### First Time Setup

1. **Login** with the credentials above
2. **Add First Member** - The app will prompt you to add your first family member
3. **Fill in details:**
   - Name (required)
   - Birth Date (optional)
   - Gender
   - Photo (optional)
   - Notes (optional)

### Building Your Tree

Each person card has buttons to:
- **+ Parent** - Add mother or father
- **+ Spouse** - Add husband/wife/partner
- **+ Child** - Add son or daughter
- **Edit** - Modify person's information
- **Delete** - Remove person from tree (with confirmation)

### Managing the View

- **Expand All** - Show all family members
- **Collapse All** - Hide all descendants
- **Reset View** - Return to top of tree
- **Collapse/Expand Individual** - Click the ⊕/⊖ button on each card

### Data Management

- **Auto-Save** - Changes automatically save to Firebase cloud
- **Export Data** - Download your family tree as a JSON backup
- **Import Data** - Restore from a backup file
- **Cloud Sync** - Access the same data from any device

## ☁️ Cloud Storage & Sync

### How It Works

1. **Automatic Sync:**
   - Every change saves to Firebase instantly
   - No manual sync needed
   - Check console for "☁️ Data saved to cloud"

2. **Multi-Device Access:**
   - Login from any device
   - All data loads automatically
   - Changes appear everywhere (after refresh)

3. **Offline Fallback:**
   - Works locally if internet is down
   - Syncs when connection returns
   - localStorage backup on each device

### Firebase Free Tier Limits

- **1GB** stored data (hundreds of family members with photos)
- **50,000** reads per day
- **20,000** writes per day
- More than enough for family use!

### Data Locations

- **Primary:** Firebase Firestore (cloud)
- **Backup:** Browser localStorage (each device)
- **Exports:** JSON files (your computer)

## 🎨 Customization

### Change Colors

Edit `styles.css` to change the color scheme:
```css
/* Main gradient background */
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);

/* Button colors */
.btn {
    background: #667eea;
}

/* Male border color */
.node-card.male {
    border-color: #4dabf7;
}

/* Female border color */
.node-card.female {
    border-color: #ff6b9d;
}
```

### Change Authentication

Edit `script.js` (lines 27-30):
```javascript
const AUTH = {
    username: 'your-username',
    password: 'your-secure-password'
};
```

### Configure Firebase

Edit `script.js` (lines 4-11) with your Firebase project credentials:
```javascript
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    // ... other config values
};
```

See [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) for detailed Firebase setup.

### Add More Fields

To add additional fields (e.g., death date, birthplace):

1. Add form field in `index.html`
2. Update save/load logic in `script.js`
3. Display in the card creation function

## 🌐 Hosting for Free

See [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) for complete instructions including:

1. **Firebase Setup** (cloud storage)
2. **Hosting Options:**
   - GitHub Pages (Recommended)
   - Netlify
   - Vercel
   - Render

All options are completely free and require no credit card!

## 📊 Data Storage & Privacy

### Cloud Storage (Firebase)

- **Primary Storage** - All data in Firebase Firestore
- **Automatic Backup** - Firebase backs up your data
- **Global Access** - Available from anywhere with internet
- **No Size Worries** - 1GB free tier (very generous)

### Local Storage (Fallback)

- **Automatic Backup** - Also saves to browser localStorage
- **Offline Mode** - Works without internet
- **Device-Specific** - Each browser has its own copy

### Privacy & Security

- **Your Data** - You control your Firebase project
- **Basic Auth** - Username/password protection
- **Firebase Rules** - Control who can read/write
- **No Third-Party** - Data stays in your Firebase account

### Storage Comparison

| Feature | Firebase (Cloud) | localStorage (Local) |
|---------|------------------|---------------------|
| Access anywhere | ✅ Yes | ❌ No |
| Multi-device | ✅ Yes | ❌ No |
| Automatic backup | ✅ Yes | ⚠️ Per device |
| Internet required | ✅ Yes | ❌ No |
| Size limit | 1GB (free) | ~5-10MB |
| Persistence | ✅ Permanent | ⚠️ Can be cleared |

## 🔒 Security & Privacy

### Current Security

- Basic username/password authentication
- Firebase Firestore security rules
- Data stored in your Firebase project
- Client-side authentication (simple)

### Security Recommendations

1. **Change Default Credentials** - Update username/password immediately
2. **Secure Firebase Rules** - Review rules in [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)
3. **Share Carefully** - Only with trusted family members
4. **Consider Firebase Auth** - For advanced security (see deployment guide)
5. **Regular Backups** - Export data periodically
6. **Monitor Access** - Check Firebase Console for usage

### For Better Security (Advanced):

- Implement Firebase Authentication (email/password)
- Update Firestore rules to require authentication
- Use environment variables for config
- Enable Firebase App Check

See [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) for details.

## 🖼️ Photo Management

### Supported Formats
- JPG/JPEG
- PNG
- GIF
- WebP

### Size Recommendations
- Keep photos under 500KB each
- Larger photos will be stored but may impact performance
- Total storage: ~5-10MB across all photos

### Tips
- Resize photos before uploading
- Use square/portrait photos for best display
- Clear/remove unused photos to save space

## 📱 Browser Compatibility

Works on all modern browsers:
- ✅ Chrome/Edge (Recommended)
- ✅ Firefox
- ✅ Safari
- ✅ Mobile browsers (iOS/Android)

Requires JavaScript enabled.

## 🛠️ Troubleshooting

### Firebase Issues

**"Firebase not configured" message:**
- Update Firebase config in `script.js`
- Replace all placeholder values
- Check Firebase Console for correct values

**Data not syncing:**
- Check internet connection
- Verify Firebase rules in Firestore
- Look for errors in browser console (F12)
- Check "☁️" messages in console

**Permission errors:**
- Review Firestore security rules
- Make sure rules are published
- See [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)

### General Issues

**Login Issues:**
- Verify credentials in `script.js` (lines 27-30)
- Clear browser cache
- Try incognito/private mode

**Data Not Saving:**
- Check browser console for errors
- Verify internet connection (for cloud sync)
- Check Firebase usage limits
- Try a different browser

**Photos Not Loading:**
- Check file size (keep under 500KB recommended)
- Use supported formats (JPG, PNG, GIF, WebP)
- Check Firebase Storage is enabled
- Reduce photo resolution if needed

**Data Not Appearing on New Device:**
- Verify Firebase is configured
- Check internet connection
- Look for "☁️ Data loaded from cloud" in console
- Refresh the page
- Check Firebase Console > Firestore > Data

**Tree Not Displaying:**
- Refresh the page
- Check browser console for errors
- Try clearing cache
- Ensure all files are in same folder (if local)

## 🔄 Updates & Maintenance

### Cloud Data Updates

- **Automatic:** Changes save to cloud instantly
- **No Manual Sync:** Just make changes and they sync
- **Multi-Device:** All devices get updates (after refresh)

### Backing Up Your Data

1. Click "Export Data" button
2. Save the JSON file securely
3. Recommended: Monthly backups
4. Keep multiple versions

### Restoring from Backup

1. Click "Import Data" button
2. Select your JSON backup file
3. Confirm replacement
4. Verify data loaded correctly
5. Data will sync to cloud automatically

### Sharing with Family

**Option 1: Cloud Sync (Automatic)**
1. Deploy with Firebase configured
2. Share the website URL
3. Share login credentials (securely)
4. Everyone sees same data automatically

**Option 2: Manual Export/Import**
1. Export your data
2. Share JSON file
3. Family imports into their installation
4. Use when not using cloud storage

## 📝 License

This project is free to use and modify for personal and family use.

## 🆘 Getting Help

### Resources

- **Firebase Docs:** https://firebase.google.com/docs
- **Deployment Guide:** See [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)
- **This README:** You're reading it!

### Common Questions

**Do I need Firebase?**
- Optional but recommended for cloud storage
- Without it, data stays in browser only
- See deployment guide for setup

**Is it really free?**
- Yes! Firebase has generous free tier
- Hosting platforms are also free
- No credit card required

**Can multiple people edit?**
- Yes, with cloud storage enabled
- Everyone uses same URL and credentials
- Changes sync across devices
- Refresh to see others' changes

**What if I exceed Firebase limits?**
- Very unlikely for family use
- Free tier: 1GB storage, 50K reads/day
- Monitor in Firebase Console
- Firebase will notify you if approaching limits

**Is my data private?**
- Data is in your Firebase project
- You control access with credentials
- Set Firestore rules for more security
- No third parties can access

**Can I use my own domain?**
- Yes! Most hosting platforms support custom domains
- See their documentation for setup
- Firebase also offers custom domain hosting

---

**Enjoy building your family tree! 🌳👨‍👩‍👧‍👦**

### Files Included

- `index.html` - Main application structure
- `styles.css` - All styling and visual design  
- `script.js` - Application logic and Firebase integration
- `DEPLOYMENT_GUIDE.md` - Complete setup and hosting instructions
- `README.md` - This documentation

## 🎯 Future Enhancements (Optional DIY)

Ideas for extending the application:
- **Real-time collaboration** - Multiple users editing simultaneously
- **Advanced Firebase Auth** - Email/password, Google Sign-In
- **Search functionality** - Find family members quickly
- **Export to PDF or image** - Print-friendly formats
- **Multiple tree views** - Ancestors, descendants, fan chart
- **Timeline view** - Chronological family history
- **Statistics** - Oldest member, generations, etc.
- **Sharing via QR code** - Easy mobile access
- **Dark mode** - For night viewing
- **Multiple language support** - International families
- **DNA integration** - Connect with genealogy services
- **Source citations** - Document genealogy research

---
