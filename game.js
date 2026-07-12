// USANIDI WA FIREBASE
const firebaseConfig = {
  apiKey: "AIzaSyDA0ty5dOoBiPJx5fRdFI_hvddJyUbb6B4",
  authDomain: "msisi-38c20.firebaseapp.com",
  projectId: "msisi-38c20",
  databaseURL: "https://msisi-38c20-default-rtdb.firebaseio.com",
  messagingSenderId: "881060609707",
  appId: "1:881060609707:web:bd9028db2b20c75d72c1ee",
  measurementId: "G-NFT0FB6V2T"
};

firebase.initializeApp(firebaseConfig);
const database = firebase.database();

let activeCatId = "";
let activeCatName = "";

window.hideAllSections = function() {
    const sections = ["cat", "bus-view-section", "single-view-section", "log", "reg", "adminSection"];
    sections.forEach(id => {
        let el = document.getElementById(id);
        if (el) el.style.display = "none";
    });
    document.getElementById("navicon").style.display = "none";
}

window.showlogin = function() { window.hideAllSections(); document.getElementById("log").style.display = "block"; }
window.showregister = function() { window.hideAllSections(); document.getElementById("reg").style.display = "block"; }

window.register = function() {
    let name = document.getElementById("regname").value.trim();
    let email = document.getElementById("regemail").value.trim();
    let password = document.getElementById("regpassword").value.trim();
    if (name == "" || email == "" || password == "") { alert("Jaza nafasi zote!"); } 
    else { 
        localStorage.setItem("name", name); localStorage.setItem("email", email); localStorage.setItem("password", password);
        alert("Usajili umekamilika!"); window.showlogin();
    }
}

window.login = function() {
    let name = document.getElementById("logname").value.trim();
    let password = document.getElementById("logpassword").value.trim();
    let dbname = localStorage.getItem("name");
    let dbpassword = localStorage.getItem("password");
    if (name == "" || password == "") { alert("Jaza nafasi zote!"); } 
    else if (name == dbname && password == dbpassword) {
        alert("Umeingia kikamilifu!"); window.showcat(true); 
    } else { alert("Taarifa si sahihi!"); }
}

window.showcat = function(isBackAction = false) {
    let dbname = localStorage.getItem("name");
    if(!dbname) { window.showregister(); return; }
    window.hideAllSections();
    document.getElementById("cat").style.display = "block";
    document.getElementById("navicon").style.display = "flex"; 
}

// --- UKURASA MPYA WA MAELEZO YA PICHA (SINGLE VIEW ENGINE) ---
window.openSingleView = function(title, base64Image, description, type, downloadLink = "") {
    window.hideAllSections();
    document.getElementById("single-view-section").style.display = "block";
    document.getElementById("navicon").style.display = "flex";

    document.getElementById("single-title").textContent = title;
    document.getElementById("single-img").src = base64Image;
    
    // Kama hakuna maelezo, mfumo unaandika maelezo ya default
    document.getElementById("single-desc").textContent = description ? description : "Hakuna maelezo ya ziada kuhusu picha hii.";

    const btnContainer = document.getElementById("download-btn-container");
    const backBtn = document.getElementById("btn-back-dynamic");
    btnContainer.innerHTML = "";

    if (type === 'category') {
        // Mtumiaji akitoka kwenye Single View ya Category, akirudi anaenda Home
        backBtn.onclick = function() { window.showcat(); };
        btnContainer.innerHTML = `<button onclick="window.showBusCategory('${downloadLink}', '${title}')">FUNGUA MABASI YOTE YA ${title}</button>`;
    } else if (type === 'bus') {
        // Mtumiaji akitoka kwenye Single View ya Basi, akirudi anaenda kwenye Category husika
        backBtn.onclick = function() { window.showBusCategory(activeCatId, activeCatName); };
        btnContainer.innerHTML = `<button><a href="${downloadLink}" target="_blank">DOWNLOAD MOD Sasa</a></button>`;
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
            return;
        }

        if (selectDropdown) {
            let defaultOpt = document.createElement('option');
            defaultOpt.value = ""; defaultOpt.textContent = "-- Chagua Category --";
            selectDropdown.appendChild(defaultOpt);
        }

        Object.keys(data).forEach((id) => {
            const cat = data[id];
            if (container) {
                const card = document.createElement('div');
                card.className = 'card';
                card.innerHTML = `
                    <p style="font-weight:bold;">${cat.name}</p> 
                    <img src="${cat.image}" style="width: 180px; height: 110px; border-radius: 10px; object-fit: cover;" onclick="window.openSingleView('${cat.name}', '${cat.image}', \`${cat.desc || ''}\`, 'category', '${id}')"> <br>
                    <button onclick="window.showBusCategory('${id}', '${cat.name}')">FUNGUA MODS</button>
                `;
                container.appendChild(card);
            }

            if (selectDropdown) {
                const option = document.createElement('option');
                option.value = id; option.textContent = cat.name;
                selectDropdown.appendChild(option);
            }
        });
    });
}

window.showBusCategory = function(categoryId, categoryName) {
    activeCatId = categoryId;
    activeCatName = categoryName;

    window.hideAllSections();
    document.getElementById("bus-view-section").style.display = "block";
    document.getElementById("navicon").style.display = "flex";
    document.getElementById("dynamic-bus-title").textContent = categoryName + " BUSES";
    
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
                <p style="font-weight:bold;">${item.name}</p>
                <img src="${item.image}" style="width: 180px; height:110px; border-radius:10px; object-fit:cover; cursor:pointer;" onclick="window.openSingleView('${item.name}', '${item.image}', \`${item.desc || ''}\`, 'bus', '${item.link}')"><br><br>
                <button><a href="${item.link}" target="_blank">DOWNLOAD</a></button>
            `;
            busContainer.appendChild(card);
        });
    });
}

// --- ONGEZA CATEGORY NA MAELEZO (ADMIN) ---
window.addCategory = function() {
    const secret = document.getElementById("adminSecret").value;
    if (secret !== "1234") { alert("Kodi ya siri ya admin siyo sahihi!"); return; }

    const id = document.getElementById("newCatId").value.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
    const name = document.getElementById("newCatName").value.trim();
    const desc = document.getElementById("newCatDesc").value.trim();
    const fileInput = document.getElementById("newCatImg");

    if (id === "" || name === "") { alert("Tafadhali jaza ID na Jina la Category!"); return; }
    if (fileInput.files.length === 0) { alert("Tafadhali chagua picha!"); return; }

    const statusDiv = document.getElementById("cat-upload-status");
    statusDiv.style.display = "block";

    const file = fileInput.files[0];
    const reader = new FileReader();

    reader.onloadend = function() {
        const base64Image = reader.result;
        database.ref('categories/' + id).set({ name: name, image: base64Image, desc: desc })
        .then(() => {
            alert("Category mpya imeongezwa!");
            document.getElementById("newCatId").value = "";
            document.getElementById("newCatName").value = "";
            document.getElementById("newCatDesc").value = "";
            fileInput.value = "";
            statusDiv.style.display = "none";
        }).catch(err => { alert("Kosa: " + err.message); statusDiv.style.display = "none"; });
    };
    reader.readAsDataURL(file);
}

// --- UPLOAD BUS NA MAELEZO (ADMIN) ---
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

    const file = fileInput.files[0];
    const reader = new FileReader();

    reader.onloadend = function() {
        const base64Image = reader.result;
        const newBusRef = database.ref('buses/' + cat).push();
        newBusRef.set({ name: name, image: base64Image, link: link, desc: desc })
        .then(() => {
            alert("Basi jipya limeongezwa!");
            document.getElementById("uploadName").value = "";
            document.getElementById("uploadDesc").value = "";
            document.getElementById("uploadLink").value = "";
            fileInput.value = "";
            statusDiv.style.display = "none";
        }).catch(err => { alert("Kosa: " + err.message); statusDiv.style.display = "none"; });
    };
    reader.readAsDataURL(file);
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
    window.loadCategories();
    window.checkCurrentLocation();
});
