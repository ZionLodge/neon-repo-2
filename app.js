const backendUrl = "https://<your-render-url>"; // link Render backend
const gallery = document.getElementById("gallery");
const fileInput = document.getElementById("fileInput");
const addBtn = document.getElementById("addBtn");
const cleanBtn = document.getElementById("cleanBtn");

// Modal
const previewModal = document.getElementById("previewModal");
const modalImg = document.getElementById("modalImg");
const closeModal = document.getElementById("closeModal");
const downloadBtn = document.getElementById("downloadBtn");

addBtn.addEventListener("click", () => fileInput.click());
fileInput.addEventListener("change", () => uploadFiles(fileInput.files));
cleanBtn.addEventListener("click", cleanAll);
closeModal.addEventListener("click", () => previewModal.style.display = "none");

// Fetch files from backend and populate grid
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

    gallery.appendChild(slot);
  });
}

// Upload files
async function uploadFiles(inputFiles) {
  const formData = new FormData();
  for (const file of inputFiles) formData.append("files", file);
  const res = await fetch(`${backendUrl}/upload`, { method: "POST", body: formData });
  const data = await res.json();
  console.log(data.uploaded);
  listFiles();
}

// Clean all
async function cleanAll() {
  await fetch(`${backendUrl}/clean`, { method: "DELETE" });
  listFiles();
}

// Initial load
listFiles();
