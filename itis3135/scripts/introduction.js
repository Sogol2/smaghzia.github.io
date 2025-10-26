(function () {
    var form = document.getElementById("intro-form");
    if (!form) return;
  
    // ---------- Helpers ----------
    function resolveUrl(str) {
      try {
        return new URL(str, location.href).href;
      } catch (e) {
        return "";
      }
    }
  
    function escapeHtml(s) {
      var str = String(s == null ? "" : s);
      var map = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
      return str.replace(/[&<>"']/g, function (ch) { return map[ch]; });
    }
  
    function escapeAttr(s) {
      var esc = escapeHtml(String(s == null ? "" : s));
      return esc.split("`").join("&#96;");
    }
  
    // ---------- Date input fallback ----------
    var ackDate = form.querySelector('input[name="ack_date"]');
    var supportsDate = (function () {
      var i = document.createElement("input");
      i.setAttribute("type", "date");
      return i.type === "date";
    })();
    if (!supportsDate && ackDate) {
      ackDate.type = "text";
      ackDate.placeholder = "YYYY-MM-DD";
      ackDate.pattern = "\\d{4}-\\d{2}-\\d{2}";
    }
  
    // ---------- Image preview wiring ----------
    var pictureUrl =
      form.querySelector("#picture_url") ||
      form.querySelector('input[name="picture_url"]');
    var pictureFile = form.querySelector('input[name="picture_file"]');
    var pictureCaption = form.querySelector('input[name="picture_caption"]');
    var pictureImg = document.getElementById("picture-preview");
    var pictureCap = document.getElementById("picture-preview-caption");
  
    var uploadedDataUrl = null;
  
    function syncPictureRequirements() {
      if (!pictureUrl) return;
      var hasFile = !!(pictureFile && pictureFile.files && pictureFile.files.length > 0);
      pictureUrl.required = !hasFile;
    }
  
    function updatePreviewFromURL() {
      uploadedDataUrl = null;
      if (!pictureUrl || !pictureImg) return;
      var raw = (pictureUrl.value || "").trim();
      if (!raw) return;
      var abs = resolveUrl(raw);
      if (abs) {
        pictureImg.src = abs;
        pictureUrl.setCustomValidity("");
      }
    }
  
    function updatePreviewFromFile() {
      if (!pictureFile || !pictureImg) return;
      var f = pictureFile.files && pictureFile.files[0];
      if (!f) return;
  
      var reader = new FileReader();
      reader.onload = function () {
        uploadedDataUrl = reader.result;
        pictureImg.src = uploadedDataUrl;
        syncPictureRequirements();
        if (pictureUrl) pictureUrl.setCustomValidity("");
      };
      reader.readAsDataURL(f);
    }
  
    function updateCaption() {
      if (!pictureCap) return;
      pictureCap.textContent = (pictureCaption && pictureCaption.value) ? pictureCaption.value : "Preview";
    }
  
    if (pictureImg) {
      pictureImg.addEventListener("error", function () {
        pictureImg.alt = "Image failed to load. Check the URL or upload a file.";
        if (pictureCap) pictureCap.textContent = "⚠️ Image not found";
      });
    }
  
   
    function collectFormData(formEl) {
      var fd = new FormData(formEl);
  
      var courses = [];
      var depts = fd.getAll("course_dept[]");
      var nums = fd.getAll("course_num[]");
      var names = fd.getAll("course_name[]");
      var reasons = fd.getAll("course_reason[]");
      var i, len = Math.max(depts.length, nums.length, names.length, reasons.length);
      for (i = 0; i < len; i++) {
        var dept = (depts[i] || "").trim();
        var num = (nums[i] || "").trim();
        var name = (names[i] || "").trim();
        var reason = (reasons[i] || "").trim();
        if (dept || num || name || reason) {
          courses.push({ dept: dept, num: num, name: name, reason: reason });
        }
      }
  
      // Prefer uploaded image; else resolved URL; else preview src
      var resolvedUrl = pictureUrl ? resolveUrl((pictureUrl.value || "").trim()) : "";
      var imageSrc = uploadedDataUrl || resolvedUrl || (pictureImg ? pictureImg.src : "");
  
      function g(name) {
        var v = fd.get(name);
        return v ? String(v).trim() : "";
      }
  
      return {
        first: g("first_name"),
        middle: g("middle_name"),
        nick: g("nickname"),
        last: g("last_name"),
        ackStmt: g("ack_statement"),
        ackDate: fd.get("ack_date") ? String(fd.get("ack_date")) : "",
        adj: g("mascot_adj"),
        animal: g("mascot_animal"),
        divider: g("divider"),
        picUrl: imageSrc,
        picCap: g("picture_caption"),
        personal: g("personal_statement"),
        bullets: {
          personalBg: g("bullet_personal_bg"),
          academicBg: g("bullet_academic_bg"),
          professionalBg: g("bullet_professional_bg"),
          webBg: g("bullet_web_bg"),
          platform: g("bullet_platform"),
          coursesOverview: g("bullet_courses_overview"),
          interesting: g("bullet_interesting")
        },
        courses: courses,
        quote: g("quote"),
        quoteAuthor: g("quote_author"),
        funny: g("funny"),
        share: g("share"),
        links: [ g("link1"), g("link2"), g("link3"), g("link4"), g("link5") ]
          .filter(function (s) { return !!s; })
      };
    }
  
    function renderIntroductionResult(formEl, d) {
      var niceName = [d.first, d.nick ? "(" + d.nick + ")" : "", d.middle, d.last]
        .filter(function (x) { return !!x; })
        .join(" ")
        .trim();
  
      var mascot = [d.adj, d.animal].filter(function (x) { return !!x; }).join(" ");
      var div = d.divider || "||";
  
      var courseLis = d.courses.map(function (c) {
        var left = [c.dept, c.num].filter(function (x) { return !!x; }).join(" ");
        var title = c.name || "";
        var reason = c.reason ? '<span class="muted"> — ' + escapeHtml(c.reason) + '</span>' : "";
        return '<li><strong>' + escapeHtml(left) + '</strong> ' + escapeHtml(title) + reason + '</li>';
      }).join("");
  
      var linksLis = d.links.map(function (u, i) {
        return '<li><a href="' + escapeAttr(u) + '" target="_blank" rel="noopener">Link ' + (i + 1) + '</a></li>';
      }).join("");
  
      var wrapper = document.createElement("div");
      wrapper.innerHTML =
        '<section class="intro-result">' +
        '  <h3 class="sr-only">Generated Introduction</h3>' +
        '  <h1 style="margin:0 0 .5rem 0;">' + escapeHtml(niceName) + ' ' + div + ' ' + escapeHtml(mascot) + ' ' + div + ' ITIS 3135</h1>' +
        '  <div class="top-links" style="margin:.25rem 0 1rem 0;">' +
        '    <ul style="display:flex;flex-wrap:wrap;gap:.5rem;list-style:none;padding:0;margin:0;">' + linksLis + '</ul>' +
        '  </div>' +
        '  <article class="intro-layout" style="display:grid;grid-template-columns:240px 1fr;gap:1rem;align-items:start;">' +
        '    <figure style="margin:0;">' +
        '      <img src="' + escapeAttr(d.picUrl) + '" alt="Profile image" style="width:100%;height:auto;border:1px solid var(--line,#ddd);padding:4px;border-radius:8px;">' +
        '      <figcaption style="text-align:center;margin-top:.25rem;">' + escapeHtml(d.picCap) + '</figcaption>' +
        '    </figure>' +
        '    <div>' +
        '      <p>' + escapeHtml(d.personal) + '</p>' +
        '      <ul>' +
        '        <li><strong>Personal Background:</strong> ' + escapeHtml(d.bullets.personalBg) + '</li>' +
        '        <li><strong>Academic Background:</strong> ' + escapeHtml(d.bullets.academicBg) + '</li>' +
        '        <li><strong>Professional Background:</strong> ' + escapeHtml(d.bullets.professionalBg) + '</li>' +
        '        <li><strong>Background in Web/Programming:</strong> ' + escapeHtml(d.bullets.webBg) + '</li>' +
        '        <li><strong>Primary Computer Platform:</strong> ' + escapeHtml(d.bullets.platform) + '</li>' +
        '        <li><strong>Courses (overview):</strong> ' + escapeHtml(d.bullets.coursesOverview) + '</li>' +
        '        <li><strong>Something Interesting:</strong> ' + escapeHtml(d.bullets.interesting) + '</li>' +
        '      </ul>' +
        (courseLis ? ('      <h4 style="margin-top:1rem;">Current Courses & Reasons</h4><ul>' + courseLis + '</ul>') : '') +
        '      <blockquote style="margin:1rem 0;padding-left:1rem;border-left:3px solid var(--line,#ddd);">' +
        '        “' + escapeHtml(d.quote) + '”<br><cite>— ' + escapeHtml(d.quoteAuthor) + '</cite>' +
        '      </blockquote>' +
        '      <p><em>' + escapeHtml(d.ackStmt) + '</em> <span class="muted">(' + escapeHtml(d.ackDate) + ')</span></p>' +
        (d.funny ? ('      <p><strong>Funny thing:</strong> ' + escapeHtml(d.funny) + '</p>') : '') +
        (d.share ? ('      <p><strong>Something I’d like to share:</strong> ' + escapeHtml(d.share) + '</p>') : '') +
        '    </div>' +
        '  </article>' +
        '  <p style="margin-top:1.25rem;"><a href="#" id="start-over">Reset and start over</a></p>' +
        '</section>';
  
      formEl.replaceWith(wrapper);
  
      var startOver = wrapper.querySelector("#start-over");
      if (startOver) {
        startOver.addEventListener("click", function (e) {
          e.preventDefault();
          location.reload();
        });
      }
    }
  
    function handleSubmit() {
      // Validate image URL if no uploaded image
      if (!uploadedDataUrl && pictureUrl) {
        var abs = resolveUrl((pictureUrl.value || "").trim());
        if (!abs) {
          pictureUrl.setCustomValidity(
            "Enter a valid image URL (absolute or relative like ./images/yourphoto.jpg) or upload a file."
          );
          pictureUrl.reportValidity();
          return;
        }
        pictureUrl.setCustomValidity("");
        if (pictureImg) pictureImg.src = abs;
      }
  
      if (!form.reportValidity()) return;
  
      var data = collectFormData(form);
      renderIntroductionResult(form, data);
    }
  
    // ---------- Wire events AFTER function definitions ----------
    if (pictureFile) {
      pictureFile.addEventListener("change", function () {
        updatePreviewFromFile();
        syncPictureRequirements();
      });
    }
    if (pictureUrl) {
      pictureUrl.addEventListener("input", updatePreviewFromURL);
      pictureUrl.addEventListener("change", updatePreviewFromURL);
    }
    if (pictureCaption) {
      pictureCaption.addEventListener("input", updateCaption);
    }
  
    updatePreviewFromURL();
    updateCaption();
    syncPictureRequirements();
  
    // Courses add/remove
    var coursesWrap = document.getElementById("courses");
    var addCourseBtn = document.getElementById("add-course");
  
    function makeCourseRow() {
      var row = document.createElement("div");
      row.className = "course-row";
      row.innerHTML =
        '<label>Dept * <input type="text" name="course_dept[]" required placeholder="e.g., ITIS"></label>' +
        '<label>No. *   <input type="text" name="course_num[]"  required placeholder="e.g., 3135"></label>' +
        '<label>Name *  <input type="text" name="course_name[]" required placeholder="Course title"></label>' +
        '<label>Reason *<input type="text" name="course_reason[]" required placeholder="Why you\'re taking it"></label>' +
        '<button type="button" class="remove-course" aria-label="Remove course">Remove</button>';
      return row;
    }
  
    if (addCourseBtn && coursesWrap) {
      addCourseBtn.addEventListener("click", function () {
        coursesWrap.appendChild(makeCourseRow());
      });
    }
  
    if (coursesWrap) {
      coursesWrap.addEventListener("click", function (e) {
        var btn = e.target && e.target.closest ? e.target.closest(".remove-course") : null;
        if (btn) {
          var row = btn.closest ? btn.closest(".course-row") : null;
          if (row) row.remove();
        }
      });
    }
  
    // Reset & Clear buttons
    var resetBtn = document.getElementById("reset-form");
    if (resetBtn) {
      resetBtn.addEventListener("click", function () {
        setTimeout(function () {
          uploadedDataUrl = null;
          updatePreviewFromURL();
          updateCaption();
          syncPictureRequirements();
        }, 0);
      });
    }
  
    var clearBtn = document.getElementById("clear-form");
    if (clearBtn) {
      clearBtn.addEventListener("click", function () {
        var inputs = Array.prototype.slice.call(form.querySelectorAll("input, textarea"));
        inputs.forEach(function (el) { el.value = ""; });
  
        if (coursesWrap) {
          var rows = Array.prototype.slice.call(coursesWrap.querySelectorAll(".course-row"));
          rows.slice(1).forEach(function (r) { r.remove(); });
        }
  
        uploadedDataUrl = null;
        if (pictureImg) pictureImg.src = "";
        if (pictureCap) pictureCap.textContent = "Preview";
        syncPictureRequirements();
      });
    }
  
    // Submit listener last 
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      handleSubmit();
    });
  
    // ---------- HTML include helper (ES5-safe) ----------
    function initIncludes() {
      var slots = document.querySelectorAll("[data-include]");
      if (!slots.length) return;
      Array.prototype.forEach.call(slots, function (el) {
        if (el.innerHTML && el.innerHTML.trim()) return;
        var url = el.getAttribute("data-include");
        if (!url) return;
        fetch(url)
          .then(function (res) { return res.text(); })
          .then(function (html) { el.innerHTML = html; })
          .catch(function (e) { console.warn("Include failed:", url, e); });
      });
    }
    initIncludes();
  })();
  