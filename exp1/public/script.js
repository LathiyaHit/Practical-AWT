let user = "";

function login() {
  user = document.getElementById("username").value;

  fetch("/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username: user })
  });

  document.getElementById("welcome").innerText = "Welcome, " + user;
  document.getElementById("loginBox").classList.add("hidden");
  document.getElementById("dashboard").classList.remove("hidden");
}

function showPurchase() {
  document.getElementById("purchaseBox").classList.remove("hidden");
  document.getElementById("updateBox").classList.add("hidden");
}

function showUpdate() {
  document.getElementById("updateBox").classList.remove("hidden");
  document.getElementById("purchaseBox").classList.add("hidden");
}

function showImage() {
  const item = document.getElementById("item").value;
  const img = document.getElementById("itemImage");

  if (item === "Laptop") img.src = "https://via.placeholder.com/300?text=Laptop";
  if (item === "Phone") img.src = "https://via.placeholder.com/300?text=Phone";
  if (item === "Headphones") img.src = "https://via.placeholder.com/300?text=Headphones";
}

function purchase() {
  const item = document.getElementById("item").value;

  fetch("/purchase", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username: user, item })
  });

  alert("Purchased: " + item);
}

function updateProfile() {
  const newName = document.getElementById("newName").value;

  fetch("/update", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ oldName: user, newName })
  });

  user = newName;
  document.getElementById("welcome").innerText = "Welcome, " + user;
}

function logout() {
  fetch("/logout", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username: user })
  });

  document.getElementById("dashboard").classList.add("hidden");
  document.getElementById("loginBox").classList.remove("hidden");
}

function viewSummary() {
  fetch("/summary", { method: "POST" });
  alert("Summary printed in terminal");
}
