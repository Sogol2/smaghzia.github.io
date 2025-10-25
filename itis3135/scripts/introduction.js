// scripts/introduction.js

(function () {
    const form = document.getElementById("intro-form");
    if (!form) return;

    // Fallback for browsers without <input type="date"> support
const ackDate = form.querySelector('input[name="ack_date"]');
const supportsDate = (() => {
  const i = document.createElement('input');
  i.setAttribute('type', 'date');
  return i.type === 'date';
})();
if (!supportsDate && ackDate) {
  ackDate.type = 'text';
  ackDate.placeholder = 'YYYY-MM-DD';
  ackDate.pattern = '\\d{4}-\\d{2}-\\d{2}';
}

  
    // ---------- Image preview wiring ----------
    // Prefer an element with id="picture_url" (recommended); else fall back to name="picture_url"
    const pictureUrl =
      form.querySelector("#picture_url") ||
      form.querySelector('input[name="picture_url"]');
    const pictureFile = form.querySelector('input[name="picture_file"]');
    const pictureCaption = form.querySelector('input[name="picture_caption"]');
    const pictureImg = document.getElementById("picture-preview");
    const pictureCap = document.getElementById("picture-preview-caption");
  
    // Stores the uploaded image as a Data URL so it renders on submit
    let uploadedDataUrl = null;
  
    // Resolve relative/absolute URLs safely
    function resolveUrl(str) {
        try {
          return new URL(str, location.href).href;
        } catch (e) {
          return "";
        }
      }
      
  
    function updatePreviewFromURL() {
      // User typed/edited the URL → ignore any prior upload
      uploadedDataUrl = null;
      if (!pictureUrl) return;
      const raw = (pictureUrl.value || "").trim();
      if (!raw) return;
      const abs = resolveUrl(raw);
      if (abs) {
        pictureImg.src = abs;
        pictureUrl.setCustomValidity("");
      }
    }
  
    function updatePreviewFromFile() {
        // NO optional chaining here
        const f = pictureFile && pictureFile.files && pictureFile.files[0];
        if (!f) return;
      
        const reader = new FileReader();
        reader.onload = function () {
          uploadedDataUrl = reader.result;   // persist uploaded image
          pictureImg.src = uploadedDataUrl;  // preview uploaded image
          // If a file is chosen, URL field is no longer required
          syncPictureRequirements();
          if (pictureUrl) pictureUrl.setCustomValidity("");
        };
        reader.readAsDataURL(f);
      }
      
  
    function updateCaption() {
      pictureCap.textContent = pictureCaption.value || "Preview";
    }
  
    // Friendly feedback if image URL is wrong
    pictureImg.addEventListener("error", () => {
      pictureImg.alt = "Image failed to load. Check the URL or upload a file.";
      pictureCap.textContent = "⚠️ Image not found";
    });
  
    // Keep the "URL required" only when no file is uploaded
    function syncPictureRequirements() {
      if (!pictureUrl) return;
      pictureUrl.required = !(pictureFile && pictureFile.files && pictureFile.files.length > 0);
    }
  
    pictureUrl?.addEventListener("input", updatePreviewFromURL);
    pictureFile?.addEventListener("change", () => {
      updatePreviewFromFile();
      syncPictureRequirements();
    });
    pictureCaption?.addEventListener("input", updateCaption);
  
    // Initial paint
    updatePreviewFromURL();
    updateCaption();
    syncPictureRequirements();
  
    // ---------- Add/Remove Courses ----------
    const coursesWrap = document.getElementById("courses");
    const addCourseBtn = document.getElementById("add-course");
  
    function makeCourseRow() {
      const row = document.createElement("div");
      row.className = "course-row";
      row.innerHTML = `
        <label>Dept * <input type="text" name="course_dept[]" required placeholder="e.g., ITIS"></label>
        <label>No. *   <input type="text" name="course_num[]"  required placeholder="e.g., 3135"></label>
        <label>Name *  <input type="text" name="course_name[]" required placeholder="Course title"></label>
        <label>Reason *<input type="text" name="course_reason[]" required placeholder="Why you're taking it"></label>
        <button type="button" class="remove-course" aria-label="Remove course">Remove</button>
      `;
      return row;
    }
  
    addCourseBtn?.addEventListener("click", () => {
      coursesWrap.appendChild(makeCourseRow());
    });
  
    coursesWrap?.addEventListener("click", (e) => {
      if (e.target.closest(".remove-course")) {
        e.target.closest(".course-row")?.remove();
      }
    });
  
    // ---------- Reset button (native reset + preview restore) ----------
    const resetBtn = document.getElementById("reset-form");
    resetBtn?.addEventListener("click", () => {
      // native reset will run first; queue UI fixes after values reset
      setTimeout(() => {
        uploadedDataUrl = null;
        updatePreviewFromURL();
        updateCaption();
        syncPictureRequirements();
      }, 0);
    });
  
    // ---------- Clear button (custom type='clear') ----------
    const clearBtn = document.getElementById("clear-form");
    if (clearBtn) {
      clearBtn.addEventListener("click", function () {
        const inputs = Array.from(form.querySelectorAll("input, textarea"));
        inputs.forEach((el) => {
          // Clear both text/url/number/date/textarea and file inputs
          el.value = "";
          if (el.type === "file") el.value = "";
        });
  
        // Remove extra course rows, keep the first
        const rows = Array.from(coursesWrap.querySelectorAll(".course-row"));
        rows.slice(1).forEach((r) => r.remove());
  
        // Reset preview state
        uploadedDataUrl = null;
        pictureImg.src = "";
        pictureCap.textContent = "Preview";
  
        // After clearing file, URL becomes required again
        syncPictureRequirements();
      });
    }
  
    // ---------- Prevent default submit; validate; render output ----------
    form.addEventListener("submit", (e) => e.preventDefault());
    form.addEventListener("submit", handleSubmit);
  
    function handleSubmit() {
      // If no uploaded image, validate the URL ourselves (supports relative)
      if (!uploadedDataUrl && pictureUrl) {
        const abs = resolveUrl((pictureUrl.value || "").trim());
        if (!abs) {
          pictureUrl.setCustomValidity("Enter a valid image URL (absolute or relative like ./images/yourphoto.jpg) or upload a file.");
          pictureUrl.reportValidity();
          return;
        }
        pictureUrl.setCustomValidity("");
        pictureImg.src = abs; // ensure preview matches what we'll render
      }
  
      // Client-side validation for the rest
      if (!form.reportValidity()) return;
  
      // Collect/Render
      const data = collectFormData(form);
      renderIntroductionResult(form, data);
    }
  
    function collectFormData(formEl) {
      const fd = new FormData(formEl);
  
      const courses = [];
      const depts = fd.getAll("course_dept[]");
      const nums = fd.getAll("course_num[]");
      const names = fd.getAll("course_name[]");
      const reasons = fd.getAll("course_reason[]");
      for (let i = 0; i < names.length; i++) {
        if (names[i] || depts[i] || nums[i] || reasons[i]) {
          courses.push({
            dept: (depts[i] || "").trim(),
            num: (nums[i] || "").trim(),
            name: (names[i] || "").trim(),
            reason: (reasons[i] || "").trim(),
          });
        }
      }
  
      // Prefer uploaded image; else resolved URL; else whatever is in preview
      const resolvedUrl =
        pictureUrl ? resolveUrl((pictureUrl.value || "").trim()) : "";
      const imageSrc = uploadedDataUrl || resolvedUrl || pictureImg?.src || "";
  
      const out = {
        first: fd.get("first_name")?.trim() || "",
        middle: fd.get("middle_name")?.trim() || "",
        nick: fd.get("nickname")?.trim() || "",
        last: fd.get("last_name")?.trim() || "",
        ackStmt: fd.get("ack_statement")?.trim() || "",
        ackDate: fd.get("ack_date") || "",
        adj: fd.get("mascot_adj")?.trim() || "",
        animal: fd.get("mascot_animal")?.trim() || "",
        divider: fd.get("divider")?.trim() || "",
        picUrl: imageSrc,
        picCap: fd.get("picture_caption")?.trim() || "",
        personal: fd.get("personal_statement")?.trim() || "",
        bullets: {
          personal_bg: fd.get("bullet_personal_bg")?.trim() || "",
          academic_bg: fd.get("bullet_academic_bg")?.trim() || "",
          professional_bg: fd.get("bullet_professional_bg")?.trim() || "",
          web_bg: fd.get("bullet_web_bg")?.trim() || "",
          platform: fd.get("bullet_platform")?.trim() || "",
          courses_overview: fd.get("bullet_courses_overview")?.trim() || "",
          interesting: fd.get("bullet_interesting")?.trim() || "",
        },
        courses,
        quote: fd.get("quote")?.trim() || "",
        quoteAuthor: fd.get("quote_author")?.trim() || "",
        funny: fd.get("funny")?.trim() || "",
        share: fd.get("share")?.trim() || "",
        links: [
          fd.get("link1")?.trim() || "",
          fd.get("link2")?.trim() || "",
          fd.get("link3")?.trim() || "",
          fd.get("link4")?.trim() || "",
          fd.get("link5")?.trim() || "",
        ].filter(Boolean),
      };
      return out;
    }
  
    // Build a result page that mirrors your intro page layout as closely as possible
    function renderIntroductionResult(formEl, d) {
      // Build name line: "First (Nick) Middle Last"
      const niceName = [d.first, d.nick ? `(${d.nick})` : "", d.middle, d.last]
        .filter(Boolean)
        .join(" ")
        .trim();
  
      // Mascot heading line like: "Sunny Macaw"
      const mascot = [d.adj, d.animal].filter(Boolean).join(" ");
  
      // Divider default
      const div = d.divider || "||";
  
      // Courses list items
      const courseLis = d.courses
        .map((c) => {
          const left = [c.dept, c.num].filter(Boolean).join(" ");
          const title = c.name || "";
          const reason = c.reason
            ? `<span class="muted"> — ${escapeHtml(c.reason)}</span>`
            : "";
          return `<li><strong>${escapeHtml(left)}</strong> ${escapeHtml(
            title
          )}${reason}</li>`;
        })
        .join("");
  
      // Links list
      const linksLis = d.links
        .map(
          (u, i) =>
            `<li><a href="${escapeAttr(u)}" target="_blank" rel="noopener">Link ${i + 1}</a></li>`
        )
        .join("");
  
      // Assemble output (keeps your page’s H2 = Introduction Form)
      const wrapper = document.createElement("div");
      wrapper.innerHTML = `
        <section class="intro-result">
          <h3 class="sr-only">Generated Introduction</h3>
  
          <h1 style="margin:0 0 .5rem 0;">${escapeHtml(niceName)} ${div} ${escapeHtml(
        mascot
      )} ${div} ITIS 3135</h1>
  
          <div class="top-links" style="margin:.25rem 0 1rem 0;">
            <ul style="display:flex;flex-wrap:wrap;gap:.5rem;list-style:none;padding:0;margin:0;">
              ${linksLis}
            </ul>
          </div>
  
          <article class="intro-layout" style="display:grid;grid-template-columns:240px 1fr;gap:1rem;align-items:start;">
            <figure style="margin:0;">
              <img src="${escapeAttr(
                d.picUrl
              )}" alt="Profile image" style="width:100%;height:auto;border:1px solid var(--line,#ddd);padding:4px;border-radius:8px;">
              <figcaption style="text-align:center;margin-top:.25rem;">${escapeHtml(
                d.picCap
              )}</figcaption>
            </figure>
  
            <div>
              <p>${escapeHtml(d.personal)}</p>
  
              <ul>
                <li><strong>Personal Background:</strong> ${escapeHtml(
                  d.bullets.personal_bg
                )}</li>
                <li><strong>Academic Background:</strong> ${escapeHtml(
                  d.bullets.academic_bg
                )}</li>
                <li><strong>Professional Background:</strong> ${escapeHtml(
                  d.bullets.professional_bg
                )}</li>
                <li><strong>Background in Web/Programming:</strong> ${escapeHtml(
                  d.bullets.web_bg
                )}</li>
                <li><strong>Primary Computer Platform:</strong> ${escapeHtml(
                  d.bullets.platform
                )}</li>
                <li><strong>Courses (overview):</strong> ${escapeHtml(
                  d.bullets.courses_overview
                )}</li>
                <li><strong>Something Interesting:</strong> ${escapeHtml(
                  d.bullets.interesting
                )}</li>
              </ul>
  
              ${
                courseLis
                  ? `<h4 style="margin-top:1rem;">Current Courses & Reasons</h4><ul>${courseLis}</ul>`
                  : ""
              }
  
              <blockquote style="margin:1rem 0;padding-left:1rem;border-left:3px solid var(--line,#ddd);">
                “${escapeHtml(d.quote)}”<br>
                <cite>— ${escapeHtml(d.quoteAuthor)}</cite>
              </blockquote>
  
              <p><em>${escapeHtml(d.ackStmt)}</em> <span class="muted">(${escapeHtml(
        d.ackDate
      )})</span></p>
  
              ${d.funny ? `<p><strong>Funny thing:</strong> ${escapeHtml(d.funny)}</p>` : ""}
              ${d.share ? `<p><strong>Something I’d like to share:</strong> ${escapeHtml(d.share)}</p>` : ""}
            </div>
          </article>
  
          <p style="margin-top:1.25rem;">
            <a href="#" id="start-over">Reset and start over</a>
          </p>
        </section>
      `;
  
      // Replace the form with result
      formEl.replaceWith(wrapper);
  
      // Reset link
      wrapper.querySelector("#start-over")?.addEventListener("click", (e) => {
        e.preventDefault();
        // simplest: reload page to restore original form with defaults
        location.reload();
      });
    }
  
    // ---------- utilities ----------
    function escapeHtml(s) {
      return String(s)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#39;");
    }

    (function initIncludes() {
        const slots = document.querySelectorAll('[data-include]');
        if (!slots.length) return;
      
        slots.forEach(async (el) => {
          if (el.innerHTML.trim()) return;
          const url = el.getAttribute('data-include');
          if (!url) return;
      
          try {
            const res = await fetch(url);
            el.innerHTML = await res.text();
          } catch (e) {
            console.warn('Include failed:', url, e);
          }
        });
      })();
      
    function escapeAttr(s) {
      return escapeHtml(s).replaceAll("`", "&#96;");
    }
  })();
  