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

// LOGIC MPYA YA KUONESHA PICHA NA MAELEZO YA NDANI (POPUP / DETAILS ENGINE)
window.showDetails = function(title, image, desc, type, targetLinkOrId, currentCatId = '', currentCatName = '') {
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
        let a = document.createElement("a");
        a.href = targetLinkOrId;
        a.target = "_blank";
        a.textContent = "DOWNLOAD NOW";
        btn.appendChild(a);
        btnContainer.appendChild(btn);
        
        window.currentDetailsBack = function() { window.showBusCategory(currentCatId, currentCatName); };
    }
}

window.goBackFromDetails = function() {
    if (typeof window.currentDetailsBack === "function") {
        window.currentDetailsBack();
    } else {
        window.showcat();
    }
}

window.loadCategories = function() {
    const container = document.getElementById("categories-container");
    const selectDropdown = document.getElementById("uploadCategory");
    
    database.ref('categories').on('value', (snapshot) => {
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
                    <img src="${cat.image}" style="width: 180px; height: 110px; border-radius: 10px; object-fit: cover; cursor: pointer;" onclick="window.showDetails('${cat.name}', '${cat.image}', \`${cat.desc || ''}\`, 'category', '${id}')"> <br>
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
    });
}

window.showBusCategory = function(categoryId, categoryName, isBackAction = false) {
    window.hideAllSections();
    document.getElementById("bus-view-section").style.display = "block";
    document.getElementById("navicon").style.display = "flex";
    document.getElementById("dynamic-bus-title").textContent = categoryName + " BUSES";

    if (!isBackAction) history.pushState({ page: categoryId, catName: categoryName }, categoryId, `#${categoryId}`);
    
    const busContainer = document.getElementById("dynamic-bus-list");
    busContainer.innerHTML = "<p style='color:white; text-align:center;'>Inapakia...</p>";

    database.ref('buses/' + categoryId).on('value', (snapshot) => {
        busContainer.innerHTML = "";
        const busesData = snapshot.val();
        if (!busesData) {
            busContainer.innerHTML = "<p style='color:white; text-align:center;'>Hakuna basi kundi hili.</p>";
            return;
        }

        Object.keys(busesData).forEach((key) => {
            const item = busesData[key];
            const card = document.createElement('div');
            card.className = 'card';
            card.innerHTML = `
                <p>${item.name}</p>
                <img src="${item.image}" style="width: 180px; height:110px; border-radius:10px; object-fit:cover; cursor: pointer;" onclick="window.showDetails('${item.name}', '${item.image}', \`${item.desc || ''}\`, 'bus', '${item.link}', '${categoryId}', '${categoryName}')"><br><br>
                <button><a href="${item.link}" target="_blank">DOWNLOAD</a></button>
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
    });
}

// --- ONGEZA CATEGORY KUPITIA BASE64 + MAELEZO MAALUM ---
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
    statusDiv.textContent = "Inahifadhi picha moja kwa moja kwenye Firebase...";

    const file = fileInput.files[0];
    const reader = new FileReader();

    reader.onloadend = function() {
        const base64Image = reader.result;
        
        database.ref('categories/' + id).set({ name: name, image: base64Image, desc: desc })
        .then(() => {
            alert("Category mpya imeongezwa kikamilifu!");
            document.getElementById("newCatId").value = "";
            document.getElementById("newCatName").value = "";
            document.getElementById("newCatDesc").value = "";
            fileInput.value = "";
            statusDiv.style.display = "none";
        }).catch(err => {
            alert("Kosa la Firebase: " + err.message);
            statusDiv.style.display = "none";
        });
    };

    reader.readAsDataURL(file);
}

// --- UPLOAD BUS MPYA KUPITIA BASE64 + MAELEZO MAALUM ---
window.uploadBus = function() {
    const secret = document.getElementById("adminSecret").value;
    if (secret !== "1234") { alert("Kodi ya siri siyo sahihi!"); return; }

    const cat = document.getElementById("uploadCategory").value;
    const name = document.getElementById("uploadName").value.trim();
    const desc = document.getElementById("uploadDesc").value.trim();
    const fileInput = document.getElementById("uploadImg");
    const link = document.getElementById("uploadLink").value.trim();

    if (cat === "") { alert("Chagua Category kwanza!"); return; }
    if (name === "" || link === "") { alert("Jaza jina na link!"); return; }
    if (fileInput.files.length === 0) { alert("Tafadhali chagua picha ya basi!"); return; }

    const statusDiv = document.getElementById("bus-upload-status");
    statusDiv.style.display = "block";
    statusDiv.textContent = "Inapakia basi na picha kwenye Firebase...";

    const file = fileInput.files[0];
    const reader = new FileReader();

    reader.onloadend = function() {
        const base64Image = reader.result;
        
        const newBusRef = database.ref('buses/' + cat).push();
        newBusRef.set({ name: name, image: base64Image, link: link, desc: desc })
        .then(() => {
            alert("Basi jipya limeongezwa kwa mafanikio!");
            document.getElementById("uploadName").value = "";
            document.getElementById("uploadDesc").value = "";
            document.getElementById("uploadLink").value = "";
            fileInput.value = "";
            statusDiv.style.display = "none";
        }).catch(err => {
            alert("Kosa la Firebase: " + err.message);
            statusDiv.style.display = "none";
        });
    };

    reader.readAsDataURL(file);
}

window.deleteCategory = function(categoryId) {
    if (!categoryId) { alert("Weka ID ya category unayotaka kuifuta."); return; }
    if(confirm("Je, una uhakika unataka kufuta GROUP la '" + categoryId + "' na kila kitu chake?")) {
        database.ref('categories/' + categoryId).remove()
        .then(() => { 
            database.ref('buses/' + categoryId).remove(); 
            alert("Vimefutwa!"); 
        }).catch(err => alert("Kosa: " + err.message));
    }
}

window.clearEntireDatabase = function() {
    const secret = document.getElementById("adminSecret").value;
    if (secret !== "1234") { alert("Kodi ya siri ya admin siyo sahihi!"); return; }

    let confirmationText = prompt("ONYO KALI: Hii itafuta Categories zote na Mabasi yote!\n\nKama una uhakika, andika neno FUTA:");
    if (confirmationText === "FUTA") {
        database.ref().remove()
        .then(() => alert("Database yote imesafishwa!"))
        .catch(err => alert("Kosa: " + err.message));
    } else { alert("Zoezi limesitishwa."); }
}

window.deleteBus = function(category, key) {
    if(confirm("Unataka kufuta basi hili?")) {
        database.ref('buses/' + category + '/' + key).remove()
        .then(() => alert("Basi limefutwa!"))
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
// SULUHISHO LA KITENGO AI ASSISTANT (KODI MPYA YENYE KEY YAKO SAHIHI)
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

    // Weka ujumbe wa mtumiaji kwenye skrini
    const userDiv = document.createElement("div");
    userDiv.className = "message user-message";
    userDiv.textContent = messageText;
    messagesContainer.appendChild(userDiv);

    inputEl.value = "";
    messagesContainer.scrollTop = messagesContainer.scrollHeight;

    // Weka ujumbe wa 'Inafikiria...'
    const loadingDiv = document.createElement("div");
    loadingDiv.className = "message ai-message";
    loadingDiv.id = "ai-loading-msg";
    loadingDiv.textContent = "Kitengo AI inafikiria...";
    messagesContainer.appendChild(loadingDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;

    try {
        // Kuunganisha na Google Gemini Live Engine API
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [{ parts: [{ text: messageText + " (Jibu kwa lugha ya kiswahili kifupi, wewe ni msaidizi wa AI wa Kitengo Gaming, unasaidia mods za ETS2)" }] }]
            })
        });

        const data = await response.json();
        
        // Futa lile neno la loading
        const loader = document.getElementById("ai-loading-msg");
        if(loader) loader.remove();

        const aiResponseText = data.candidates[0].content.parts[0].text;

        // Onyesha jibu la Kitengo AI
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
