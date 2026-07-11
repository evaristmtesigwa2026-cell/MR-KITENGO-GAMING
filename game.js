// KUNGANISHA APP YAKO NA FIREBASE
const firebaseConfig = {
  apiKey: "AIzaSyCA3yQHiJpBaMGoTgGoWed-ZraepLiLfRY",
  authDomain: "kitengo-gaming.firebaseapp.com",
  projectId: "kitengo-gaming",
  storageBucket: "kitengo-gaming.firebasestorage.app",
  messagingSenderId: "634577657147",
  appId: "1:634577657147:web:b60feaded1f01cf5db6b1e",
  measurementId: "G-7B0YKGKT71"
};

// Kuanzisha Firebase
firebase.initializeApp(firebaseConfig);
const database = firebase.database();

function showlogin() {
    hideAllSections();
    document.getElementById("log").style.display = "block";
}

function showregister() {
    hideAllSections();
    document.getElementById("reg").style.display = "block";
}

function register() {
    let name = document.getElementById("regname").value;
    let email = document.getElementById("regemail").value;
    let password = document.getElementById("regpassword").value;
    
    if (name == "" || email == "" || password == "") {
        alert("jaza taarifa zote"); 
    } else { 
        localStorage.setItem("name", name);
        localStorage.setItem("email", email);
        localStorage.setItem("password", password);
        alert("hongera taarifa zimekamilika");
        showlogin();
    }
}

function login() {
    let name = document.getElementById("logname").value;
    let password = document.getElementById("logpassword").value;
    let dbname = localStorage.getItem("name");
    let dbpassword = localStorage.getItem("password");
    
    if (name == "" || password == "") {
        alert("incomplete field");
    } else if (name == dbname && password == dbpassword) {
        alert("login sucsees");
        history.replaceState({ page: "home" }, "Home", "#home");
        showcat(true); 
    } else {
        alert("incorrect details");
    }
}

function hideAllSections() {
    const sections = ["bus-view-section", "log", "reg", "cat", "adminSection"];
    sections.forEach(id => {
        let el = document.getElementById(id);
        if (el) el.style.display = "none"; 
    });
    document.getElementById("navicon").style.display = "none";
}

function showcat(isBackAction = false) {
    let dbname = localStorage.getItem("name");
    if(!dbname) { showregister(); return; }
    hideAllSections();
    document.getElementById("cat").style.display = "block";
    document.getElementById("navicon").style.display = "flex"; 
    if (!isBackAction) history.pushState({ page: "home" }, "Home", "#home");
}

// --- KUVUTA CATEGORIES NA KUZIWEKA HOME & DROPDOWN DYNAMICALLY ---
function loadCategories() {
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
                opt.textContent = "-- Hakuna Category --";
                selectDropdown.appendChild(opt);
            }
            return;
        }

        Object.keys(data).forEach((id) => {
            const cat = data[id];

            // 1. Tengeneza Kadi za Home
            if (container) {
                const card = document.createElement('div');
                card.className = 'card';
                card.innerHTML = `
                    <p>${cat.name}</p>
                    <img src="${cat.image}" style="width: 180px; height: 110px; border-radius: 10px; object-fit: cover;"> <br>
                    <button onclick="window.showBusCategory('${id}', '${cat.name}')">CHAGUA HAPA</button>
                `;
                container.appendChild(card);
            }

            // 2. Jaza Dropdown ya Admin panel automaticamente
            if (selectDropdown) {
                const option = document.createElement('option');
                option.value = id;
                option.textContent = cat.name;
                selectDropdown.appendChild(option);
            }
        });
    });
}

// --- ONYESHA LIST YA MABASI YA CATEGORY HUSIKA ---
function showBusCategory(categoryId, categoryName, isBackAction = false) {
    hideAllSections();
    document.getElementById("bus-view-section").style.display = "block";
    document.getElementById("navicon").style.display = "flex";
    document.getElementById("dynamic-bus-title").textContent = categoryName + " BUSES";

    if (!isBackAction) history.pushState({ page: categoryId, catName: categoryName }, categoryId, `#${categoryId}`);

    const busContainer = document.getElementById("dynamic-bus-list");
    busContainer.innerHTML = "<p style='color:white; text-align:center;'>Inapakia mabasi...</p>";

    database.ref('buses/' + categoryId).on('value', (snapshot) => {
        busContainer.innerHTML = "";
        const busesData = snapshot.val();
        if (!busesData) {
            busContainer.innerHTML = "<p style='color:white; text-align:center;'>Hakuna basi kwenye kundi hili.</p>";
            return;
        }

        Object.keys(busesData).forEach((key) => {
            const item = busesData[key];
            const card = document.createElement('div');
            card.className = 'card';
            card.innerHTML = `
                <p>${item.name}</p>
                <img src="${item.image}" style="width: 180px; height:110px; border-radius:10px; object-fit:cover;"><br><br>
                <button><a href="${item.link}" target="_blank" onclick="window.showmessage()">DOWNLOAD</a></button>
                <button class="btn-delete" id="del-${key}" style="display:none;" onclick="window.deleteBus('${categoryId}', '${key}')">FUTA</button>
            `;
            busContainer.appendChild(card);
            
            if(window.location.hash === "#admin") {
                setTimeout(() => {
                    let delBtn = document.getElementById(`del-${key}`);
                    if(delBtn) delBtn.style.display = "inline-block";
                }, 200);
            }
        });
    });
}

function showmessage() { alert("start your download"); }

function showAdminPanel() {
    hideAllSections();
    document.getElementById("adminSection").style.display = "block";
}

// --- USIMAMIZI WA ADMIN PANEL (ADD & DELETE) ---
function addCategory() {
    const secret = document.getElementById("adminSecret").value;
    if (secret !== "1234") { alert("Kodi ya siri siyo sahihi!"); return; }

    const id = document.getElementById("newCatId").value.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
    const name = document.getElementById("newCatName").value.trim();
    const img = document.getElementById("newCatImg").value.trim();

    if (id === "" || name === "" || img === "") { alert("Tafadhali jaza nafasi zote za Category!"); return; }

    database.ref('categories/' + id).set({
        name: name,
        image: img
    }, (err) => {
        if (err) alert("Kosa: " + err.message);
        else {
            alert("Category mpya imeongezwa kikamilifu!");
            document.getElementById("newCatId").value = "";
            document.getElementById("newCatName").value = "";
            document.getElementById("newCatImg").value = "";
        }
    });
}

// FUNCTION MPYA YA KUFUTA CATEGORY NA CONTENTS ZAKE ZOTE
function deleteCategory() {
    const secret = document.getElementById("adminSecret").value;
    if (secret !== "1234") { alert("Kodi ya siri siyo sahihi!"); return; }

    const id = document.getElementById("newCatId").value.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
    if (id === "") { alert("Tafadhali weka ID ya Category unayotaka kuifuta kwenye kisanduku cha 'ID ya Category'!"); return; }

    if (confirm("Je, una uhakika unataka kufuta Category ya '" + id + "' pamoja na yaliyomo yote (Mabasi yake yote)?")) {
        // 1. Futa category yenyewe kutoka kwenye node ya 'categories'
        database.ref('categories/' + id).remove()
        .then(() => {
            // 2. Futa contents zote (Mabasi yote) yaliyopo chini ya kundi hilo
            return database.ref('buses/' + id).remove();
        })
        .then(() => {
            alert("Category '" + id + "' na yaliyomo ndani yake zimefutwa kikamilifu!");
            document.getElementById("newCatId").value = "";
            document.getElementById("newCatName").value = "";
            document.getElementById("newCatImg").value = "";
        })
        .catch((error) => {
            alert("Imeshindwa kufuta: " + error.message);
        });
    }
}

function uploadBus() {
    const secret = document.getElementById("adminSecret").value;
    if (secret !== "1234") { alert("Kodi ya siri siyo sahihi!"); return; }

    const cat = document.getElementById("uploadCategory").value;
    const name = document.getElementById("uploadName").value.trim();
    const img = document.getElementById("uploadImg").value.trim();
    const link = document.getElementById("uploadLink").value.trim();

    if (name === "" || img === "" || link === "") { alert("Tafadhali jaza nafasi zote!"); return; }

    const newBusRef = database.ref('buses/' + cat).push();
    newBusRef.set({ name: name, image: img, link: link }, (error) => {
        if (error) alert("Imeshindwa kuupload: " + error.message);
        else {
            alert("Basi limeongezwa kwenye mfumo kikamilifu!");
            document.getElementById("uploadName").value = "";
            document.getElementById("uploadImg").value = "";
            document.getElementById("uploadLink").value = "";
        }
    });
}

function deleteBus(category, key) {
    if(confirm("Je, una uhakika unataka kufuta basi hili?")) {
        database.ref('buses/' + category + '/' + key).remove()
        .then(() => alert("Basi limefutwa!"))
        .catch((err) => alert("Imeshindwa kufuta: " + err.message));
    }
}

function checkCurrentLocation() {
    let hash = window.location.hash;
    let dbname = localStorage.getItem("name");
    
    if (hash === "#admin") {
        showAdminPanel();
        return;
    }

    if (!dbname) {
        hideAllSections();
        if (hash === "#login") showlogin();
        else showregister();
    } else {
        if (hash === "#home" || hash === "") showcat(true);
        else {
            // Inarudisha muonekano sahihi kulingana na hash iliyopo
            let cleanHash = hash.replace("#", "");
            showBusCategory(cleanHash, cleanHash.toUpperCase(), true);
        }
    }
}

// --- KUUNGANISHA FUNCTIONS KWENYE WINDOW OBJECT ---
window.showlogin = showlogin;
window.showregister = showregister;
window.register = register;
window.login = login;
window.showcat = showcat;
window.showBusCategory = showBusCategory;
window.showmessage = showmessage;
window.addCategory = addCategory;
window.deleteCategory = deleteCategory;
window.uploadBus = uploadBus;
window.deleteBus = deleteBus;

window.addEventListener("popstate", function(event) {
    let hash = window.location.hash;
    if (hash === "#admin") { showAdminPanel(); return; }

    let dbname = localStorage.getItem("name");
    if (!dbname) {
        hideAllSections();
        document.getElementById("reg").style.display = "block";
        return;
    }
    
    if (event.state && event.state.page) {
        let page = event.state.page;
        if (page === "home") showcat(true);
        else showBusCategory(page, page.toUpperCase(), true);
    } else {
        checkCurrentLocation();
    }
});

window.addEventListener("DOMContentLoaded", () => {
    loadCategories();
    checkCurrentLocation();
});
