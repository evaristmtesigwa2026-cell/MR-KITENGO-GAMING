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

// LOCAL CACHE & DATA INDEXING FOR SEARCH
window.cachedCategories = {};
window.cachedBuses = {};
window.searchDebounceTimer = null;
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

window.cancelLoader = function() {
    if (typeof window.activeLoadingTask === 'function') {
        try { window.activeLoadingTask(); } catch(e) {}
    }
    window.hideLoader();
};

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
        alert("Hongera registration yako imekamilika!"); 
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
        alert("KARIBU KITENGO GAMING!"); 
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
    document.getElementById("details-desc").textContent = desc ? desc : "Hakuna maelezo ya ziada.";
    
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
            btn.appendChild(a);
        }
        btnContainer.appendChild(btn);

        if (setLink && setLink.trim() !== "") {
            let setBtn = document.createElement("a");
            setBtn.href = setLink;
            setBtn.target = "_blank";
            setBtn.textContent = "SETUP VIDEO";
            setBtn.style.cssText = "background: linear-gradient(135deg, #ff007f, #7139e8); color: white; padding: 12px 15px; border-radius: 10px; font-weight: bold; text-decoration: none; display: inline-flex; align-items: center; justify-content: center;";
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
};

window.requestPasswordSMS = function() {
    const namba = "0615304000";
    const jina = document.getElementById("pay-item-name").textContent;
    const ujumbe = `HABARI KITENGO GAMING, NAHITAJI PASSWORD YA MOD YA: ${jina}`;
    window.location.href = `sms:${namba}?body=${encodeURIComponent(ujumbe)}`;
};

window.verifyPasswordAndDownload = function() {
    const passwordInput = document.getElementById("pay-password").value.trim();
    const linkInput = document.getElementById("pay-target-link");
    const link = linkInput.value;
    const catId = linkInput.dataset.catId;
    const busKey = linkInput.dataset.busKey;
    const statusLog = document.getElementById("pay-status-log");
    
    if(passwordInput === "") {
        alert("Ingiza password!");
        return;
    }
    
    statusLog.style.display = "block";
    statusLog.style.color = "yellow";
    statusLog.textContent = "Inahakiki password...";
    
    database.ref(`buses/${catId}/${busKey}/password`).once('value')
    .then((snapshot) => {
        const correctPassword = snapshot.val();
        if (correctPassword && passwordInput === correctPassword.toString().trim()) {
            statusLog.style.color = "lightgreen";
            statusLog.textContent = "Password sahihi! Inafungua...";
            setTimeout(() => {
                window.closePaymentModal();
                window.open(link, "_blank");
            }, 1000);
        } else {
            statusLog.style.color = "red";
            statusLog.textContent = "Password si sahihi! Hakikisha umeandika vizuri.";
        }
    })
    .catch((err) => {
        statusLog.style.color = "red";
        statusLog.textContent = "Hitilafu: " + err.message;
    });
};

window.goBackFromDetails = function() {
    if (typeof window.currentDetailsBack === "function") {
        window.currentDetailsBack();
    } else {
        window.showcat();
    }
};

// COMPRESSION UTILITY ILIYOBORESHWA (KUTUMIA FILEREADER MOJA KWA MOJA NA CANVAS RESIZING)
window.compressImage = function(file, maxWidth, maxHeight, quality, callback) {
    if (!file) {
        window.hideLoader();
        return;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
        const img = new Image();
        img.onload = function() {
            try {
                const canvas = document.createElement("canvas");
                let width = img.naturalWidth || img.width;
                let height = img.naturalHeight || img.height;

                const targetMaxW = maxWidth || 1200;
                const targetMaxH = maxHeight || 1200;

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
                ctx.imageSmoothingQuality = "medium";
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

                const targetQuality = quality || 0.75;
                const compressedBase64 = canvas.toDataURL("image/jpeg", targetQuality);

                callback(compressedBase64);
            } catch (err) {
                alert("Hitilafu wakati wa kuchakata picha: " + err.message);
                window.hideLoader();
            }
        };
        img.onerror = function() {
            alert("Mfumo umeshindwa kusoma picha hii. Hakikisha picha ni ya format ya JPG au PNG.");
            window.hideLoader();
        };
        img.src = e.target.result;
    };
    reader.onerror = function() {
        alert("Imeshindwa kusoma picha kutoka kwenye kifaa chako.");
        window.hideLoader();
    };
    reader.readAsDataURL(file);
};

// PAKIA PICHA YA CATEGORY
window.addCategory = function() {
    let rawId = document.getElementById("newCatId").value.trim();
    let name = document.getElementById("newCatName").value.trim();
    let desc = document.getElementById("newCatDesc").value.trim();
    let fileInput = document.getElementById("newCatImg");
    
    if (rawId === "" || name === "") { alert("Jaza ID na Jina!"); return; }
    let id = rawId.toLowerCase().replace(/\s+/g, '-');
    if (fileInput.files.length === 0) { alert("Chagua picha!"); return; }
    
    window.showLoader("INAPAKIA CATEGORY...");
    
    window.compressImage(fileInput.files[0], 1200, 1200, 0.75, function(compressedBase64) {
        database.ref('categories/' + id).set({ 
            name: name, 
            image: compressedBase64, 
            desc: desc
        })
        .then(() => {
            alert("Category imeongezwa!");
            document.getElementById("newCatId").value = "";
            document.getElementById("newCatName").value = "";
            document.getElementById("newCatDesc").value = "";
            fileInput.value = "";
            window.hideLoader();
        }).catch(err => {
            alert("Kosa la Firebase: " + err.message);
            window.hideLoader();
        });
    });
};

window.deleteCategory = function(catId) {
    if (!catId) { alert("Weka Category ID!"); return; }
    if (confirm("Unahakika unataka kufuta category hii?")) {
        window.showLoader("INAFUTA...");
        database.ref('categories/' + catId).remove()
        .then(() => {
            alert("Category imefutwa!");
            window.hideLoader();
        });
    }
};

window.loadCategoryForEdit = function(id) {
    if (!id) return;
    window.showLoader("INASOMA...");
    database.ref('categories/' + id).once('value').then((snapshot) => {
        const cat = snapshot.val();
        window.hideLoader();
        if (!cat) return;
        document.getElementById("editCatName").value = cat.name || "";
        document.getElementById("editCatDesc").value = cat.desc || "";
        const imgPreview = document.getElementById("editCatCurrentImg");
        if (imgPreview) {
            imgPreview.src = cat.image || "";
            imgPreview.style.display = "block";
        }
    });
};

window.updateCategory = function() {
    const id = document.getElementById("editCategorySelect").value;
    if (!id) { alert("Chagua category!"); return; }
    const name = document.getElementById("editCatName").value.trim();
    const desc = document.getElementById("editCatDesc").value.trim();
    const fileInput = document.getElementById("editCatImg");

    window.showLoader("INASASISHA...");

    const saveUpdate = (imageBase64) => {
        const updates = { name: name, desc: desc };
        if (imageBase64) updates.image = imageBase64;

        database.ref('categories/' + id).update(updates)
        .then(() => {
            alert("Category imesasishwa!");
            window.hideLoader();
        });
    };

    if (fileInput && fileInput.files.length > 0) {
        window.compressImage(fileInput.files[0], 1200, 1200, 0.75, saveUpdate);
    } else {
        saveUpdate(null);
    }
};

window.uploadBus = function() {
    const catId = document.getElementById("uploadCategory").value;
    const name = document.getElementById("uploadName").value.trim();
    const desc = document.getElementById("uploadDesc").value.trim();
    const fileInput = document.getElementById("uploadImg");
    const link = document.getElementById("uploadLink").value.trim();
    const setLink = document.getElementById("uploadSetLink").value.trim();
    const price = document.getElementById("uploadPrice").value.trim() || 0;
    const password = document.getElementById("uploadPassword").value.trim();

    if (!catId || name === "" || fileInput.files.length === 0 || link === "") {
        alert("Jaza nafasi zote muhimu ikiwemo picha na link!");
        return;
    }

    window.showLoader("INAPAKIA BUS/MOD...");

    window.compressImage(fileInput.files[0], 1200, 1200, 0.75, function(compressedBase64) {
        const newRef = database.ref('buses/' + catId).push();
        newRef.set({
            name: name,
            desc: desc,
            image: compressedBase64,
            link: link,
            setLink: setLink,
            price: price,
            password: password
        })
        .then(() => {
            alert("Bus/Mod imepakiwa kikamilifu!");
            document.getElementById("uploadName").value = "";
            document.getElementById("uploadDesc").value = "";
            document.getElementById("uploadLink").value = "";
            document.getElementById("uploadSetLink").value = "";
            document.getElementById("uploadPrice").value = "";
            document.getElementById("uploadPassword").value = "";
            fileInput.value = "";
            window.hideLoader();
        }).catch(err => {
            alert("Kosa: " + err.message);
            window.hideLoader();
        });
    });
};

window.deleteBus = function(catId, busKey) {
    if (confirm("Unahakika unataka kufuta Mod hii?")) {
        window.showLoader("INAFUTA...");
        database.ref(`buses/${catId}/${busKey}`).remove()
        .then(() => {
            alert("Mod imefutwa!");
            window.reloadCategoryView(catId, catId);
        });
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
            editCatSelect.innerHTML = '<option value="">-- Chagua Category ya Kuhariri --</option>';
            for (const [key, cat] of Object.entries(categories)) {
                const opt = document.createElement("option");
                opt.value = key;
                opt.textContent = cat.name;
                editCatSelect.appendChild(opt);
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
                    <span>&rsaquo;</span>
                </div>
            </div>
        `;
        catContainer.appendChild(card);
    }
};

window.handleSearchInput = function(query) {
    const clearBtn = document.getElementById("search-clear-btn");
    if (clearBtn) clearBtn.style.display = query && query.length > 0 ? "block" : "none";

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
        if ((cat.name && cat.name.toLowerCase().includes(q)) || (cat.desc && cat.desc.toLowerCase().includes(q))) {
            matchedCategories.push({ key, ...cat });
        }
    }

    const matchedBuses = [];
    for (const [catId, busesMap] of Object.entries(window.cachedBuses || {})) {
        const catName = window.cachedCategories[catId] ? window.cachedCategories[catId].name : 'BUS';
        for (const [busKey, bus] of Object.entries(busesMap || {})) {
            if ((bus.name && bus.name.toLowerCase().includes(q)) || (bus.desc && bus.desc.toLowerCase().includes(q))) {
                matchedBuses.push({ busKey, catId, catName, ...bus });
            }
        }
    }

    if (matchedCategories.length === 0 && matchedBuses.length === 0) {
        dropdown.innerHTML = `<div style="padding:15px; text-align:center; color:#8a8d9b;">Hakuna matokeo ya "<strong>${query}</strong>"</div>`;
        dropdown.style.display = "block";
        return;
    }

    let html = "";
    if (matchedCategories.length > 0) {
        html += `<div class="search-suggestion-group"><div class="search-suggestion-header">CATEGORIES</div>`;
        matchedCategories.slice(0, 4).forEach(cat => {
            html += `
                <div class="search-suggestion-item" onclick="window.selectSearchCategory('${cat.key}', '${cat.name.replace(/'/g, "\\'")}')">
                    <img src="${cat.image}" alt="${cat.name}">
                    <div><span class="search-suggestion-title">${cat.name}</span></div>
                </div>`;
        });
        html += `</div>`;
    }

    if (matchedBuses.length > 0) {
        html += `<div class="search-suggestion-group"><div class="search-suggestion-header">MODS</div>`;
        matchedBuses.slice(0, 6).forEach(bus => {
            html += `
                <div class="search-suggestion-item" onclick="window.selectSearchBus('${bus.name.replace(/'/g, "\\'")}', '${bus.image}', '${(bus.desc || '').replace(/'/g, "\\'")}', '${bus.link}', '${bus.catId}', '${bus.catName.replace(/'/g, "\\'")}', ${bus.price || 0}, '${bus.busKey}', '${bus.setLink || ''}')">
                    <img src="${bus.image}" alt="${bus.name}">
                    <div><span class="search-suggestion-title">${bus.name}</span></div>
                </div>`;
        });
        html += `</div>`;
    }

    dropdown.innerHTML = html;
    dropdown.style.display = "block";
};

window.selectSearchCategory = function(catId, catName) {
    window.closeSearchSuggestions();
    window.showBusCategory(catId, catName);
};

window.selectSearchBus = function(name, img, desc, link, catId, catName, price, busKey, setLink) {
    window.closeSearchSuggestions();
    window.showDetails(name, img, desc, 'bus', link, catId, catName, price, busKey, setLink);
};

window.showBusCategory = function(catId, catName, isAdminMode = false) {
    window.showLoader("INAPAKIA...");
    database.ref('buses/' + catId).once('value', (snapshot) => {
        const buses = snapshot.val() || {};
        window.hideAllSections();
        document.getElementById("bus-view-section").style.display = "block";
        document.getElementById("navicon").style.display = "flex";
        document.getElementById("dynamic-bus-title").textContent = catName;
        
        let busList = document.getElementById("dynamic-bus-list");
        busList.innerHTML = "";
        
        for (const [key, bus] of Object.entries(buses)) {
            const card = document.createElement("div");
            card.className = "card bus-card";
            
            if (isAdminMode) {
                card.innerHTML = `
                    <div style="padding:10px;">
                        <img src="${bus.image}" style="width: 100%; height: 160px; object-fit: cover; border-radius: 12px;">
                        <h3 style="color:#45f3ff;">${bus.name}</h3>
                        <p style="color:#a4a6b0; font-size:12px;">${bus.desc || ''}</p>
                        <button onclick="window.deleteBus('${catId}', '${key}')" style="background-color: #ff0000; border:none; color:white; padding:8px; border-radius:5px; cursor:pointer;">FUTA</button>
                    </div>`;
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
                    </div>`;
            }
            busList.appendChild(card);
        }
        window.hideLoader();
    });
};

window.reloadCategoryView = function(catId, catName) {
    window.showBusCategory(catId, catName, true);
};

window.clearEntireDatabase = function() {
    if (confirm("UNAHAKIKA UNATAKA KUFUTA DATA ZOTE?")) {
        window.showLoader("INARUDIRISHA UPYA...");
        database.ref().remove().then(() => {
            alert("Database imesafishwa!");
            window.hideLoader();
            location.reload();
        });
    }
};

window.toggleChat = function() {
    const box = document.getElementById("ai-chat-box");
    box.style.display = (box.style.display === "flex") ? "none" : "flex";
};

window.checkEnter = function(e) {
    if (e.key === 'Enter') window.sendMessage();
};

window.sendMessage = function() {
    const input = document.getElementById("ai-user-input");
    const msg = input.value.trim();
    if (!msg) return;

    const messagesContainer = document.getElementById("ai-chat-messages");
    const userDiv = document.createElement("div");
    userDiv.className = "message user-message";
    userDiv.textContent = msg;
    messagesContainer.appendChild(userDiv);
    input.value = "";

    setTimeout(() => {
        const aiDiv = document.createElement("div");
        aiDiv.className = "message ai-message";
        aiDiv.textContent = "Asante kwa ujumbe wako. Kitengo Gaming ipo hapa kukusaidia kupata mods bora za ETS2 na Bus Simulator!";
        messagesContainer.appendChild(aiDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }, 800);
};

// INITIALIZE APP
window.onload = function() {
    window.loadCategories();
    if (window.location.hash === "#admin") {
        document.getElementById("adminSection").style.display = "block";
    } else {
        window.showcat();
    }
};
