// scripts/generate_html.js
(function () {
    // Tiny helpers
    function $(sel, root) { return (root || document).querySelector(sel); }
    function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  
    function esc(s) {
      s = String(s == null ? "" : s);
      return s.replace(/[&<>]/g, function (m) {
        return m === "&" ? "&amp;" : (m === "<" ? "&lt;" : "&gt;");
      });
    }
  
    function getVal(form, name) {
      var el = form && form.elements ? form.elements[name] : null;
      if (!el) return "";
      // Handle NodeList (e.g., radio groups), but we only use simple inputs here
      if (el.length && el.tagName === undefined) {
        // fall through: take first
        el = el[0];
      }
      var v = (typeof el.value !== "undefined") ? el.value : "";
      return String(v).trim();
    }
  
    function collect(form) {
      // Identity
      var first = getVal(form, "first_name");
      var middle = getVal(form, "middle_name");
      var nick = getVal(form, "nickname");
      var last = getVal(form, "last_name");
  
      var name = [first, middle].filter(Boolean).join(" ");
      if (nick) name += ' "' + nick + '"';
      if (last) name += " " + last;
  
      // Mascot
      var mascotAdj = getVal(form, "mascot_adj");
      var mascotAnimal = getVal(form, "mascot_animal");
      var mascot = [mascotAdj, mascotAnimal].filter(Boolean).join(" ");
  
      // Picture
      var url = getVal(form, "picture_url");
      var fileInput = form && form.elements ? form.elements["picture_file"] : null;
      var fileName = (fileInput && fileInput.files && fileInput.files[0]) ? fileInput.files[0].name : "";
      var imgSrc = url || fileName || "";
      var imgCaption = getVal(form, "picture_caption");
      var imgAlt = name ? ("Headshot of " + name) : "Headshot";
  
      // Personal statement
      var personalStatement = getVal(form, "personal_statement");
  
      // Seven bullets
      var bullets = {
        personal: getVal(form, "bullet_personal_bg"),
        academic: getVal(form, "bullet_academic_bg"),
        professional: getVal(form, "bullet_professional_bg"),
        web: getVal(form, "bullet_web_bg"),
        platform: getVal(form, "bullet_platform"),
        coursesOverview: getVal(form, "bullet_courses_overview"),
        interesting: getVal(form, "bullet_interesting")
      };
  
      // Courses (arrays)
      var depts = $$('input[name="course_dept[]"]', form);
      var nums = $$('input[name="course_num[]"]', form);
      var names = $$('input[name="course_name[]"]', form);
      var reasons = $$('input[name="course_reason[]"]', form);
      var courses = [];
      for (var i = 0; i < depts.length; i++) {
        var c = {
          dept: (depts[i] && depts[i].value) ? depts[i].value.trim() : "",
          num: (nums[i] && nums[i].value) ? nums[i].value.trim() : "",
          title: (names[i] && names[i].value) ? names[i].value.trim() : "",
          reason: (reasons[i] && reasons[i].value) ? reasons[i].value.trim() : ""
        };
        if (c.dept || c.num || c.title || c.reason) courses.push(c);
      }
  
      // Quote + optional extras
      var quote = getVal(form, "quote");
      var quoteAuthor = getVal(form, "quote_author");
      var funny = getVal(form, "funny");
      var share = getVal(form, "share");
  
      return {
        name: name,
        mascot: mascot,
        imgSrc: imgSrc,
        imgAlt: imgAlt,
        imgCaption: imgCaption,
        personalStatement: personalStatement,
        bullets: bullets,
        courses: courses,
        quote: quote,
        quoteAuthor: quoteAuthor,
        funny: funny,
        share: share
      };
    }
  
    function buildHTML(d) {
      var h3 = d.mascot ? (esc(d.name) + " ★ " + esc(d.mascot)) : esc(d.name);
  
      var figureBlock = d.imgSrc
        ? '  <figure>\n' +
          '    <img src="' + esc(d.imgSrc) + '" alt="' + esc(d.imgAlt) + '" />\n' +
          (d.imgCaption ? '    <figcaption>' + esc(d.imgCaption) + '</figcaption>\n' : '') +
          '  </figure>'
        : "";
  
      var bulletLines = [];
      if (d.bullets.personal) bulletLines.push('  <li><strong>Personal Background:</strong> ' + esc(d.bullets.personal) + '</li>');
      if (d.bullets.academic) bulletLines.push('  <li><strong>Academic Background:</strong> ' + esc(d.bullets.academic) + '</li>');
      if (d.bullets.professional) bulletLines.push('  <li><strong>Professional Background:</strong> ' + esc(d.bullets.professional) + '</li>');
      if (d.bullets.web) bulletLines.push('  <li><strong>Background in Web/Programming:</strong> ' + esc(d.bullets.web) + '</li>');
      if (d.bullets.platform) bulletLines.push('  <li><strong>Primary Computer Platform:</strong> ' + esc(d.bullets.platform) + '</li>');
      if (d.bullets.coursesOverview) bulletLines.push('  <li><strong>Courses You’re Taking & Why:</strong> ' + esc(d.bullets.coursesOverview) + '</li>');
      if (d.bullets.interesting) bulletLines.push('  <li><strong>Something Interesting About Me:</strong> ' + esc(d.bullets.interesting) + '</li>');
      if (d.funny) bulletLines.push('  <li><strong>Funny thing:</strong> ' + esc(d.funny) + '</li>');
      if (d.share) bulletLines.push('  <li><strong>Something I’d like to share:</strong> ' + esc(d.share) + '</li>');
  
      var bulletsBlock = bulletLines.length ? ['<ul>', bulletLines.join('\n'), '</ul>'].join('\n') : "";
  
      var coursesBlock = "";
      if (d.courses.length) {
        var items = [];
        for (var i = 0; i < d.courses.length; i++) {
          var c = d.courses[i];
          var left = [c.dept, c.num].filter(Boolean).join(" ");
          var text = '    <li>' + esc(left);
          if (c.title) text += ' – ' + esc(c.title);
          if (c.reason) text += ': ' + esc(c.reason);
          text += '</li>';
          items.push(text);
        }
        coursesBlock =
          '  <h4>Current Courses</h4>\n' +
          '  <ul>\n' +
          items.join('\n') +
          '\n  </ul>';
      }
  
      var quoteBlock = "";
      if (d.quote) {
        quoteBlock =
          '  <blockquote>\n' +
          '    <p>' + esc(d.quote) + '</p>\n' +
          (d.quoteAuthor ? '    <cite>— ' + esc(d.quoteAuthor) + '</cite>\n' : '') +
          '  </blockquote>';
      }
  
      var parts = [
        '<h2>Introduction HTML</h2>',
        '<h3>' + h3 + '</h3>',
        d.personalStatement ? '<p>' + esc(d.personalStatement) + '</p>' : '',
        figureBlock,
        bulletsBlock,
        coursesBlock,
        quoteBlock
      ];
  
      return parts.filter(Boolean).join('\n');
    }
  
    function renderCodeReplacingForm(form, htmlText) {
      var section = document.createElement('section');
      section.id = 'intro-html-output';
      section.setAttribute('aria-live', 'polite');
  
      var toolbar = document.createElement('div');
      toolbar.style.display = 'flex';
      toolbar.style.justifyContent = 'flex-end';
      toolbar.style.margin = '0 0 .5rem 0';
  
      var copyBtn = document.createElement('button');
      copyBtn.type = 'button';
      copyBtn.textContent = 'Copy Code';
      copyBtn.addEventListener('click', function () {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(htmlText).then(function () {
            copyBtn.textContent = 'Copied!';
            setTimeout(function () { copyBtn.textContent = 'Copy Code'; }, 1400);
          });
        }
      });
      toolbar.appendChild(copyBtn);
  
      var pre = document.createElement('pre');
      var code = document.createElement('code');
      code.className = 'language-html';
      code.textContent = htmlText; // show literal HTML
  
      pre.appendChild(code);
      section.appendChild(toolbar);
      section.appendChild(pre);
  
      form.parentNode.replaceChild(section, form);
  
      if (window.hljs && typeof window.hljs.highlightElement === 'function') {
        window.hljs.highlightElement(code);
      }
    }
  
    function wireUp() {
      var form = $('#intro-form');
      var btn = $('#btn-generate-html');
      if (!form || !btn) return;
  
      btn.addEventListener('click', function () {
        var h2 = $('main h2') || $('h2');
        if (h2) h2.textContent = 'Introduction HTML';
  
        var data = collect(form);
        var snippet = buildHTML(data);
        renderCodeReplacingForm(form, snippet);
      });
    }
  
    document.addEventListener('DOMContentLoaded', wireUp);
  })();
  