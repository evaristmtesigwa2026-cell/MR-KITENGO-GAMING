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
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const database = firebase.database();

let slideIndex = 1;
let slideInterval = null;

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
    
    // Vuta na uonyeshe slideshow na categories
    window.loadSlides();
    window.loadCategories();
}

// ==========================================
// LOGIC YA SLIDESHOW MANAGEMENT (ADMIN & USER)
// ==========================================
window.addSlide = function() {
    let title = document.getElementById("slideTitle").value.trim();
    let desc = document.getElementById("slideDesc").value.trim();
    let fileInput = document.getElementById("slideImg");

    if (title === "") { alert("Weka kichwa cha habari cha slide!"); return; }
    if (fileInput.files.length === 0) { alert("Chagua picha ya slideshow!"); return; }

    const statusDiv = document.getElementById("slide-upload-status");
    statusDiv.style.display = "block";
    statusDiv.textContent = "Inashindilia picha ya slideshow na kupakia...";

    const file = fileInput.files[0];

    window.compressImage(file, 900, 500, 0.6, function(compressedBase64) {
        database.ref('slideshow').push({
            title: title,
            desc: desc,
            image: compressedBase64,
            timestamp: Date.now()
        })
        .then(() => {
            alert("Slide mpya imepakizwa kwa ufanisi!");
            document.getElementById("slideTitle").value = "";
            document.getElementById("slideDesc").value = "";
            fileInput.value = "";
            statusDiv.style.display = "none";
            window.loadSlides();
        })
        .catch(err => {
            alert("Kosa: " + err.message);
            statusDiv.style.display = "none";
        });
    });
}

window.loadSlides = function() {
    database.ref('slideshow').once('value', (snapshot) => {
        const slides = snapshot.val() || {};
        const slideContainer = document.getElementById("slides-list-container");
        const dotsContainer = document.getElementById("slideshow-dots-container");
        const adminSlidesList = document.getElementById("admin-slides-list");

        if (slideContainer) slideContainer.innerHTML = "";
        if (dotsContainer) dotsContainer.innerHTML = "";
        if (adminSlidesList) adminSlidesList.innerHTML = "";

        let slideCount = 0;
        let keys = Object.keys(slides);

        if (keys.length === 0) {
            // Kama hakuna slide iliyowekwa, weka iliyo ya msingi (Default)
            if (slideContainer) {
                slideContainer.innerHTML = `
                    <div class="slide-item" style="display: block;">
                        <img src="logo.jpg" alt="Kitengo Gaming Banner">
                        <div class="slide-caption">
                            <h3>KARIBU KITENGO GAMING</h3>
                            <p>Pata mods kali za ETS2 na Bus Simulator Indonesia hapa.</p>
                        </div>
                    </div>
                `;
            }
            return;
        }

        for (const [key, slide] of Object.entries(slides)) {
            slideCount++;
            
            // Populating UI Slideshow
            if (slideContainer) {
                const slideDiv = document.createElement("div");
                slideDiv.className = "slide-item";
                slideDiv.innerHTML = `
                    <img src="${slide.image}" alt="${slide.title}">
                    <div class="slide-caption">
                        <h3>${slide.title}</h3>
                        <p>${slide.desc || ''}</p>
                    </div>
                `;
                slideContainer.appendChild(slideDiv);
            }

            if (dotsContainer) {
                const dotSpan = document.createElement("span");
                dotSpan.className = "dot";
                dotSpan.setAttribute("onclick", `window.currentSlide(${slideCount})`);
                dotsContainer.appendChild(dotSpan);
            }

            // Populating Admin Slide Management List
            if (adminSlidesList) {
                const adminSlideItem = document.createElement("div");
                adminSlideItem.className = "admin-slide-item";
                adminSlideItem.innerHTML = `
                    <img src="${slide.image}" alt="Slide">
                    <div style="flex: 1;">
                        <strong style="color: #45f3ff;">${slide.title}</strong>
                        <p style="margin: 0; font-size: 12px; color: #a4a6b0;">${slide.desc || ''}</p>
                    </div>
                    <button onclick="window.deleteSlide('${key}')" style="background-color: #ff0000; width: auto; padding: 6px 12px; margin: 0;">FUTA</button>
                `;
                adminSlidesList.appendChild(adminSlideItem);
            }
        }

        slideIndex = 1;
        window.showSlides(slideIndex);
        window.startAutoSlide();
    });
}

window.deleteSlide = function(key) {
    if (confirm("Je, una uhakika unataka kufuta slide hii?")) {
        database.ref(`slideshow/${key}`).remove()
            .then(() => {
                alert("Slide imefutwa!");
                window.loadSlides();
            })
            .catch(err => alert("Hitilafu: " + err.message));
    }
}

window.plusSlides = function(n) {
    window.showSlides(slideIndex += n);
    window.resetAutoSlide();
}

window.currentSlide = function(n) {
    window.showSlides(slideIndex = n);
    window.resetAutoSlide();
}

window.showSlides = function(n) {
    let i;
    let slides = document.getElementsByClassName("slide-item");
    let dots = document.getElementsByClassName("dot");
    if (!slides || slides.length === 0) return;

    if (n > slides.length) { slideIndex = 1 }
    if (n < 1) { slideIndex = slides.length }

    for (i = 0; i < slides.length; i++) {
        slides[i].style.display = "none";
    }
    for (i = 0; i < dots.length; i++) {
        dots[i].className = dots[i].className.replace(" active", "");
    }

    if (slides[slideIndex - 1]) slides[slideIndex - 1].style.display = "block";
    if (dots[slideIndex - 1]) dots[slideIndex - 1].className += " active";
}

window.startAutoSlide = function() {
    if (slideInterval) clearInterval(slideInterval);
    slideInterval = setInterval(() => {
        window.plusSlides(1);
    }, 5000); // Badilisha slide kila sekunde 5
}

window.resetAutoSlide = function() {
    clearInterval(slideInterval);
    window.startAutoSlide();
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
            a.style.color = "#ffffff";
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

window.requestPasswordSMS = function() {
    const nambaHalotel = "0615304000";
    const jinaLaBasi = document.getElementById("pay-item-name").textContent;
    const ujumbe = `HELLO KITENGO GAMING, NAHITAJI PASSWORD YA MOD YA: ${jinaLaBasi}`;
    
    window.location.href = `sms:${nambaHalotel}?body=${encodeURIComponent(ujumbe)}`;
}

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

// CHOMBO CHA USHINDILIAJI PICHA KIOTOMATIKI
window.compressImage = function(file, maxWidth, maxHeight, quality, callback) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(event) {
        const img = new Image();
        img.onload = function() {
            const canvas = document.createElement("canvas");
            let width = img.width;
            let height = img.height;
            
            if (width > height) {
                if (width > maxWidth) {
                    height = Math.round((height * maxWidth) / width);
                    width = maxWidth;
                }
            } else {
                if (height > maxHeight) {
                    width = Math.round((width * maxHeight) / height);
                    height = maxHeight;
                }
            }
            
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext("2d");
            ctx.drawImage(img, 0, 0, width, height);
            
            const compressedBase64 = canvas.toDataURL("image/jpeg", quality || 0.5);
            callback(compressedBase64);
        };
        img.onerror = function() {
            alert("Hitilafu kwenye picha! Jaribu picha nyingine.");
        };
        img.src = event.target.result;
    };
    reader.readAsDataURL(file);
}

// PAKIA PICHA YA CATEGORY
window.addCategory = function() {
    let id = document.getElementById("newCatId").value.trim();
    let name = document.getElementById("newCatName").value.trim();
    let desc = document.getElementById("newCatDesc").value.trim();
    let fileInput = document.getElementById("newCatImg");
    
    if (id === "" || name === "") { alert("Jaza ID na Jina!"); return; }
    if (fileInput.files.length === 0) { alert("Chagua picha ya kundi!"); return; }
    
    const statusDiv = document.getElementById("cat-upload-status");
    statusDiv.style.display = "block";
    statusDiv.textContent = "Inashindilia picha ya kundi kuwa nyepesi...";
    
    const file = fileInput.files[0];
    
    window.compressImage(file, 400, 400, 0.5, function(compressedBase64) {
        database.ref('categories/' + id).set({ 
            name: name, 
            image: compressedBase64, 
            desc: desc
        })
        .then(() => {
            alert("Kundi jipya limeongezwa!");
            document.getElementById("newCatId").value = "";
            document.getElementById("newCatName").value = "";
            document.getElementById("newCatDesc").value = "";
            fileInput.value = "";
            statusDiv.style.display = "none";
            window.loadCategories();
        }).catch(err => {
            alert("Kosa: " + err.message);
            statusDiv.style.display = "none";
        });
    });
}

window.loadCategories = function() {
    database.ref('categories').once('value', (snapshot) => {
        const categories = snapshot.val() || {};
        let categorySelect = document.getElementById("uploadCategory");
        if(categorySelect) categorySelect.innerHTML = '<option value="">-- Chagua Category --</option>';
        
        let catContainer = document.getElementById("categories-container");
        if(catContainer) catContainer.innerHTML = "";
        
        for (const [key, cat] of Object.entries(categories)) {
            if(categorySelect) {
                const opt = document.createElement("option");
                opt.value = key;
                opt.textContent = cat.name;
                categorySelect.appendChild(opt);
            }
            
            if(catContainer) {
                const card = document.createElement("div");
                card.className = "card category-card";
                card.style.position = "relative";
                
                card.innerHTML = `
                    <div style="position: relative; width: 100%; height: 200px; overflow: hidden; border-radius: 15px;">
                        <img src="${cat.image}" alt="${cat.name}" style="width: 100%; height: 100%; object-fit: cover;">
                    </div>
                    <h3 style="margin: 15px 0 5px 0; text-align: center;">${cat.name}</h3>
                    <p style="margin: 0; font-size: 14px; text-align: center; color: #a4a6b0;">${cat.desc || 'Kundi la mods'}</p>
                    <button onclick="window.showBusCategory('${key}', '${cat.name}', false)" style="width: calc(100% - 30px); margin: 15px;">CHAGUA HAPA</button>
                `;
                
                catContainer.appendChild(card);
            }
        }
        
        let adminCatSelect = document.getElementById("adminCategorySelect");
        if (adminCatSelect) {
            adminCatSelect.innerHTML = '<option value="">-- Chagua Category ya Kuhariri --</option>';
            for (const [key, cat] of Object.entries(categories)) {
                const opt = document.createElement("option");
                opt.value = key;
                opt.textContent = cat.name;
                adminCatSelect.appendChild(opt);
            }
        }
    });
}

window.showBusCategory = function(catId, catName, isAdminMode = false) {
    database.ref('buses/' + catId).once('value', (snapshot) => {
        const buses = snapshot.val() || {};
        
        let isAdmin = window.location.hash === "#admin";
        
        window.hideAllSections();
        document.getElementById("bus-view-section").style.display = "block";
        document.getElementById("navicon").style.display = "flex";
        
        if (!isAdmin) {
            history.pushState({ page: catId, catName: catName }, catName, "#" + catId);
        }
        
        document.getElementById("dynamic-bus-title").textContent = catName;
        
        let busList = document.getElementById("dynamic-bus-list");
        busList.innerHTML = "";
        
        for (const [key, bus] of Object.entries(buses)) {
            const card = document.createElement("div");
            card.className = "card bus-card";
            
            if (isAdmin) {
                card.innerHTML = `
                    <div class="admin-card-wrapper" data-cat="${catId}" data-key="${key}">
                        <div style="position: relative;">
                            <img src="${bus.image}" alt="${bus.name}" class="editable-image" style="width: 100%; height: 200px; object-fit: cover; border-radius: 15px; cursor: pointer;">
                            <div class="long-press-hint" style="position: absolute; top: 5px; right: 5px; background: rgba(0,0,0,0.7); color: #45f3ff; padding: 3px 8px; border-radius: 5px; font-size: 11px; display: none;">5s = Edit</div>
                        </div>
                        <h3 class="editable-title" style="margin: 15px 0 5px 0; cursor: pointer; color: #45f3ff;">${bus.name}</h3>
                        <p class="editable-category" style="margin: 0; font-size: 12px; color: #7139e8; cursor: pointer;">${catName}</p>
                        <p class="editable-desc" style="margin: 10px 0; font-size: 14px; line-height: 1.4; text-align: left; background: rgba(0,0,0,0.2); padding: 10px; border-radius: 8px; cursor: pointer;">
                            ${bus.desc || 'Hakuna maelezo'}
                        </p>
                        <div style="display: flex; gap: 8px; margin: 10px 0;">
                            <div style="flex: 1;">
                                <label style="font-size: 11px; color: #a4a6b0;">Bei (Tsh):</label>
                                <p class="editable-price" style="margin: 0; color: #ff007f; font-weight: bold; cursor: pointer; background: rgba(0,0,0,0.2); padding: 8px; border-radius: 5px;">${bus.price || 0}</p>
                            </div>
                            <div style="flex: 1;">
                                <label style="font-size: 11px; color: #a4a6b0;">Link:</label>
                                <p class="editable-link" style="margin: 0; color: #45f3ff; font-size: 11px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; cursor: pointer; background: rgba(0,0,0,0.2); padding: 8px; border-radius: 5px;" title="${bus.link}">${bus.link ? bus.link.substring(0, 20) : ''}...</p>
                            </div>
                        </div>
                        <div style="display: flex; gap: 8px;">
                            <button onclick="window.deleteBus('${catId}', '${key}')" style="flex: 1; background-color: #ff0000; margin: 0;">FUTA</button>
                            <button onclick="window.reloadCategoryView('${catId}', '${catName}')" style="flex: 1; margin: 0;">REFRESH</button>
                        </div>
                    </div>
                `;
            } else {
                card.innerHTML = `
                    <div style="position: relative; width: 100%; height: 200px; overflow: hidden; border-radius: 15px;">
                        <img src="${bus.image}" alt="${bus.name}" style="width: 100%; height: 100%; object-fit: cover; cursor: pointer;" onclick="window.showDetails('${bus.name}', '${bus.image}', '${(bus.desc || '').replace(/'/g, "\\'")}', 'bus', '${bus.link}', '${catId}', '${catName}', ${bus.price || 0}, '${key}')">
                    </div>
                    <h3 style="margin: 15px 0 5px 0; text-align: center;">${bus.name}</h3>
                    <p style="margin: 0; font-size: 14px; text-align: center; color: #a4a6b0; line-height: 1.4;">
                        ${bus.desc || 'Hakuna maelezo'}
                    </p>
                    <div style="display: flex; gap: 8px; align-items: center; justify-content: center; margin: 12px 0;">
                        ${bus.price && parseInt(bus.price) > 0 ? 
                            `<span style="background: #ff007f; color: white; padding: 5px 12px; border-radius: 20px; font-weight: bold;">Tsh ${bus.price}</span>` : 
                            `<span style="background: #00AA00; color: white; padding: 5px 12px; border-radius: 20px; font-weight: bold;">FREE</span>`}
                    </div>
                    <button onclick="window.showDetails('${bus.name}', '${bus.image}', '${(bus.desc || '').replace(/'/g, "\\'")}', 'bus', '${bus.link}', '${catId}', '${catName}', ${bus.price || 0}, '${key}')" style="width: calc(100% - 30px); margin: 15px;">TAZAMA & DOWNLOAD</button>
                `;
            }
            
            busList.appendChild(card);
            
            if (isAdmin) {
                window.setupAdminCardListeners(card, catId, key, bus);
            }
        }
        
        let backBtn = document.createElement("button");
        backBtn.textContent = "Rudi Nyuma";
        backBtn.style.cssText = "display: block; margin: 20px auto; padding: 12px 30px; width: auto;";
        backBtn.onclick = function() {
            if (isAdmin) {
                window.showAdminPanel();
            } else {
                window.showcat();
            }
        };
        busList.parentElement.insertBefore(backBtn, busList.nextSibling);
    });
}

window.reloadCategoryView = function(catId, catName) {
    window.showBusCategory(catId, catName, false);
}

window.setupAdminCardListeners = function(card, catId, key, bus) {
    const titleEl = card.querySelector('.editable-title');
    const priceEl = card.querySelector('.editable-price');
    const linkEl = card.querySelector('.editable-link');
    const descEl = card.querySelector('.editable-desc');
    const imageEl = card.querySelector('.editable-image');
    const hintEl = card.querySelector('.long-press-hint');
    
    let pressTimer;
    
    if (imageEl) {
        imageEl.addEventListener('mousedown', () => {
            if(hintEl) hintEl.style.display = 'block';
            pressTimer = setTimeout(() => { window.editBusImage(catId, key, bus); }, 5000);
        });
        imageEl.addEventListener('mouseup', () => { clearTimeout(pressTimer); if(hintEl) hintEl.style.display = 'none'; });
        imageEl.addEventListener('mouseleave', () => { clearTimeout(pressTimer); if(hintEl) hintEl.style.display = 'none'; });
        
        imageEl.addEventListener('touchstart', () => {
            if(hintEl) hintEl.style.display = 'block';
            pressTimer = setTimeout(() => { window.editBusImage(catId, key, bus); }, 5000);
        });
        imageEl.addEventListener('touchend', () => { clearTimeout(pressTimer); if(hintEl) hintEl.style.display = 'none'; });
    }
    
    if (titleEl) {
        titleEl.addEventListener('mousedown', () => { pressTimer = setTimeout(() => { window.editBusField(catId, key, 'name', bus.name, 'Jina la Mod'); }, 5000); });
        titleEl.addEventListener('mouseup', () => clearTimeout(pressTimer));
        titleEl.addEventListener('mouseleave', () => clearTimeout(pressTimer));
        
        titleEl.addEventListener('touchstart', () => { pressTimer = setTimeout(() => { window.editBusField(catId, key, 'name', bus.name, 'Jina la Mod'); }, 5000); });
        titleEl.addEventListener('touchend', () => clearTimeout(pressTimer));
    }
    
    if (priceEl) {
        priceEl.addEventListener('mousedown', () => { pressTimer = setTimeout(() => { window.editBusField(catId, key, 'price', bus.price || 0, 'Bei ya Mod'); }, 5000); });
        priceEl.addEventListener('mouseup', () => clearTimeout(pressTimer));
        priceEl.addEventListener('mouseleave', () => clearTimeout(pressTimer));
        
        priceEl.addEventListener('touchstart', () => { pressTimer = setTimeout(() => { window.editBusField(catId, key, 'price', bus.price || 0, 'Bei ya Mod'); }, 5000); });
        priceEl.addEventListener('touchend', () => clearTimeout(pressTimer));
    }
    
    if (linkEl) {
        linkEl.addEventListener('mousedown', () => { pressTimer = setTimeout(() => { window.editBusField(catId, key, 'link', bus.link, 'Link ya Download'); }, 5000); });
        linkEl.addEventListener('mouseup', () => clearTimeout(pressTimer));
        linkEl.addEventListener('mouseleave', () => clearTimeout(pressTimer));
        
        linkEl.addEventListener('touchstart', () => { pressTimer = setTimeout(() => { window.editBusField(catId, key, 'link', bus.link, 'Link ya Download'); }, 5000); });
        linkEl.addEventListener('touchend', () => clearTimeout(pressTimer));
    }
    
    if (descEl) {
        descEl.addEventListener('mousedown', () => { pressTimer = setTimeout(() => { window.editBusField(catId, key, 'desc', bus.desc || '', 'Maelezo'); }, 5000); });
        descEl.addEventListener('mouseup', () => clearTimeout(pressTimer));
        descEl.addEventListener('mouseleave', () => clearTimeout(pressTimer));
        
        descEl.addEventListener('touchstart', () => { pressTimer = setTimeout(() => { window.editBusField(catId, key, 'desc', bus.desc || '', 'Maelezo'); }, 5000); });
        descEl.addEventListener('touchend', () => clearTimeout(pressTimer));
    }
}

window.editBusField = function(catId, key, field, currentValue, label) {
    const newValue = prompt(`Badilisha ${label}:\n\n(Sasa: ${currentValue})`, currentValue);
    if (newValue !== null && newValue !== currentValue) {
        database.ref(`buses/${catId}/${key}/${field}`).set(newValue)
            .then(() => {
                alert('Imebadilishwa kwa ufanisi!');
                window.reloadCategoryView(catId, '');
            })
            .catch(err => alert('Kosa: ' + err.message));
    }
}

window.editBusImage = function(catId, key, bus) {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    
    fileInput.onchange = function() {
        if (this.files.length > 0) {
            const file = this.files[0];
            window.compressImage(file, 500, 500, 0.5, function(compressedBase64) {
                database.ref(`buses/${catId}/${key}/image`).set(compressedBase64)
                    .then(() => {
                        alert('Picha imebadilishwa kwa ufanisi!');
                        window.reloadCategoryView(catId, '');
                    })
                    .catch(err => alert('Kosa: ' + err.message));
            });
        }
    };
    
    fileInput.click();
}

window.uploadBus = function() {
    let cat = document.getElementById("uploadCategory").value;
    let name = document.getElementById("uploadName").value.trim();
    let link = document.getElementById("uploadLink").value.trim();
    let desc = document.getElementById("uploadDesc").value.trim();
    let price = document.getElementById("uploadPrice").value;
    let password = document.getElementById("uploadPassword").value.trim();
    let fileInput = document.getElementById("uploadImg");

    if (cat === "") { alert("Chagua Category kwanza!"); return; }
    if (name === "" || link === "") { alert("Jaza jina na link!"); return; }
    if (fileInput.files.length === 0) { alert("Tafadhali chagua picha ya basi!"); return; }
    if (price && parseInt(price) > 0 && password === "") { alert("Tafadhali weka password ya mod hii ya kulipia!"); return; }

    const statusDiv = document.getElementById("bus-upload-status");
    statusDiv.style.display = "block";
    statusDiv.textContent = "Inashindilia picha kwa kasi kubwa na kupakia Firebase...";

    const file = fileInput.files[0];

    window.compressImage(file, 500, 500, 0.5, function(compressedBase64) {
        const newBusRef = database.ref('buses/' + cat).push();
        newBusRef.set({
            name: name,
            image: compressedBase64,
            link: link,
            desc: desc,
            price: price ? parseInt(price) : 0,
            password: password
        })
        .then(() => {
            alert("Mod imepakizwa kikamilifu!");
            document.getElementById("uploadName").value = "";
            document.getElementById("uploadLink").value = "";
            document.getElementById("uploadDesc").value = "";
            document.getElementById("uploadPrice").value = "";
            document.getElementById("uploadPassword").value = "";
            fileInput.value = "";
            statusDiv.style.display = "none";
        })
        .catch(err => {
            alert("Kosa: " + err.message);
            statusDiv.style.display = "none";
        });
    });
}
