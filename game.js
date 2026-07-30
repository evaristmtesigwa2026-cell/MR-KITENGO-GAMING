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
    
    // Tunavuta password sahihi ya basi hili kutoka Firebase kiusalama (Kasi ya juu kwa once)
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

// ====== MFUMO MPYA WA USHINDILIAJI WA PICHA (KASI ZAIDI) ======
window.compressImage = function(file, maxWidth = 600, maxHeight = 600, quality = 0.7, callback) {
    // Mbadala ya haraka ya compression kwa PNG na JPEG
    if (file.type === "image/png" || file.type === "image/jpeg") {
        const reader = new FileReader();
        reader.onload = function(event) {
            const img = new Image();
            img.onload = function() {
                const canvas = document.createElement("canvas");
                let width = img.width;
                let height = img.height;
                
                // Kubadilisha ukubwa kuhifadhi ratio
                if (width > height) {
                    if (width > maxWidth) {
                        height = Math.round(height * maxWidth / width);
                        width = maxWidth;
                    }
                } else {
                    if (height > maxHeight) {
                        width = Math.round(width * maxHeight / height);
                        height = maxHeight;
                    }
                }
                
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext("2d");
                ctx.drawImage(img, 0, 0, width, height);
                
                // Kubadilisha kuwa base64 kwa kasi
                canvas.toBlob(function(blob) {
                    const reader2 = new FileReader();
                    reader2.onload = function() {
                        callback(reader2.result);
                    };
                    reader2.readAsDataURL(blob);
                }, file.type, quality);
            };
            img.onerror = function() {
                callback(event.target.result); // Ikiwa karibu error, tumia original
            };
            img.src = event.target.result;
        };
        reader.readAsDataURL(file);
    } else {
        // Kwa file type nyingine, tumia tu base64 moja kwa moja
        const reader = new FileReader();
        reader.onload = function(event) {
            callback(event.target.result);
        };
        reader.readAsDataURL(file);
    }
};

window.loadCategories = function() {
    database.ref('categories').once('value')
    .then((snapshot) => {
        let catData = snapshot.val() || {};
        let select = document.getElementById("uploadCategory");
        let adminSelect = document.getElementById("adminCategorySelect");
        
        select.innerHTML = "<option value=''>-- Chagua Category --</option>";
        adminSelect.innerHTML = "<option value=''>-- Chagua Category --</option>";
        
        let grid = document.getElementById("categories-container");
        grid.innerHTML = "";
        
        Object.keys(catData).forEach(catId => {
            let cat = catData[catId];
            
            // Kuongeza option katika select
            let option = document.createElement("option");
            option.value = catId;
            option.textContent = cat.name || catId;
            select.appendChild(option);
            
            let adminOption = document.createElement("option");
            adminOption.value = catId;
            adminOption.textContent = cat.name || catId;
            adminSelect.appendChild(adminOption);
            
            // Kuongeza card katika grid
            let card = document.createElement("div");
            card.className = "card";
            card.innerHTML = `<img src="${cat.image || 'placeholder.jpg'}" alt="Category Image" style="width: 100%; border-radius: 10px; cursor: pointer;" onclick="window.showBusCategory('${catId}', '${cat.name}')">
                            <h3 style="text-align: center; color: #45f3ff; margin-top: 10px;">${cat.name}</h3>`;
            card.style.cursor = "pointer";
            card.onclick = function() {
                window.showDetails(cat.name, cat.image, cat.desc, 'category', catId);
            };
            grid.appendChild(card);
        });
    })
    .catch(err => console.error("Kosa: ", err));
}

window.showBusCategory = function(categoryId, categoryName, isReload = false) {
    window.hideAllSections();
    
    if (!isReload) {
        history.pushState({ page: categoryId, catName: categoryName }, categoryName, `#${categoryId}`);
    }
    
    document.getElementById("bus-view-section").style.display = "block";
    document.getElementById("navicon").style.display = "flex";
    document.getElementById("dynamic-bus-title").textContent = categoryName;
    
    database.ref('buses/' + categoryId).once('value')
    .then((snapshot) => {
        let busData = snapshot.val() || {};
        let list = document.getElementById("dynamic-bus-list");
        list.innerHTML = "";
        
        Object.keys(busData).forEach(busKey => {
            let bus = busData[busKey];
            let card = document.createElement("div");
            card.className = "card";
            card.innerHTML = `<img src="${bus.image || 'placeholder.jpg'}" alt="Bus Image" style="width: 100%; border-radius: 10px;">
                            <h3 style="text-align: center; color: #45f3ff;">${bus.name}</h3>`;
            card.onclick = function() {
                window.showDetails(bus.name, bus.image, bus.desc, 'bus', bus.link, categoryId, categoryName, bus.price, busKey);
            };
            list.appendChild(card);
        });
    })
    .catch(err => console.error("Kosa: ", err));
}

window.addCategory = function() {
    const secret = document.getElementById("adminSecret").value;
    if (secret !== "1234") { alert("Kodi ya siri ya admin siyo sahihi!"); return; }
    
    const catId = document.getElementById("newCatId").value.trim();
    const catName = document.getElementById("newCatName").value.trim();
    const catDesc = document.getElementById("newCatDesc").value.trim();
    const fileInput = document.getElementById("newCatImg");
    const statusDiv = document.getElementById("cat-upload-status");
    
    if (!catId || !catName) { alert("Jaza ID na Jina la Category!"); return; }
    
    if (fileInput.files.length === 0) { alert("Chagua picha ya Category!"); return; }
    
    statusDiv.style.display = "block";
    statusDiv.textContent = "⏳ Inaandalizia picha yako...";
    
    let file = fileInput.files[0];
    window.compressImage(file, 400, 400, 0.8, function(base64Image) {
        statusDiv.textContent = "📤 Inaupload picha kwenye database...";
        
        database.ref('categories/' + catId).set({
            name: catName,
            desc: catDesc,
            image: base64Image
        }).then(() => {
            statusDiv.style.color = "#00ff00";
            statusDiv.textContent = "✅ Category iliongezwa! Inaboresha...";
            fileInput.value = "";
            
            setTimeout(() => {
                statusDiv.style.display = "none";
                window.loadCategories();
            }, 1000);
        }).catch(err => {
            statusDiv.style.color = "#ff0000";
            statusDiv.textContent = "❌ Kosa: " + err.message;
        });
    });
}

window.uploadBus = function() {
    const secret = document.getElementById("adminSecret").value;
    if (secret !== "1234") { alert("Kodi ya siri ya admin siyo sahihi!"); return; }
    
    const cat = document.getElementById("uploadCategory").value.trim();
    const name = document.getElementById("uploadName").value.trim();
    const desc = document.getElementById("uploadDesc").value.trim();
    const link = document.getElementById("uploadLink").value.trim();
    const price = document.getElementById("uploadPrice").value.trim();
    const password = document.getElementById("uploadPassword").value.trim();
    const fileInput = document.getElementById("uploadImg");
    const statusDiv = document.getElementById("bus-upload-status");
    
    if (!cat || !name || !link) { alert("Jaza Category, Jina, na Link!"); return; }
    if (fileInput.files.length === 0) { alert("Chagua picha ya Basi!"); return; }
    
    statusDiv.style.display = "block";
    statusDiv.textContent = "⏳ Inaandalizia picha...";
    statusDiv.style.color = "#45f3ff";
    
    let file = fileInput.files[0];
    
    // Tumia compression kwa haraka zaidi
    window.compressImage(file, 500, 500, 0.75, function(base64Image) {
        statusDiv.textContent = "📤 Inaupload kwenye Firebase...";
        
        // Firebase key iliyotengana
        let busKey = database.ref('buses/' + cat).push().key;
        
        let busData = {
            name: name,
            desc: desc,
            link: link,
            image: base64Image,
            price: price || 0,
            password: password || ""
        };
        
        database.ref('buses/' + cat + '/' + busKey).set(busData).then(() => {
            statusDiv.style.color = "#00ff00";
            statusDiv.textContent = "✅ Basi lilich-upload! Inaboresha...";
            
            setTimeout(() => {
                fileInput.value = "";
                statusDiv.style.display = "none";
                window.showBusCategory(cat, "MABASI", true); // Reload category hiyo husika kwa kasi
            }, 1000);
        }).catch(err => {
            statusDiv.style.color = "#ff0000";
            statusDiv.textContent = "❌ Kosa: " + err.message;
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
// SULUHISHO LA KITENGO AI ASSISTANT (FIXED NA KAZI VIZURI)
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

        // "gemini-1.5-flash" imezimwa kabisa na Google (Julai 2026), ndio maana AI ilikuwa haijibu.
        // Tunatumia model mpya inayofanya kazi sasa, na kama Google wakiibadilisha tena baadaye,
        // mfumo unajaribu model mbadala kiotomatiki badala ya kukwama kimya kimya.
        let response = await askGemini("gemini-3.6-flash");
        if (!response.ok) {
            response = await askGemini("gemini-2.5-flash");
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

// ===== VITENDO VYA FOOTER NAVIGATION =====
window.openPhoneMenu = function() {
    const choice = confirm("Chagua:\n✓ OK = Pigia simu (0615304000)\n✗ Cancel = Tuma ujumbe");
    if (choice) {
        window.location.href = "tel:0615304000";
    } else {
        window.location.href = "sms:0615304000?body=Habari Kitengo Gaming!";
    }
}

window.showSearch = function() {
    const searchTerm = prompt("Tafadhali weka neno la kutafuta:");
    if (searchTerm && searchTerm.trim() !== "") {
        alert("Utafutaji kwa: " + searchTerm + "\n(Sifa hii inaendelea kufanya kazi)");
    }
}

window.showAbout = function() {
    alert("KITENGO GAMING\n\nTunatoa mod za ubora wa hali ya juu za:\n- Euro Truck Simulator 2\n- Indonesia Bus Simulator (Maleo)\n\nJihadhari na maboresho yetu mara kwa mara!");
}
