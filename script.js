// ====================================================================
// FIREBASE CONFIGURATION
// ====================================================================
// Replace these values with your own Firebase project credentials
// Get these from: Firebase Console > Project Settings > Your apps
const firebaseConfig = {
  apiKey: "AIzaSyCmCPkn_iZwkIQHqSdvwBq23we3aKNfvis",
  authDomain: "family-tree-7e473.firebaseapp.com",
  projectId: "family-tree-7e473",
  storageBucket: "family-tree-7e473.firebasestorage.app",
  messagingSenderId: "744724183520",
  appId: "1:744724183520:web:88f412837fe56a10719385"
};

// Initialize Firebase
// Note: Photos are stored as base64 in Firestore, so Storage is NOT required
let db = null;
let isFirebaseConfigured = false;

try {
    if (firebaseConfig.apiKey !== "YOUR_API_KEY_HERE") {
        firebase.initializeApp(firebaseConfig);
        db = firebase.firestore();
        isFirebaseConfigured = true;
        console.log('✅ Firebase connected - Cloud storage enabled');
    } else {
        console.warn('⚠️ Firebase not configured - Using local storage only');
    }
} catch (error) {
    console.warn('⚠️ Firebase initialization failed - Using local storage only:', error);
}

// ====================================================================
// AUTHENTICATION CONFIGURATION
// ====================================================================
const AUTH = {
    username: 'admin',
    password: 'family2026'
};

// ====================================================================
// GLOBAL STATE
// ====================================================================
let familyData = {
    members: {},
    relationships: {
        spouses: [],
        children: []
    },
    rootPersonId: null
};

let currentEditingId = null;
let modalAction = null;
let parentIdForNew = null;
let relationshipType = null;
let familyTreeId = 'default'; // Can be changed to support multiple families

// ====================================================================
// APP INITIALIZATION
// ====================================================================
document.addEventListener('DOMContentLoaded', async () => {
    setupEventListeners();
    
    // Check if already logged in
    if (sessionStorage.getItem('authenticated') === 'true') {
        await loadData();
        showMainApp();
    }
});

// Event Listeners Setup
function setupEventListeners() {
    // Login
    document.getElementById('loginForm').addEventListener('submit', handleLogin);
    
    // Logout
    document.getElementById('logoutBtn').addEventListener('click', handleLogout);
    
    // Controls
    document.getElementById('expandAllBtn').addEventListener('click', expandAll);
    document.getElementById('collapseAllBtn').addEventListener('click', collapseAll);
    document.getElementById('resetZoomBtn').addEventListener('click', resetView);
    document.getElementById('exportBtn').addEventListener('click', exportData);
    document.getElementById('importBtn').addEventListener('click', () => {
        document.getElementById('importFile').click();
    });
    document.getElementById('importFile').addEventListener('change', importData);
    
    // Modal
    document.querySelector('.close').addEventListener('click', closeModal);
    document.getElementById('cancelBtn').addEventListener('click', closeModal);
    document.getElementById('personForm').addEventListener('submit', handlePersonSubmit);
    document.getElementById('personPhoto').addEventListener('change', handlePhotoPreview);
    
    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
        const modal = document.getElementById('personModal');
        if (e.target === modal) {
            closeModal();
        }
    });
}

// ====================================================================
// AUTHENTICATION
// ====================================================================
function handleLogin(e) {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const errorDiv = document.getElementById('loginError');
    
    if (username === AUTH.username && password === AUTH.password) {
        sessionStorage.setItem('authenticated', 'true');
        loadData().then(() => {
            showMainApp();
            errorDiv.textContent = '';
        });
    } else {
        errorDiv.textContent = 'Invalid username or password';
    }
}

function handleLogout() {
    sessionStorage.removeItem('authenticated');
    document.getElementById('loginScreen').style.display = 'flex';
    document.getElementById('mainApp').style.display = 'none';
    document.getElementById('username').value = '';
    document.getElementById('password').value = '';
}

async function showMainApp() {
    document.getElementById('loginScreen').style.display = 'none';
    document.getElementById('mainApp').style.display = 'flex';
    
    // Show Firebase status
    if (isFirebaseConfigured) {
        console.log('☁️ Cloud sync enabled');
    } else {
        console.log('💾 Local storage mode');
    }
    
    // Initialize tree if no data
    if (Object.keys(familyData.members).length === 0) {
        showAddRootPersonModal();
    } else {
        renderTree();
    }
}

// ====================================================================
// MODAL FUNCTIONS
// ====================================================================
function showAddRootPersonModal() {
    modalAction = 'addRoot';
    document.getElementById('modalTitle').textContent = 'Add First Family Member';
    resetForm();
    document.getElementById('personModal').style.display = 'block';
}

function openAddPersonModal(parentId, type) {
    modalAction = 'add';
    parentIdForNew = parentId;
    relationshipType = type;
    
    const titles = {
        'parent': 'Add Parent',
        'spouse': 'Add Spouse',
        'child': 'Add Child'
    };
    
    document.getElementById('modalTitle').textContent = titles[type] || 'Add Person';
    resetForm();
    document.getElementById('personModal').style.display = 'block';
}

function openEditPersonModal(personId) {
    modalAction = 'edit';
    currentEditingId = personId;
    const person = familyData.members[personId];
    
    document.getElementById('modalTitle').textContent = 'Edit Person';
    document.getElementById('personName').value = person.name;
    document.getElementById('personBirthDate').value = person.birthDate || '';
    document.getElementById('personGender').value = person.gender || 'male';
    document.getElementById('personNotes').value = person.notes || '';
    
    if (person.photo) {
        const preview = document.getElementById('photoPreview');
        preview.innerHTML = `<img src="${person.photo}" alt="Preview">`;
    }
    
    document.getElementById('personModal').style.display = 'block';
}

function closeModal() {
    document.getElementById('personModal').style.display = 'none';
    resetForm();
    currentEditingId = null;
    parentIdForNew = null;
    relationshipType = null;
}

function resetForm() {
    document.getElementById('personForm').reset();
    document.getElementById('photoPreview').innerHTML = '';
}

function handlePhotoPreview(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
            const preview = document.getElementById('photoPreview');
            preview.innerHTML = `<img src="${event.target.result}" alt="Preview">`;
        };
        reader.readAsDataURL(file);
    }
}

// ====================================================================
// PERSON MANAGEMENT
// ====================================================================
function handlePersonSubmit(e) {
    e.preventDefault();
    
    const name = document.getElementById('personName').value;
    const birthDate = document.getElementById('personBirthDate').value;
    const gender = document.getElementById('personGender').value;
    const notes = document.getElementById('personNotes').value;
    const photoFile = document.getElementById('personPhoto').files[0];
    
    const processPhoto = () => {
        if (photoFile) {
            const reader = new FileReader();
            reader.onload = async (event) => {
                await savePerson(name, birthDate, gender, notes, event.target.result);
            };
            reader.readAsDataURL(photoFile);
        } else {
            const existingPhoto = currentEditingId ? familyData.members[currentEditingId].photo : null;
            savePerson(name, birthDate, gender, notes, existingPhoto);
        }
    };
    
    processPhoto();
}

async function savePerson(name, birthDate, gender, notes, photo) {
    if (modalAction === 'edit') {
        // Update existing person
        familyData.members[currentEditingId] = {
            ...familyData.members[currentEditingId],
            name,
            birthDate,
            gender,
            notes,
            photo
        };
    } else {
        // Add new person
        const personId = 'person_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        familyData.members[personId] = {
            id: personId,
            name,
            birthDate,
            gender,
            notes,
            photo,
            collapsed: false
        };
        
        if (modalAction === 'addRoot') {
            familyData.rootPersonId = personId;
        } else if (modalAction === 'add') {
            addRelationship(parentIdForNew, personId, relationshipType);
        }
    }
    
    await saveData();
    closeModal();
    renderTree();
}

function addRelationship(parentId, childId, type) {
    if (type === 'spouse') {
        familyData.relationships.spouses.push({
            person1: parentId,
            person2: childId
        });
    } else if (type === 'child') {
        familyData.relationships.children.push({
            parentId: parentId,
            childId: childId
        });
    } else if (type === 'parent') {
        familyData.relationships.children.push({
            parentId: childId,
            childId: parentId
        });
    }
}

function deletePerson(personId) {
    if (confirm('Are you sure you want to delete this person and all their descendants?')) {
        // Remove person
        delete familyData.members[personId];
        
        // Remove relationships
        familyData.relationships.spouses = familyData.relationships.spouses.filter(
            rel => rel.person1 !== personId && rel.person2 !== personId
        );
        familyData.relationships.children = familyData.relationships.children.filter(
            rel => rel.parentId !== personId && rel.childId !== personId
        );
        
        // If root person deleted, find new root or reset
        if (familyData.rootPersonId === personId) {
            const remainingIds = Object.keys(familyData.members);
            familyData.rootPersonId = remainingIds.length > 0 ? remainingIds[0] : null;
        }
        
        saveData();
        renderTree();
    }
}

// ====================================================================
// TREE RENDERING
// ====================================================================
function renderTree() {
    const canvas = document.getElementById('treeCanvas');
    canvas.innerHTML = '';
    
    if (!familyData.rootPersonId || !familyData.members[familyData.rootPersonId]) {
        canvas.innerHTML = '<div style="text-align: center; padding: 50px;"><h2>No family members yet</h2><button class="btn" onclick="showAddRootPersonModal()">Add First Member</button></div>';
        return;
    }
    
    const rootPerson = familyData.members[familyData.rootPersonId];
    const treeNode = buildTreeNode(rootPerson.id, null);
    canvas.appendChild(treeNode);
}

function buildTreeNode(personId, spouseId) {
    const person = familyData.members[personId];
    if (!person) return null;
    
    const container = document.createElement('div');
    container.className = 'tree-node';
    
    // Create family group (person + spouse if exists)
    const familyGroup = document.createElement('div');
    familyGroup.className = 'family-group';
    
    // Add person card
    const personCard = createPersonCard(person);
    familyGroup.appendChild(personCard);
    
    // Add spouse if exists
    const spouse = getSpouse(personId);
    if (spouse && spouse.id !== spouseId) {
        const spouseCard = createPersonCard(spouse);
        familyGroup.appendChild(spouseCard);
    }
    
    container.appendChild(familyGroup);
    
    // Add children if not collapsed
    if (!person.collapsed) {
        const children = getChildren(personId);
        if (children.length > 0) {
            const childrenContainer = document.createElement('div');
            childrenContainer.className = 'children-container';
            
            children.forEach(child => {
                const childNode = buildTreeNode(child.id, personId);
                if (childNode) {
                    childrenContainer.appendChild(childNode);
                }
            });
            
            container.appendChild(childrenContainer);
        }
    } else {
        const children = getChildren(personId);
        if (children.length > 0) {
            const indicator = document.createElement('div');
            indicator.className = 'collapsed-indicator';
            indicator.textContent = `▼ ${children.length} child${children.length > 1 ? 'ren' : ''} (click expand)`;
            container.appendChild(indicator);
        }
    }
    
    return container;
}

function createPersonCard(person) {
    const card = document.createElement('div');
    card.className = `node-card ${person.gender || 'male'}`;
    
    // Collapse button
    const children = getChildren(person.id);
    if (children.length > 0) {
        const collapseBtn = document.createElement('div');
        collapseBtn.className = 'collapse-btn';
        collapseBtn.textContent = person.collapsed ? '+' : '−';
        collapseBtn.onclick = (e) => {
            e.stopPropagation();
            toggleCollapse(person.id);
        };
        card.appendChild(collapseBtn);
    }
    
    // Photo
    const photo = document.createElement('div');
    photo.className = 'node-photo';
    if (person.photo) {
        photo.innerHTML = `<img src="${person.photo}" alt="${person.name}">`;
    } else {
        const initial = person.name.charAt(0).toUpperCase();
        photo.innerHTML = `<span class="placeholder">${initial}</span>`;
    }
    card.appendChild(photo);
    
    // Name
    const name = document.createElement('div');
    name.className = 'node-name';
    name.textContent = person.name;
    card.appendChild(name);
    
    // Info
    if (person.birthDate) {
        const info = document.createElement('div');
        info.className = 'node-info';
        const year = new Date(person.birthDate).getFullYear();
        info.textContent = `Born: ${year}`;
        card.appendChild(info);
    }
    
    // Actions
    const actions = document.createElement('div');
    actions.className = 'node-actions';
    
    const addParentBtn = createButton('+ Parent', () => openAddPersonModal(person.id, 'parent'));
    const addSpouseBtn = createButton('+ Spouse', () => openAddPersonModal(person.id, 'spouse'));
    const addChildBtn = createButton('+ Child', () => openAddPersonModal(person.id, 'child'));
    const editBtn = createButton('Edit', () => openEditPersonModal(person.id));
    const deleteBtn = createButton('Delete', () => deletePerson(person.id));
    
    deleteBtn.style.background = '#dc3545';
    
    actions.appendChild(addParentBtn);
    
    // Only show spouse button if no spouse exists
    if (!getSpouse(person.id)) {
        actions.appendChild(addSpouseBtn);
    }
    
    actions.appendChild(addChildBtn);
    actions.appendChild(editBtn);
    actions.appendChild(deleteBtn);
    
    card.appendChild(actions);
    
    return card;
}

function createButton(text, onClick) {
    const btn = document.createElement('button');
    btn.textContent = text;
    btn.className = 'btn';
    btn.onclick = (e) => {
        e.stopPropagation();
        onClick();
    };
    return btn;
}

// ====================================================================
// HELPER FUNCTIONS
// ====================================================================
function getSpouse(personId) {
    for (const rel of familyData.relationships.spouses) {
        if (rel.person1 === personId) {
            return familyData.members[rel.person2];
        }
        if (rel.person2 === personId) {
            return familyData.members[rel.person1];
        }
    }
    return null;
}

function getChildren(personId) {
    const children = [];
    const spouse = getSpouse(personId);
    
    for (const rel of familyData.relationships.children) {
        if (rel.parentId === personId || (spouse && rel.parentId === spouse.id)) {
            const child = familyData.members[rel.childId];
            if (child && !children.find(c => c.id === child.id)) {
                children.push(child);
            }
        }
    }
    
    return children;
}

function toggleCollapse(personId) {
    familyData.members[personId].collapsed = !familyData.members[personId].collapsed;
    saveData();
    renderTree();
}

function expandAll() {
    Object.keys(familyData.members).forEach(id => {
        familyData.members[id].collapsed = false;
    });
    saveData();
    renderTree();
}

function collapseAll() {
    Object.keys(familyData.members).forEach(id => {
        familyData.members[id].collapsed = true;
    });
    saveData();
    renderTree();
}

function resetView() {
    const container = document.getElementById('treeContainer');
    const canvas = document.getElementById('treeCanvas');
    
    // Reset scroll position
    container.scrollTop = 0;
    
    // Center horizontally
    const containerWidth = container.clientWidth;
    const canvasWidth = canvas.scrollWidth;
    
    if (canvasWidth > containerWidth) {
        // If content is wider than container, center it
        container.scrollLeft = (canvasWidth - containerWidth) / 2;
    } else {
        // If content fits, scroll to left
        container.scrollLeft = 0;
    }
}

// ====================================================================
// DATA MANAGEMENT - CLOUD & LOCAL STORAGE
// ====================================================================

// Save data to Firebase or localStorage
async function saveData() {
    if (isFirebaseConfigured && db) {
        try {
            await db.collection('familyTrees').doc(familyTreeId).set({
                data: familyData,
                lastUpdated: firebase.firestore.FieldValue.serverTimestamp()
            });
            console.log('☁️ Data saved to cloud');
        } catch (error) {
            console.error('Error saving to Firebase:', error);
            // Fallback to localStorage
            saveToLocalStorage();
        }
    } else {
        saveToLocalStorage();
    }
}

// Load data from Firebase or localStorage
async function loadData() {
    if (isFirebaseConfigured && db) {
        try {
            const doc = await db.collection('familyTrees').doc(familyTreeId).get();
            if (doc.exists) {
                const cloudData = doc.data();
                familyData = cloudData.data;
                console.log('☁️ Data loaded from cloud');
                
                // Also save to localStorage as backup
                saveToLocalStorage();
                return;
            } else {
                console.log('No cloud data found, checking local storage...');
            }
        } catch (error) {
            console.error('Error loading from Firebase:', error);
        }
    }
    
    // Fallback to localStorage
    loadFromLocalStorage();
}

// Save to localStorage (backup or primary if Firebase not configured)
function saveToLocalStorage() {
    try {
        localStorage.setItem('familyTreeData', JSON.stringify(familyData));
        console.log('💾 Data saved locally');
    } catch (error) {
        console.error('Error saving to localStorage:', error);
        alert('Unable to save data locally. Your browser storage might be full.');
    }
}

// Load from localStorage
function loadFromLocalStorage() {
    const saved = localStorage.getItem('familyTreeData');
    if (saved) {
        try {
            familyData = JSON.parse(saved);
            console.log('💾 Data loaded from local storage');
        } catch (e) {
            console.error('Error loading data:', e);
        }
    }
}

// ====================================================================
// EXPORT / IMPORT
// ====================================================================
function exportData() {
    const dataStr = JSON.stringify(familyData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `family-tree-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
}

async function importData(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = async (event) => {
            try {
                const imported = JSON.parse(event.target.result);
                if (confirm('This will replace all current data. Continue?')) {
                    familyData = imported;
                    await saveData();
                    renderTree();
                }
            } catch (error) {
                alert('Error importing file. Please check the file format.');
            }
        };
        reader.readAsText(file);
    }
    e.target.value = '';
}
