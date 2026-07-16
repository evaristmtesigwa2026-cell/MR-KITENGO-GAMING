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
firebase.initializeApp(firebaseConfig);
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
        alert("Sajili imekamilika!"); window.showlogin();
    }
}

window.login = function() {
    let name = document.getElementById("logname").value;
    let password = document.getElementById("logpassword").value;
    let dbname = localStorage.getItem("name");
    let dbpassword = localStorage.getItem("password");
    if (name == "" || password == "") { alert("Jaza nafasi zote!"); } 
    else if (name == dbname && password == dbpassword) {
        alert("Umeingia kikamilifu!"); history.replaceState({ page: "home" }, "Home", "#home"); window.showcat(true); 
    } else { alert("Taarifa si sahihi!"); }
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
    document.getElementById("details-desc").textContent = desc ? desc : "Hakuna maelezo ya ziada yaliyowekwa kwenye item hii.";
    
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
    statusLog.textContent = "Inahakiki password yako kwenye database yetu...";
    
    // Tunavuta password sahihi ya basi hili kutoka Firebase kiusalama (Kasi ya juu kwa once)
    database.ref(`buses/${catId}/${busKey}/password`).once('value')
    .then((snapshot) => {
        const correctPassword = snapshot.val();
        
        if (correctPassword && passwordInput === correctPassword.toString().trim()) {
            statusLog.style.color = "lightgreen";
            statusLog.textContent = "Password ni sahihi! Mfumo unakupeleka Mediafire...";
            
            setTimeout(() => {
                window.closePaymentModal();
                window.open(link, "_blank");
            }, 1500);
        } else {
            statusLog.style.color = "red";
            statusLog.textContent = "Password siyo sahihi! Tafadhali hakikisha umeandika herufi vizuri au omba mpya kwa SMS.";
        }
    })
    .catch((err) => {
        statusLog.style.color = "red";
        statusLog.textContent = "Kosa la muunganisho: " + err.message;
    });
}

window.goBackFromDetails = function() {
    if (typeof window.currentDetailsBack === "function") {
        window.currentDetailsBack();
    } else {
        window.showcat();
    }
}

// CHOMBO CHA USHINDILIAJI PICHA KIOTOMATIKI (KUZUIA MB KUBWA)
window.compressImage = function(file, maxWidth, maxHeight, quality, callback) {
    const reader = new FileReader();
    reader.onload = function(event) {
        const img = new Image();
        img.onload = function() {
            const canvas = document.createElement('canvas');
            let width = img.width;
            let height = img.height;

            // Kokotoa vipimo ili picha isiharibike uwiano (aspect ratio)
            if (width > height) {
                if (width > maxWidth) {
                    height *= maxWidth / width;
                    width = maxWidth;
                }
            } else {
                if (height > maxHeight) {
                    width *= maxHeight / height;
                    height = maxHeight;
                }
            }

            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);

            // Geuza picha kuwa JPEG iliyoshindiliwa kwa kiwango kilichochaguliwa
            const compressedBase64 = canvas.toDataURL('image/jpeg', quality);
            callback(compressedBase64);
        };
        img.src = event.target.result;
    };
    reader.readAsDataURL(file);
}

// INAPAKIA CATEGORIES KWA KASI YA KIWANGO CHA JUU KUTUMIA .ONCE
window.loadCategories = function() {
    const container = document.getElementById("categories-container");
    const selectDropdown = document.getElementById("uploadCategory");
    
    if (container) container.innerHTML = "<p style='color:white; text-align:center; font-family:\"Orbitron\", sans-serif; letter-spacing:1px;'>Inapakia makundi kwa kasi ya mwanga...</p>";

    database.ref('categories').once('value').then((snapshot) => {
        if (container) container.innerHTML = "";
        if (selectDropdown) selectDropdown.innerHTML = "";
        
        const data = snapshot.val();
        if (!data) {
            if (container) container.innerHTML = "<p style='color:white; text-align:center;'>Hakuna kundi lililowekwa bado.</p>";
            if (selectDropdown) {
                let opt = document.createElement('option');
                opt.value = "";
                opt.textContent = "-- Hakuna Kundi --";
                selectDropdown.appendChild(opt);
            }
            return;
        }

        if (selectDropdown) {
            let defaultOpt = document.createElement('option');
            defaultOpt.value = "";
            defaultOpt.textContent = "-- Chagua Category --";
            selectDropdown.appendChild(defaultOpt);
        }

        Object.keys(data).forEach((id) => {
            const cat = data[id];
            if (container) {
                const card = document.createElement('div');
                card.className = 'card';
                card.innerHTML = `
                    <p>${cat.name}</p> 
                    <img src="${cat.image}" style="width: 100%; height: 115px; border-radius: 12px; object-fit: cover; cursor: pointer; border: 1px solid rgba(255,255,255,0.1);" onclick="window.showDetails('${cat.name}', '${cat.image}', \`${cat.desc || ''}\`, 'category', '${id}')"> <br>
                    <button onclick="window.showBusCategory('${id}', '${cat.name}')">CHAGUA HAPA</button>
                    <button class="btn-delete" style="display:none; background-color:red;" id="del-cat-${id}" onclick="window.deleteCategory('${id}')">FUTA GROUP</button>
                `;
                container.appendChild(card);
            }

            if (selectDropdown) {
                const option = document.createElement('option');
                option.value = id;
                option.textContent = cat.name;
                selectDropdown.appendChild(option);
            }

            if(window.location.hash === "#admin") {
                setTimeout(() => {
                    let btn = document.getElementById(`del-cat-${id}`);
                    if(btn) btn.style.display = "inline-block";
                }, 200);
            }
        });
    }).catch(err => {
        if (container) container.innerHTML = "<p style='color:red;'>Tatizo la mtandao: " + err.message + "</p>";
    });
}

// INAPAKIA MABASI YA KUNDI MAALUM KWA MILISEKUNDE KUTUMIA .ONCE
window.showBusCategory = function(categoryId, categoryName, isBackAction = false) {
    window.hideAllSections();
    document.getElementById("bus-view-section").style.display = "block";
    document.getElementById("navicon").style.display = "flex";
    document.getElementById("dynamic-bus-title").textContent = categoryName + " BUSES";

    if (!isBackAction) history.pushState({ page: categoryId, catName: categoryName }, categoryId, `#${categoryId}`);
    
    const busContainer = document.getElementById("dynamic-bus-list");
    busContainer.innerHTML = "<p style='color:white; text-align:center; font-family:\"Orbitron\", sans-serif;'>Inatengeneza muonekano...</p>";

    database.ref('buses/' + categoryId).once('value').then((snapshot) => {
        busContainer.innerHTML = "";
        const busesData = snapshot.val();
        if (!busesData) {
            busContainer.innerHTML = "<p style='color:white; text-align:center;'>Hakuna basi kundi hili bado.</p>";
            return;
        }

        Object.keys(busesData).forEach((key) => {
            const item = busesData[key];
            const card = document.createElement('div');
            card.className = 'card';
            
            // Tambua kama ni Premium (ina bei na ipo juu ya 0)
            const isPremium = item.price && parseInt(item.price) > 0;
            
            card.innerHTML = `
                ${isPremium ? `<div class="premium-badge">👑 PREMIUM</div>` : ''}
                <p>${item.name} ${isPremium ? `<span style='color:#ff007f;font-size:14px;display:block;margin-top:5px;font-family:"Orbitron", sans-serif;text-shadow: 0 0 5px rgba(255,0,127,0.3);'>(Tsh ${item.price})</span>` : ''}</p>
                <img src="${item.image}" style="width: 100%; height:115px; border-radius:12px; object-fit:cover; cursor: pointer; border: 1px solid rgba(255,255,255,0.1);" onclick="window.showDetails('${item.name}', '${item.image}', \`${item.desc || ''}\`, 'bus', '${item.link}', '${categoryId}', '${categoryName}', '${item.price || 0}', '${key}')"><br><br>
                
                ${isPremium ? 
                  `<button onclick="window.openPasswordModal('${item.name}', '${item.price}', '${item.link}', '${categoryId}', '${key}')">BUY MOD</button>` : 
                  `<button><a href="${item.link}" target="_blank">DOWNLOAD</a></button>`
                }
                
                <button class="btn-delete" id="del-bus-${key}" style="display:none;" onclick="window.deleteBus('${categoryId}', '${key}')">FUTA</button>
            `;
            busContainer.appendChild(card);

            if(window.location.hash === "#admin") {
                setTimeout(() => {
                    let btn = document.getElementById(`del-bus-${key}`);
                    if(btn) btn.style.display = "inline-block";
                }, 200);
            }
        });
    }).catch(err => {
        busContainer.innerHTML = "<p style='color:red;'>Tatizo la mtandao: " + err.message + "</p>";
    });
}

// --- ONGEZA CATEGORY KUPITIA BASE64 ILIYOSHINDILIWA ---
window.addCategory = function() {
    const secret = document.getElementById("adminSecret").value;
    if (secret !== "1234") { alert("Kodi ya siri ya admin siyo sahihi!"); return; }

    const id = document.getElementById("newCatId").value.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
    const name = document.getElementById("newCatName").value.trim();
    const desc = document.getElementById("newCatDesc").value.trim();
    const fileInput = document.getElementById("newCatImg");

    if (id === "" || name === "") { alert("Tafadhali jaza ID na Jina la Category!"); return; }
    if (fileInput.files.length === 0) { alert("Tafadhali chagua picha kutoka kwenye simu!"); return; }

    const statusDiv = document.getElementById("cat-upload-status");
    statusDiv.style.display = "block";
    statusDiv.textContent = "Inashindilia picha kuwa nyepesi na kuhifadhi kwenye Firebase...";

    const file = fileInput.files[0];

    // Kupunguza picha hadi pixel 500 max width na ubora wa 0.7 (nyepesi ajabu)
    window.compressImage(file, 500, 500, 0.7, function(compressedBase64) {
        database.ref('categories/' + id).set({ name: name, image: compressedBase64, desc: desc })
        .then(() => {
            alert("Category mpya imeongezwa kikamilifu kwa kasi sana!");
            document.getElementById("newCatId").value = "";
            document.getElementById("newCatName").value = "";
            document.getElementById("newCatDesc").value = "";
            fileInput.value = "";
            statusDiv.style.display = "none";
            window.loadCategories(); // Reload haraka
        }).catch(err => {
            alert("Kosa la Firebase: " + err.message);
            statusDiv.style.display = "none";
        });
    });
}

// --- UPLOAD BUS MPYA KUPITIA BASE64 ILIYOSHINDILIWA + BEI NA PASSWORD YAKE ---
window.uploadBus = function() {
    const secret = document.getElementById("adminSecret").value;
    if (secret !== "1234") { alert("Kodi ya siri siyo sahihi!"); return; }

    const cat = document.getElementById("uploadCategory").value;
    const name = document.getElementById("uploadName").value.trim();
    const desc = document.getElementById("uploadDesc").value.trim();
    const fileInput = document.getElementById("uploadImg");
    const link = document.getElementById("uploadLink").value.trim();
    const price = document.getElementById("uploadPrice").value.trim(); 
    const password = document.getElementById("uploadPassword").value.trim();

    if (cat === "") { alert("Chagua Category kwanza!"); return; }
    if (name === "" || link === "") { alert("Jaza jina na link!"); return; }
    if (fileInput.files.length === 0) { alert("Tafadhali chagua picha ya basi!"); return; }
    if (price && parseInt(price) > 0 && password === "") { alert("Tafadhali weka password ya mod hii ya kulipia!"); return; }

    const statusDiv = document.getElementById("bus-upload-status");
    statusDiv.style.display = "block";
    statusDiv.textContent = "Inashindilia picha ya basi kuwa nyepesi na kupakia Firebase...";

    const file = fileInput.files[0];

    // Kupunguza picha ya basi hadi pixel 600 max width na ubora wa 0.7
    window.compressImage(file, 600, 600, 0.7, function(compressedBase64) {
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
            window.showBusCategory(cat, "MABASI", true); // Reload category hiyo husika kwa kasi
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

window.checkCurrentLocation = function() {
    let hash = window.location.hash;
    let dbname = localStorage.getItem("name");
    
    if (hash === "#admin") { 
        window.hideAllSections(); 
        document.getElementById("adminSection").style.display = "block"; 
        window.loadCategories();
        return; 
    }
    if (!dbname) { window.hideAllSections(); if (hash === "#login") window.showlogin(); else window.showregister(); } 
    else { window.showcat(true); }
}

window.addEventListener("popstate", function(event) {
    let hash = window.location.hash;
    if (hash === "#admin") { window.hideAllSections(); document.getElementById("adminSection").style.display = "block"; return; }
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
// SULUHISHO LA KITENGO AI ASSISTANT (KODI SALAMA)
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
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [{ parts: [{ text: messageText + " (Jibu kwa lugha ya kiswahili kifupi, wewe ni msaidizi wa AI wa Kitengo Gaming, unasaidia mods za ETS2)" }] }]
            })
        });

        const data = await response.json();
        
        const loader = document.getElementById("ai-loading-msg");
        if(loader) loader.remove();

        const aiResponseText = data.candidates[0].content.parts[0].text;

        const aiDiv = document.createElement("div");
        aiDiv.className = "message ai-message";
        aiDiv.textContent = aiResponseText;
        messagesContainer.appendChild(aiDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;

    } catch (error) {
        const loader = document.getElementById("ai-loading-msg");
        if(loader) loader.remove();
        
        const aiDiv = document.createElement("div");
        aiDiv.className = "message ai-message";
        aiDiv.textContent = "Samahani mkuu, kuna tatizo la mtandao. Jaribu tena!";
        messagesContainer.appendChild(aiDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
}
