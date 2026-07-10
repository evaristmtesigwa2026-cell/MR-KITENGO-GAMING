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
    const sections = ["costa", "zhongtong", "higer", "dragon", "scania", "yutong", "log", "reg", "cat"];
    sections.forEach(id => {
        let el = document.getElementById(id);
        if (el) el.style.display = "none"; 
    });
    document.getElementById("navicon").style.display = "none";
}

function showyutong(isBackAction = false) {
    let dbname = localStorage.getItem("name");
    if (!dbname) { showregister(); return; }
    
    hideAllSections();
    document.getElementById("yutong").style.display = "block";
    document.getElementById("navicon").style.display = "flex";    
    if (!isBackAction) history.pushState({ page: "yutong" }, "Yutong", "#yutong");
}

function showzhongtong(isBackAction = false) {
    let dbname = localStorage.getItem("name");
    if (!dbname) { showregister(); return; }
    
    hideAllSections();
    document.getElementById("zhongtong").style.display = "block";
    document.getElementById("navicon").style.display = "flex";            
    if (!isBackAction) history.pushState({ page: "zhongtong" }, "Zhongtong", "#zhongtong");
}

function showhiger(isBackAction = false) {
    let dbname = localStorage.getItem("name");
    if (!dbname) { showregister(); return; }
    
    hideAllSections();
    document.getElementById("higer").style.display = "block";
    document.getElementById("navicon").style.display = "flex";        
    if (!isBackAction) history.pushState({ page: "higer" }, "Higer", "#higer");
}

function showdragon(isBackAction = false) {
    let dbname = localStorage.getItem("name");
    if (!dbname) { showregister(); return; }
    
    hideAllSections();
    document.getElementById("dragon").style.display = "block";
    document.getElementById("navicon").style.display = "flex";        
    if (!isBackAction) history.pushState({ page: "dragon" }, "Dragon", "#dragon");
}

function showscania(isBackAction = false) {
    let dbname = localStorage.getItem("name");
    if (!dbname) { showregister(); return; }
    
    hideAllSections();
    document.getElementById("scania").style.display = "block";
    document.getElementById("navicon").style.display = "flex";        
    if (!isBackAction) history.pushState({ page: "scania" }, "Scania", "#scania");
}

function showcosta(isBackAction = false) {
    let dbname = localStorage.getItem("name");
    if (!dbname) { showregister(); return; }
    
    hideAllSections();
    document.getElementById("costa").style.display = "block";
    document.getElementById("navicon").style.display = "flex";        
    if (!isBackAction) history.pushState({ page: "costa" }, "Costa", "#costa");
}

function showcat(isBackAction = false) {
    let dbname = localStorage.getItem("name");
    if(!dbname) {
        showregister();
        return;
    }
    hideAllSections();
    document.getElementById("cat").style.display = "block";
    document.getElementById("navicon").style.display = "flex"; 
    if (!isBackAction) history.pushState({ page: "home" }, "Home", "#home");
}

function showmessage() {
    alert("start your download");
}

function alertAbout() {
    alert("Karibu Kitengo Gaming! Hii ni sehemu ya 'About Us' ambapo tunakuletea habari zote za updates za mabasi yetu halisi ya Kitanzania na Afrika Mashariki.");
}

function alertServices() {
    alert("Huduma zetu ni pamoja na kukupatia Mods kali na za kisasa kabisa za Euro Truck Simulator 2 (ETS2) zenye muonekano halisi (Realistic Experience).");
}

function alertContact() {
    alert("Wasiliana nasi kwa msaada zaidi au malipo ya moja kwa moja kupitia Simu: 0615304000 au mitandao yetu ya kijamii.");
}

function checkCurrentLocation() {
    let hash = window.location.hash;
    let dbname = localStorage.getItem("name");
    
    // Kama mtumiaji hana akaunti kwenye LocalStorage, lazima abaki kwenye Register au Login pekee!
    if (!dbname) {
        hideAllSections();
        if (hash === "#login") {
            showlogin();
        } else {
            showregister();
        }
    } else {
        // Kama ana akaunti, sasa anaweza kwenda kurasa nyingine kulingana na Link
        if (hash === "#home") showcat(true);
        else if (hash === "#yutong") showyutong(true);
        else if (hash === "#zhongtong") showzhongtong(true);
        else if (hash === "#higer") showhiger(true);
        else if (hash === "#dragon") showdragon(true);
        else if (hash === "#scania") showscania(true);
        else if (hash === "#costa") showcosta(true);
        else showcat(true); // Kama kaingia bila hash lakini ana akaunti, apelekwe Home moja kwa moja
    }
}

window.addEventListener("popstate", function(event) {
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
