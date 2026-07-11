// IMPORT FIREBASE V10 SDKs ZA SASA HIVI
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getDatabase, ref, set, push, onValue, remove } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

// KODI ZAKO MPYA ZA FIREBASE CONFIG (Msisi Project)
const firebaseConfig = {
  apiKey: "AIzaSyDA0ty5dOoBiPJx5fRdFI_hvddJyUbb6B4",
  authDomain: "msisi-38c20.firebaseapp.com",
  projectId: "msisi-38c20",
  storageBucket: "msisi-38c20.firebasestorage.app",
  messagingSenderId: "881060609707",
  appId: "1:881060609707:web:bd9028db2b20c75d72c1ee",
  measurementId: "G-NFT0FB6V2T"
};

// Kuanzisha Firebase na Database
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// --- MFUMO WA KUFICHA UKURASA ---
function hideAllSections() {
    const sections = ["cat", "bus-view-section", "log", "reg", "adminSection"];
    sections.forEach(id => {
        let el = document.getElementById(id);
        if (el) el.style.display = "none";
    });
    document.getElementById("navicon").style.display = "none";
}

// --- KURASA ZA LOGIN NA REGISTER ---
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
        alert("Tafadhali jaza taarifa zote"); 
    } else { 
        localStorage.setItem("name", name);
        localStorage.setItem("email", email);
        localStorage.setItem("password", password);
        alert("Hongera! Taarifa zimekamilika.");
        showlogin();
    }
}

function login() {
    let name = document.getElementById("logname").value;
    let password = document.getElementById("logpassword").value;
    let dbname = localStorage.getItem("name");
    let dbpassword = localStorage.getItem("password");
    
    if (name == "" || password == "") {
        alert("Tafadhali jaza nafasi zote!");
    } else if (name == dbname && password == dbpassword) {
        alert("Login Successful!");
        history.replaceState({ page: "home" }, "Home", "#home");
        showcat(true); 
    } else {
        alert("Taarifa siyo sahihi!");
    }
}

function showcat(isBackAction = false) {
    let dbname = localStorage.getItem("name");
    if(!dbname) { showregister(); return; }
    hideAllSections();
    document.getElementById("cat").style.display = "block";
    document.getElementById("navicon").style.display = "flex"; 
    if (!isBackAction) history.pushState({ page: "home" }, "Home", "#home");
}

// --- DYNAMIC CATEGORIES: KUVUTA NA KUZIONYESHA HOME ---
function loadCategories() {
    const container = document.getElementById("categories-container");
    const selectDropdown = document.getElementById("uploadCategory");
    
    if (!container) return;

    // Kusikiliza mabadiliko ya Categories kule Firebase
    onValue(ref(database, 'categories'), (snapshot) => {
        container.innerHTML = "";
        if (selectDropdown) selectDropdown.innerHTML = "";
        
        const data = snapshot.val();
        if (!data) {
            container.innerHTML = "<p style='color:white; text-align:center;'>Hakuna category yoyote iliyowekwa bado. Ingia kama admin kuongeza.</p>";
            return;
        }

        Object.keys(data).forEach((id) => {
            const cat = data[id];
            
            // 1. Tengeneza Card ya Category kwenye Home Page
            const card = document.createElement('div');
            card.className = 'card';
            card.innerHTML = `
                <p>${cat.name}</p> 
                <img src="${cat.image}" style="width: 180px; height: 110px; border-radius: 10px; object-fit: cover;"> 
                <br>
                <button class="btn-select-cat" id="view-${id}">CHAGUA HAPA</button>
                <button class="btn-delete del-cat-btn" style="display:none; background-color:red;" id="del-cat-${id}">FUTA GROUP</button>
            `;
            container.appendChild(card);

            // Weka click listener ya kufungua mabasi ya kundi hili
            document.getElementById(`view-${id}`).addEventListener('click', () => {
                showBusCategory(id, cat.name);
            });

            // Weka click listener ya kufuta category (Kwa ajili ya Admin)
            document.getElementById(`del-cat-${id}`).addEventListener('click', () => {
                deleteCategory(id);
            });

            // 2. Jaza Dropdown ya kuchagua category kwenye Admin Panel
            if (selectDropdown) {
                const option = document.createElement('option');
                option.value = id;
                option.textContent = cat.name.split('(')[0].trim(); // Chukua jina fupi la basi tu
                selectDropdown.appendChild(option);
            }

            // Kama tupo admin panel, onyesha kitufe cha kufuta kundi
            if(window.location.hash === "#admin") {
                setTimeout(() => {
                    let delCatBtn = document.getElementById(`del-cat-${id}`);
                    if(delCatBtn) delCatBtn.style.display = "inline-block";
                }, 200);
            }
        });
    });
}

// --- DYNAMIC BUS LISTING (Inafungua mabasi ya kundi lililochaguliwa) ---
function showBusCategory(categoryId, categoryName, isBackAction = false) {
    let dbname = localStorage.getItem("name");
    if (!dbname) { showregister(); return; }
    
    hideAllSections();
    document.getElementById("bus-view-section").style.display = "block";
    document.getElementById("navicon").style.display = "flex";
    
    const titleEl = document.getElementById("dynamic-bus-title");
    titleEl.textContent = categoryName.split('(')[0].trim() + " BUSES";

    if (!isBackAction) history.pushState({ page: categoryId, catName: categoryName }, categoryId, `#${categoryId}`);
    
    // Vuta mabasi ya kundi hili maalum
    const busContainer = document.getElementById("dynamic-bus-list");
    busContainer.innerHTML = "<p style='color:white; text-align:center;'>Inapakia mabasi...</p>";

    onValue(ref(database, 'buses/' + categoryId), (snapshot) => {
        busContainer.innerHTML = "";
        const busesData = snapshot.val();
        
        if (!busesData) {
            busContainer.innerHTML = "<p style='color:white; text-align:center;'>Hakuna basi lililowekwa bado kwenye kundi hili.</p>";
            return;
        }

        Object.keys(busesData).forEach((key) => {
            const item = busesData[key];
            const card = document.createElement('div');
            card.className = 'card';
            card.innerHTML = `
                <p>${item.name}</p>
                <img src="${item.image}" style="width: 180px; height: 110px; border-radius:10px; object-fit: cover;"><br><br>
                <button><a href="${item.link}" target="_blank" id="dl-${key}">DOWNLOAD</a></button>
                <button class="btn-delete" id="del-bus-${key}" style="display:none;">FUTA</button>
            `;
            busContainer.appendChild(card);

            document.getElementById(`dl-${key}`).addEventListener('click', () => alert("Start your download!"));
            
            document.getElementById(`del-bus-${key}`).addEventListener('click', () => {
                deleteBus(categoryId, key);
            });

            // Kama tupo admin panel, onyesha kitufe cha kufuta basi
            if(window.location.hash === "#admin") {
                setTimeout(() => {
                    let delBusBtn = document.getElementById(`del-bus-${key}`);
                    if(delBusBtn) delBusBtn.style.display = "inline-block";
                }, 200);
            }
        });
    });
}

// --- ADMINISTRATIVE FUNCTIONS (UPLOAD & DELETE) ---

// 1. Ongeza Category Mpya
function addCategory() {
    const secret = document.getElementById("adminSecret").value;
    if (secret !== "1234") { alert("Kodi ya siri ya admin siyo sahihi!"); return; }

    const id = document.getElementById("newCatId").value.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
    const name = document.getElementById("newCatName").value.trim();
    const img = document.getElementById("newCatImg").value.trim();

    if (id === "" || name === "" || img === "") { alert("Tafadhali jaza nafasi zote za Category!"); return; }

    set(ref(database, 'categories/' + id), {
        name: name,
        image: img
    }).then(() => {
        alert("Group jipya limeongezwa kikamilifu!");
        document.getElementById("newCatId").value = "";
        document.getElementById("newCatName").value = "";
        document.getElementById("newCatImg").value = "";
    }).catch(err => alert("Kosa limetokea: " + err.message));
}

// 2. Futa Category
function deleteCategory(categoryId) {
    if(confirm("Je, una uhakika unataka kufuta GROUP hili pamoja na mabasi yote yaliyomo ndani yake?")) {
        // Futa kundi
        remove(ref(database, 'categories/' + categoryId))
        .then(() => {
            // Futa na mabasi yote yaliyokuwa ndani ya kundi hilo
            remove(ref(database, 'buses/' + categoryId));
            alert("Group limefutwa kabisa!");
        }).catch(err => alert("Imeshindwa kufuta: " + err.message));
    }
}

// 3. Upload Basi Mpya (Kwenye Category iliyochaguliwa)
function uploadBus() {
    const secret = document.getElementById("adminSecret").value;
    if (secret !== "1234") { alert("Kodi ya siri siyo sahihi!"); return; }

    const cat = document.getElementById("uploadCategory").value;
    const name = document.getElementById("uploadName").value.trim();
    const img = document.getElementById("uploadImg").value.trim();
    const link = document.getElementById("uploadLink").value.trim();

    if (!cat) { alert("Tafadhali weka/chagua Category kwanza!"); return; }
    if (name === "" || img === "" || link === "") { alert("Tafadhali jaza nafasi zote!"); return; }

    const newBusRef = push(ref(database, 'buses/' + cat));
    set(newBusRef, {
        name: name,
        image: img,
        link: link
    }).then(() => {
        alert("Basi limeongezwa kwenye mfumo kikamilifu!");
        document.getElementById("uploadName").value = "";
        document.getElementById("uploadImg").value = "";
        document.getElementById("uploadLink").value = "";
    }).catch((error) => {
        alert("Imeshindwa kuupload: " + error.message);
    });
}

// 4. Futa Basi Maalum
function deleteBus(category, key) {
    if(confirm("Je, una uhakika unataka kufuta basi hili?")) {
        remove(ref(database, 'buses/' + category + '/' + key))
        .then(() => alert("Basi limefutwa!"))
        .catch((err) => alert("Imeshindwa kufuta: " + err.message));
    }
}

function showAdminPanel() {
    hideAllSections();
    document.getElementById("adminSection").style.display = "block";
}

// --- ROUTING NA MAJUMUISHO ---
function checkCurrentLocation() {
    let hash = window.location.hash;
    let dbname = localStorage.getItem("name");
    
    if (hash === "#admin") {
        showAdminPanel();
        return;
    }

    if (!dbname) {
        if (hash === "#login") showlogin();
        else showregister();
    } else {
        if (hash === "#home" || hash === "") showcat(true);
        else {
            // Kama ni hash ya dynamic category, ifungue yenyewe
            let cleanCatId = hash.replace("#", "");
            showBusCategory(cleanCatId, cleanCatId.toUpperCase(), true);
        }
    }
}

// Kuunganisha Event Listeners kwenye HTML Elements
document.addEventListener("DOMContentLoaded", () => {
    // Nav links
    document.getElementById("nav-home").addEventListener("click", () => showcat());
    document.getElementById("nav-about").addEventListener("click", () => alert("Karibu Kitengo Gaming! Hii ni sehemu ya 'About Us'..."));
    document.getElementById("nav-services").addEventListener("click", () => alert("Huduma zetu ni pamoja na kukupatia Mods kali..."));
    document.getElementById("nav-contact").addEventListener("click", () => alert("Wasiliana nasi kwa msaada zaidi..."));

    // Auth links & buttons
    document.getElementById("btn-login").addEventListener("click", login);
    document.getElementById("btn-register").addEventListener("click", register);
    document.getElementById("go-to-reg").addEventListener("click", showregister);
    document.getElementById("go-to-log").addEventListener("click", showlogin);

    // Admin Panel Buttons
    document.getElementById("btn-add-category").addEventListener("click", addCategory);
    document.getElementById("btn-upload-bus").addEventListener("click", uploadBus);

    // Washa categories pindi tu app inapofunguka
    loadCategories();
    checkCurrentLocation();
});

window.addEventListener("popstate", function(event) {
    let hash = window.location.hash;
    if (hash === "#admin") { showAdminPanel(); return; }

    let dbname = localStorage.getItem("name");
    if (!dbname) { showregister(); return; }
    
    if (event.state && event.state.page) {
        let page = event.state.page;
        if (page === "home") showcat(true);
        else showBusCategory(page, event.state.catName || page, true);
    } else {
        checkCurrentLocation();
    }
});
