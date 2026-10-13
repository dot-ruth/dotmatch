/* DotMatch content script: pre-fills application forms on supported ATS sites.
   It never submits anything — the applicant reviews every field themselves. */
(() => {
  "use strict";

  if (window.__dotmatchLoaded) return;
  window.__dotmatchLoaded = true;

  const EXCLUDE_RE =
    /(password|passcode|confirm|verify|captcha|consent|terms|agree|newsletter|opt-?in|honeypot|referrer|reference|friend|how did you hear|source of|re-enter)/i;

  const SPECS = [
    {
      id: "email",
      types: ["email"],
      autocomplete: ["email"],
      labelRe: /e-?mail/i,
      value: (ctx) => ctx.settings.email,
    },
    {
      id: "phone",
      types: ["tel"],
      autocomplete: ["tel", "tel-national", "tel-country"],
      labelRe: /\b(phone|mobile|telephone|contact number|cell)\b/i,
      value: (ctx) => ctx.settings.phone,
    },
    {
      id: "firstName",
      autocomplete: ["given-name", "additional-name"],
      labelRe: /\b(first name|given name|forename)\b/i,
      value: (ctx) => splitName(ctx.settings.name).first,
    },
    {
      id: "lastName",
      autocomplete: ["family-name"],
      labelRe: /\b(last name|surname|family name)\b/i,
      value: (ctx) => splitName(ctx.settings.name).last,
    },
    {
      id: "fullName",
      autocomplete: ["name"],
      labelRe: /\b(full name|your name|applicant name|name of applicant|candidate name|legal name)\b/i,
      value: (ctx) => ctx.settings.name,
    },
    {
      id: "city",
      autocomplete: ["address-level2"],
      labelRe: /\b(city|town|location you are based|current location)\b/i,
      value: (ctx) => ctx.settings.city,
    },
    {
      id: "linkedin",
      labelRe: /\b(linked ?in)\b/i,
      value: (ctx) => ctx.settings.linkedin,
    },
    {
      id: "github",
      labelRe: /\bgit ?hub\b/i,
      value: (ctx) => ctx.settings.github,
    },
    {
      id: "portfolio",
      labelRe: /\b(portfolio|personal website|website|home page|homepage|your site)\b/i,
      value: (ctx) => ctx.settings.portfolio,
    },
    {
      id: "coverLetter",
      kinds: ["textarea"],
      labelRe:
        /\b(cover letter|letter of motivation|motivation letter|message to (the )?hiring|additional (information|comments|notes)|why (do you|are you) (want|interested)|anything else|tell us (about|why))\b/i,
      value: () => "",
      needsCover: true,
    },
  ];

  function splitName(full) {
    const parts = String(full || "").trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return { first: "", last: "" };
    if (parts.length === 1) return { first: parts[0], last: "" };
    return { first: parts[0], last: parts.slice(1).join(" ") };
  }

  function backgroundMessage(message) {
    return new Promise((resolve) => {
      try {
        chrome.runtime.sendMessage(message, (response) => {
          if (chrome.runtime.lastError) {
            resolve({ ok: false, error: chrome.runtime.lastError.message });
          } else {
            resolve(response || { ok: false, error: "No response from extension" });
          }
        });
      } catch (err) {
        resolve({ ok: false, error: String(err) });
      }
    });
  }

  function haystack(el) {
    const parts = [];
    const attr = (name) => el.getAttribute && el.getAttribute(name);
    if (attr("aria-label")) parts.push(attr("aria-label"));
    if (attr("placeholder")) parts.push(attr("placeholder"));
    if (attr("name")) parts.push(attr("name"));
    if (attr("autocomplete")) parts.push(attr("autocomplete"));
    if (el.id) {
      parts.push(el.id);
      const explicit = document.querySelector(`label[for="${CSS.escape(el.id)}"]`);
      if (explicit) parts.push(explicit.textContent || "");
    }
    const wrapping = el.closest && el.closest("label");
    if (wrapping) parts.push(wrapping.textContent || "");
    const row = el.parentElement;
    if (row) parts.push((row.textContent || "").slice(0, 160));
    return parts.join(" ").replace(/\s+/g, " ").trim();
  }

  function isFillable(el) {
    if (el.disabled || el.readOnly) return false;
    if (el.type === "password" || el.type === "checkbox" || el.type === "radio" || el.type === "file") {
      return false;
    }
    const visible =
      !!(el.offsetWidth || el.offsetHeight || el.getClientRects().length);
    if (!visible) return false;
    const text = haystack(el);
    if (EXCLUDE_RE.test(text)) return false;
    return true;
  }

  function matchesSpec(el, spec) {
    if (spec.kinds) {
      const kind = el.tagName === "TEXTAREA" ? "textarea" : "input";
      if (!spec.kinds.includes(kind)) return false;
    }
    const autocomplete = (el.getAttribute && el.getAttribute("autocomplete")) || "";
    if (spec.autocomplete && spec.autocomplete.includes(autocomplete.toLowerCase())) return true;
    if (spec.types && el.tagName === "INPUT" && spec.types.includes((el.type || "").toLowerCase())) {
      return true;
    }
    if (spec.labelRe && spec.labelRe.test(haystack(el))) return true;
    return false;
  }

  function setValue(el, value) {
    const proto =
      el.tagName === "TEXTAREA"
        ? HTMLTextAreaElement.prototype
        : HTMLInputElement.prototype;
    const descriptor = Object.getOwnPropertyDescriptor(proto, "value");
    if (descriptor && descriptor.set) descriptor.set.call(el, value);
    else el.value = value;
    el.dispatchEvent(new Event("input", { bubbles: true }));
    el.dispatchEvent(new Event("change", { bubbles: true }));
  }

  async function fillForm() {
    const payload = await backgroundMessage({ type: "dm:getPayload" });
    if (!payload || !payload.ok) {
      showToast(payload && payload.error ? payload.error : "Could not reach the DotMatch API.", true);
      return;
    }
    const ctx = { settings: payload.settings || {}, profile: payload.profile || null };

    if (!ctx.settings.name && !ctx.settings.email) {
      showToast("Set your name and email in the DotMatch popup first.", true);
      return;
    }

    const fields = Array.from(
      document.querySelectorAll("input, textarea"),
    ).filter(isFillable);

    let filled = 0;
    const taken = new Set();
    let coverEl = null;

    for (const spec of SPECS) {
      const candidates = fields.filter((el) => !taken.has(el) && matchesSpec(el, spec));
      if (spec.needsCover) {
        coverEl = candidates.find((el) => !el.value || !el.value.trim()) || null;
        if (coverEl) taken.add(coverEl);
        continue;
      }
      const value = String(spec.value(ctx) || "").trim();
      if (!value) continue;
      const el = candidates.find((candidate) => !candidate.value || !candidate.value.trim());
      if (!el) continue;
      setValue(el, value);
      taken.add(el);
      filled += 1;
    }

    let coverNote = "";
    if (coverEl && (!coverEl.value || !coverEl.value.trim())) {
      const draft = await backgroundMessage({
        type: "dm:coverLetter",
        url: window.location.href,
      });
      if (draft && draft.ok && draft.text) {
        setValue(coverEl, draft.text);
        filled += 1;
        coverNote = " Cover letter draft inserted.";
      } else if (draft && draft.error) {
        coverNote = ` Cover letter skipped: ${draft.error}.`;
      }
    }

    if (payload.profileError) {
      showToast(`Resume profile unavailable (${payload.profileError}). Filled what it could.`, true);
      return;
    }
    showToast(
      filled > 0
        ? `Filled ${filled} field${filled === 1 ? "" : "s"}.${coverNote} Review everything before you submit — nothing is sent automatically.`
        : `Nothing to fill — the form's fields didn't match your profile.${coverNote}`,
      filled === 0,
    );
  }

  /* --- tiny floating UI --- */
  let toastTimer = null;

  function showToast(message, isError) {
    let toast = document.getElementById("dm-toast");
    if (!toast) {
      toast = document.createElement("div");
      toast.id = "dm-toast";
      toast.setAttribute("role", "status");
      toast.style.cssText =
        "position:fixed;right:16px;bottom:76px;z-index:2147483646;max-width:320px;" +
        "padding:10px 14px;border-radius:10px;font:13px/1.45 system-ui,sans-serif;" +
        "box-shadow:0 8px 24px rgba(0,0,0,.18);opacity:0;transition:opacity .2s;";
      document.documentElement.appendChild(toast);
    }
    toast.style.background = isError ? "#7f1d1d" : "#14532d";
    toast.style.color = "#fff";
    toast.textContent = message;
    requestAnimationFrame(() => {
      toast.style.opacity = "1";
    });
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toast.style.opacity = "0";
    }, 6000);
  }

  function mountButton() {
    if (document.getElementById("dm-fill-btn")) return;
    const btn = document.createElement("button");
    btn.id = "dm-fill-btn";
    btn.type = "button";
    btn.textContent = "DotMatch · fill form";
    btn.style.cssText =
      "position:fixed;right:16px;bottom:16px;z-index:2147483647;cursor:pointer;" +
      "padding:10px 16px;border-radius:999px;border:none;background:#166534;color:#fff;" +
      "font:600 13px/1 system-ui,sans-serif;box-shadow:0 8px 24px rgba(0,0,0,.22);";
    btn.addEventListener("mouseenter", () => {
      btn.style.background = "#14532d";
    });
    btn.addEventListener("mouseleave", () => {
      btn.style.background = "#166534";
    });
    btn.addEventListener("click", async () => {
      btn.disabled = true;
      btn.textContent = "Filling…";
      try {
        await fillForm();
      } catch (err) {
        showToast(String(err), true);
      } finally {
        btn.disabled = false;
        btn.textContent = "DotMatch · fill form";
      }
    });
    document.documentElement.appendChild(btn);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", mountButton);
  } else {
    mountButton();
  }
})();
