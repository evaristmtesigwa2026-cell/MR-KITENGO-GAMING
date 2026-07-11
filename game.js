// USANIDI WA FIREBASE (Msisi Project)
const firebaseConfig = {
  apiKey: "AIzaSyDA0ty5dOoBiPJx5fRdFI_hvddJyUbb6B4",
  authDomain: "msisi-38c20.firebaseapp.com",
  projectId: "msisi-38c20",
  storageBucket: "msisi-38c20.firebasestorage.app",
  messagingSenderId: "881060609707",
  appId: "1:881060609707:web:bd9028db2b20c75d72c1ee",
  measurementId: "G-NFT0FB6V2T"
};

// Kuanzisha Firebase Compat
firebase.initializeApp(firebaseConfig);
const database = firebase.database();

// --- PELEKA FUNCTIONS KWENYE WINDOW ILI ONCLICK ISOMEKE ---
window.hideAllSections = function() {
    const sections = ["cat", "bus-view-section", "log", "reg", "adminSection"];
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

// --- KUSIKILIZA DYNAMIC CATEGORIES TOKA FIREBASE ---
window.loadCategories = function() {
    const container = document.getElementById("categories-container");
    const selectDropdown = document.getElementById("uploadCategory");
    
    database.ref('categories').on('value', (snapshot) => {
        if (container) container.innerHTML = "";
        if (selectDropdown) selectDropdown.innerHTML = "";
        
        const data = snapshot.val();
        if (!data) {
            if (container) container.innerHTML = "<p style='color:white; text-align:center;'>Hakuna kundi lililowekwa bado. Tumia fomu ya admin kuongeza.</p>";
            if (selectDropdown) {
                let opt = document.createElement('option');
                opt.textContent = "-- Hakuna Kundi --";
                selectDropdown.appendChild(opt);
            }
            return;
        }

        Object.keys(data).forEach((id) => {
            const cat = data[id];
            
            // 1. Kadi za Home
            if (container) {
                const card = document.createElement('div');
                card.className = 'card';
                card.innerHTML = `
                    <p>${cat.name}</p> 
                    <img src="${cat.image}" style="width: 180px; height: 110px; border-radius: 10px; object-fit: cover;"> <br>
                    <button onclick="window.showBusCategory('${id}', '${cat.name}')">CHAGUA HAPA</button>
                    <button class="btn-delete" style="display:none; background-color:red;" id="del-cat-${id}" onclick="window.deleteCategory('${id}')">FUTA GROUP</button>
                `;
                container.appendChild(card);
            }

            // 2. Dropdown ya Admin Panel (HAPA NDIPO PANAPOREKEBIHA SHIDA YAKO)
            if (selectDropdown) {
                const option = document.createElement('option');
                option.value = id;
                option.textContent = cat.name;
                selectDropdown.appendChild(option);
            }

            // Kama tupo Admin, onyesha vitufe vya kufuta
            if(window.location.hash === "#admin") {
                setTimeout(() => {
                    let btn = document.getElementById(`del-cat-${id}`);
                    if(btn) btn.style.display = "inline-block";
                }, 200);
            }
        });
    });
}

// --- ONYESHA MABASI YA KUNDI MAALUM ---
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
                <img src="${item.image}" style="width: 180px; height:110px; border-radius:10px; object-fit:cover;"><br><br>
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

// --- USIMAMIZI WA ADMIN (ADD / DELETE) ---
window.addCategory = function() {
    const secret = document.getElementById("adminSecret").value;
    if (secret !== "1234") { alert("Kodi siyo sahihi!"); return; }

    const id = document.getElementById("newCatId").value.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
    const name = document.getElementById("newCatName").value.trim();
    const img = document.getElementById("newCatImg").value.trim();

    if (id === "" || name === "" || img === "") { alert("Jaza nafasi zote!"); return; }

    database.ref('categories/' + id).set({ name: name, image: img })
    .then(() => {
        alert("Group jipya limeongezwa!");
        document.getElementById("newCatId").value = "";
        document.getElementById("newCatName").value = "";
        document.getElementById("newCatImg").value = "";
    }).catch(err => alert("Kosa: " + err.message));
}

window.deleteCategory = function(categoryId) {
    if(confirm("Futa GROUP hili na mabasi yake yote?")) {
        database.ref('categories/' + categoryId).remove()
        .then(() => { database.ref('buses/' + categoryId).remove(); alert("Group limefutwa!"); })
        .catch(err => alert("Imeshindwa: " + err.message));
    }
}

window.uploadBus = function() {
    const secret = document.getElementById("adminSecret").value;
    if (secret !== "1234") { alert("Kodi siyo sahihi!"); return; }

    const cat = document.getElementById("uploadCategory").value;
    const name = document.getElementById("uploadName").value.trim();
    const img = document.getElementById("uploadImg").value.trim();
    const link = document.getElementById("uploadLink").value.trim();

    if (cat === "" || cat === "-- Hakuna Kundi --") { alert("Tafadhali tengeneza/chagua Category kwanza!"); return; }
    if (name === "" || img === "" || link === "") { alert("Jaza nafasi zote!"); return; }

    const newBusRef = database.ref('buses/' + cat).push();
    newBusRef.set({ name: name, image: img, link: link })
    .then(() => {
        alert("Basi limeongezwa kikamilifu!");
        document.getElementById("uploadName").value = "";
        document.getElementById("uploadImg").value = "";
        document.getElementById("uploadLink").value = "";
    }).catch(err => alert("Kosa: " + err.message));
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
    
    if (hash === "#admin") { window.hideAllSections(); document.getElementById("adminSection").style.display = "block"; return; }
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
