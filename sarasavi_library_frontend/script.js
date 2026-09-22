const $ = (selector) => document.querySelector(selector);

function showToast(message) {
  const toast = $("#toast");
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 2200);
}

// LOGIN PAGE
const loginForm = $("#loginForm");
if (loginForm) {
  const username = $("#username");
  const password = $("#password");
  const message = $("#loginMessage");

  $("#togglePassword")?.addEventListener("click", () => {
    password.type = password.type === "password" ? "text" : "password";
  });

  loginForm.addEventListener("submit", (e) => {
    e.preventDefault();
    message.classList.remove("success");

    if (!username.value.trim() || !password.value.trim()) {
      message.textContent = "Please enter both username and password.";
      return;
    }

    if (username.value.trim() === "admin" && password.value === "admin123") {
      localStorage.setItem("sarasaviUser", username.value.trim());
      message.textContent = "Login successful. Redirecting...";
      message.classList.add("success");
      setTimeout(() => window.location.href = "home.html", 450);
    } else {
      message.textContent = "Invalid login. Use admin / admin123 for this demo.";
    }
  });

  $("#exitBtn")?.addEventListener("click", () => {
    if (confirm("Do you want to exit the Sarasavi Library system?")) {
      window.location.href = "about:blank";
    }
  });
}

// HOME PAGE
const welcomeUser = $("#welcomeUser");
if (welcomeUser) {
  const currentUser = localStorage.getItem("sarasaviUser") || "Guest";
  welcomeUser.textContent = `Welcome, ${currentUser}`;

  $("#logoutBtn")?.addEventListener("click", () => {
    localStorage.removeItem("sarasaviUser");
    window.location.href = "index.html";
  });

  document.querySelectorAll("[data-placeholder]").forEach(card => {
    card.addEventListener("click", (e) => {
      e.preventDefault();
      showToast(`${card.dataset.placeholder} page can be added next.`);
    });
  });
}

// BOOK REGISTRATION
const bookForm = $("#bookForm");
const tableBody = $("#bookTableBody");

function getBooks() {
  return JSON.parse(localStorage.getItem("sarasaviBooks") || "[]");
}

function saveBooks(books) {
  localStorage.setItem("sarasaviBooks", JSON.stringify(books));
}

function getBookFormData() {
  return {
    bookId: $("#bookId").value.trim(),
    bookName: $("#bookName").value.trim(),
    author: $("#author").value.trim(),
    category: $("#category").value,
    language: $("#language").value,
    pages: $("#pages").value,
    price: $("#price").value,
    publisher: $("#publisher").value.trim(),
    status: $("#status").value,
    location: $("#location").value.trim(),
    acquisitionDate: $("#acquisitionDate").value,
    quantity: $("#quantity").value
  };
}

function setBookForm(book) {
  $("#bookId").value = book.bookId || "";
  $("#bookName").value = book.bookName || "";
  $("#author").value = book.author || "";
  $("#category").value = book.category || "";
  $("#language").value = book.language || "";
  $("#pages").value = book.pages || "";
  $("#price").value = book.price || "";
  $("#publisher").value = book.publisher || "";
  $("#status").value = book.status || "";
  $("#location").value = book.location || "";
  $("#acquisitionDate").value = book.acquisitionDate || "";
  $("#quantity").value = book.quantity || "";
}

function validateBook(book) {
  const msg = $("#bookMessage");
  msg.classList.remove("success");

  if (!book.bookId || !book.bookName || !book.author) {
    msg.textContent = "Book ID, Book Name and Author are required.";
    return false;
  }

  msg.textContent = "";
  return true;
}

function renderBooks(filter = "") {
  if (!tableBody) return;
  const books = getBooks();
  const q = filter.trim().toLowerCase();

  const filtered = books.filter(book =>
    [book.bookId, book.bookName, book.author, book.category, book.status]
      .some(v => String(v || "").toLowerCase().includes(q))
  );

  tableBody.innerHTML = filtered.length
    ? filtered.map(book => `
      <tr data-book-id="${book.bookId}">
        <td>${escapeHtml(book.bookId)}</td>
        <td>${escapeHtml(book.bookName)}</td>
        <td>${escapeHtml(book.author)}</td>
        <td>${escapeHtml(book.category || "-")}</td>
        <td>${escapeHtml(book.status || "-")}</td>
        <td>${escapeHtml(book.quantity || "0")}</td>
      </tr>
    `).join("")
    : `<tr><td colspan="6">No books registered yet.</td></tr>`;

  tableBody.querySelectorAll("tr[data-book-id]").forEach(row => {
    row.addEventListener("click", () => {
      const book = getBooks().find(b => b.bookId === row.dataset.bookId);
      if (book) {
        setBookForm(book);
        showToast("Book loaded for editing.");
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    });
  });
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

if (bookForm) {
  if (!localStorage.getItem("sarasaviBooks")) {
    saveBooks([
      {
        bookId: "BK001",
        bookName: "Madol Doova",
        author: "Martin Wickramasinghe",
        category: "Fiction",
        language: "Sinhala",
        pages: "180",
        price: "950",
        publisher: "Sarasavi Publishers",
        status: "Available",
        location: "Rack A-01",
        acquisitionDate: "2026-09-21",
        quantity: "4"
      }
    ]);
  }

  renderBooks();

  bookForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const book = getBookFormData();
    if (!validateBook(book)) return;

    const books = getBooks();
    if (books.some(b => b.bookId === book.bookId)) {
      $("#bookMessage").textContent = "This Book ID already exists. Use Update instead.";
      return;
    }

    books.push(book);
    saveBooks(books);
    renderBooks();
    bookForm.reset();
    $("#bookMessage").textContent = "Book added successfully.";
    $("#bookMessage").classList.add("success");
    showToast("Book added successfully.");
  });

  $("#updateBook")?.addEventListener("click", () => {
    const book = getBookFormData();
    if (!validateBook(book)) return;

    const books = getBooks();
    const index = books.findIndex(b => b.bookId === book.bookId);
    if (index === -1) {
      $("#bookMessage").textContent = "Book ID not found.";
      return;
    }

    books[index] = book;
    saveBooks(books);
    renderBooks($("#bookSearch")?.value || "");
    $("#bookMessage").textContent = "Book updated successfully.";
    $("#bookMessage").classList.add("success");
    showToast("Book updated successfully.");
  });

  $("#deleteBook")?.addEventListener("click", () => {
    const id = $("#bookId").value.trim();
    if (!id) {
      $("#bookMessage").textContent = "Enter or select a Book ID to delete.";
      return;
    }

    const books = getBooks();
    if (!books.some(b => b.bookId === id)) {
      $("#bookMessage").textContent = "Book ID not found.";
      return;
    }

    if (!confirm(`Delete book ${id}?`)) return;

    saveBooks(books.filter(b => b.bookId !== id));
    renderBooks($("#bookSearch")?.value || "");
    bookForm.reset();
    $("#bookMessage").textContent = "Book deleted successfully.";
    $("#bookMessage").classList.add("success");
    showToast("Book deleted.");
  });

  $("#bookSearch")?.addEventListener("input", (e) => renderBooks(e.target.value));
}
