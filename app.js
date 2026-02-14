// ==============================
// !!! COMPLETARE: pui linkul Render backend aici
// ==============================
const backendUrl = "https://<your-render-url>";

const gallery = document.getElementById("gallery");
const fileInput = document.getElementById("fileInput");
const addBtn = document.getElementById("addBtn");
const cleanBtn = document.getElementById("cleanBtn");

// Modal elements
const previewModal = document.getElementById("previewModal");
const modalImg = document.getElementById("modalImg");
const closeModal = document.getElementById("closeModal");
const downloadBtn = document.getElementById("downloadBtn");

addBtn.addEventListener("click", () => fileInput.click());
fileInput.addEventListener("change", () => uploadFiles(fileInput.files));
cleanBtn.addEventListener("click", cleanAll);
closeModal.addEventListener("click", () => previewModal.style.display = "none");

// Drag & drop variables
let draggedSlot = null;

// ==============================
// LIST FILES
// ==============================
async function listFiles() {
  const res = await fetch(`${backendUrl}/files`);
  const files = await res.json();
  gallery.innerHTML = "";

  files.forEach(f => {
    const slot = document.createElement("div");
    slot.className = "slot";

    const img = document.createElement("img");
    img.src = f;
    slot.appendChild(img);

    // click to preview
    slot.addEventListener("click", () => {
      previewModal.style.display = "flex";
      modalImg.src = f;
      downloadBtn.href = f;
    });

    // right-click to delete
    slot.addEventListener("contextmenu", async (e) => {
      e.preventDefault();
      const filename = f.split("/").pop();
      await fetch(`${backendUrl}/delete/${filename}`, { method: "DELETE" });
      listFiles();
    });

    // drag & drop
    slot.draggable = true;
    slot.addEventListener("dragstart", () => draggedSlot = slot);
    slot.addEventListener("dragover", e => e.preventDefault());
    slot.addEventListener("drop", async () => {
      if (!draggedSlot || draggedSlot === slot) return;
      // swap src
      const temp = draggedSlot.querySelector("img").src;
      draggedSlot.querySelector("img").src = slot.querySelector("img").src;
      slot.querySelector("img").src = temp;
      draggedSlot = null;
    });

    gallery.appendChild(slot);
  });
}

// ==============================
// UPLOAD FILES
// ==============================
async function uploadFiles(inputFiles) {
  const formData = new FormData();
  for (const file of inputFiles) formData.append("files", file);
  const res = await fetch(`${backendUrl}/upload`, { method: "POST", body: formData });
  const data = await res.json();
  console.log("Uploaded:", data.uploaded);
  listFiles();
}

// ==============================
// CLEAN ALL FILES
// ==============================
async function cleanAll() {
  if (!confirm("Delete all files?")) return;
  await fetch(`${backendUrl}/clean`, { method: "DELETE" });
  listFiles();
}

// ==============================
// INITIAL LOAD
// ==============================
listFiles();
