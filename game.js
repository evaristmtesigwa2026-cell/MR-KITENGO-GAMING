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

let currentOpenCategoryId = "";
let currentOpenCategoryName = "";
let currentOpenModId = "";

window.hideAllSections = function() {
    const sections = ["cat", "bus-view-section", "single-mod-section", "log", "reg", "adminSection"];
    sections.forEach(id => {
        let el = document.getElementById(id);
        if (el) el.style.display = "none";
    });
    document.getElementById("navicon").style.display = "none";
    document.getElementById("main-search-bar").style.display = "none";
}

window.showlogin = function() { window.hideAllSections(); document.getElementById("log").style.display = "block"; }
window.showregister = function() { window.hideAllSections(); document.getElementById("reg").style.display = "block"; }

window.logout = function() {
    localStorage.clear();
    alert("Umetoka kwenye akaunti!");
    window.showlogin();
}

window.register = function() {
    let name = document.getElementById("regname").value.trim();
    let email = document.getElementById("regemail").value.trim();
    let password = document.getElementById("regpassword").value.trim();
    if (name == "" || email == "" || password == "") { alert("Jaza nafasi zote!"); } 
    else { 
        localStorage.setItem("name", name); localStorage.setItem("email", email); localStorage.setItem("password", password);
        alert("Sajili imekamilika!"); window.showlogin();
    }
}

window.login = function() {
    let name = document.getElementById("logname").value.trim();
    let password = document.getElementById("logpassword").value.trim();
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
    document.getElementById("main-search-bar").style.display = "block";
    document.getElementById("searchInput").value = "";
    if (!isBackAction) history.pushState({ page: "home" }, "Home", "#home");
    window.loadCategories();
}

// --- SEARCH FILTER METHODO ---
window.filterItems = function() {
    let input = document.getElementById("searchInput").value.toLowerCase();
    let cards = document.querySelectorAll(".cat-grid .card");
    
    cards.forEach(card => {
        let title = card.querySelector(".card-title").textContent.toLowerCase();
        if(title.includes(input)) {
            card.style.display = "flex";
        } else {
            card.style.display = "none";
        }
    });
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
                    <div class="card-img-wrapper">
                        <img src="${cat.image}">
                    </div>
                    <div class="card-content">
                        <div class="card-title">${cat.name}</div>
                        <button onclick="window.showBusCategory('${id}', '${cat.name}')">FUNGUA MODS</button>
                        <button class="btn-delete" style="display:none;" id="del-cat-${id}" onclick="window.deleteCategory('${id}')">FUTA GROUP</button>
                    </div>
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
    currentOpenCategoryId = categoryId;
    currentOpenCategoryName = categoryName;

    window.hideAllSections();
    document.getElementById("bus-view-section").style.display = "block";
    document.getElementById("navicon").style.display = "flex";
    document.getElementById("main-search-bar").style.display = "block";
    document.getElementById("searchInput").value = "";
    document.getElementById("dynamic-bus-title").textContent = categoryName + " BUSES";

    if (!isBackAction) history.pushState({ page: categoryId, catName: categoryName }, categoryId, `#${categoryId}`);
    
    const busContainer = document.getElementById("dynamic-bus-list");
    busContainer.innerHTML = "<p style='color:white; text-align:center;'>Inapakia mabasi...</p>";

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
                <div class="card-img-wrapper">
                    <img src="${item.image}">
                </div>
                <div class="card-content">
                    <div class="card-title">${item.name}</div>
                    <button onclick="window.openSingleMod('${categoryId}', '${key}')">TAZAMA / DOWNLOAD</button>
                    <button class="btn-delete" id="del-bus-${key}" style="display:none;" onclick="window.deleteBus('${categoryId}', '${key}')">FUTA</button>
                </div>
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

// --- UKURASA MPYA MAALUM WA NDANI YA MOD (Single Mod View) ---
window.openSingleMod = function(categoryId, modId) {
    currentOpenCategoryId = categoryId;
    currentOpenModId = modId;

    window.hideAllSections();
    document.getElementById("single-mod-section").style.display = "block";
    document.getElementById("navicon").style.display = "flex";

    database.ref('buses/' + categoryId + '/' + modId).on('value', (snapshot) => {
        const item = snapshot.val();
        if(!item) return;

        document.getElementById("single-mod-title").textContent = item.name;
        document.getElementById("single-mod-img").src = item.image;
        document.getElementById("single-mod-link").href = item.link;

        // Pakia Votes (Likes/Dislikes)
        let likes = item.likes ? Object.keys(item.likes).length : 0;
        let dislikes = item.dislikes ? Object.keys(item.dislikes).length : 0;
        document.getElementById("like-count").textContent = likes;
        document.getElementById("dislike-count").textContent = dislikes;
    });

    // Pakia Maoni (Comments)
    window.loadComments(categoryId, modId);
}

window.goBackToCategory = function() {
    window.showBusCategory(currentOpenCategoryId, currentOpenCategoryName);
}

// --- MFUMO WA KUPIGA KURA (Votes API) ---
window.voteMod = function(type) {
    let username = localStorage.getItem("name") || "Anoymous";
    let cleanUserKey = username.replace(/[^a-zA-Z0-9]/g, "");

    if(type === 'like') {
        database.ref('buses/' + currentOpenCategoryId + '/' + currentOpenModId + '/likes/' + cleanUserKey).set(true);
        database.ref('buses/' + currentOpenCategoryId + '/' + currentOpenModId + '/dislikes/' + cleanUserKey).remove();
    } else {
        database.ref('buses/' + currentOpenCategoryId + '/' + currentOpenModId + '/dislikes/' + cleanUserKey).set(true);
        database.ref('buses/' + currentOpenCategoryId + '/' + currentOpenModId + '/likes/' + cleanUserKey).remove();
    }
}

// --- MFUMO WA MAONI (Comments Engine) ---
window.postComment = function() {
    let textarea = document.getElementById("commentInput");
    let text = textarea.value.trim();
    let username = localStorage.getItem("name") || "Mtumiaji";

    if(text === "") { alert("Andika kitu kwanza mkuu!"); return; }

    let commentData = {
        user: username,
        text: text,
        timestamp: firebase.database.ServerValue.TIMESTAMP
    };

    database.ref('comments/' + currentOpenModId).push(commentData)
    .then(() => {
        textarea.value = "";
    });
}

window.loadComments = function(categoryId, modId) {
    const list = document.getElementById("comments-list");
    database.ref('comments/' + modId).on('value', (snapshot) => {
        list.innerHTML = "";
        const data = snapshot.val();
        if(!data) {
            list.innerHTML = "<p style='color:gray; text-align:left; padding:0;'>Hakuna maoni bado. Kuwa wa kwanza kutoa maoni!</p>";
            return;
        }
        Object.keys(data).forEach(key => {
            let c = data[key];
            let div = document.createElement('div');
            div.className = 'comment-box';
            div.innerHTML = `
                <div class="comment-user"><i class="fa-solid fa-user"></i> ${c.user}</div>
                <p class="comment-text">${c.text}</p>
            `;
            list.appendChild(div);
        });
    });
}

// --- ONGEZA CATEGORY KUPITIA BASE64 ---
window.addCategory = function() {
    const secret = document.getElementById("adminSecret").value;
    if (secret !== "1234") { alert("Kodi ya siri ya admin siyo sahihi!"); return; }

    const id = document.getElementById("newCatId").value.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
    const name = document.getElementById("newCatName").value.trim();
    const fileInput = document.getElementById("newCatImg");

    if (id === "" || name === "") { alert("Tafadhali jaza ID na Jina la Category!"); return; }
    if (fileInput.files.length === 0) { alert("Tafadhali chagua picha kutoka kwenye simu!"); return; }

    const statusDiv = document.getElementById("cat-upload-status");
    statusDiv.style.display = "block";
    statusDiv.textContent = "Inapakia kundi jipya...";

    const file = fileInput.files[0];
    const reader = new FileReader();

    reader.onloadend = function() {
        const base64Image = reader.result;
        database.ref('categories/' + id).set({ name: name, image: base64Image })
        .then(() => {
            alert("Category mpya imeongezwa!");
            document.getElementById("newCatId").value = "";
            document.getElementById("newCatName").value = "";
            fileInput.value = "";
            statusDiv.style.display = "none";
        }).catch(err => {
            alert("Kosa: " + err.message);
            statusDiv.style.display = "none";
        });
    };
    reader.readAsDataURL(file);
}

// --- UPLOAD BUS MPYA KUPITIA BASE64 ---
window.uploadBus = function() {
    const secret = document.getElementById("adminSecret").value;
    if (secret !== "1234") { alert("Kodi ya siri siyo sahihi!"); return; }

    const cat = document.getElementById("uploadCategory").value;
    const name = document.getElementById("uploadName").value.trim();
    const fileInput = document.getElementById("uploadImg");
    const link = document.getElementById("uploadLink").value.trim();

    if (cat === "") { alert("Chagua Category kwanza!"); return; }
    if (name === "" || link === "") { alert("Jaza jina na link!"); return; }
    if (fileInput.files.length === 0) { alert("Tafadhali chagua picha ya basi!"); return; }

    const statusDiv = document.getElementById("bus-upload-status");
    statusDiv.style.display = "block";
    statusDiv.textContent = "Inapakia basi jipya...";

    const file = fileInput.files[0];
    const reader = new FileReader();

    reader.onloadend = function() {
        const base64Image = reader.result;
        const newBusRef = database.ref('buses/' + cat).push();
        newBusRef.set({ name: name, image: base64Image, link: link })
        .then(() => {
            alert("Basi jipya limeongezwa!");
            document.getElementById("uploadName").value = "";
            document.getElementById("uploadLink").value = "";
            fileInput.value = "";
            statusDiv.style.display = "none";
        }).catch(err => {
            alert("Kosa: " + err.message);
            statusDiv.style.display = "none";
        });
    };
    reader.readAsDataURL(file);
}

window.deleteCategory = function(categoryId) {
    if (!categoryId) { alert("Weka ID ya category."); return; }
    if(confirm("Je, una uhakika unataka kufuta group hili?")) {
        database.ref('categories/' + categoryId).remove()
        .then(() => { 
            database.ref('buses/' + categoryId).remove(); 
            alert("Vimefutwa!"); 
        });
    }
}

window.clearEntireDatabase = function() {
    const secret = document.getElementById("adminSecret").value;
    if (secret !== "1234") { alert("Kodi ya siri ya admin siyo sahihi!"); return; }
    if (confirm("Je, una uhakika unataka kufuta database nzima?")) {
        database.ref().remove().then(() => alert("Kila kitu kimefutwa!"));
    }
}

window.deleteBus = function(category, key) {
    if(confirm("Unataka kufuta basi hili?")) {
        database.ref('buses/' + category + '/' + key).remove()
        .then(() => alert("Basi limefutwa!"));
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

window.addEventListener("DOMContentLoaded", () => {
    window.checkCurrentLocation();
});
