// scripts/generate_json.js 
(function () {
    "use strict";
  
    // ----- helpers -----
    const q  = (sel, root) => (root || document).querySelector(sel);
    const qa = (sel, root) => Array.prototype.slice.call((root || document).querySelectorAll(sel));
    const val = (sel, root) => {
      const el = q(sel, root);
      return el ? String(el.value || "").trim() : "";
    };
  
    function middleToInitial(m) {
      const t = String(m || "").trim();
      if (!t) return "";
      return /^[A-Za-z]\.?$/.test(t) ? t : (t[0] ? t[0].toUpperCase() : "");
    }
  
    function getInputFromArray(arr, i) {
      const el = arr[i];
      return el ? String(el.value || "").trim() : "";
    }
  
    // My form
    function collectCourses() {
      const deps    = qa('input[name="course_dept[]"]');
      const nums    = qa('input[name="course_num[]"]');
      const names   = qa('input[name="course_name[]"]');
      const reasons = qa('input[name="course_reason[]"]');
  
      const max = Math.max(deps.length, nums.length, names.length, reasons.length);
      const out = [];
      for (let i = 0; i < max; i++) {
        const department = getInputFromArray(deps, i);
        const number     = getInputFromArray(nums, i);
        const name       = getInputFromArray(names, i);
        const reason     = getInputFromArray(reasons, i);
        if (department || number || name || reason) {
          out.push({ department, number, name, reason });
        }
      }
      return out;
    }
  
    function collectLinks() {
      var required = ["GitHub", "GitHub Page", "freeCodeCamp", "Codecademy", "LinkedIn"];
      return required.map(function (name) { return { name: name, href: "" }; });
    }
  
    function buildJson() {
      var data = {
        firstName:               val('input[name="first_name"]'),
        preferredName:           val('input[name="nickname"]'),
        middleInitial:           middleToInitial(val('input[name="middle_name"]')),
        lastName:                val('input[name="last_name"]'),
  
        divider:                 val('input[name="divider"]'),
        mascotAdjective:         val('input[name="mascot_adj"]'),
        mascotAnimal:            val('input[name="mascot_animal"]'),
  
        image:                   val('#picture_url') || val('input[name="picture_url"]'),
        imageCaption:            val('input[name="picture_caption"]'),
  
        personalStatement:       val('textarea[name="personal_statement"]'),
        personalBackground:      val('textarea[name="bullet_personal_bg"]'),
        professionalBackground:  val('textarea[name="bullet_professional_bg"]'),
        academicBackground:      val('textarea[name="bullet_academic_bg"]'),
        subjectBackground:       val('textarea[name="bullet_web_bg"]'),
        primaryComputer:         val('textarea[name="bullet_platform"]'),
  
        courses:                 collectCourses(),
        links:                   collectLinks()
      };
  
      return JSON.stringify(data, null, 2);
    }
  
    function replaceFormWithJson(jsonText) {
      // Update H2
      var h2 = q("main h2");
      if (h2 && /Introduction Form/i.test(h2.textContent)) {
        h2.textContent = "Introduction HTML";
      }
  
      // Swap form → code block
      var form = q("#intro-form");
      if (!form) return;
  
      var section = document.createElement("section");
      section.className = "json-output";
      section.innerHTML =
        '<pre><code class="language-json" id="json-code"></code></pre>' +
        '<button type="button" id="copy-json" aria-label="Copy JSON">Copy JSON</button>';
  
      form.parentNode.replaceChild(section, form);
  
      var code = q("#json-code", section);
      code.textContent = jsonText;
  
      // Highlight if HLJS available
      if (window.hljs && typeof window.hljs.highlightElement === "function") {
        window.hljs.highlightElement(code);
      }
  
      // Copy button
      var copyBtn = q("#copy-json", section);
      if (copyBtn) {
        copyBtn.addEventListener("click", function () {
          if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(jsonText).then(function () {
              copyBtn.textContent = "Copied!";
              setTimeout(function () { copyBtn.textContent = "Copy JSON"; }, 1200);
            })["catch"](function () {
              // Fallback: select text
              var range = document.createRange();
              range.selectNodeContents(code);
              var sel = window.getSelection();
              sel.removeAllRanges();
              sel.addRange(range);
            });
          } else {
            var range = document.createRange();
            range.selectNodeContents(code);
            var sel = window.getSelection();
            sel.removeAllRanges();
            sel.addRange(range);
          }
        });
      }
  
      if (section.scrollIntoView) {
        section.scrollIntoView({ behavior: "smooth" });
      }
    }
  
    function onGenerate() {
      var jsonText = buildJson();
      replaceFormWithJson(jsonText);
    }
  
    function wire() {
      var btn = q("#btn-generate-json");
      if (!btn) return;
      btn.addEventListener("click", function (e) {
        e.preventDefault();
        onGenerate();
      });
    }
  
    document.addEventListener("DOMContentLoaded", wire);
  })();
  