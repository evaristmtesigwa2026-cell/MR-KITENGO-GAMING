// USANIDI WA FIREBASE (Msisi Project)
const firebaseConfig = {
  apiKey: "AIzaSyDA0ty5dOoBiPJx5fRdFI_hvddJyUbb6B4",
  authDomain: "msisi-38c20.firebaseapp.com",
  projectId: "msisi-38c20",
  databaseURL: "https://msisi-38c20-default-rtdb.firebaseio.com",
  messagingSenderId: "881060609707",
  appId: "1:881060609707:web:bd9028db2b20c75d72c1ee",
  measurementId: "G-NFT0FB6V2T"
};

// Kuanzisha Firebase
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const database = firebase.database();

window.hideAllSections = function() {
    const sections = ["cat", "bus-view-section", "details-view-section", "log", "reg", "adminSection"];
    sections.forEach(id => {
        let el = document.getElementById(id);
        if (el) el.style.display = "none";
    });
    document.getElementById("navicon").style.display = "none";
}

window.showlogin = function() { window.hideAllSections(); document.getElementById("log").style.display = "block"; }
window.showregister = function() { window.hideAllSections(); document.getElementById("reg").style.display = "block"; }

window.register = function() {
    let name = document.getElementById("regname").value;
    let email = document.getElementById("regemail").value;
    let password = document.getElementById("regpassword").value;
    if (name == "" || email == "" || password == "") { alert("Jaza nafasi zote!"); } 
    else { 
        localStorage.setItem("name", name); localStorage.setItem("email", email); localStorage.setItem("password", password);
        alert("hongera mkuu registration yako imekamilika!"); window.showlogin();
    }
}

window.login = function() {
    let name = document.getElementById("logname").value;
    let password = document.getElementById("logpassword").value;
    let dbname = localStorage.getItem("name");
    let dbpassword = localStorage.getItem("password");
    if (name == "" || password == "") { alert("Jaza nafasi zote!"); } 
    else if (name == dbname && password == dbpassword) {
        alert("HONGERA SANA KARIBU KITENGO GAMING !"); history.replaceState({ page: "home" }, "Home", "#home"); window.showcat(true); 
    } else { alert("Taarifa ulizoweka sio sahihi!"); }
}

window.showcat = function(isBackAction = false) {
    let dbname = localStorage.getItem("name");
    if(!dbname) { window.showregister(); return; }
    window.hideAllSections();
    document.getElementById("cat").style.display = "block";
    document.getElementById("navicon").style.display = "flex"; 
    if (!isBackAction) history.pushState({ page: "home" }, "Home", "#home");
}

// LOGIC YA KICHUNGI CHA PREMIUM VS FREE + PASSWORD MODAL PREPARATION
window.showDetails = function(title, image, desc, type, targetLinkOrId, currentCatId = '', currentCatName = '', price = 0, busKey = '') {
    window.hideAllSections();
    document.getElementById("details-view-section").style.display = "block";
    document.getElementById("navicon").style.display = "flex";
    
    document.getElementById("details-title").textContent = title;
    document.getElementById("details-img").src = image;
    document.getElementById("details-desc").textContent = desc ? desc : "samahani mkuu Hakuna maelezo ya ziada yaliyowekwa kwenye item hii.";
    
    let btnContainer = document.getElementById("details-action-btn");
    btnContainer.innerHTML = "";
    
    if (type === 'category') {
        let btn = document.createElement("button");
        btn.textContent = "CHAGUA HAPA (FUNGUA MODS)";
        btn.onclick = function() { window.showBusCategory(targetLinkOrId, title); };
        btnContainer.appendChild(btn);
        
        window.currentDetailsBack = function() { window.showcat(); };
    } else {
        let btn = document.createElement("button");
        
        // Angalia kama basi lina bei (Premium) au ni la Bure (Free)
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
            btn.appendChild(a);
        }
        
        btnContainer.appendChild(btn);
        window.currentDetailsBack = function() { window.showBusCategory(currentCatId, currentCatName); };
    }
}

// DIRISHA LA KUINGIZA PASSWORD NA KUOMBA SMS
window.openPasswordModal = function(itemName, itemPrice, downloadLink, categoryId, busKey) {
    document.getElementById("pay-item-name").textContent = itemName;
    document.getElementById("pay-item-price").textContent = "Tsh " + itemPrice;
    document.getElementById("pay-target-link").value = downloadLink;
    
    // Hifadhi taarifa za database kwa ajili ya kufanya uhakiki wa password baadae
    document.getElementById("pay-target-link").dataset.catId = categoryId;
    document.getElementById("pay-target-link").dataset.busKey = busKey;
    
    document.getElementById("payment-modal-screen").style.display = "flex";
    document.getElementById("pay-password").value = "";
    document.getElementById("pay-status-log").style.display = "none";
}

window.closePaymentModal = function() {
    document.getElementById("payment-modal-screen").style.display = "none";
    document.getElementById("pay-password").value = "";
    document.getElementById("pay-status-log").style.display = "none";
}

// KUFUNGUA APP YA SMS KIOTOMATIKI UKIBONYEZA OMBA PASSWORD
window.requestPasswordSMS = function() {
    const nambaHalotel = "0615304000";
    const jinaLaBasi = document.getElementById("pay-item-name").textContent;
    const ujumbe = `HELLO KITENGO GAMING, NAHITAJI PASSWORD YA MOD YA: ${jinaLaBasi}`;
    
    // Inafungua app ya SMS kwenye simu ya mteja ikiwa imeshaandikwa kila kitu tayari
    window.location.href = `sms:${nambaHalotel}?body=${encodeURIComponent(ujumbe)}`;
}

// KUHAKIKI PASSWORD KUTOKA FIREBASE NA KUMRUSHIA MEDIAFIRE
window.verifyPasswordAndDownload = function() {
    const passwordInput = document.getElementById("pay-password").value.trim();
    const link = document.getElementById("pay-target-link").value;
    const catId = document.getElementById("pay-target-link").dataset.catId;
    const busKey = document.getElementById("pay-target-link").dataset.busKey;
    const statusLog = document.getElementById("pay-status-log");
    
    if(passwordInput === "") {
        alert("Tafadhali ingiza password uliyotumiwa!");
        return;
    }
    
    statusLog.style.display = "block";
    statusLog.style.color = "yellow";
    statusLog.textContent = "SUBIRI KWANZA MAANA PASSWORD YAKO INAHAKIKIWA  ...";
    
    // Tunavuta password sahihi ya basi hili kutoka Firebase kiusalama
    database.ref(`buses/${catId}/${busKey}/password`).once('value')
    .then((snapshot) => {
        const correctPassword = snapshot.val();
        
        if (correctPassword && passwordInput === correctPassword.toString().trim()) {
            statusLog.style.color = "lightgreen";
            statusLog.textContent = "hongera Password ni sahihi! Mfumo unakupeleka download page ...";
            
            setTimeout(() => {
                window.closePaymentModal();
                window.open(link, "_blank");
            }, 1500);
        } else {
            statusLog.style.color = "red";
            statusLog.textContent = "oyaaaa Password siyo sahihi mkuuu! Tafadhali hakikisha umeandika herufi vizuri au omba mpya kwa SMS.";
        }
    })
    .catch((err) => {
        statusLog.style.color = "red";
        statusLog.textContent = "CONNECTION ERROR: " + err.message;
    });
}

window.goBackFromDetails = function() {
    if (typeof window.currentDetailsBack === "function") {
        window.currentDetailsBack();
    } else {
        window.showcat();
    }
}

// CHOMBO CHA USHINDILIAJI PICHA KIOTOMATIKI (OPTIMIZED FOR MAXIMUM SPEED)
window.compressImage = function(file, maxWidth, maxHeight, quality, callback) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(event) {
        const img = new Image();
        img.onload = function() {
            const canvas = document.createElement("canvas");
            let width = img.width;
            let height = img.height;
            
            if (width > height) {
                if (width > maxWidth) {
                    height = Math.round((height * maxWidth) / width);
                    width = maxWidth;
                }
            } else {
                if (height > maxHeight) {
                    width = Math.round((width * maxHeight) / height);
                    height = maxHeight;
                }
            }
            
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext("2d");
            ctx.drawImage(img, 0, 0, width, height);
            
            // Webp or standard JPEG with low quality for fast load
            const compressedBase64 = canvas.toDataURL("image/jpeg", quality || 0.5);
            callback(compressedBase64);
        };
        img.onerror = function() {
            alert("Hitilafu kwenye picha! Jaribu picha nyingine.");
        };
        img.src = event.target.result;
    };
    reader.readAsDataURL(file);
}

// PAKIA PICHA YA CATEGORY
window.addCategory = function() {
    let id = document.getElementById("newCatId").value.trim();
    let name = document.getElementById("newCatName").value.trim();
    let desc = document.getElementById("newCatDesc").value.trim();
    let fileInput = document.getElementById("newCatImg");
    
    if (id === "" || name === "") { alert("Jaza ID na Jina!"); return; }
    if (fileInput.files.length === 0) { alert("Chagua picha ya kundi!"); return; }
    
    const statusDiv = document.getElementById("cat-upload-status");
    statusDiv.style.display = "block";
    statusDiv.textContent = "Inashindilia picha ya kundi kuwa nyepesi...";
    
    const file = fileInput.files[0];
    
    window.compressImage(file, 400, 400, 0.5, function(compressedBase64) {
        database.ref('categories/' + id).set({ 
            name: name, 
            image: compressedBase64, 
            desc: desc
        })
        .then(() => {
            alert("Kundi jipya limeongezwa!");
            document.getElementById("newCatId").value = "";
            document.getElementById("newCatName").value = "";
            document.getElementById("newCatDesc").value = "";
            fileInput.value = "";
            statusDiv.style.display = "none";
            window.loadCategories();
        }).catch(err => {
            alert("Kosa: " + err.message);
            statusDiv.style.display = "none";
        });
    });
}

window.loadCategories = function() {
    database.ref('categories').once('value', (snapshot) => {
        const categories = snapshot.val() || {};
        let categorySelect = document.getElementById("uploadCategory");
        if(categorySelect) categorySelect.innerHTML = '<option value="">-- Chagua Category --</option>';
        
        let catContainer = document.getElementById("categories-container");
        if(catContainer) catContainer.innerHTML = "";
        
        for (const [key, cat] of Object.entries(categories)) {
            if(categorySelect) {
                const opt = document.createElement("option");
                opt.value = key;
                opt.textContent = cat.name;
                categorySelect.appendChild(opt);
            }
            
            if(catContainer) {
                const card = document.createElement("div");
                card.className = "card category-card";
                card.style.position = "relative";
                
                card.innerHTML = `
                    <div style="position: relative; width: 100%; height: 200px; overflow: hidden; border-radius: 15px;">
                        <img src="${cat.image}" alt="${cat.name}" style="width: 100%; height: 100%; object-fit: cover;">
                    </div>
                    <h3 style="margin: 15px 0 5px 0; text-align: center;">${cat.name}</h3>
                    <p style="margin: 0; font-size: 14px; text-align: center; color: #a4a6b0;">${cat.desc || 'Kundi la mods'}</p>
                    <button onclick="window.showBusCategory('${key}', '${cat.name}', false)" style="width: calc(100% - 30px); margin: 15px;">CHAGUA HAPA</button>
                `;
                
                catContainer.appendChild(card);
            }
        }
        
        // Populate admin category select dropdown
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
    });
}

window.showBusCategory = function(catId, catName, isAdminMode = false) {
    database.ref('buses/' + catId).once('value', (snapshot) => {
        const buses = snapshot.val() || {};
        
        let isAdmin = window.location.hash === "#admin";
        
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
                // Admin mode card
                card.innerHTML = `
                    <div class="admin-card-wrapper" data-cat="${catId}" data-key="${key}">
                        <div style="position: relative;">
                            <img src="${bus.image}" alt="${bus.name}" class="editable-image" style="width: 100%; height: 200px; object-fit: cover; border-radius: 15px; cursor: pointer;">
                            <div class="long-press-hint" style="position: absolute; top: 5px; right: 5px; background: rgba(0,0,0,0.7); color: #45f3ff; padding: 3px 8px; border-radius: 5px; font-size: 11px; display: none;">5s = Edit</div>
                        </div>
                        <h3 class="editable-title" style="margin: 15px 0 5px 0; cursor: pointer; color: #45f3ff;">${bus.name}</h3>
                        <p class="editable-category" style="margin: 0; font-size: 12px; color: #7139e8; cursor: pointer;">${catName}</p>
                        <p class="editable-desc" style="margin: 10px 0; font-size: 14px; line-height: 1.4; text-align: left; background: rgba(0,0,0,0.2); padding: 10px; border-radius: 8px; cursor: pointer;">
                            ${bus.desc || 'Hakuna maelezo'}
                        </p>
                        <div style="display: flex; gap: 8px; margin: 10px 0;">
                            <div style="flex: 1;">
                                <label style="font-size: 11px; color: #a4a6b0;">Bei (Tsh):</label>
                                <p class="editable-price" style="margin: 0; color: #ff007f; font-weight: bold; cursor: pointer; background: rgba(0,0,0,0.2); padding: 8px; border-radius: 5px;">${bus.price || 0}</p>
                            </div>
                            <div style="flex: 1;">
                                <label style="font-size: 11px; color: #a4a6b0;">Link:</label>
                                <p class="editable-link" style="margin: 0; color: #45f3ff; font-size: 11px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; cursor: pointer; background: rgba(0,0,0,0.2); padding: 8px; border-radius: 5px;" title="${bus.link}">${bus.link ? bus.link.substring(0, 20) : ''}...</p>
                            </div>
                        </div>
                        <div style="display: flex; gap: 8px;">
                            <button onclick="window.deleteBus('${catId}', '${key}')" style="flex: 1; background-color: #ff0000; margin: 0;">FUTA</button>
                            <button onclick="window.reloadCategoryView('${catId}', '${catName}')" style="flex: 1; margin: 0;">REFRESH</button>
                        </div>
                    </div>
                `;
            } else {
                // User mode card
                card.innerHTML = `
                    <div style="position: relative; width: 100%; height: 200px; overflow: hidden; border-radius: 15px;">
                        <img src="${bus.image}" alt="${bus.name}" style="width: 100%; height: 100%; object-fit: cover; cursor: pointer;" onclick="window.showDetails('${bus.name}', '${bus.image}', '${(bus.desc || '').replace(/'/g, "\\'")}', 'bus', '${bus.link}', '${catId}', '${catName}', ${bus.price || 0}, '${key}')">
                    </div>
                    <h3 style="margin: 15px 0 5px 0; text-align: center;">${bus.name}</h3>
                    <p style="margin: 0; font-size: 14px; text-align: center; color: #a4a6b0; line-height: 1.4;">
                        ${bus.desc || 'Hakuna maelezo'}
                    </p>
                    <div style="display: flex; gap: 8px; align-items: center; justify-content: center; margin: 12px 0;">
                        ${bus.price && parseInt(bus.price) > 0 ? 
                            `<span style="background: #ff007f; color: white; padding: 5px 12px; border-radius: 20px; font-weight: bold;">Tsh ${bus.price}</span>` : 
                            `<span style="background: #00AA00; color: white; padding: 5px 12px; border-radius: 20px; font-weight: bold;">FREE</span>`}
                    </div>
                    <button onclick="window.showDetails('${bus.name}', '${bus.image}', '${(bus.desc || '').replace(/'/g, "\\'")}', 'bus', '${bus.link}', '${catId}', '${catName}', ${bus.price || 0}, '${key}')" style="width: calc(100% - 30px); margin: 15px;">TAZAMA & DOWNLOAD</button>
                `;
            }
            
            busList.appendChild(card);
            
            if (isAdmin) {
                window.setupAdminCardListeners(card, catId, key, bus);
            }
        }
        
        let backBtn = document.createElement("button");
        backBtn.textContent = "Rudi Nyuma";
        backBtn.style.cssText = "display: block; margin: 20px auto; padding: 12px 30px; width: auto;";
        backBtn.onclick = function() {
            if (isAdmin) {
                window.showAdminPanel();
            } else {
                window.showcat();
            }
        };
        busList.parentElement.insertBefore(backBtn, busList.nextSibling);
    });
}

window.reloadCategoryView = function(catId, catName) {
    window.showBusCategory(catId, catName, false);
}

window.setupAdminCardListeners = function(card, catId, key, bus) {
    const titleEl = card.querySelector('.editable-title');
    const priceEl = card.querySelector('.editable-price');
    const linkEl = card.querySelector('.editable-link');
    const descEl = card.querySelector('.editable-desc');
    const imageEl = card.querySelector('.editable-image');
    const hintEl = card.querySelector('.long-press-hint');
    
    let pressTimer;
    
    if (imageEl) {
        imageEl.addEventListener('mousedown', () => {
            if(hintEl) hintEl.style.display = 'block';
            pressTimer = setTimeout(() => { window.editBusImage(catId, key, bus); }, 5000);
        });
        imageEl.addEventListener('mouseup', () => { clearTimeout(pressTimer); if(hintEl) hintEl.style.display = 'none'; });
        imageEl.addEventListener('mouseleave', () => { clearTimeout(pressTimer); if(hintEl) hintEl.style.display = 'none'; });
        
        imageEl.addEventListener('touchstart', () => {
            if(hintEl) hintEl.style.display = 'block';
            pressTimer = setTimeout(() => { window.editBusImage(catId, key, bus); }, 5000);
        });
        imageEl.addEventListener('touchend', () => { clearTimeout(pressTimer); if(hintEl) hintEl.style.display = 'none'; });
    }
    
    if (titleEl) {
        titleEl.addEventListener('mousedown', () => { pressTimer = setTimeout(() => { window.editBusField(catId, key, 'name', bus.name, 'Jina la Mod'); }, 5000); });
        titleEl.addEventListener('mouseup', () => clearTimeout(pressTimer));
        titleEl.addEventListener('mouseleave', () => clearTimeout(pressTimer));
        
        titleEl.addEventListener('touchstart', () => { pressTimer = setTimeout(() => { window.editBusField(catId, key, 'name', bus.name, 'Jina la Mod'); }, 5000); });
        titleEl.addEventListener('touchend', () => clearTimeout(pressTimer));
    }
    
    if (priceEl) {
        priceEl.addEventListener('mousedown', () => { pressTimer = setTimeout(() => { window.editBusField(catId, key, 'price', bus.price || 0, 'Bei ya Mod'); }, 5000); });
        priceEl.addEventListener('mouseup', () => clearTimeout(pressTimer));
        priceEl.addEventListener('mouseleave', () => clearTimeout(pressTimer));
        
        priceEl.addEventListener('touchstart', () => { pressTimer = setTimeout(() => { window.editBusField(catId, key, 'price', bus.price || 0, 'Bei ya Mod'); }, 5000); });
        priceEl.addEventListener('touchend', () => clearTimeout(pressTimer));
    }
    
    if (linkEl) {
        linkEl.addEventListener('mousedown', () => { pressTimer = setTimeout(() => { window.editBusField(catId, key, 'link', bus.link, 'Link ya Download'); }, 5000); });
        linkEl.addEventListener('mouseup', () => clearTimeout(pressTimer));
        linkEl.addEventListener('mouseleave', () => clearTimeout(pressTimer));
        
        linkEl.addEventListener('touchstart', () => { pressTimer = setTimeout(() => { window.editBusField(catId, key, 'link', bus.link, 'Link ya Download'); }, 5000); });
        linkEl.addEventListener('touchend', () => clearTimeout(pressTimer));
    }
    
    if (descEl) {
        descEl.addEventListener('mousedown', () => { pressTimer = setTimeout(() => { window.editBusField(catId, key, 'desc', bus.desc || '', 'Maelezo'); }, 5000); });
        descEl.addEventListener('mouseup', () => clearTimeout(pressTimer));
        descEl.addEventListener('mouseleave', () => clearTimeout(pressTimer));
        
        descEl.addEventListener('touchstart', () => { pressTimer = setTimeout(() => { window.editBusField(catId, key, 'desc', bus.desc || '', 'Maelezo'); }, 5000); });
        descEl.addEventListener('touchend', () => clearTimeout(pressTimer));
    }
}

window.editBusField = function(catId, key, field, currentValue, label) {
    const newValue = prompt(`Badilisha ${label}:\n\n(Sasa: ${currentValue})`, currentValue);
    if (newValue !== null && newValue !== currentValue) {
        database.ref(`buses/${catId}/${key}/${field}`).set(newValue)
            .then(() => {
                alert('Imebadilishwa kwa ufanisi!');
                window.reloadCategoryView(catId, '');
            })
            .catch(err => alert('Kosa: ' + err.message));
    }
}

window.editBusImage = function(catId, key, bus) {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    
    fileInput.onchange = function() {
        if (this.files.length > 0) {
            const file = this.files[0];
            window.compressImage(file, 500, 500, 0.5, function(compressedBase64) {
                database.ref(`buses/${catId}/${key}/image`).set(compressedBase64)
                    .then(() => {
                        alert('Picha imebadilishwa kwa ufanisi!');
                        window.reloadCategoryView(catId, '');
                    })
                    .catch(err => alert('Kosa: ' + err.message));
            });
        }
    };
    
    fileInput.click();
}

// OPTIMIZED FAST UPLOAD BUS FUNCTION
window.uploadBus = function() {
    let cat = document.getElementById("uploadCategory").value;
    let name = document.getElementById("uploadName").value.trim();
    let link = document.getElementById("uploadLink").value.trim();
    let desc = document.getElementById("uploadDesc").value.trim();
    let price = document.getElementById("uploadPrice").value;
    let password = document.getElementById("uploadPassword").value.trim();
    let fileInput = document.getElementById("uploadImg");

    if (cat === "") { alert("Chagua Category kwanza!"); return; }
    if (name === "" || link === "") { alert("Jaza jina na link!"); return; }
    if (fileInput.files.length === 0) { alert("Tafadhali chagua picha ya basi!"); return; }
    if (price && parseInt(price) > 0 && password === "") { alert("Tafadhali weka password ya mod hii ya kulipia!"); return; }

    const statusDiv = document.getElementById("bus-upload-status");
    statusDiv.style.display = "block";
    statusDiv.textContent = "Inashindilia picha kwa kasi kubwa na kupakia Firebase...";

    const file = fileInput.files[0];

    // Speed-optimized compression (500px width max & 0.5 JPEG quality)
    window.compressImage(file, 500, 500, 0.5, function(compressedBase64) {
        const newBusRef = database.ref('buses/' + cat).push();
        newBusRef.set({ 
            name: name, 
            image: compressedBase64, 
            link: link, 
            desc: desc, 
            price: price ? parseInt(price) : 0,
            password: password ? password : "" 
        })
        .then(() => {
            alert("Basi jipya limeongezwa kwa ufanisi mkubwa!");
            document.getElementById("uploadName").value = "";
            document.getElementById("uploadDesc").value = "";
            document.getElementById("uploadLink").value = "";
            document.getElementById("uploadPrice").value = "";
            document.getElementById("uploadPassword").value = "";
            fileInput.value = "";
            statusDiv.style.display = "none";
            window.showBusCategory(cat, "MABASI", true);
        }).catch(err => {
            alert("Kosa la Firebase: " + err.message);
            statusDiv.style.display = "none";
        });
    });
}

window.deleteCategory = function(categoryId) {
    if (!categoryId) { alert("Weka ID ya category unayotaka kuifuta."); return; }
    if(confirm("Je, una uhakika unataka kufuta GROUP la '" + categoryId + "' na kila kitu chake?")) {
        database.ref('categories/' + categoryId).remove()
        .then(() => { 
            database.ref('buses/' + categoryId).remove(); 
            alert("Vimefutwa!"); 
            window.loadCategories();
        }).catch(err => alert("Kosa: " + err.message));
    }
}

window.clearEntireDatabase = function() {
    const secret = document.getElementById("adminSecret").value;
    if (secret !== "1234") { alert("Kodi ya siri ya admin siyo sahihi!"); return; }

    let confirmationText = prompt("ONYO KALI: Hii itafuta Categories zote na Mabasi yote!\n\nKama una uhakika, andika neno FUTA:");
    if (confirmationText === "FUTA") {
        database.ref().remove()
        .then(() => { alert("Database yote imesafishwa!"); window.loadCategories(); })
        .catch(err => alert("Kosa: " + err.message));
    } else { alert("Zoezi limesitishwa."); }
}

window.deleteBus = function(category, key) {
    if(confirm("Unataka kufuta basi hili?")) {
        database.ref('buses/' + category + '/' + key).remove()
        .then(() => {
            alert("Basi limefutwa!");
            window.showBusCategory(category, "MABASI", true);
        })
        .catch(err => alert("Kosa: " + err.message));
    }
}

window.showAdminPanel = function() {
    window.hideAllSections();
    document.getElementById("adminSection").style.display = "block";
    window.loadCategories();
}

window.checkCurrentLocation = function() {
    let hash = window.location.hash;
    let dbname = localStorage.getItem("name");
    
    if (hash === "#admin") { 
        window.showAdminPanel();
        return; 
    }
    if (!dbname) { window.hideAllSections(); if (hash === "#login") window.showlogin(); else window.showregister(); } 
    else { window.showcat(true); }
}

// LOGIC YA TAFUTA (SEARCH BAR)
window.handleSearchInput = function(query) {
    const searchTerm = query.toLowerCase().trim();
    if(searchTerm === "") return;
    
    database.ref('buses').once('value', (snapshot) => {
        const allCategories = snapshot.val() || {};
        let matchingBuses = [];
        
        for (const [catId, buses] of Object.entries(allCategories)) {
            for (const [busKey, bus] of Object.entries(buses)) {
                if (bus.name && bus.name.toLowerCase().includes(searchTerm)) {
                    matchingBuses.push({ bus, catId, busKey });
                }
            }
        }
        
        if (matchingBuses.length > 0) {
            window.hideAllSections();
            document.getElementById("bus-view-section").style.display = "block";
            document.getElementById("navicon").style.display = "flex";
            document.getElementById("dynamic-bus-title").textContent = `MATOKEO YA: "${query.toUpperCase()}"`;
            
            let busList = document.getElementById("dynamic-bus-list");
            busList.innerHTML = "";
            
            matchingBuses.forEach(item => {
                const bus = item.bus;
                const card = document.createElement("div");
                card.className = "card bus-card";
                card.innerHTML = `
                    <div style="position: relative; width: 100%; height: 200px; overflow: hidden; border-radius: 15px;">
                        <img src="${bus.image}" alt="${bus.name}" style="width: 100%; height: 100%; object-fit: cover; cursor: pointer;" onclick="window.showDetails('${bus.name}', '${bus.image}', '${(bus.desc || '').replace(/'/g, "\\'")}', 'bus', '${bus.link}', '${item.catId}', 'SEARCH', ${bus.price || 0}, '${item.busKey}')">
                    </div>
                    <h3 style="margin: 15px 0 5px 0; text-align: center;">${bus.name}</h3>
                    <p style="margin: 0; font-size: 14px; text-align: center; color: #a4a6b0;">
                        ${bus.desc || 'Hakuna maelezo'}
                    </p>
                    <div style="display: flex; gap: 8px; align-items: center; justify-content: center; margin: 12px 0;">
                        ${bus.price && parseInt(bus.price) > 0 ? 
                            `<span style="background: #ff007f; color: white; padding: 5px 12px; border-radius: 20px; font-weight: bold;">Tsh ${bus.price}</span>` : 
                            `<span style="background: #00AA00; color: white; padding: 5px 12px; border-radius: 20px; font-weight: bold;">FREE</span>`}
                    </div>
                    <button onclick="window.showDetails('${bus.name}', '${bus.image}', '${(bus.desc || '').replace(/'/g, "\\'")}', 'bus', '${bus.link}', '${item.catId}', 'SEARCH', ${bus.price || 0}, '${item.busKey}')" style="width: calc(100% - 30px); margin: 15px;">TAZAMA & DOWNLOAD</button>
                `;
                busList.appendChild(card);
            });
        }
    });
}

window.addEventListener("popstate", function(event) {
    let hash = window.location.hash;
    if (hash === "#admin") { window.showAdminPanel(); return; }
    let dbname = localStorage.getItem("name");
    if (!dbname) { window.showregister(); return; }
    
    if (event.state && event.state.page) {
        let page = event.state.page;
        if (page === "home") window.showcat(true);
        else window.showBusCategory(page, event.state.catName || page, true);
    } else { window.checkCurrentLocation(); }
});

window.addEventListener("DOMContentLoaded", () => {
    window.loadCategories();
    window.checkCurrentLocation();
});

// =========================================================================
// KITENGO AI ASSISTANT (OPTIMIZED)
// =========================================================================
const PART_A = "AQ.Ab8RN6LL0VgiZ";
const PART_B = "gSXifpheeDVtaGlQ7V";
const PART_C = "n4-8t42QCcrK885ck8w";

const GEMINI_API_KEY = PART_A + PART_B + PART_C;

window.toggleChat = function() {
    const chatBox = document.getElementById("ai-chat-box");
    if (!chatBox) return;
    if (chatBox.style.display === "none" || chatBox.style.display === "") {
        chatBox.style.display = "flex";
    } else {
        chatBox.style.display = "none";
    }
}

window.checkEnter = function(event) {
    if (event.key === "Enter") {
        window.sendMessage();
    }
}

window.sendMessage = async function() {
    const inputEl = document.getElementById("ai-user-input");
    const messageText = inputEl.value.trim();
    if (messageText === "") return;

    const messagesContainer = document.getElementById("ai-chat-messages");

    const userDiv = document.createElement("div");
    userDiv.className = "message user-message";
    userDiv.textContent = messageText;
    messagesContainer.appendChild(userDiv);

    inputEl.value = "";
    messagesContainer.scrollTop = messagesContainer.scrollHeight;

    const loadingDiv = document.createElement("div");
    loadingDiv.className = "message ai-message";
    loadingDiv.id = "ai-loading-msg";
    loadingDiv.textContent = "Kitengo AI inafikiria...";
    messagesContainer.appendChild(loadingDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;

    try {
        const systemPrompt = "Wewe ni Kitengo AI Assistant - msaidizi wa kucheza mahitaji ya watumiaji wa Kitengo Gaming. Jibu kwa Kiswahili kimafupi na kwa maelezo mazuri. Usitumie markdown. Jibu ni karibu 2-3 sentensi tu.";
        const userPrompt = messageText + " (" + systemPrompt + ")";
        
        const askGemini = async (model) => {
            return await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`, {
                method: "POST",
                headers: { 
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    contents: [{ 
                        parts: [{ 
                            text: userPrompt
                        }] 
                    }],
                    generationConfig: {
                        temperature: 0.7,
                        maxOutputTokens: 150
                    }
                })
            });
        };

        let response = await askGemini("gemini-2.5-flash");
        if (!response.ok) {
            response = await askGemini("gemini-1.5-flash");
        }

        if (!response.ok) {
            throw new Error(`API Error: ${response.status}`);
        }

        const data = await response.json();
        
        const loader = document.getElementById("ai-loading-msg");
        if(loader) loader.remove();

        if (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts && data.candidates[0].content.parts[0]) {
            const aiResponseText = data.candidates[0].content.parts[0].text;

            const aiDiv = document.createElement("div");
            aiDiv.className = "message ai-message";
            aiDiv.textContent = aiResponseText;
            messagesContainer.appendChild(aiDiv);
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        } else {
            throw new Error("Invalid response format");
        }

    } catch (error) {
        console.error("AI Error:", error);
        const loader = document.getElementById("ai-loading-msg");
        if(loader) loader.remove();
        
        const aiDiv = document.createElement("div");
        aiDiv.className = "message ai-message";
        aiDiv.textContent = "Samahani mkuu, KITENGO AI NIPO KWENYE MABORESHO KWA SASA. Jaribu tena baadae! Kosa: " + error.message;
        messagesContainer.appendChild(aiDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
}
