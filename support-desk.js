(function () {
  if (window._supportDesk) return;
  window._supportDesk = 1;

  var css = document.createElement("link");
  css.rel = "stylesheet";
  css.href = "./support-desk.css?v=120";
  document.head.appendChild(css);

  var QUICK = [
    { key: "/noted", text: "शिकायत नोट हो गई। हम जाँच कर रहे हैं।" },
    { key: "/photo", text: "कृपया समस्या की फोटो भेजें।" },
    { key: "/upi", text: "UPI से भुगतान के बाद रसीद की फोटो यहीं भेज दें।" },
    { key: "/done", text: "आपका काम हो गया। और मदद चाहिए तो लिखें।" }
  ];

  function fs() {
    try {
      if (window.firebase && firebase.apps && firebase.apps.length) return firebase.firestore();
    } catch (e) {}
    return window.fs || null;
  }
  function me() { return window.user || null; }
  function isAdmin() {
    var u = me();
    return !!(u && (u.role === "admin" || u.phone === window.ADMIN_PHONE || window.admin));
  }
  function threadId() {
    var u = me();
    if (u && u.phone) return "p_" + String(u.phone).replace(/\D/g, "").slice(-10);
    var id = localStorage.getItem("k_support_tid");
    if (!id) {
      id = "g_" + Math.random().toString(36).slice(2, 10);
      localStorage.setItem("k_support_tid", id);
    }
    return id;
  }
  function guestName() {
    return localStorage.getItem("k_support_name") || "";
  }
  function clock(iso) {
    var d = new Date(iso);
    if (isNaN(d.getTime())) return "";
    return d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
  }
  function dayLabel(iso) {
    var d = new Date(iso);
    if (isNaN(d.getTime())) return "";
    var start = new Date(); start.setHours(0, 0, 0, 0);
    var that = new Date(d); that.setHours(0, 0, 0, 0);
    var diff = (start - that) / 86400000;
    if (diff === 0) return "आज";
    if (diff === 1) return "कल";
    return d.toLocaleDateString("hi-IN", { day: "2-digit", month: "short" });
  }
  function esc(s) {
    return String(s || "").replace(/[&<>"]/g, function (c) {
      return { "&": "&", "<": "<", ">": ">", '"': """ }[c];
    });
  }
  function beep() {
    try {
      var ctx = new AudioContext();
      var osc = ctx.createOscillator();
      var gain = ctx.createGain();
      osc.frequency.value = 880;
      gain.gain.value = 0.04;
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.12);
    } catch (e) {}
  }
  function shrinkImage(file) {
    return new Promise(function (resolve, reject) {
      var img = new Image();
      var url = URL.createObjectURL(file);
      img.onload = function () {
        var max = 900;
        var w = img.width, h = img.height;
        if (w > max || h > max) {
          var r = Math.min(max / w, max / h);
          w = Math.round(w * r); h = Math.round(h * r);
        }
        var c = document.createElement("canvas");
        c.width = w; c.height = h;
        c.getContext("2d").drawImage(img, 0, 0, w, h);
        URL.revokeObjectURL(url);
        var data = c.toDataURL("image/jpeg", 0.72);
        if (data.length > 700000) return reject(new Error("फोटो बड़ी है"));
        resolve(data);
      };
      img.onerror = function () { reject(new Error("फोटो नहीं खुली")); };
      img.src = url;
    });
  }

  function mount() {
    if (document.getElementById("sdRoot")) return;
    var root = document.createElement("div");
    root.id = "sdRoot";
    root.innerHTML =
      '<section id="sdPanel" class="sd-panel" hidden>' +
        '<header class="sd-head"><div><b id="sdTitle">कोल्डीहा सहायता</b><div class="sd-sub" id="sdSub">आमतौर पर कुछ मिनट में जवाब</div></div><button type="button" id="sdClose" aria-label="बंद">✕</button></header>' +
        '<div id="sdList" class="sd-list"></div>' +
        '<div id="sdThreads" class="sd-threads" hidden></div>' +
        '<form id="sdForm" class="sd-form">' +
          '<div id="sdQuick" class="sd-quick" hidden></div>' +
          '<img id="sdPrev" class="sd-prev" alt="" hidden/>' +
          '<div class="sd-row">' +
            '<button type="button" id="sdPic" aria-label="फोटो">+</button>' +
            '<textarea id="sdText" rows="1" maxlength="500" placeholder="संदेश लिखें"></textarea>' +
            '<button type="submit" id="sdSend" aria-label="भेजो">➤</button>' +
          '</div>' +
          '<input id="sdFile" type="file" accept="image/*" hidden/>' +
        '</form>' +
      '</section>' +
      '<button type="button" id="sdFab" class="sd-fab" aria-label="सहायता चैट">💬<span id="sdBadge" hidden>0</span></button>';
    (document.querySelector(".phone") || document.body).appendChild(root);

    document.getElementById("sdFab").onclick = function () { toggle(true); };
    document.getElementById("sdClose").onclick = function () { toggle(false); };
    document.getElementById("sdPic").onclick = function () { document.getElementById("sdFile").click(); };
    document.getElementById("sdFile").onchange = function (e) {
      var f = e.target.files && e.target.files[0];
      e.target.value = "";
      if (!f) return;
      shrinkImage(f).then(function (data) {
        window._sdImage = data;
        var img = document.getElementById("sdPrev");
        img.src = data; img.hidden = false;
      }).catch(function (err) { if (typeof toast === "function") toast(err.message || "फोटो नहीं गई"); });
    };
    document.getElementById("sdText").addEventListener("input", onType);
    document.getElementById("sdText").addEventListener("keydown", function (e) {
      if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); document.getElementById("sdForm").requestSubmit(); }
    });
    document.getElementById("sdForm").onsubmit = function (e) { e.preventDefault(); send(); };
  }

  var open = false, mode = "user", active = "", lines = [], threads = [], unsubL = null, unsubT = null, heard = 0;

  function toggle(force) {
    open = typeof force === "boolean" ? force : !open;
    document.getElementById("sdPanel").hidden = !open;
    document.getElementById("sdFab").classList.toggle("on", open);
    if (open) listen();
  }

  function listen() {
    var store = fs();
    if (!store) {
      document.getElementById("sdList").innerHTML = '<p class="sd-empty">क्लाउड जुड़ नहीं रहा। एक बार रीफ्रेश करें।</p>';
      return;
    }
    if (isAdmin() && mode !== "reply") startInbox(store);
    else startUser(store);
  }

  function startUser(store) {
    mode = "user";
    active = threadId();
    document.getElementById("sdTitle").textContent = "कोल्डीहा सहायता";
    document.getElementById("sdThreads").hidden = true;
    document.getElementById("sdList").hidden = false;
    document.getElementById("sdForm").hidden = false;
    if (unsubL) unsubL();
    unsubL = store.collection("supportThreads").doc(active).collection("lines").orderBy("at").onSnapshot(function (qs) {
      lines = qs.docs.map(function (d) { var x = d.data(); x.id = d.id; return x; });
      paintLines("user");
      if (open) store.collection("supportThreads").doc(active).set({ customerSeen: new Date().toISOString() }, { merge: true }).catch(function () {});
    }, function () {
      document.getElementById("sdList").innerHTML = '<p class="sd-empty">चैट लोड नहीं हुई।</p>';
    });
  }

  function startInbox(store) {
    mode = "inbox";
    document.getElementById("sdTitle").textContent = "सपोर्ट इनबॉक्स";
    document.getElementById("sdSub").textContent = "ग्राहक संदेश";
    document.getElementById("sdList").hidden = true;
    document.getElementById("sdForm").hidden = true;
    document.getElementById("sdThreads").hidden = false;
    if (unsubT) unsubT();
    unsubT = store.collection("supportThreads").orderBy("lastAt", "desc").limit(40).onSnapshot(function (qs) {
      threads = qs.docs.map(function (d) { var x = d.data(); x.id = d.id; return x; });
      var unread = threads.reduce(function (s, t) { return s + Number(t.unread || 0); }, 0);
      if (heard && unread > heard) beep();
      heard = unread;
      var badge = document.getElementById("sdBadge");
      badge.hidden = unread < 1;
      badge.textContent = unread > 9 ? "9+" : String(unread);
      paintThreads();
    });
  }

  function openThread(id) {
    var store = fs();
    if (!store) return;
    mode = "reply";
    active = id;
    var row = threads.filter(function (t) { return t.id === id; })[0] || {};
    document.getElementById("sdTitle").textContent = row.name || "श्रद्धालु";
    document.getElementById("sdSub").textContent = row.phone || "जवाब लिखें · / से शॉर्टकट";
    document.getElementById("sdThreads").hidden = true;
    document.getElementById("sdList").hidden = false;
    document.getElementById("sdForm").hidden = false;
    store.collection("supportThreads").doc(id).set({ unread: 0 }, { merge: true }).catch(function () {});
    if (unsubL) unsubL();
    unsubL = store.collection("supportThreads").doc(id).collection("lines").orderBy("at").onSnapshot(function (qs) {
      lines = qs.docs.map(function (d) { var x = d.data(); x.id = d.id; return x; });
      paintLines("admin");
    });
  }

  function paintThreads() {
    var box = document.getElementById("sdThreads");
    if (!threads.length) { box.innerHTML = '<p class="sd-empty">अभी कोई संदेश नहीं।</p>'; return; }
    box.innerHTML = threads.map(function (t) {
      return '<button type="button" class="sd-thread" data-id="' + esc(t.id) + '"><b>' + esc(t.name || "अतिथि") + '</b><span>' + esc(t.last || "फोटो") + '</span>' + (t.unread ? '<i>' + t.unread + '</i>' : '') + '</button>';
    }).join("");
    box.querySelectorAll(".sd-thread").forEach(function (btn) {
      btn.onclick = function () { openThread(btn.getAttribute("data-id")); };
    });
  }

  function paintLines(mine) {
    var box = document.getElementById("sdList");
    if (!lines.length) {
      box.innerHTML = '<p class="sd-empty">नमस्ते। पूजा, चंदा या पंडाल के बारे में लिखें। एडमिन यहीं जवाब देगा।</p>';
      return;
    }
    var lastDay = "";
    box.innerHTML = lines.map(function (line) {
      var day = dayLabel(line.at);
      var chip = day !== lastDay ? '<p class="sd-day">' + esc(day) + '</p>' : "";
      lastDay = day;
      var own = line.from === mine || (mine === "user" && line.from === "user") || (mine === "admin" && line.from === "admin");
      return chip + '<div class="sd-bub ' + (own ? "me" : "") + '">' +
        (line.text ? '<p>' + esc(line.text) + '</p>' : '') +
        (line.image ? '<img src="' + line.image + '" alt="फोटो"/>' : '') +
        '<time>' + clock(line.at) + '</time></div>';
    }).join("");
    box.scrollTop = box.scrollHeight;
  }

  function onType() {
    var text = document.getElementById("sdText").value;
    var quick = document.getElementById("sdQuick");
    if (mode === "reply" && text.indexOf("/") === 0) {
      var hit = QUICK.filter(function (r) { return r.key.indexOf(text.split(" ")[0]) === 0; });
      quick.hidden = !hit.length;
      quick.innerHTML = hit.map(function (r) { return '<button type="button" data-t="' + esc(r.text) + '"><b>' + r.key + '</b> ' + esc(r.text) + '</button>'; }).join("");
      quick.querySelectorAll("button").forEach(function (b) { b.onclick = function () { document.getElementById("sdText").value = b.getAttribute("data-t"); send(); }; });
    } else quick.hidden = true;
  }

  async function send() {
    var store = fs();
    var text = (document.getElementById("sdText").value || "").trim();
    var image = window._sdImage || "";
    if (!store) return typeof toast === "function" && toast("क्लाउड जुड़ा नहीं");
    if (!text && !image) return;
    if (mode === "user") {
      var u = me();
      var name = (u && u.name) || guestName();
      if (!name) {
        name = (prompt("अपना नाम लिखें", "") || "").trim();
        if (!name) return;
        localStorage.setItem("k_support_name", name);
      }
      var id = threadId();
      var phone = (u && u.phone) || "";
      await store.collection("supportThreads").doc(id).set({
        name: name, phone: phone, last: text || "फोटो", lastAt: Date.now(),
        unread: firebase.firestore.FieldValue.increment(1), status: "pending"
      }, { merge: true });
      await store.collection("supportThreads").doc(id).collection("lines").add({
        from: "user", text: text, image: image, at: new Date().toISOString()
      });
    } else if (mode === "reply" && active) {
      await store.collection("supportThreads").doc(active).set({
        last: text || "फोटो", lastAt: Date.now(), status: "pending"
      }, { merge: true });
      await store.collection("supportThreads").doc(active).collection("lines").add({
        from: "admin", text: text, image: image, at: new Date().toISOString()
      });
    }
    document.getElementById("sdText").value = "";
    window._sdImage = "";
    document.getElementById("sdPrev").hidden = true;
    document.getElementById("sdQuick").hidden = true;
  }

  function boot() {
    var splash = document.getElementById("splash");
    if (splash) splash.classList.add("hide");
    mount();
    var store = fs();
    if (store && isAdmin()) startInbox(store);
    else if (store) {
      store.collection("supportThreads").doc(threadId()).onSnapshot(function (doc) {
        var seen = (doc.data() && doc.data().customerSeen) || "";
        var badge = document.getElementById("sdBadge");
        if (!badge) return;
        store.collection("supportThreads").doc(threadId()).collection("lines").where("from", "==", "admin").get().then(function (qs) {
          var n = 0;
          qs.forEach(function (d) { if ((d.data().at || "") > seen) n++; });
          badge.hidden = n < 1 || open;
          badge.textContent = String(n);
        }).catch(function () {});
      });
    }
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", function () { setTimeout(boot, 600); });
  else setTimeout(boot, 600);
  setInterval(function () {
    var splash = document.getElementById("splash");
    if (splash && !splash.classList.contains("hide")) splash.classList.add("hide");
  }, 2000);
})();
