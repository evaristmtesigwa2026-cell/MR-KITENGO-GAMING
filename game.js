// USANIDI WA FIREBASE (Msisi Project)
const firebaseConfig = {
  apiKey: "AIzaSyDA0ty5dOoBiPJx5fRdFI_hvddJyUbb6B4",
  authDomain: "msisi-38c20.firebaseapp.com",
  databaseURL: "https://msisi-38c20-default-rtdb.firebaseio.com",
  projectId: "msisi-38c20",
  storageBucket: "msisi-38c20.appspot.com",
  messagingSenderId: "881060609707",
  appId: "1:881060609707:web:bd9028db2b20c75d72c1ee",
  measurementId: "G-NFT0FB6V2T"
};

if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const database = firebase.database();

// LOCAL CACHE & DATA INDEXING FOR INSTANT YOUTUBE-STYLE SEARCH
window.cachedCategories = {};
window.cachedBuses = {};
window.searchDebounceTimer = null;

// GLOBAL LOADING ANIMATION HELPERS WITH CANCEL SUPPORT
window.activeLoadingTask = null;

window.showLoader = function(customText) {
    const loader = document.getElementById('global-loader');
    const label = document.getElementById('loader-text-label');
    if (label) label.textContent = customText || 'LOADING...';
    if (loader) loader.classList.add('active');
};

window.hideLoader = function() {
    const loader = document.getElementById('global-loader');
    if (loader) loader.classList.remove('active');
    window.activeLoadingTask = null;
};

// OPTION YA KU-CANCEL LOADING PROCESS
window.cancelLoader = function() {
    console.log("Loading process user-cancelled");
    if (typeof window.activeLoadingTask === 'function') {
        try { window.activeLoadingTask(); } catch(e) {}
    }
    window.hideLoader();
};

// ESC KEY CANCELS LOADER & SEARCH
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        window.cancelLoader();
        window.closeSearchSuggestions();
    }
});

window.hideAllSections = function() {
    const sections = ["cat", "bus-view-section", "details-view-section", "log", "reg", "adminSection"];
    sections.forEach(id => {
        let el = document.getElementById(id);
        if (el) el.style.display = "none";
    });
    const nav = document.getElementById("navicon");
    if (nav) nav.style.display = "none";
};

window.showlogin = function() { window.hideAllSections(); document.getElementById("log").style.display = "block"; };
window.showregister = function() { window.hideAllSections(); document.getElementById("reg").style.display = "block"; };

window.register = function() {
    let name = document.getElementById("regname").value.trim();
    let email = document.getElementById("regemail").value.trim();
    let password = document.getElementById("regpassword").value.trim();
    if (name === "" || email === "" || password === "") { 
        alert("Jaza nafasi zote!"); 
    } else { 
        localStorage.setItem("name", name); 
        localStorage.setItem("email", email); 
        localStorage.setItem("password", password);
        alert("Hongera mkuu registration yako imekamilika!"); 
        window.showlogin();
    }
};

window.login = function() {
    let name = document.getElementById("logname").value.trim();
    let password = document.getElementById("logpassword").value.trim();
    let dbname = localStorage.getItem("name");
    let dbpassword = localStorage.getItem("password");
    
    if (name === "" || password === "") { 
        alert("Jaza nafasi zote!"); 
    } else if (name === dbname && password === dbpassword) {
        alert("HONGERA SANA KARIBU KITENGO GAMING !"); 
        history.replaceState({ page: "home" }, "Home", "#home"); 
        window.showcat(true); 
    } else { 
        alert("Taarifa ulizoweka sio sahihi!"); 
    }
};

window.showcat = function(isBackAction = false) {
    let dbname = localStorage.getItem("name");
    if(!dbname) { window.showregister(); return; }
    window.hideAllSections();
    document.getElementById("cat").style.display = "block";
    document.getElementById("navicon").style.display = "flex"; 
    if (!isBackAction) history.pushState({ page: "home" }, "Home", "#home");
    window.renderFilteredCategories(window.cachedCategories);
};

window.showDetails = function(title, image, desc, type, targetLinkOrId, currentCatId = '', currentCatName = '', price = 0, busKey = '', setLink = '') {
    window.hideAllSections();
    document.getElementById("details-view-section").style.display = "block";
    document.getElementById("navicon").style.display = "flex";
    window.closeSearchSuggestions();
    
    document.getElementById("details-title").textContent = title;
    document.getElementById("details-img").src = image;
    document.getElementById("details-desc").textContent = desc ? desc : "Samahani mkuu, hakuna maelezo ya ziada yaliyowekwa kwenye item hii.";
    
    let btnContainer = document.getElementById("details-action-btn");
    btnContainer.innerHTML = "";
    btnContainer.style.cssText = "display: flex; gap: 10px; align-items: center; justify-content: center; margin-top: 15px; width: 100%;";
    
    if (type === 'category') {
        let btn = document.createElement("button");
        btn.textContent = "CHAGUA HAPA (FUNGUA MODS)";
        btn.style.cssText = "background: linear-gradient(135deg, #7139e8, #45f3ff); color: white; border: none; padding: 12px 20px; border-radius: 10px; font-weight: bold; cursor: pointer; width: 100%; min-height: 44px;";
        btn.onclick = function() { window.showBusCategory(targetLinkOrId, title); };
        btnContainer.appendChild(btn);
        
        window.currentDetailsBack = function() { window.showcat(); };
    } else {
        let btn = document.createElement("button");
        btn.style.cssText = "background: linear-gradient(135deg, #7139e8, #45f3ff); color: white; border: none; padding: 12px 20px; border-radius: 10px; font-weight: bold; cursor: pointer; flex: 1; min-height: 44px;";
        
        if (price && parseInt(price) > 0) {
            btn.textContent = `DOWNLOAD NOW (Tsh ${price})`;
            btn.onclick = function() {
                window.openPasswordModal(title, price, targetLinkOrId, currentCatId, busKey);
            };
        } else {
            let a = document.createElement("a");
            a.href = targetLinkOrId;
            a.target = "_blank";
            a.textContent = "DOWNLOAD NOW";
            a.style.color = "#ffffff";
            a.style.textDecoration = "none";
            a.style.display = "block";
            a.style.width = "100%";
            btn.appendChild(a);
        }
        
        btnContainer.appendChild(btn);

        if (setLink && setLink.trim() !== "") {
            let setBtn = document.createElement("a");
            setBtn.href = setLink;
            setBtn.target = "_blank";
            setBtn.textContent = "SETUP VIDEO";
            setBtn.style.cssText = "background: linear-gradient(135deg, #ff007f, #7139e8); color: white; border: none; padding: 12px 15px; border-radius: 10px; font-weight: bold; cursor: pointer; text-decoration: none; display: inline-flex; align-items: center; justify-content: center; font-size: 12px; min-height: 44px; font-family: 'Orbitron', sans-serif; box-shadow: 0 0 10px rgba(255,0,127,0.5); white-space: nowrap;";
            btnContainer.appendChild(setBtn);
        }
        
        window.currentDetailsBack = function() { window.showBusCategory(currentCatId, currentCatName); };
    }
};

window.openPasswordModal = function(itemName, itemPrice, downloadLink, categoryId, busKey) {
    document.getElementById("pay-item-name").textContent = itemName;
    document.getElementById("pay-item-price").textContent = "Tsh " + itemPrice;
    
    const linkInput = document.getElementById("pay-target-link");
    linkInput.value = downloadLink;
    linkInput.dataset.catId = categoryId;
    linkInput.dataset.busKey = busKey;
    
    document.getElementById("payment-modal-screen").style.display = "flex";
    document.getElementById("pay-password").value = "";
    document.getElementById("pay-status-log").style.display = "none";
};

window.closePaymentModal = function() {
    document.getElementById("payment-modal-screen").style.display = "none";
    document.getElementById("pay-password").value = "";
    document.getElementById("pay-status-log").style.display = "none";
};

window.requestPasswordSMS = function() {
    const nambaHalotel = "0615304000";
    const jinaLaBasi = document.getElementById("pay-item-name").textContent;
    const ujumbe = `HELLO KITENGO GAMING, NAHITAJI PASSWORD YA MOD YA: ${jinaLaBasi}`;
    window.location.href = `sms:${nambaHalotel}?body=${encodeURIComponent(ujumbe)}`;
};

window.verifyPasswordAndDownload = function() {
    const passwordInput = document.getElementById("pay-password").value.trim();
    const linkInput = document.getElementById("pay-target-link");
    const link = linkInput.value;
    const catId = linkInput.dataset.catId;
    const busKey = linkInput.dataset.busKey;
    const statusLog = document.getElementById("pay-status-log");
    
    if(passwordInput === "") {
        alert("Tafadhali ingiza password uliyotumiwa!");
        return;
    }
    
    statusLog.style.display = "block";
    statusLog.style.color = "yellow";
    statusLog.textContent = "SUBIRI KWANZA MAANA PASSWORD YAKO INAHAKIKIWA  ...";
    
    database.ref(`buses/${catId}/${busKey}/password`).once('value')
    .then((snapshot) => {
        const correctPassword = snapshot.val();
        
        if (correctPassword && passwordInput === correctPassword.toString().trim()) {
            statusLog.style.color = "lightgreen";
            statusLog.textContent = "Hongera Password ni sahihi! Mfumo unakupeleka download page ...";
            
            setTimeout(() => {
                window.closePaymentModal();
                window.open(link, "_blank");
            }, 1200);
        } else {
            statusLog.style.color = "red";
            statusLog.textContent = "Oyaaa Password siyo sahihi mkuuu! Tafadhali hakikisha umeandika herufi vizuri au omba mpya kwa SMS.";
        }
    })
    .catch((err) => {
        statusLog.style.color = "red";
        statusLog.textContent = "CONNECTION ERROR: " + err.message;
    });
};

window.goBackFromDetails = function() {
    if (typeof window.currentDetailsBack === "function") {
        window.currentDetailsBack();
    } else {
        window.showcat();
    }
};

// HIGH-QUALITY & STABLE IMAGE COMPRESSION UTILITY (WITH DUAL FALLBACK READER & FULL HD SUPPORT)
window.compressImage = function(file, maxWidth, maxHeight, quality, callback) {
    if (!file) {
        window.hideLoader();
        return;
    }

    const processImageElement = function(img, cleanupCallback) {
        try {
            const canvas = document.createElement("canvas");
            let width = img.naturalWidth || img.width;
            let height = img.naturalHeight || img.height;

            const targetMaxW = maxWidth || 1920;
            const targetMaxH = maxHeight || 1080;

            if (width > targetMaxW || height > targetMaxH) {
                if (width / height > targetMaxW / targetMaxH) {
                    height = Math.round((height * targetMaxW) / width);
                    width = targetMaxW;
                } else {
                    width = Math.round((width * targetMaxH) / height);
                    height = targetMaxH;
                }
            }

            canvas.width = Math.max(width, 1);
            canvas.height = Math.max(height, 1);
            const ctx = canvas.getContext("2d");

            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = "high";
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

            const targetQuality = quality ? quality : 0.88;
            const compressedBase64 = canvas.toDataURL("image/jpeg", targetQuality);
            
            if (cleanupCallback) cleanupCallback();
            callback(compressedBase64);
        } catch (canvasErr) {
            if (cleanupCallback) cleanupCallback();
            alert("Hitilafu kwenye kuchakata picha: " + canvasErr.message);
            window.hideLoader();
        }
    };

    // Primary Attempt: URL.createObjectURL
    try {
        const objectUrl = URL.createObjectURL(file);
        const img = new Image();

        img.onload = function() {
            processImageElement(img, function() {
                URL.revokeObjectURL(objectUrl);
            });
        };

        img.onerror = function() {
            URL.revokeObjectURL(objectUrl);
            // Fallback Attempt: FileReader
            const reader = new FileReader();
            reader.onload = function(e) {
                const imgFallback = new Image();
                imgFallback.onload = function() {
                    processImageElement(imgFallback, null);
                };
                imgFallback.onerror = function() {
                    alert("Hitilafu kwenye picha hii! Jaribu picha nyingine iliyo katika format ya JPG/PNG.");
                    window.hideLoader();
                };
                imgFallback.src = e.target.result;
            };
            reader.onerror = function() {
                alert("Imeshindwa kusoma picha kutoka kwenye kifaa chako.");
                window.hideLoader();
            };
            reader.readAsDataURL(file);
        };

        img.src = objectUrl;
    } catch (err) {
        alert("Hitilafu wakati wa kuanza kusoma picha: " + err.message);
        window.hideLoader();
    }
};

// PAKIA PICHA YA CATEGORY (HD Resolution: Max 1920px, Quality 0.88)
window.addCategory = function() {
    let rawId = document.getElementById("newCatId").value.trim();
    let name = document.getElementById("newCatName").value.trim();
    let desc = document.getElementById("newCatDesc").value.trim();
    let fileInput = document.getElementById("newCatImg");
    
    if (rawId === "" || name === "") { alert("Jaza ID na Jina!"); return; }
    let id = rawId.toLowerCase().replace(/\s+/g, '-');
    if (fileInput.files.length === 0) { alert("Chagua picha ya kundi!"); return; }
    
    const statusDiv = document.getElementById("cat-upload-status");
    if (statusDiv) {
        statusDiv.style.display = "block";
        statusDiv.textContent = "Inachakata picha katika ubora wa hali ya juu (HD)...";
    }
    window.showLoader("INAPAKIA CATEGORY...");
    
    const file = fileInput.files[0];
    
    window.compressImage(file, 1920, 1080, 0.88, function(compressedBase64) {
        database.ref('categories/' + id).set({ 
            name: name, 
            image: compressedBase64, 
            desc: desc
        })
        .then(() => {
            alert("Kundi jipya limeongezwa kwa ubora wa juu!");
            document.getElementById("newCatId").value = "";
            document.getElementById("newCatName").value = "";
            document.getElementById("newCatDesc").value = "";
            fileInput.value = "";
            if (statusDiv) statusDiv.style.display = "none";
            window.hideLoader();
        }).catch(err => {
            alert("Kosa la Firebase: " + err.message);
            if (statusDiv) statusDiv.style.display = "none";
            window.hideLoader();
        });
    });
};

window.loadCategoryForEdit = function(id) {
    const nameInput = document.getElementById("editCatName");
    const descInput = document.getElementById("editCatDesc");
    const imgPreview = document.getElementById("editCatCurrentImg");
    const fileInput = document.getElementById("editCatImg");

    if (!id) {
        if (nameInput) nameInput.value = "";
        if (descInput) descInput.value = "";
        if (imgPreview) imgPreview.style.display = "none";
        if (fileInput) fileInput.value = "";
        return;
    }

    window.showLoader("INASOMA CATEGORY...");
    database.ref('categories/' + id).once('value').then((snapshot) => {
        const cat = snapshot.val();
        window.hideLoader();
        if (!cat) return;
        if (nameInput) nameInput.value = cat.name || "";
        if (descInput) descInput.value = cat.desc || "";
        if (imgPreview) {
            imgPreview.src = cat.image || "";
            imgPreview.style.display = "block";
        }
        if (fileInput) fileInput.value = "";
    }).catch(err => {
        window.hideLoader();
        alert("Kosa: " + err.message);
    });
};

window.updateCategory = function() {
    const id = document.getElementById("editCategorySelect").value;
    if (!id) { alert("Chagua category unayotaka kuihariri kwanza!"); return; }

    const name = document.getElementById("editCatName").value.trim();
    const desc = document.getElementById("editCatDesc").value.trim();
    if (name === "") { alert("Jina la category haliwezi kuwa tupu!"); return; }

    const fileInput = document.getElementById("editCatImg");
    const statusDiv = document.getElementById("edit-cat-upload-status");

    const saveUpdate = (imageBase64) => {
        const updates = { name: name, desc: desc };
        if (imageBase64) updates.image = imageBase64;

        database.ref('categories/' + id).update(updates)
        .then(() => {
            alert("Category imesasishwa kwa ufanisi!");
            if (statusDiv) statusDiv.style.display = "none";
            if (fileInput) fileInput.value = "";
            window.hideLoader();
        }).catch(err => {
            alert("Kosa: " + err.message);
            if (statusDiv) statusDiv.style.display = "none";
            window.hideLoader();
        });
    };

    window.showLoader("INASASISHA CATEGORY...");

    if (fileInput && fileInput.files.length > 0) {
        if (statusDiv) {
            statusDiv.style.display = "block";
            statusDiv.textContent = "Inachakata picha mpya katika ubora wa HD...";
        }
        window.compressImage(fileInput.files[0], 1920, 1080, 0.88, function(compressedBase64) {
            saveUpdate(compressedBase64);
        });
    } else {
        saveUpdate(null);
    }
};

window.loadCategories = function() {
    database.ref('categories').on('value', (snapshot) => {
        const categories = snapshot.val() || {};
        window.cachedCategories = categories;
        
        let categorySelect = document.getElementById("uploadCategory");
        if(categorySelect) categorySelect.innerHTML = '<option value="">-- Chagua Category --</option>';
        
        for (const [key, cat] of Object.entries(categories)) {
            if(categorySelect) {
                const opt = document.createElement("option");
                opt.value = key;
                opt.textContent = cat.name;
                categorySelect.appendChild(opt);
            }
        }

        window.renderFilteredCategories(categories);

        let adminCatSelect = document.getElementById("adminCategorySelect");
        if (adminCatSelect) {
            adminCatSelect.innerHTML = '<option value="">-- Chagua Category ya Kuhariri --</option>';
            for (const [key, cat] of Object.entries(categories)) {
                const opt = document.createElement("option");
                opt.value = key;
                opt.textContent = cat.name;
                adminCatSelect.appendChild(opt);
            }
        }

        let editCatSelect = document.getElementById("editCategorySelect");
        if (editCatSelect) {
            const previousValue = editCatSelect.value;
            editCatSelect.innerHTML = '<option value="">-- Chagua Category ya Kuhariri --</option>';
            for (const [key, cat] of Object.entries(categories)) {
                const opt = document.createElement("option");
                opt.value = key;
                opt.textContent = cat.name;
                editCatSelect.appendChild(opt);
            }
            if (previousValue && categories[previousValue]) {
                editCatSelect.value = previousValue;
            }
        }
    });

    database.ref('buses').on('value', (snapshot) => {
        window.cachedBuses = snapshot.val() || {};
    });
};

window.renderFilteredCategories = function(categoriesObj) {
    let catContainer = document.getElementById("categories-container");
    if(!catContainer) return;
    catContainer.innerHTML = "";
    
    for (const [key, cat] of Object.entries(categoriesObj || {})) {
        const card = document.createElement("div");
        card.className = "card category-card";
        card.onclick = function() {
            window.showBusCategory(key, cat.name, false);
        };
        
        card.innerHTML = `
            <div class="card-img-wrapper">
                <img src="${cat.image}" alt="${cat.name}">
            </div>
            <div class="card-content">
                <span class="card-tag">CATEGORY</span>
                <div class="card-title">${cat.name}</div>
                <div class="card-footer">
                    <span>${cat.desc || 'Mods available'}</span>
                    <span class="card-action-icon">&rsaquo;</span>
                </div>
            </div>
        `;
        
        catContainer.appendChild(card);
    }
};

/* ==========================================================================
   INSTANT & YOUTUBE-STYLE SEARCH ENGINE LOGIC
   ========================================================================== */

window.handleSearchInput = function(query) {
    const clearBtn = document.getElementById("search-clear-btn");
    if (clearBtn) {
        clearBtn.style.display = query && query.length > 0 ? "block" : "none";
    }

    if (window.searchDebounceTimer) clearTimeout(window.searchDebounceTimer);

    window.searchDebounceTimer = setTimeout(() => {
        window.executeLiveSearch(query.trim());
    }, 100);
};

window.clearSearchInput = function() {
    const input = document.getElementById("global-search-input");
    if (input) input.value = "";
    window.handleSearchInput("");
    window.closeSearchSuggestions();
};

window.closeSearchSuggestions = function() {
    const dropdown = document.getElementById("search-suggestions");
    if (dropdown) dropdown.style.display = "none";
};

document.addEventListener('click', function(e) {
    const searchContainer = document.querySelector('.nav-search-container');
    if (searchContainer && !searchContainer.contains(e.target)) {
        window.closeSearchSuggestions();
    }
});

window.executeLiveSearch = function(query) {
    const dropdown = document.getElementById("search-suggestions");
    if (!dropdown) return;

    if (!query || query.length === 0) {
        dropdown.style.display = "none";
        window.renderFilteredCategories(window.cachedCategories);
        return;
    }

    const q = query.toLowerCase();
    
    const matchedCategories = [];
    for (const [key, cat] of Object.entries(window.cachedCategories || {})) {
        const nameMatch = cat.name && cat.name.toLowerCase().includes(q);
        const descMatch = cat.desc && cat.desc.toLowerCase().includes(q);
        if (nameMatch || descMatch) {
            matchedCategories.push({ key, ...cat });
        }
    }

    const matchedBuses = [];
    for (const [catId, busesMap] of Object.entries(window.cachedBuses || {})) {
        const catName = window.cachedCategories[catId] ? window.cachedCategories[catId].name : 'BUS';
        for (const [busKey, bus] of Object.entries(busesMap || {})) {
            const nameMatch = bus.name && bus.name.toLowerCase().includes(q);
            const descMatch = bus.desc && bus.desc.toLowerCase().includes(q);
            if (nameMatch || descMatch) {
                matchedBuses.push({ busKey, catId, catName, ...bus });
            }
        }
    }

    const homeCatSection = document.getElementById("cat");
    if (homeCatSection && homeCatSection.style.display !== "none") {
        const filteredObj = {};
        matchedCategories.forEach(c => { filteredObj[c.key] = c; });
        window.renderFilteredCategories(filteredObj);
    }

    if (matchedCategories.length === 0 && matchedBuses.length === 0) {
        dropdown.innerHTML = `<div style="padding:15px; text-align:center; color:#8a8d9b; font-size:13px;">Hakuna Mod au Category inayomatch na "<strong>${query}</strong>"</div>`;
        dropdown.style.display = "block";
        return;
    }

    let html = "";

    if (matchedCategories.length > 0) {
        html += `<div class="search-suggestion-group">`;
        html += `<div class="search-suggestion-header">CATEGORIES</div>`;
        matchedCategories.slice(0, 4).forEach(cat => {
            const highlightedName = window.highlightText(cat.name, query);
            html += `
                <div class="search-suggestion-item" onclick="window.selectSearchCategory('${cat.key}', '${cat.name.replace(/'/g, "\\'")}')">
                    <img src="${cat.image}" alt="${cat.name}">
                    <div class="search-suggestion-text">
                        <span class="search-suggestion-title">${highlightedName}</span>
                        <span class="search-suggestion-subtitle">Category • ${cat.desc || 'Fungua kupakua'}</span>
                    </div>
                </div>
            `;
        });
        html += `</div>`;
    }

    if (matchedBuses.length > 0) {
        html += `<div class="search-suggestion-group">`;
        html += `<div class="search-suggestion-header">MODS & MABASI</div>`;
        matchedBuses.slice(0, 6).forEach(bus => {
            const highlightedName = window.highlightText(bus.name, query);
            const tagPrice = bus.price && parseInt(bus.price) > 0 ? `Tsh ${bus.price}` : 'FREE';
            html += `
                <div class="search-suggestion-item" onclick="window.selectSearchBus('${bus.name.replace(/'/g, "\\'")}', '${bus.image}', '${(bus.desc || '').replace(/'/g, "\\'")}', '${bus.link}', '${bus.catId}', '${bus.catName.replace(/'/g, "\\'")}', ${bus.price || 0}, '${bus.busKey}', '${bus.setLink || ''}')">
                    <img src="${bus.image}" alt="${bus.name}">
                    <div class="search-suggestion-text">
                        <span class="search-suggestion-title">${highlightedName}</span>
                        <span class="search-suggestion-subtitle">${bus.catName} • ${tagPrice}</span>
                    </div>
                </div>
            `;
        });
        html += `</div>`;
    }

    dropdown.innerHTML = html;
    dropdown.style.display = "block";
};

window.highlightText = function(text, query) {
    if (!text) return "";
    const regex = new RegExp(`(${query})`, "gi");
    return text.replace(regex, `<span class="search-highlight">$1</span>`);
};

window.selectSearchCategory = function(catId, catName) {
    window.closeSearchSuggestions();
    window.showBusCategory(catId, catName);
};

window.selectSearchBus = function(name, img, desc, link, catId, catName, price, busKey, setLink) {
    window.closeSearchSuggestions();
    window.showDetails(name, img, desc, 'bus', link, catId, catName, price, busKey, setLink);
};

let slideshowItems = [];
let slideshowIndex = 0;
let slideshowTimer = null;

window.loadSlideshow = function() {
    database.ref('slideshow').on('value', (snapshot) => {
        const data = snapshot.val() || {};
        slideshowItems = Object.entries(data).map(([key, val]) => ({ key, ...val }));

        if (slideshowTimer) { clearTimeout(slideshowTimer); slideshowTimer = null; }

        if (slideshowItems.length > 0) {
            slideshowIndex = 0;
            window.playSlideshowItem();
        } else {
            const imgEl = document.getElementById('slideshow-img');
            const videoEl = document.getElementById('slideshow-video');
            if (videoEl) { videoEl.pause(); videoEl.style.display = 'none'; }
            if (imgEl) { imgEl.src = 'logo.jpg'; imgEl.style.display = 'block'; }
        }
    });
};

window.playSlideshowItem = function() {
    if (slideshowTimer) { clearTimeout(slideshowTimer); slideshowTimer = null; }
    if (slideshowItems.length === 0) return;

    const imgEl = document.getElementById('slideshow-img');
    const videoEl = document.getElementById('slideshow-video');
    if (!imgEl || !videoEl) return;

    const item = slideshowItems[slideshowIndex];

    if (item.type === 'video') {
        imgEl.style.display = 'none';
        videoEl.style.display = 'block';
        videoEl.muted = true;
        videoEl.src = item.src;
        videoEl.currentTime = 0;
        videoEl.play().catch(() => {});
        slideshowTimer = setTimeout(window.nextSlideshowItem, 5000);
    } else {
        videoEl.pause();
        videoEl.style.display = 'none';
        imgEl.style.display = 'block';
        imgEl.src = item.src;
        slideshowTimer = setTimeout(window.nextSlideshowItem, 3000);
    }
};

window.nextSlideshowItem = function() {
    if (slideshowItems.length === 0) return;
    slideshowIndex = (slideshowIndex + 1) % slideshowItems.length;
    window.playSlideshowItem();
};

window.addSlideshowItem = function() {
    const fileInput = document.getElementById('slideshowFile');
    if (!fileInput || fileInput.files.length === 0) { alert('Chagua picha au video kwanza!'); return; }

    const file = fileInput.files[0];
    const statusDiv = document.getElementById('slideshow-upload-status');
    const isVideo = file.type.startsWith('video/');

    if (statusDiv) statusDiv.style.display = 'block';
    window.showLoader("UNAPAKIA SLIDESHOW...");

    if (isVideo) {
        if (statusDiv) statusDiv.textContent = 'LOADING...';
        const reader = new FileReader();
        reader.onload = function(e) {
            database.ref('slideshow').push().set({ type: 'video', src: e.target.result })
            .then(() => {
                alert('Video imeongezwa kwenye slideshow!');
                fileInput.value = '';
                if (statusDiv) statusDiv.style.display = 'none';
                window.loadSlideshowAdminList();
                window.hideLoader();
            }).catch(err => {
                alert('Kosa: ' + err.message);
                if (statusDiv) statusDiv.style.display = 'none';
                window.hideLoader();
            });
        };
        reader.onerror = function() {
            alert('Hitilafu wakati wa kusoma video.');
            if (statusDiv) statusDiv.style.display = 'none';
            window.hideLoader();
        };
        reader.readAsDataURL(file);
    } else {
        if (statusDiv) statusDiv.textContent = 'Inachakata picha ya slideshow katika ubora wa Full HD...';
        window.compressImage(file, 1920, 1080, 0.88, function(compressedBase64) {
            database.ref('slideshow').push().set({ type: 'image', src: compressedBase64 })
            .then(() => {
                alert('Picha imeongezwa kwenye slideshow!');
                fileInput.value = '';
                if (statusDiv) statusDiv.style.display = 'none';
                window.loadSlideshowAdminList();
                window.hideLoader();
            }).catch(err => {
                alert('Kosa: ' + err.message);
                if (statusDiv) statusDiv.style.display = 'none';
                window.hideLoader();
            });
        });
    }
};

window.loadSlideshowAdminList = function() {
    const listEl = document.getElementById('slideshow-admin-list');
    if (!listEl) return;

    database.ref('slideshow').once('value', (snapshot) => {
        const data = snapshot.val() || {};
        listEl.innerHTML = '';
        const entries = Object.entries(data);

        if (entries.length === 0) {
            listEl.innerHTML = '<p style="color:#a4a6b0; font-size:13px;">Hakuna picha/video kwenye slideshow bado.</p>';
            return;
        }

        entries.forEach(([key, item]) => {
            const row = document.createElement('div');
            row.style.cssText = 'display:flex; align-items:center; gap:10px; background:rgba(0,0,0,0.3); padding:8px; border-radius:8px;';
            const preview = item.type === 'video'
                ? `<video src="${item.src}" muted style="width:60px; height:45px; object-fit:cover; border-radius:5px;"></video>`
                : `<img src="${item.src}" style="width:60px; height:45px; object-fit:cover; border-radius:5px;">`;
            row.innerHTML = `
                ${preview}
                <span style="flex:1; font-size:12px; color:#45f3ff;">${item.type === 'video' ? 'VIDEO (sek 5)' : 'PICHA (sek 3)'}</span>
                <button onclick="window.deleteSlideshowItem('${key}')" style="background-color:#ff0000; margin:0; padding:6px 12px; font-size:12px; width:auto; min-height:30px;">FUTA</button>
            `;
            listEl.appendChild(row);
        });
    });
};

window.deleteSlideshowItem = function(key) {
    if (confirm('Unataka kufuta hii kwenye slideshow?')) {
        window.showLoader("INAFUTA SLIDESHOW...");
        database.ref('slideshow/' + key).remove()
        .then(() => {
            window.loadSlideshowAdminList();
            window.hideLoader();
        }).catch(err => {
            alert('Kosa: ' + err.message);
            window.hideLoader();
        });
    }
};

window.showBusCategory = function(catId, catName, isAdminMode = false) {
    window.showLoader("INAPAKIA MABASI...");
    database.ref('buses/' + catId).once('value', (snapshot) => {
        const buses = snapshot.val() || {};
        
        let isAdmin = window.location.hash === "#admin" || isAdminMode;
        
        window.hideAllSections();
        document.getElementById("bus-view-section").style.display = "block";
        document.getElementById("navicon").style.display = "flex";
        
        if (!isAdmin) {
            history.pushState({ page: catId, catName: catName }, catName, "#" + catId);
        }
        
        document.getElementById("dynamic-bus-title").textContent = catName;
        
        let busList = document.getElementById("dynamic-bus-list");
        busList.innerHTML = "";
        
        for (const [key, bus] of Object.entries(buses)) {
            const card = document.createElement("div");
            card.className = "card bus-card";
            
            if (isAdmin) {
                card.innerHTML = `
                    <div class="admin-card-wrapper" data-cat="${catId}" data-key="${key}">
                        <div style="position: relative;">
                            <img src="${bus.image}" alt="${bus.name}" class="editable-image" style="width: 100%; height: 160px; object-fit: cover; border-radius: 12px; cursor: pointer;">
                        </div>
                        <h3 class="editable-title" style="margin: 10px 0 5px 0; cursor: pointer; color: #45f3ff; font-size:15px;">${bus.name}</h3>
                        <p class="editable-desc" style="margin: 5px 0; cursor: pointer; color: #a4a6b0; font-size:12px; background: rgba(0,0,0,0.3); padding: 5px; border-radius: 5px;">${bus.desc ? bus.desc : 'Bonyeza hapa sekunde 3 kuedit caption/maelezo'}</p>
                        <p class="editable-price" style="margin: 0; color: #ff007f; font-weight: bold; cursor: pointer; font-size:13px;">Tsh ${bus.price || 0}</p>
                        <p class="editable-setlink" style="margin: 5px 0; color: #00ff88; font-weight: bold; cursor: pointer; font-size:11px; word-break: break-all;">TikTok Link: ${bus.setLink ? bus.setLink : 'Haikuwekwa (Bonyeza sekunde 3 kuweka)'}</p>
                        <div style="display: flex; gap: 8px; margin-top:10px;">
                            <button onclick="window.deleteBus('${catId}', '${key}')" style="flex: 1; background-color: #ff0000; padding:6px; font-size:12px; min-height:36px;">FUTA</button>
                            <button onclick="window.reloadCategoryView('${catId}', '${catName}')" style="flex: 1; padding:6px; font-size:12px; min-height:36px;">REFRESH</button>
                        </div>
                    </div>
                `;
            } else {
                card.onclick = function() {
                    window.showDetails(bus.name, bus.image, bus.desc, 'bus', bus.link, catId, catName, bus.price || 0, key, bus.setLink || '');
                };
                
                card.innerHTML = `
                    <div class="card-img-wrapper">
                        <img src="${bus.image}" alt="${bus.name}">
                    </div>
                    <div class="card-content">
                        <span class="card-tag">${bus.price && parseInt(bus.price) > 0 ? `PREMIUM (Tsh ${bus.price})` : 'FREE MOD'}</span>
                        <div class="card-title">${bus.name}</div>
                        <div class="card-footer">
                            <span>1 link</span>
                            <span class="card-action-icon">&rsaquo;</span>
                        </div>
                    </div>
                `;
            }
            
            busList.appendChild(card);
            
            if (isAdmin) {
                window.setupAdminCardListeners(card, catId, key, bus);
            }
        }
        
        let existingBtn = document.getElementById("admin-back-btn");
        if(existingBtn) existingBtn.remove();

        let backBtn = document.createElement("button");
        backBtn.id = "admin-back-btn";
        backBtn.textContent = "Rudi Nyuma";
        backBtn.style.cssText = "display: block; margin: 25px auto; padding: 10px 25px; background: #7139e8; color: white; border: none; border-radius: 8px; cursor: pointer; min-height:44px; font-weight:bold;";
        backBtn.onclick = function() {
            if (isAdmin) {
                window.showAdminPanel();
            } else {
                window.showcat();
            }
        };
        busList.parentElement.insertBefore(backBtn, busList.nextSibling);
        window.hideLoader();
    });
};

window.reloadCategoryView = function(catId, catName) {
    window.showBusCategory(catId, catName, true);
};

window.setupAdminCardListeners = function(card, catId, key, bus) {
    const titleEl = card.querySelector('.editable-title');
    const descEl = card.querySelector('.editable-desc');
    const priceEl = card.querySelector('.editable-price');
    const setLinkEl = card.querySelector('.editable-setlink');
    const imageEl = card.querySelector('.editable-image');
    let pressTimer;

    const bindLongPress = (element, callback) => {
        if (!element) return;
        
        element.addEventListener('touchstart', (e) => { 
            pressTimer = setTimeout(() => { callback(); }, 3000); 
        });
        element.addEventListener('touchend', () => clearTimeout(pressTimer));
        element.addEventListener('touchmove', () => clearTimeout(pressTimer));
        
        element.addEventListener('mousedown', () => {
            pressTimer = setTimeout(() => { callback(); }, 3000);
        });
        element.addEventListener('mouseup', () => clearTimeout(pressTimer));
        element.addEventListener('mouseleave', () => clearTimeout(pressTimer));
    };
    
    bindLongPress(imageEl, () => window.editBusImage(catId, key, bus));
    bindLongPress(titleEl, () => window.editBusField(catId, key, 'name', bus.name, 'Jina la Mod'));
    bindLongPress(descEl, () => window.editBusField(catId, key, 'desc', bus.desc || '', 'Maelezo / Caption ya Content'));
    bindLongPress(priceEl, () => window.editBusField(catId, key, 'price', bus.price || 0, 'Bei ya Mod'));
    bindLongPress(setLinkEl, () => window.editBusField(catId, key, 'setLink', bus.setLink || '', 'TikTok Video Link (Kama hautaki button ijadiliane acha wazi)'));
};

window.editBusField = function(catId, key, field, currentValue, label) {
    const newValue = prompt(`Badilisha ${label}:\n\n(Sasa: ${currentValue})`, currentValue);
    if (newValue !== null && newValue !== currentValue) {
        window.showLoader("INABABILISHA...");
        database.ref(`buses/${catId}/${key}/${field}`).set(newValue)
            .then(() => {
                alert('Imebadilishwa kwa ufanisi!');
                window.reloadCategoryView(catId, '');
            })
            .catch(err => {
                alert('Kosa: ' + err.message);
                window.hideLoader();
            });
    }
};

window.editBusImage = function(catId, key, bus) {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    
    fileInput.onchange = function() {
        if (this.files.length > 0) {
            const file = this.files[0];
            window.showLoader("INAPAKIA PICHA MPYA...");
            window.compressImage(file, 1920, 1080, 0.88, function(compressedBase64) {
                database.ref(`buses/${catId}/${key}/image`).set(compressedBase64)
                    .then(() => {
                        alert('Picha imebadilishwa katika ubora wa HD!');
                        window.reloadCategoryView(catId, '');
                    })
                    .catch(err => {
                        alert('Kosa: ' + err.message);
                        window.hideLoader();
                    });
            });
        }
    };
    fileInput.click();
};

window.deleteBus = function(catId, busKey) {
    if (confirm("Je, una uhakika unataka kufuta Mod hii?")) {
        window.showLoader("INAFUTA MOD...");
        database.ref(`buses/${catId}/${busKey}`).remove()
        .then(() => {
            alert("Mod imefutwa kikamilifu!");
            window.reloadCategoryView(catId, '');
        })
        .catch(err => {
            alert("Kosa: " + err.message);
            window.hideLoader();
        });
    }
};

window.uploadBus = function() {
    let cat = document.getElementById("uploadCategory").value;
    let name = document.getElementById("uploadName").value.trim();
    let link = document.getElementById("uploadLink").value.trim();
    let setLink = document.getElementById("uploadSetLink").value.trim();
    let desc = document.getElementById("uploadDesc").value.trim();
    let price = document.getElementById("uploadPrice").value;
    let password = document.getElementById("uploadPassword").value.trim();
    let fileInput = document.getElementById("uploadImg");

    if (cat === "") { alert("Chagua Category kwanza!"); return; }
    if (name === "" || link === "") { alert("Jaza jina na link!"); return; }
    if (fileInput.files.length === 0) { alert("Tafadhali chagua picha ya basi!"); return; }
    if (price && parseInt(price) > 0 && password === "") { alert("Tafadhali weka password ya mod hii ya kulipia!"); return; }

    const statusDiv = document.getElementById("bus-upload-status");
    if (statusDiv) {
        statusDiv.style.display = "block";
        statusDiv.textContent = "Inachakata picha katika ubora wa hali ya juu (HD)...";
    }
    window.showLoader("UNAPAKIA MOD MPYA...");

    const file = fileInput.files[0];

    window.compressImage(file, 1920, 1080, 0.88, function(compressedBase64) {
        const newBusRef = database.ref('buses/' + cat).push();
        newBusRef.set({ 
            name: name, 
            image: compressedBase64, 
            link: link, 
            setLink: setLink,
            desc: desc, 
            price: price ? parseInt(price) : 0,
            password: password ? password : "" 
        })
        .then(() => {
            alert("Basi jipya limeongezwa kwa ubora wa juu (HD)!");
            document.getElementById("uploadName").value = "";
            document.getElementById("uploadDesc").value = "";
            document.getElementById("uploadLink").value = "";
            document.getElementById("uploadSetLink").value = "";
            document.getElementById("uploadPrice").value = "";
            document.getElementById("uploadPassword").value = "";
            fileInput.value = "";
            if (statusDiv) statusDiv.style.display = "none";
            window.showBusCategory(cat, "MABASI", true);
        }).catch(err => {
            alert("Kosa la Firebase: " + err.message);
            if (statusDiv) statusDiv.style.display = "none";
            window.hideLoader();
        });
    });
};

window.deleteCategory = function(rawId) {
    if (!rawId || rawId.trim() === "") { 
        alert("Weka au Chagua ID ya Category unayotaka kuifuta."); 
        return; 
    }
    
    let categoryId = rawId.trim().toLowerCase().replace(/\s+/g, '-');

    window.showLoader("INAFUTA CATEGORY...");
    database.ref('categories/' + categoryId).once('value')
    .then((snapshot) => {
        if (!snapshot.exists()) {
            window.hideLoader();
            alert("CATEGORY ERROR: Hakuna Category yenye ID ya '" + categoryId + "' kwenye Mfumo!");
            return;
        }

        if(confirm("Je, una uhakika unataka kufuta Category ya '" + categoryId + "' pamoja na mabasi yake yote?")) {
            database.ref('categories/' + categoryId).remove()
            .then(() => { 
                return database.ref('buses/' + categoryId).remove(); 
            })
            .then(() => {
                alert("Category na vifaa vyake vyote vimefutwa kikamilifu!"); 
                window.hideLoader();
            })
            .catch(err => {
                alert("Kosa: " + err.message);
                window.hideLoader();
            });
        } else {
            window.hideLoader();
        }
    })
    .catch((err) => {
        window.hideLoader();
        alert("Kosa la mtandao: " + err.message);
    });
};

window.showAdminPanel = function() {
    window.hideAllSections();
    document.getElementById("adminSection").style.display = "block";
    document.getElementById("navicon").style.display = "flex";
    window.loadSlideshowAdminList();
};

window.clearEntireDatabase = function() {
    const secret = document.getElementById("adminSecret").value;
    if (secret !== "1234") { alert("Kodi ya siri ya admin siyo sahihi!"); return; }

    let confirmationText = prompt("ONYO KALI: Hii itafuta Categories zote na Mabasi yote!\n\nKama una uhakika, andika neno FUTA:");
    if (confirmationText === "FUTA") {
        window.showLoader("INASAFISHA DATABASE...");
        database.ref().remove().then(() => {
            alert("Database yote imesafishwa kikamilifu!");
            window.hideLoader();
            location.reload();
        }).catch(err => {
            alert("Kosa: " + err.message);
            window.hideLoader();
        });
    }
};

window.addEventListener('DOMContentLoaded', () => {
    window.loadCategories();
    window.loadSlideshow();
    
    if (window.location.hash === "#admin") {
        window.showAdminPanel();
    } else {
        let dbname = localStorage.getItem("name");
        if (dbname) {
            window.showcat(true);
        } else {
            window.showregister();
        }
    }
});
