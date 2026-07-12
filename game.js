// CONFIGURATION YA FIREBASE (Ihakiki na mradi wako wa Msisi)
const firebaseConfig = {
  apiKey: "AIzaSyDA0ty5dOoBiPJx5fRdFI_hvddJyUbb6B4",
  authDomain: "msisi-38c20.firebaseapp.com",
  projectId: "msisi-38c20",
  databaseURL: "https://msisi-38c20-default-rtdb.firebaseio.com",
  messagingSenderId: "881060609707",
  appId: "1:881060609707:web:bd9028db2b20c75d72c1ee",
  measurementId: "G-NFT0FB6V2T"
};

// Kuanzisha Huduma za Firebase
firebase.initializeApp(firebaseConfig);
const database = firebase.database();
const auth = firebase.auth();
const storage = firebase.storage();

// Array ya kimataifa (Global array) kwa ajili ya kurahisisha Search Filter ya mabasi
let currentBusesData = [];

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

// 1. MFUMO WA AKAUNTI: Msajili Mpya
window.register = function() {
    let email = document.getElementById("regemail").value;
    let password = document.getElementById("regpassword").value;
    let name = document.getElementById("regname").value;
    
    if (name === "" || email === "" || password === "") { alert("Tafadhali jaza nafasi zote!"); return; } 
    
    auth.createUserWithEmailAndPassword(email, password)
    .then((userCredential) => {
        return userCredential.user.updateProfile({ displayName: name });
    })
    .then(() => {
        alert("Hongera! Usajili wa akaunti umekamilika kiprofessional.");
        window.showlogin();
    })
    .catch(err => alert("Kosa la Usajili: " + err.message));
}

// 2. MFUMO WA AKAUNTI: Kuingia Kwenye Mfumo (Login)
window.login = function() {
    let email = document.getElementById("logname").value; 
    let password = document.getElementById("logpassword").value;
    
    if (email === "" || password === "") { alert("Weka Email na Password yako!"); return; } 
    
    auth.signInWithEmailAndPassword(email, password)
    .then(() => {
        alert("Umeingia kikamilifu!"); 
        history.replaceState({ page: "home" }, "Home", "#home"); 
        window.showcat(true); 
    })
    .catch(err => alert("Barua pepe au Password si sahihi! " + err.message));
}

// 3. MFUMO WA AKAUNTI: Kujiondoa (Logout)
window.logout = function() {
    auth.signOut().then(() => {
        alert("Umetoka kwenye mfumo.");
        window.showlogin();
    });
}

window.showcat = function(isBackAction = false) {
    let user = auth.currentUser;
    if(!user) { window.showregister(); return; }
    window.hideAllSections();
    document.getElementById("cat").style.display = "block";
    document.getElementById("navicon").style.display = "flex"; 
    if (!isBackAction) history.pushState({ page: "home" }, "Home", "#home");
}

// 4. KUPAKIA KUNDI LA MABASI
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
                    <p>${cat.name}</p> 
                    <img src="${cat.image}"> <br>
                    <button onclick="window.showBusCategory('${id}', '${cat.name}')">FUNGUA MABASI</button>
                    <button style="display:none; background-color:red; margin-top:5px;" id="del-cat-${id}" onclick="window.deleteCategory('${id}')">FUTA</button>
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

// 5. KUPAKIA MABASI NDANI YA CATEGORY
window.showBusCategory = function(categoryId, categoryName, isBackAction = false) {
    window.hideAllSections();
    document.getElementById("bus-view-section").style.display = "block";
    document.getElementById("navicon").style.display = "flex";
    document.getElementById("dynamic-bus-title").textContent = categoryName + " MODS";
    document.getElementById("busSearch").value = ""; // Kusafisha sanduku la kutafuta

    if (!isBackAction) history.pushState({ page: categoryId, catName: categoryName }, categoryId, `#${categoryId}`);
    
    const busContainer = document.getElementById("dynamic-bus-list");
    busContainer.innerHTML = "<p style='color:white; text-align:center;'>Inapakia mabasi...</p>";

    database.ref('buses/' + categoryId).on('value', (snapshot) => {
        currentBusesData = []; // Kusafisha array ya zamani
        const busesData = snapshot.val();
        
        if (!busesData) {
            busContainer.innerHTML = "<p style='color:white; text-align:center;'>Hakuna basi lililowekwa kwenye kundi hili bado.</p>";
            return;
        }

        // Kuhifadhi data kwenye array ili itumike kwenye Search Filter
        Object.keys(busesData).forEach((key) => {
            currentBusesData.push({
                key: key,
                categoryId: categoryId,
                name: busesData[key].name,
                image: busesData[key].image,
                link: busesData[key].link
            });
        });

        window.renderBusesList(currentBusesData);
    });
}

// 6. SEARCH FILTER LOGIC (Kipengele cha 3)
window.renderBusesList = function(busesArray) {
    const busContainer = document.getElementById("dynamic-bus-list");
    busContainer.innerHTML = "";

    if(busesArray.length === 0) {
        busContainer.innerHTML = "<p style='color:var(--text-muted); text-align:center;'>Hakuna basi linaloendana na utafutaji wako.</p>";
        return;
    }

    busesArray.forEach((item) => {
        const card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = `
            <p>${item.name}</p>
            <img src="${item.image}"><br><br>
            <button onclick="window.openModal('${item.name}', '${item.image}', '${item.link}')">ANGALIA MOD</button>
            <button class="btn-delete" id="del-bus-${item.key}" style="display:none; background-color:red; margin-top:5px;" onclick="window.deleteBus('${item.categoryId}', '${item.key}')">FUTA</button>
        `;
        busContainer.appendChild(card);

        if(window.location.hash === "#admin") {
            setTimeout(() => {
                let btn = document.getElementById(`del-bus-${item.key}`);
                if(btn) btn.style.display = "inline-block";
            }, 200);
        }
    });
}

window.filterBuses = function() {
    const query = document.getElementById("busSearch").value.toLowerCase();
    const filtered = currentBusesData.filter(bus => bus.name.toLowerCase().includes(query));
    window.renderBusesList(filtered);
}

// 7. POPUP MODAL LOGIC (Kipengele cha 5 - Kurasa za Ndani)
window.openModal = function(name, image, link) {
    document.getElementById("modalBusName").textContent = name;
    document.getElementById("modalBusImg").src = image;
    document.getElementById("modalDownloadLink").href = link;
    document.getElementById("busDetailModal").style.display = "flex";
}

window.closeModal = function() {
    document.getElementById("busDetailModal").style.display = "none";
}

// 8. STORAGE & DATABASE: Kuongeza Group Jipya la Picha halisi
window.addCategory = function() {
    const secret = document.getElementById("adminSecret").value;
    if (secret !== "1234") { alert("Kodi ya siri siyo sahihi!"); return; }

    const id = document.getElementById("newCatId").value.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
    const name = document.getElementById("newCatName").value.trim();
    const fileInput = document.getElementById("newCatImg");

    if (id === "" || name === "") { alert("Jaza ID na Jina la Category!"); return; }
    if (fileInput.files.length === 0) { alert("Chagua picha ya group!"); return; }

    const statusDiv = document.getElementById("cat-upload-status");
    statusDiv.style.display = "block";
    statusDiv.textContent = "Inapakia picha kwenye Firebase Storage...";

    const file = fileInput.files[0];
    const storageRef = storage.ref('categories/' + id + '_' + file.name);

    storageRef.put(file).then(snapshot => {
        return snapshot.ref.getDownloadURL();
    }).then(downloadURL => {
        return database.ref('categories/' + id).set({ name: name, image: downloadURL });
    }).then(() => {
        alert("Group jipya limehifadhiwa kwa mafanikio ya kiprofessional!");
        document.getElementById("newCatId").value = "";
        document.getElementById("newCatName").value = "";
        fileInput.value = "";
        statusDiv.style.display = "none";
    }).catch(err => {
        alert("Kosa lililotokea: " + err.message);
        statusDiv.style.display = "none";
    });
}

// 9. STORAGE & DATABASE: Kuupload Basi Jipya
window.uploadBus = function() {
    const secret = document.getElementById("adminSecret").value;
    if (secret !== "1234") { alert("Kodi ya siri ya admin siyo sahihi!"); return; }

    const cat = document.getElementById("uploadCategory").value;
    const name = document.getElementById("uploadName").value.trim();
    const fileInput = document.getElementById("uploadImg");
    const link = document.getElementById("uploadLink").value.trim();

    if (cat === "") { alert("Chagua Category kwanza!"); return; }
    if (name === "" || link === "") { alert("Jaza jina na link vizuri!"); return; }
    if (fileInput.files.length === 0) { alert("Chagua picha ya basi husika!"); return; }

    const statusDiv = document.getElementById("bus-upload-status");
    statusDiv.style.display = "block";
    statusDiv.textContent = "Inapakia mod kwenye mtandao...";

    const file = fileInput.files[0];
    const timestamp = Date.now();
    const storageRef = storage.ref('buses/' + cat + '/' + timestamp + '_' + file.name);

    storageRef.put(file).then(snapshot => {
        return snapshot.ref.getDownloadURL();
    }).then(downloadURL => {
        const newBusRef = database.ref('buses/' + cat).push();
        return newBusRef.set({ name: name, image: downloadURL, link: link });
    }).then(() => {
        alert("Basi jipya limeongezwa kikamilifu!");
        document.getElementById("uploadName").value = "";
        document.getElementById("uploadLink").value = "";
        fileInput.value = "";
        statusDiv.style.display = "none";
    }).catch(err => {
        alert("Kosa: " + err.message);
        statusDiv.style.display = "none";
    });
}

window.deleteCategory = function(categoryId) {
    if(confirm("Je, una uhakika unataka kufuta Group hili na mabasi yake yote?")) {
        database.ref('categories/' + categoryId).remove()
        .then(() => { database.ref('buses/' + categoryId).remove(); alert("Group limefutwa!"); })
        .catch(err => alert("Kosa: " + err.message));
    }
}

window.deleteBus = function(category, key) {
    if(confirm("Unataka kufuta mod hii ya basi?")) {
        database.ref('buses/' + category + '/' + key).remove()
        .then(() => alert("Basi limefutwa rasmi!"))
        .catch(err => alert("Kosa: " + err.message));
    }
}

window.clearEntireDatabase = function() {
    const secret = document.getElementById("adminSecret").value;
    if (secret !== "1234") { alert("Kodi ya siri haipo sahihi!"); return; }

    let confirmationText = prompt("ANDIKA 'FUTA' ILI KUFUTA DATA ZOTE:");
    if (confirmationText === "FUTA") {
        database.ref().remove().then(() => alert("Kila kitu kimesafishwa!")).catch(err => alert(err.message));
    }
}

// 10. MFUMO WA ROUTING (Kusimamia kurasa bila kurefresh)
window.checkCurrentLocation = function() {
    let hash = window.location.hash;
    
    if (hash === "#admin") { 
        window.hideAllSections(); 
        document.getElementById("adminSection").style.display = "block"; 
        window.loadCategories();
        return; 
    }

    auth.onAuthStateChanged((user) => {
        if (!user) { 
            window.hideAllSections(); 
            if (hash === "#login") window.showlogin(); 
            else window.showregister(); 
        } else { 
            if(hash === "" || hash === "#home") {
                window.showcat(true); 
            }
        }
    });
}

window.addEventListener("popstate", function(event) {
    let hash = window.location.hash;
    if (hash === "#admin") { window.hideAllSections(); document.getElementById("adminSection").style.display = "block"; return; }
    
    let user = auth.currentUser;
    if (!user) { window.showregister(); return; }
    
    if (event.state && event.state.page) {
        let page = event.state.page;
        if (page === "home") window.showcat(true);
        else window.showBusCategory(page, event.state.catName || page, true);
    } else { window.checkCurrentLocation(); }
});

// Kuanzisha programu
window.addEventListener("DOMContentLoaded", () => {
    window.loadCategories();
    window.checkCurrentLocation();
});
