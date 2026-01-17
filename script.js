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

// Wait for Firebase to load before initializing
if (typeof firebase !== 'undefined') {
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
} else {
    console.warn('⚠️ Firebase SDK not loaded - Using local storage only');
}

// ====================================================================
// AUTHENTICATION CONFIGURATION
// ====================================================================
// Multi-tree authentication - stored per tree
const TREES_STORAGE_KEY = 'familyTreesAuth';

function getTreeAuth(treeId) {
    const trees = JSON.parse(localStorage.getItem(TREES_STORAGE_KEY) || '{}');
    return trees[treeId];
}

function saveTreeAuth(treeId, treeData) {
    const trees = JSON.parse(localStorage.getItem(TREES_STORAGE_KEY) || '{}');
    trees[treeId] = treeData;
    localStorage.setItem(TREES_STORAGE_KEY, JSON.stringify(trees));
}

function getAllTrees() {
    return JSON.parse(localStorage.getItem(TREES_STORAGE_KEY) || '{}');
}

function deleteTree(treeId) {
    const trees = JSON.parse(localStorage.getItem(TREES_STORAGE_KEY) || '{}');
    delete trees[treeId];
    localStorage.setItem(TREES_STORAGE_KEY, JSON.stringify(trees));
    // Also delete tree data
    localStorage.removeItem(`familyTree_${treeId}`);
}

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
let familyTreeId = null; // Will be set from URL
let currentTreeAuth = null; // Current tree's auth info
let zoomLevel = 1.0; // Current zoom level

// ====================================================================
// SCREEN MANAGEMENT
// ====================================================================
function showTreeSelector() {
    console.log('Showing tree selector');
    document.getElementById('treeSelectorScreen').style.display = 'flex';
    document.getElementById('createTreeScreen').style.display = 'none';
    document.getElementById('loginScreen').style.display = 'none';
    document.getElementById('mainApp').style.display = 'none';
    populateTreeList();
}

function showCreateTreeScreen() {
    console.log('Showing create tree screen');
    document.getElementById('treeSelectorScreen').style.display = 'none';
    document.getElementById('createTreeScreen').style.display = 'flex';
    document.getElementById('loginScreen').style.display = 'none';
    document.getElementById('mainApp').style.display = 'none';
}

function showLoginScreen() {
    console.log('Showing login screen for tree:', familyTreeId);
    document.getElementById('treeSelectorScreen').style.display = 'none';
    document.getElementById('createTreeScreen').style.display = 'none';
    document.getElementById('loginScreen').style.display = 'flex';
    document.getElementById('mainApp').style.display = 'none';
    
    // Update login header with tree name
    if (currentTreeAuth) {
        document.getElementById('loginTreeName').textContent = currentTreeAuth.name + ' - Login';
    }
}

function showMainApp() {
    console.log('Showing main app');
    document.getElementById('treeSelectorScreen').style.display = 'none';
    document.getElementById('createTreeScreen').style.display = 'none';
    document.getElementById('loginScreen').style.display = 'none';
    document.getElementById('mainApp').style.display = 'flex';
    renderTree();
}

// ====================================================================
// APP INITIALIZATION
// ====================================================================
document.addEventListener('DOMContentLoaded', async () => {
    // Setup event listeners first
    setupEventListeners();
    
    // Check URL for tree ID
    const urlParams = new URLSearchParams(window.location.search);
    const treeIdFromUrl = urlParams.get('tree');
    
    console.log('Tree ID from URL:', treeIdFromUrl);
    
    if (treeIdFromUrl) {
        // Tree specified in URL - go to login
        familyTreeId = treeIdFromUrl;
        currentTreeAuth = getTreeAuth(familyTreeId);
        
        console.log('Tree auth found:', currentTreeAuth);
        
        if (!currentTreeAuth) {
            console.error('Tree not found in storage');
            alert('Tree not found! Redirecting to tree selector...');
            window.location.href = window.location.pathname;
            return;
        }
        
        // Check if already logged in for this tree
        const authKey = `authenticated_${familyTreeId}`;
        const isAuthenticated = sessionStorage.getItem(authKey) === 'true';
        console.log('Is authenticated:', isAuthenticated);
        
        if (isAuthenticated) {
            await loadData();
            showMainApp();
        } else {
            showLoginScreen();
        }
    } else {
        // No tree specified - show tree selector
        console.log('No tree in URL, showing selector');
        showTreeSelector();
    }
});

// Event Listeners Setup
function setupEventListeners() {
    // Tree Management
    document.getElementById('createNewTreeBtn').addEventListener('click', showCreateTreeScreen);
    document.getElementById('createTreeForm').addEventListener('submit', handleCreateTree);
    document.getElementById('backToSelector').addEventListener('click', showTreeSelector);
    document.getElementById('backToTrees').addEventListener('click', () => {
        window.location.href = window.location.pathname;
    });
    
    // Login
    document.getElementById('loginForm').addEventListener('submit', handleLogin);
    
    // Burger Menu
    document.getElementById('burgerBtn').addEventListener('click', toggleBurgerMenu);
    document.getElementById('logoutBtn').addEventListener('click', handleLogout);
    
    // Export Options
    document.getElementById('exportJsonBtn').addEventListener('click', exportData);
    document.getElementById('exportPdfBtn').addEventListener('click', exportAsPDF);
    document.getElementById('exportJpegBtn').addEventListener('click', exportAsJPEG);
    document.getElementById('importBtn').addEventListener('click', () => {
        document.getElementById('importFile').click();
        toggleBurgerMenu();
    });
    document.getElementById('importFile').addEventListener('change', importData);
    
    // Controls
    document.getElementById('expandAllBtn').addEventListener('click', expandAll);
    document.getElementById('collapseAllBtn').addEventListener('click', collapseAll);
    document.getElementById('zoomInBtn').addEventListener('click', zoomIn);
    document.getElementById('zoomOutBtn').addEventListener('click', zoomOut);
    
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
// TREE MANAGEMENT
// ====================================================================
function populateTreeList() {
    const treeList = document.getElementById('treeList');
    const trees = getAllTrees();
    
    if (Object.keys(trees).length === 0) {
        treeList.innerHTML = '<p class="no-trees">No family trees yet. Create your first one!</p>';
        return;
    }
    
    treeList.innerHTML = '';
    for (const [treeId, treeData] of Object.entries(trees)) {
        const treeCard = document.createElement('div');
        treeCard.className = 'tree-card';
        treeCard.innerHTML = `
            <div class="tree-card-content">
                <h3>🌳 ${treeData.name}</h3>
                <p class="tree-id">ID: ${treeId}</p>
                <p class="tree-url">URL: ${window.location.origin}${window.location.pathname}?tree=${treeId}</p>
            </div>
            <div class="tree-card-actions">
                <button class="tree-btn open-btn" data-tree-id="${treeId}">Open</button>
                <button class="tree-btn delete-btn" data-tree-id="${treeId}" data-tree-name="${treeData.name}">Delete</button>
            </div>
        `;
        
        // Add event listeners
        const openBtn = treeCard.querySelector('.open-btn');
        const deleteBtn = treeCard.querySelector('.delete-btn');
        
        openBtn.addEventListener('click', () => openTree(treeId));
        deleteBtn.addEventListener('click', () => confirmDeleteTree(treeId, treeData.name));
        
        treeList.appendChild(treeCard);
    }
}

function openTree(treeId) {
    window.location.href = `${window.location.pathname}?tree=${treeId}`;
}

function confirmDeleteTree(treeId, treeName) {
    if (confirm(`Are you sure you want to delete "${treeName}"?\n\nThis will permanently delete all family data for this tree. This action cannot be undone.`)) {
        deleteTree(treeId);
        populateTreeList();
    }
}

function handleCreateTree(e) {
    e.preventDefault();
    const treeId = document.getElementById('treeId').value.toLowerCase().trim();
    const treeName = document.getElementById('treeName').value.trim();
    const username = document.getElementById('newUsername').value;
    const password = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const errorDiv = document.getElementById('createError');
    
    // Validate
    if (!treeId.match(/^[a-z0-9-]+$/)) {
        errorDiv.textContent = 'Tree ID must contain only lowercase letters, numbers, and hyphens';
        return;
    }
    
    if (password !== confirmPassword) {
        errorDiv.textContent = 'Passwords do not match';
        return;
    }
    
    if (password.length < 6) {
        errorDiv.textContent = 'Password must be at least 6 characters';
        return;
    }
    
    // Check if tree already exists
    const existingTree = getTreeAuth(treeId);
    if (existingTree) {
        errorDiv.textContent = 'A tree with this ID already exists. Please choose a different ID.';
        return;
    }
    
    // Create tree
    saveTreeAuth(treeId, {
        name: treeName,
        username: username,
        password: password,
        createdAt: new Date().toISOString()
    });
    
    // Clear form
    document.getElementById('createTreeForm').reset();
    errorDiv.textContent = '';
    
    // Show success and redirect
    alert(`Tree "${treeName}" created successfully!\n\nYou can access it at:\n${window.location.origin}${window.location.pathname}?tree=${treeId}`);
    showTreeSelector();
}

// ====================================================================
// AUTHENTICATION
// ====================================================================
function handleLogin(e) {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const errorDiv = document.getElementById('loginError');
    
    if (!currentTreeAuth) {
        errorDiv.textContent = 'Tree configuration error';
        return;
    }
    
    if (username === currentTreeAuth.username && password === currentTreeAuth.password) {
        sessionStorage.setItem(`authenticated_${familyTreeId}`, 'true');
        loadData().then(() => {
            showMainApp();
            errorDiv.textContent = '';
        });
    } else {
        errorDiv.textContent = 'Invalid username or password';
    }
}

function handleLogout() {
    sessionStorage.removeItem(`authenticated_${familyTreeId}`);
    window.location.href = window.location.pathname;

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
        // When adding a parent: childId is the new parent, parentId is the existing person
        familyData.relationships.children.push({
            parentId: childId,
            childId: parentId
        });
        // The new parent becomes the root (renderTree will find true topmost ancestor)
        familyData.rootPersonId = childId;
    }
}

function deletePerson(personId) {
    const person = familyData.members[personId];
    const children = getChildren(personId);
    
    let message = `Delete "${person.name}"?\n\n`;
    if (children.length > 0) {
        message += `This person has ${children.length} child${children.length > 1 ? 'ren' : ''}.\n\n`;
        message += 'Choose OK to delete ONLY this person (children will remain)\n';
        message += 'or Cancel to abort.';
    } else {
        message += 'This action cannot be undone.';
    }
    
    if (confirm(message)) {
        deletePersonOnly(personId);
    }
}

function deletePersonOnly(personId) {
    const children = getChildren(personId);
    const spouse = getSpouse(personId);
    
    // Remove person
    delete familyData.members[personId];
    
    // Remove spouse relationships
    familyData.relationships.spouses = familyData.relationships.spouses.filter(
        rel => rel.person1 !== personId && rel.person2 !== personId
    );
    
    // Remove parent-child relationships where this person is involved
    familyData.relationships.children = familyData.relationships.children.filter(
        rel => rel.parentId !== personId && rel.childId !== personId
    );
    
    // Handle root person update
    if (familyData.rootPersonId === personId) {
        // Priority: spouse, first child, or any remaining person
        if (spouse) {
            familyData.rootPersonId = spouse.id;
        } else if (children.length > 0) {
            familyData.rootPersonId = children[0].id;
        } else {
            const remainingIds = Object.keys(familyData.members);
            familyData.rootPersonId = remainingIds.length > 0 ? remainingIds[0] : null;
        }
    }
    
    saveData();
    renderTree();
}

function deletePersonAndDescendants(personId) {
    const children = getChildren(personId);
    
    // Recursively delete all children first
    children.forEach(child => {
        deletePersonAndDescendants(child.id);
    });
    
    // Then delete this person
    deletePersonOnly(personId);
}

// ====================================================================
// TREE RENDERING
// ====================================================================
function findTopmostAncestor(personId) {
    // Find the topmost ancestor (person with no parents)
    let current = personId;
    let visited = new Set();
    
    while (current && !visited.has(current)) {
        visited.add(current);
        let parent = null;
        
        // Look for a parent relationship where current is the child
        for (const rel of familyData.relationships.children) {
            if (rel.childId === current) {
                parent = rel.parentId;
                break;
            }
        }
        
        if (parent && familyData.members[parent]) {
            current = parent;
        } else {
            break;
        }
    }
    
    return current;
}

function renderTree() {
    const canvas = document.getElementById('treeCanvas');
    canvas.innerHTML = '';
    
    if (!familyData.rootPersonId || !familyData.members[familyData.rootPersonId]) {
        canvas.innerHTML = '<div style="text-align: center; padding: 50px;"><h2>No family members yet</h2><button class="btn" onclick="showAddRootPersonModal()">Add First Member</button></div>';
        return;
    }
    
    // Always find and render from the topmost ancestor
    const actualRoot = findTopmostAncestor(familyData.rootPersonId);
    if (actualRoot !== familyData.rootPersonId) {
        familyData.rootPersonId = actualRoot;
    }
    
    const rootPerson = familyData.members[actualRoot];
    const treeNode = buildTreeNode(rootPerson.id, null);
    canvas.appendChild(treeNode);
    
    // Center the tree after rendering
    setTimeout(() => centerTree(), 100);
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
    
    // Get children for this person
    const children = getChildren(personId);
    
    // Add children if not collapsed
    if (!person.collapsed) {
        if (children.length > 0) {
            const childrenContainer = document.createElement('div');
            childrenContainer.className = 'children-container';
            
            children.forEach((child, index) => {
                const childWrapper = document.createElement('div');
                childWrapper.className = 'child-wrapper';
                
                // Add vertical line from parent to child
                const childConnector = document.createElement('div');
                childConnector.className = 'child-connector-line';
                childWrapper.appendChild(childConnector);
                
                const childNode = buildTreeNode(child.id, personId);
                if (childNode) {
                    childWrapper.appendChild(childNode);
                }
                childrenContainer.appendChild(childWrapper);
            });
            
            container.appendChild(childrenContainer);
        }
    } else {
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
    
    // Add right-click context menu
    card.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        showContextMenu(e, person);
    });
    
    // Also show context menu on long press for touch devices
    let pressTimer;
    card.addEventListener('touchstart', (e) => {
        pressTimer = setTimeout(() => {
            showContextMenu(e.touches[0], person);
        }, 500);
    });
    card.addEventListener('touchend', () => {
        clearTimeout(pressTimer);
    });
    
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
// CONTEXT MENU
// ====================================================================
function showContextMenu(e, person) {
    // Remove existing context menu if any
    const existingMenu = document.querySelector('.context-menu');
    if (existingMenu) {
        existingMenu.remove();
    }
    
    // Create context menu
    const menu = document.createElement('div');
    menu.className = 'context-menu active';
    
    const children = getChildren(person.id);
    const spouse = getSpouse(person.id);
    
    // Menu items
    const menuItems = [
        { label: '➕ Add Parent', action: () => openAddPersonModal(person.id, 'parent') },
        { label: '➕ Add Child', action: () => openAddPersonModal(person.id, 'child') },
        { label: '💑 Add Spouse', action: () => openAddPersonModal(person.id, 'spouse') },
        { divider: true },
        { label: '✏️ Edit', action: () => openEditPersonModal(person.id) },
        { divider: true },
        { label: '🗑️ Delete', action: () => deletePerson(person.id), danger: true }
    ];
    
    // Add delete all option if person has descendants
    if (children.length > 0) {
        menuItems.push({
            label: '⚠️ Delete + Descendants',
            action: () => {
                if (confirm(`Delete "${person.name}" and ALL their descendants?\n\nThis will delete ${countAllDescendants(person.id) + 1} people total.\n\nThis action cannot be undone.`)) {
                    deletePersonAndDescendants(person.id);
                }
            },
            danger: true
        });
    }
    
    // Build menu
    menuItems.forEach(item => {
        if (item.divider) {
            const divider = document.createElement('div');
            divider.className = 'context-menu-divider';
            menu.appendChild(divider);
        } else {
            const menuItem = document.createElement('button');
            menuItem.className = 'context-menu-item';
            if (item.danger) {
                menuItem.classList.add('danger');
            }
            menuItem.textContent = item.label;
            menuItem.onclick = () => {
                item.action();
                menu.remove();
            };
            menu.appendChild(menuItem);
        }
    });
    
    // Position menu
    document.body.appendChild(menu);
    const menuRect = menu.getBoundingClientRect();
    const x = e.clientX || e.pageX;
    const y = e.clientY || e.pageY;
    
    // Adjust position if menu goes off screen
    let left = x;
    let top = y;
    
    if (left + menuRect.width > window.innerWidth) {
        left = window.innerWidth - menuRect.width - 10;
    }
    if (top + menuRect.height > window.innerHeight) {
        top = window.innerHeight - menuRect.height - 10;
    }
    
    menu.style.left = left + 'px';
    menu.style.top = top + 'px';
    
    // Close menu on click outside
    const closeMenu = (event) => {
        if (!menu.contains(event.target)) {
            menu.remove();
            document.removeEventListener('click', closeMenu);
            document.removeEventListener('contextmenu', closeMenu);
        }
    };
    
    setTimeout(() => {
        document.addEventListener('click', closeMenu);
        document.addEventListener('contextmenu', closeMenu);
    }, 10);
}

// ====================================================================
// HELPER FUNCTIONS
// ====================================================================
function countAllDescendants(personId) {
    const children = getChildren(personId);
    let count = children.length;
    
    children.forEach(child => {
        count += countAllDescendants(child.id);
    });
    
    return count;
}

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

function zoomIn() {
    zoomLevel = Math.min(zoomLevel + 0.1, 2.0);
    applyZoom();
}

function zoomOut() {
    zoomLevel = Math.max(zoomLevel - 0.1, 0.5);
    applyZoom();
}

function applyZoom() {
    const canvas = document.getElementById('treeCanvas');
    canvas.style.transform = `scale(${zoomLevel})`;
    canvas.style.transformOrigin = 'center top';
    console.log(`Zoom level: ${(zoomLevel * 100).toFixed(0)}%`);
}

function centerTree() {
    const container = document.getElementById('treeContainer');
    const canvas = document.getElementById('treeCanvas');
    
    // Get the dimensions
    const scrollWidth = canvas.scrollWidth;
    const scrollHeight = canvas.scrollHeight;
    const clientWidth = container.clientWidth;
    const clientHeight = container.clientHeight;
    
    // Center horizontally and position top portion visible
    const scrollLeft = Math.max(0, (scrollWidth - clientWidth) / 2);
    const scrollTop = 0; // Start at top to see root node
    
    container.scrollLeft = scrollLeft;
    container.scrollTop = scrollTop;
}

function resetView() {
    const canvas = document.getElementById('treeCanvas');
    
    // Reset zoom to 100%
    zoomLevel = 1.0;
    canvas.style.transform = 'scale(1)';
    canvas.style.transformOrigin = 'center top';
    
    // Re-render the tree to apply zoom reset
    renderTree();
    
    // Center the tree
    setTimeout(() => {
        centerTree();
        console.log('Reset view - Centered at zoom 100%');
    }, 100);
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
        const storageKey = `familyTree_${familyTreeId}`;
        localStorage.setItem(storageKey, JSON.stringify(familyData));
        console.log(`💾 Data saved locally for tree: ${familyTreeId}`);
    } catch (error) {
        console.error('Error saving to localStorage:', error);
        alert('Unable to save data locally. Your browser storage might be full.');
    }
}

// Load from localStorage
function loadFromLocalStorage() {
    const storageKey = `familyTree_${familyTreeId}`;
    const saved = localStorage.getItem(storageKey);
    if (saved) {
        try {
            familyData = JSON.parse(saved);
            console.log(`💾 Data loaded from local storage for tree: ${familyTreeId}`);
        } catch (e) {
            console.error('Error loading data:', e);
        }
    }
}

// ====================================================================
// BURGER MENU
// ====================================================================
function toggleBurgerMenu() {
    const menu = document.getElementById('burgerMenu');
    const burger = document.getElementById('burgerBtn');
    const isOpen = menu.classList.contains('active');
    
    if (isOpen) {
        menu.classList.remove('active');
        burger.classList.remove('active');
        document.removeEventListener('click', closeBurgerMenuOutside);
    } else {
        menu.classList.add('active');
        burger.classList.add('active');
        setTimeout(() => {
            document.addEventListener('click', closeBurgerMenuOutside);
        }, 10);
    }
}

function closeBurgerMenuOutside(e) {
    const menu = document.getElementById('burgerMenu');
    const burger = document.getElementById('burgerBtn');
    if (!menu.contains(e.target) && !burger.contains(e.target)) {
        menu.classList.remove('active');
        burger.classList.remove('active');
        document.removeEventListener('click', closeBurgerMenuOutside);
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
    toggleBurgerMenu();
}

async function exportAsPDF() {
    const canvas = document.getElementById('treeCanvas');
    const container = document.getElementById('treeContainer');
    
    // Temporarily reset zoom and styling for export
    const originalTransform = canvas.style.transform;
    canvas.style.transform = 'scale(1)';
    
    try {
        // Use html2canvas to capture the tree
        const canvasElement = await html2canvas(canvas, {
            backgroundColor: '#ffffff',
            scale: 2,
            logging: false,
            useCORS: true
        });
        
        // Create PDF with jsPDF
        const { jsPDF } = window.jspdf;
        const imgData = canvasElement.toDataURL('image/png');
        const imgWidth = canvasElement.width;
        const imgHeight = canvasElement.height;
        
        // Calculate PDF dimensions (A4 landscape)
        const pdfWidth = 297; // A4 width in mm (landscape)
        const pdfHeight = 210; // A4 height in mm (landscape)
        const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
        const finalWidth = imgWidth * ratio;
        const finalHeight = imgHeight * ratio;
        
        const pdf = new jsPDF({
            orientation: finalWidth > finalHeight ? 'landscape' : 'portrait',
            unit: 'mm',
            format: 'a4'
        });
        
        const x = (pdf.internal.pageSize.getWidth() - finalWidth) / 2;
        const y = (pdf.internal.pageSize.getHeight() - finalHeight) / 2;
        
        pdf.addImage(imgData, 'PNG', x, y, finalWidth, finalHeight);
        pdf.save(`family-tree-${new Date().toISOString().split('T')[0]}.pdf`);
        
    } catch (error) {
        console.error('Error exporting PDF:', error);
        alert('Error exporting PDF. Please try again.');
    }
    
    // Restore original transform
    canvas.style.transform = originalTransform;
    toggleBurgerMenu();
}

async function exportAsJPEG() {
    const canvas = document.getElementById('treeCanvas');
    
    // Temporarily reset zoom and styling for export
    const originalTransform = canvas.style.transform;
    canvas.style.transform = 'scale(1)';
    
    try {
        // Use html2canvas to capture the tree
        const canvasElement = await html2canvas(canvas, {
            backgroundColor: '#ffffff',
            scale: 2,
            logging: false,
            useCORS: true
        });
        
        // Convert to JPEG and download
        canvasElement.toBlob((blob) => {
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `family-tree-${new Date().toISOString().split('T')[0]}.jpg`;
            link.click();
            URL.revokeObjectURL(url);
        }, 'image/jpeg', 0.95);
        
    } catch (error) {
        console.error('Error exporting JPEG:', error);
        alert('Error exporting JPEG. Please try again.');
    }
    
    // Restore original transform
    canvas.style.transform = originalTransform;
    toggleBurgerMenu();
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
