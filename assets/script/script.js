const buku = [];
const RENDER_EVENT = "render-buku";

function show() {
  let show = document.getElementById("input").style.visibility;
  if (show == "hidden") {
    document.getElementById("input").style.visibility = "visible";
  } else {
    document.getElementById("input").style.visibility = "hidden";
  }
}

document.addEventListener("DOMContentLoaded", function () {
  const submitForm = document.getElementById("form");
  submitForm.addEventListener("submit", function (event) {
    event.preventDefault();
    tambahBuku();
    reset();
  });
  if (isStorageExist()) {
    loadDataFromStorage();
  }
});

function reset() {
  document.getElementById("judul").value = "";
  document.getElementById("penulis").value = "";
  document.getElementById("tahun").value = "";
}

function tambahBuku() {
  const judulBuku = document.getElementById("judul").value;
  const penulisBuku = document.getElementById("penulis").value;
  const tahunBuku = document.getElementById("tahun").value;

  const generatedID = generateId();
  const ObjectBuku = generateObjectBuku(
    generatedID,
    judulBuku,
    penulisBuku,
    tahunBuku,
    false
  );
  buku.push(ObjectBuku);

  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function generateId() {
  return +new Date();
}

function generateObjectBuku(id, judul, penulis, tahun, isCompleted) {
  return {
    id,
    judul,
    penulis,
    tahun,
    isCompleted,
  };
}

document.addEventListener(RENDER_EVENT, function () {
  const bukuBelumSelesai = document.getElementById("uncompleted-book");
  bukuBelumSelesai.innerHTML = "";

  const bukuSelesai = document.getElementById("completed-book");
  bukuSelesai.innerHTML = "";

  for (const bookItem of buku) {
    const elemenBuku = buatBuku(bookItem);
    if (!bookItem.isCompleted) {
      bukuBelumSelesai.append(elemenBuku);
    } else bukuSelesai.append(elemenBuku);
  }
});

function buatBuku(ObjectBuku) {
  const textJudulBuku = document.createElement("h3");
  textJudulBuku.innerText = ObjectBuku.judul;

  const textPenulisBuku = document.createElement("p");
  textPenulisBuku.innerText = "Penulis :" + " " + ObjectBuku.penulis;

  const dateTahunBuku = document.createElement("p");
  dateTahunBuku.innerText = ObjectBuku.tahun;

  const textContainer = document.createElement("div");
  textContainer.classList.add("inner");
  textContainer.append(textJudulBuku, textPenulisBuku, dateTahunBuku);

  const container = document.createElement("div");
  container.classList.add("item");
  container.append(textContainer);
  container.setAttribute("id", `todo-${ObjectBuku.id}`);

  const buttonContainer = document.createElement("div");
  container.classList.add("button-container");
  container.append(buttonContainer);

  if (ObjectBuku.isCompleted) {
    const undoButton = document.createElement("button");
    undoButton.classList.add("undo-button");

    undoButton.addEventListener("click", function () {
      undoBuku(ObjectBuku.id);
    });

    const trashButton = document.createElement("button");
    trashButton.classList.add("trash-button");

    trashButton.addEventListener("click", function () {
      hapusBuku(ObjectBuku.id);
    });

    const editButton = document.createElement("button");
    editButton.classList.add("edit-button");

    editButton.addEventListener("click", function () {
      editBuku(ObjectBuku.id);
    });

    buttonContainer.append(editButton, undoButton, trashButton);
  } else {
    const checkButton = document.createElement("button");
    checkButton.classList.add("check-button");

    const trashButton = document.createElement("button");
    trashButton.classList.add("trash-button");

    const editButton = document.createElement("button");
    editButton.classList.add("edit-button");

    trashButton.addEventListener("click", function () {
      hapusBuku(ObjectBuku.id);
    });
    checkButton.addEventListener("click", function () {
      bukuSelesai(ObjectBuku.id);
    });
    editButton.addEventListener("click", function () {
      editBuku(ObjectBuku.id);
    });

    buttonContainer.append(editButton, checkButton, trashButton);
  }

  return container;
}

function bukuSelesai(id) {
  const targetBuku = temukanBuku(id);

  if (targetBuku == null) return;

  targetBuku.isCompleted = true;
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function temukanBuku(id) {
  for (const bookItem of buku) {
    if (bookItem.id === id) {
      return bookItem;
    }
  }
  return null;
}

function hapusBuku(id) {
  const targetBuku = temukanIndeksBuku(id);

  if (targetBuku === -1) return;

  buku.splice(targetBuku, 1);
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function undoBuku(id) {
  const targetBuku = temukanBuku(id);

  if (targetBuku == null) return;

  targetBuku.isCompleted = false;
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function temukanIndeksBuku(id) {
  for (const index in buku) {
    if (buku[index].id === id) {
      return index;
    }
  }

  return -1;
}

function editBuku(id) {
  const targetBuku = temukanBuku(id);

  if (targetBuku == null) return;
  document.getElementById("input").style.visibility = "visible";
  document.getElementById("judul").value = targetBuku.judul;
  document.getElementById("penulis").value = targetBuku.penulis;
  document.getElementById("tahun").value = targetBuku.tahun;

  document.dispatchEvent(new Event(RENDER_EVENT));
  editData(id);
}

function cariBuku() {
  const cari = document.getElementById("cari").value;
  const bukuBelumSelesai = document.getElementById("uncompleted-book");
  bukuBelumSelesai.innerHTML = "";

  const bukuSelesai = document.getElementById("completed-book");
  bukuSelesai.innerHTML = "";

  for (const bookItem of buku) {
    const elemenBuku = buatBuku(bookItem);
    if (bookItem.judul.toLowerCase().includes(cari.toLowerCase())) {
      if (!bookItem.isCompleted) {
        bukuBelumSelesai.append(elemenBuku);
      } else bukuSelesai.append(elemenBuku);
    }
  } 
}

function saveData() {
  if (isStorageExist()) {
    const parsed = JSON.stringify(buku);
    localStorage.setItem(STORAGE_KEY, parsed);
    document.dispatchEvent(new Event(SAVED_EVENT));
  }
}

function editData(id) {
  if (isStorageExist()) {
    const targetBuku = temukanIndeksBuku(id);

    if (targetBuku === -1) return;
  
    buku.splice(targetBuku, 1);
    document.dispatchEvent(new Event(RENDER_EVENT));

    const parsed = JSON.stringify(buku);
    localStorage.setItem(STORAGE_KEY, parsed);
    document.dispatchEvent(new Event(SAVED_EVENT));
    saveData();
  }
}

const SAVED_EVENT = "saved-buku";
const STORAGE_KEY = "BOOK_APPS";

function isStorageExist() {
  if (typeof Storage === undefined) {
    alert("Browser kamu tidak mendukung local storage");
    return false;
  }
  return true;
}

document.addEventListener(SAVED_EVENT, function () {
  console.log(localStorage.getItem(STORAGE_KEY));
});

function loadDataFromStorage() {
  const serializedData = localStorage.getItem(STORAGE_KEY);
  let data = JSON.parse(serializedData);

  if (data !== null) {
    for (const book of data) {
      buku.push(book);
    }
  }

  document.dispatchEvent(new Event(RENDER_EVENT));
}
