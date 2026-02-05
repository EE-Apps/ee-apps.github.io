// Default pins/bookmarks
const defaultPins = [
    { name: "WebArchive", link: "https://archive.org/", icon: "https://archive.org/offshoot_assets/favicon.ico", position: 0 },
    { name: "RegEx101", link: "https://regex101.com/", icon: "https://regex101.com/static/assets/favicon.ico", position: 1 },
    { name: "Base64 decode/encode", link: "https://jam.dev/utilities/base-64-encoder", icon: "https://storage.googleapis.com/jam-assets/jam-logo.webp", position: 2 },
    { name: "Diffchecker", link: "https://www.diffchecker.com/", icon: "https://www.diffchecker.com/static/images/diffchecker.svg", position: 3 },
    { name: "Weather", link: "http://ee-apps.github.io/web/weather/index.html", icon: "img/company/ee/weather.png", position: 4 },
    { name: "GitHub", link: "https://github.com", icon: "img/company/microsoft/github.svg", position: 5 },
];

let pins = [];
let isEditMode = false;
let draggedElement = null;
let draggedIndex = null;
let editingPinPosition = null;

// Load pins from localStorage
function loadPinsFromStorage() {
    const savedPins = localStorage.getItem('appPins');
    if (savedPins) {
        try {
            pins = JSON.parse(savedPins);
        } catch (e) {
            console.error('Error parsing saved pins:', e);
            pins = JSON.parse(JSON.stringify(defaultPins));
        }
    } else {
        pins = JSON.parse(JSON.stringify(defaultPins));
    }
}

// Save pins to localStorage
function savePinsToStorage() {
    try {
        localStorage.setItem('appPins', JSON.stringify(pins));
    } catch (e) {
        console.error('Error saving pins:', e);
    }
}

// Render pins on the page
function renderPins() {
    const pinsContainer = document.getElementById('pins');
    if (!pinsContainer) return;
    
    // Keep edit button
    const editBtn = document.getElementById('editPinsBtn');
    
    // Clear container except edit button
    pinsContainer.innerHTML = '';
    if (editBtn) {
        pinsContainer.appendChild(editBtn);
    }
    
    // Sort pins by position
    const sortedPins = [...pins].sort((a, b) => a.position - b.position);
    
    // Render each pin
    sortedPins.forEach((pin, index) => {
        const pinElement = createPinElement(pin, index);
        pinsContainer.appendChild(pinElement);
    });
    
    // Add "Add bookmark" button in edit mode
    if (isEditMode) {
        const addBtn = createAddButton();
        pinsContainer.appendChild(addBtn);
    }
}

// Create pin element
function createPinElement(pin, index) {
    const pinDiv = document.createElement('div');
    pinDiv.className = 'pinitem';
    pinDiv.draggable = isEditMode;
    pinDiv.dataset.position = pin.position;
    
    if (isEditMode) {
        // Edit mode: show controls
        pinDiv.innerHTML = `
            <div class="pin-editBtns">
                <div class="pin-drag-handle"><img src="img/ui/lines.svg"></div>
                <button class="pin-delete-btn" title="Delete"><img src="img/ui/cross.svg"></button>
                <button class="pin-edit-btn" title="Edit"><img src="img/ui/edit2.svg"></button>
            </div>
            <div class="pin-content">
                <img src="${pin.icon}" alt="${pin.name}" onerror="this.src='img/ui/check/bookmark.svg'">
                <p>${pin.name}</p>
            </div>
        `;
        
        // Delete button handler
        const deleteBtn = pinDiv.querySelector('.pin-delete-btn');
        deleteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            removePin(pin.position);
        });
        
        // Edit button handler
        const editBtn = pinDiv.querySelector('.pin-edit-btn');
        editBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            openEditModal(pin.position);
        });
        
        // Drag and drop handlers
        pinDiv.addEventListener('dragstart', handleDragStart);
        pinDiv.addEventListener('dragover', handleDragOver);
        pinDiv.addEventListener('drop', handleDrop);
        pinDiv.addEventListener('dragend', handleDragEnd);
        
    } else {
        // Normal mode: clickable link
        pinDiv.innerHTML = `
            <a href="${pin.link}" rel="noopener noreferrer" class="pin-link">
                <img src="${pin.icon}" alt="${pin.name}" onerror="this.src='img/ui/check/bookmark.svg'">
                <p>${pin.name}</p>
            </a>
        `;
    }
    
    return pinDiv;
}

// Create add button
function createAddButton() {
    const addBtn = document.createElement('div');
    addBtn.className = 'pinitem pin-add-btn';
    addBtn.innerHTML = `
        <div class="pin-add-content">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            <p>Add Bookmark</p>
        </div>
    `;
    
    addBtn.addEventListener('click', () => {
        const newPin = addPin('New Bookmark', 'https://', 'img/ui/check/bookmark.svg');
        openEditModal(newPin.position);
    });
    
    return addBtn;
}

// Open edit modal
function openEditModal(position) {
    editingPinPosition = position;
    const pin = pins.find(p => p.position === position);
    if (!pin) return;
    
    // Create or get modal
    let modal = document.getElementById('pinEditModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'pinEditModal';
        modal.className = 'pin-edit-modal';
        document.body.appendChild(modal);
    }
    
    // Modal content
    modal.innerHTML = `
        <div class="pin-edit-backdrop"></div>
        <div class="pin-edit-dialog">
            <div class="pin-edit-header">
                <h3>Edit Bookmark</h3>
                <button class="pin-edit-close" title="Close">
                    <img src="img/ui/cross.svg" alt="Close">
                </button>
            </div>
            <div class="pin-edit-body">
                <div class="pin-edit-preview">
                    <img id="pinEditPreviewImg" src="${pin.icon}" alt="${pin.name}" onerror="this.src='img/ui/check/bookmark.svg'">
                </div>
                <div class="pin-edit-form">
                    <div class="pin-edit-field">
                        <label for="pinEditName">Name</label>
                        <input type="text" id="pinEditName" value="${pin.name}" placeholder="Bookmark name">
                    </div>
                    <div class="pin-edit-field">
                        <label for="pinEditLink">URL</label>
                        <input type="text" id="pinEditLink" value="${pin.link}" placeholder="https://example.com">
                    </div>
                    <div class="pin-edit-field">
                        <label for="pinEditIcon">Icon path</label>
                        <input type="text" id="pinEditIcon" value="${pin.icon}" placeholder="img/icon.svg">
                    </div>
                </div>
            </div>
            <div class="pin-edit-footer">
                <button class="pin-edit-cancel">Cancel</button>
                <button class="pin-edit-save">Save</button>
            </div>
        </div>
    `;
    
    // Show modal
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    
    // Update preview when icon changes
    const iconInput = modal.querySelector('#pinEditIcon');
    const previewImg = modal.querySelector('#pinEditPreviewImg');
    iconInput.addEventListener('input', () => {
        if (iconInput.value == '') {
            const url = new URL(modal.querySelector('#pinEditLink').value);
            const domain = url.hostname;
            console.log(`https://www.google.com/s2/favicons?domain=${domain}&sz=256`);
            previewImg.src = `https://www.google.com/s2/favicons?domain=${domain}&sz=256`
        } else previewImg.src = iconInput.value;
    });
    
    // Close handlers
    const closeBtn = modal.querySelector('.pin-edit-close');
    const cancelBtn = modal.querySelector('.pin-edit-cancel');
    const backdrop = modal.querySelector('.pin-edit-backdrop');
    
    const closeModal = () => {
        modal.classList.remove('active');
        document.body.style.overflow = '';
        editingPinPosition = null;
    };
    
    closeBtn.addEventListener('click', closeModal);
    cancelBtn.addEventListener('click', closeModal);
    backdrop.addEventListener('click', closeModal);
    
    // Save handler
    const saveBtn = modal.querySelector('.pin-edit-save');
    saveBtn.addEventListener('click', () => {
        const name = modal.querySelector('#pinEditName').value.trim();
        const link = modal.querySelector('#pinEditLink').value.trim();
        const icon = modal.querySelector('#pinEditIcon').value.trim();
        
        if (name && link && icon) {
            updatePin(position, name, link, icon);
            closeModal();
        } else {
            alert('Please fill in all fields');
        }
    });
    
    // Focus on name input
    setTimeout(() => {
        modal.querySelector('#pinEditName').focus();
    }, 100);
}

// Update pin
function updatePin(position, name, link, icon) {
    const pin = pins.find(p => p.position === position);
    if (pin) {
        pin.name = name;
        pin.link = link;
        pin.icon = icon;
        savePinsToStorage();
        renderPins();
    }
}

// Drag and drop handlers
function handleDragStart(e) {
    draggedElement = e.currentTarget;
    draggedIndex = parseInt(draggedElement.dataset.position);
    e.currentTarget.style.opacity = '0.4';
    e.dataTransfer.effectAllowed = 'move';
}

function handleDragOver(e) {
    if (e.preventDefault) {
        e.preventDefault();
    }
    e.dataTransfer.dropEffect = 'move';
    return false;
}

function handleDrop(e) {
    if (e.stopPropagation) {
        e.stopPropagation();
    }
    
    if (draggedElement !== e.currentTarget) {
        const targetIndex = parseInt(e.currentTarget.dataset.position);
        
        // Swap positions
        const draggedPin = pins.find(p => p.position === draggedIndex);
        const targetPin = pins.find(p => p.position === targetIndex);
        
        if (draggedPin && targetPin) {
            draggedPin.position = targetIndex;
            targetPin.position = draggedIndex;
            
            savePinsToStorage();
            renderPins();
        }
    }
    
    return false;
}

function handleDragEnd(e) {
    e.currentTarget.style.opacity = '1';
    draggedElement = null;
    draggedIndex = null;
}

// Add a new pin
function addPin(name, link, icon) {
    const newPin = {
        name: name,
        link: link,
        icon: icon,
        position: pins.length
    };
    pins.push(newPin);
    savePinsToStorage();
    renderPins();
    return newPin;
}

// Remove a pin by position
function removePin(position) {
    pins = pins.filter(pin => pin.position !== position);
    // Recalculate positions
    pins.forEach((pin, index) => {
        pin.position = index;
    });
    savePinsToStorage();
    renderPins();
}

// Toggle edit mode
function toggleEditMode() {
    isEditMode = !isEditMode;
    const editBtn = document.getElementById('editPinsBtn');
    const pinsDiv = document.getElementById('pins');
    
    if (editBtn) {
        if (isEditMode) {
            editBtn.classList.add('edit-active');
            pinsDiv.classList.add('edit-active');
            editBtn.title = 'Done editing';
        } else {
            editBtn.classList.remove('edit-active');
            pinsDiv.classList.remove('edit-active');
            editBtn.title = 'Edit bookmarks';
        }
    }
    
    renderPins();
}

// Initialize pins on page load
document.addEventListener('DOMContentLoaded', () => {
    loadPinsFromStorage();
    renderPins();
    
    // Edit pins button handler
    const editPinsBtn = document.getElementById('editPinsBtn');
    if (editPinsBtn) {
        editPinsBtn.addEventListener('click', toggleEditMode);
    }
});