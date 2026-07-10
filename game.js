// KUNGANISHA APP YAKO NA FIREBASE (Kutumia configuration uliyotuma)
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
    document.getElementById("log").style.display = "block";
    document.getElementById("reg").style.display = "none";
    document.getElementById("cat").style.display = "none";    
}

function showregister() {
    document.getElementById("log").style.display = "none";
    document.getElementById("reg").style.display = "block";
    document.getElementById("cat").style.display = "none";
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
        document.getElementById("reg").style.display = "none";
        document.getElementById("log").style.display = "none";
        
        history.replaceState({ page: "home" }, "Home", "#home");
        showcat(true); 
    } else {
        alert("incorrect details");
    }
}

function hideAllSections() {
    const sections = ["costa", "zhongtong", "higer", "dragon", "scania", "yutong", "log", "reg", "cat", "adminSection"];
    sections.forEach(id => {
        let el = document.getElementById(id);
        if (el) el.style.display = "none"; 
    });
    document.getElementById("navicon").style.display = "none";
}

// FUNCTION YA KUVUTA DATA KUTOKA DATABASE NA KUZIONYESHA KWENYE GRID automatically
function loadCategoryItems(categoryName, containerId) {
    const container = document.getElementById(containerId);
    container.innerHTML = "<p style='color:white; text-align:center;'>Inapakia mabasi...</p>";

    database.ref('buses/' + categoryName).on('value', (snapshot) => {
        container.innerHTML = ""; // Futa meseji ya kupakia
        const data = snapshot.val();
        
        if (!data) {
            container.innerHTML = "<p style='color:white; text-align:center;'>Hakuna basi lililowekwa bado kwenye kundi hili.</p>";
            return;
        }

        // Pitia kila item iliyopo kwenye database na kuitengenezea kadi ya HTML
        Object.keys(data).forEach((key) => {
            const item = data[key];
            
            const card = document.createElement('div');
            card.className = 'card';
            card.innerHTML = `
                <p>${item.name}</p>
                <img src="${item.image}" style="width: 180px; border-radius:10px;"><br><br>
                <button><a href="${item.link}" target="_blank" onclick="showmessage()">DOWNLOAD</a></button>
                <button class="btn-delete" id="del-${key}" style="display:none;" onclick="deleteBus('${categoryName}', '${key}')">FUTA</button>
            `;
            container.appendChild(card);
            
            // Kama sasa hivi tupo kwenye hali ya admin, ruhusu vitufe vya kufuta vionekane
            if(window.location.hash === "#admin") {
                setTimeout(() => {
                    let delBtn = document.getElementById(`del-${key}`);
                    if(delBtn) delBtn.style.display = "inline-block";
                }, 200);
            }
        });
    });
}

function showyutong(isBackAction = false) {
    let dbname = localStorage.getItem("name");
    if (!dbname) { showregister(); return; }
    hideAllSections();
    document.getElementById("yutong").style.display = "block";
    document.getElementById("navicon").style.display = "flex";    
    if (!isBackAction) history.pushState({ page: "yutong" }, "Yutong", "#yutong");
    loadCategoryItems('yutong', 'yutong-list');
}

function showzhongtong(isBackAction = false) {
    let dbname = localStorage.getItem("name");
    if (!dbname) { showregister(); return; }
    hideAllSections();
    document.getElementById("zhongtong").style.display = "block";
    document.getElementById("navicon").style.display = "flex";            
    if (!isBackAction) history.pushState({ page: "zhongtong" }, "Zhongtong", "#zhongtong");
    loadCategoryItems('zhongtong', 'zhongtong-list');
}

function showhiger(isBackAction = false) {
    let dbname = localStorage.getItem("name");
    if (!dbname) { showregister(); return; }
    hideAllSections();
    document.getElementById("higer").style.display = "block";
    document.getElementById("navicon").style.display = "flex";        
    if (!isBackAction) history.pushState({ page: "higer" }, "Higer", "#higer");
    loadCategoryItems('higer', 'higer-list');
}

function showdragon(isBackAction = false) {
    let dbname = localStorage.getItem("name");
    if (!dbname) { showregister(); return; }
    hideAllSections();
    document.getElementById("dragon").style.display = "block";
    document.getElementById("navicon").style.display = "flex";        
    if (!isBackAction) history.pushState({ page: "dragon" }, "Dragon", "#dragon");
    loadCategoryItems('dragon', 'dragon-list');
}

function showscania(isBackAction = false) {
    let dbname = localStorage.getItem("name");
    if (!dbname) { showregister(); return; }
    hideAllSections();
    document.getElementById("scania").style.display = "block";
    document.getElementById("navicon").style.display = "flex";        
    if (!isBackAction) history.pushState({ page: "scania" }, "Scania", "#scania");
    loadCategoryItems('scania', 'scania-list');
}

function showcosta(isBackAction = false) {
    let dbname = localStorage.getItem("name");
    if (!dbname) { showregister(); return; }
    hideAllSections();
    document.getElementById("costa").style.display = "block";
    document.getElementById("navicon").style.display = "flex";        
    if (!isBackAction) history.pushState({ page: "costa" }, "Costa", "#costa");
    loadCategoryItems('costa', 'costa-list');
}

function showcat(isBackAction = false) {
    let dbname = localStorage.getItem("name");
    if(!dbname) { showregister(); return; }
    hideAllSections();
    document.getElementById("cat").style.display = "block";
    document.getElementById("navicon").style.display = "flex"; 
    if (!isBackAction) history.pushState({ page: "home" }, "Home", "#home");
}

function showmessage() { alert("start your download"); }
function alertAbout() { alert("Karibu Kitengo Gaming! Hii ni sehemu ya 'About Us'..."); }
function alertServices() { alert("Huduma zetu ni pamoja na kukupatia Mods kali..."); }
function alertContact() { alert("Wasiliana nasi kwa msaada zaidi..."); }

// ================= KODI ZA ADMIN PANEL (KUUPLOAD NA KUFUTA BIFA CODING) =================
function showAdminPanel() {
    hideAllSections();
    document.getElementById("adminSection").style.display = "block";
}

function uploadBus() {
    const secret = document.getElementById("adminSecret").value;
    if (secret !== "1234") { // <--- BADILISHA HAPA KUWEKA PASSWORD YAKO YA SIRI
        alert("Kodi ya siri siyo sahihi!");
        return;
    }

    const cat = document.getElementById("uploadCategory").value;
    const name = document.getElementById("uploadName").value;
    const img = document.getElementById("uploadImg").value;
    const link = document.getElementById("uploadLink").value;

    if (name === "" || img === "" || link === "") {
        alert("Tafadhali jaza nafasi zote!");
        return;
    }

    // Tupa data kwenye Realtime Database ya Firebase
    const newBusRef = database.ref('buses/' + cat).push();
    newBusRef.set({
        name: name,
        image: img,
        link: link
    }, (error) => {
        if (error) {
            alert("Imeshindwa kuupload: " + error.message);
        } else {
            alert("Basi limeongezwa kwenye mfumo kikamilifu!");
            // Safisha fomu
            document.getElementById("uploadName").value = "";
            document.getElementById("uploadImg").value = "";
            document.getElementById("uploadLink").value = "";
        }
    });
}

// Function ya kufuta basi kwenye database
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
        if (hash === "#home") showcat(true);
        else if (hash === "#yutong") showyutong(true);
        else if (hash === "#zhongtong") showzhongtong(true);
        else if (hash === "#higer") showhiger(true);
        else if (hash === "#dragon") showdragon(true);
        else if (hash === "#scania") showscania(true);
        else if (hash === "#costa") showcosta(true);
        else showcat(true);
    }
}

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
        else if (page === "yutong") showyutong(true);
        else if (page === "zhongtong") showzhongtong(true);
        else if (page === "higer") showhiger(true);
        else if (page === "dragon") showdragon(true);
        else if (page === "scania") showscania(true);
        else if (page === "costa") showcosta(true);
    } else {
        checkCurrentLocation();
    }
});

window.addEventListener("DOMContentLoaded", checkCurrentLocation);
