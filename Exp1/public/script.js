let currentUsername = null;
let isLoggedIn = false;

const usernameInput = document.getElementById('usernameInput');
const itemInput = document.getElementById('itemInput');
const loginBtn = document.getElementById('loginBtn');
const logoutBtn = document.getElementById('logoutBtn');
const purchaseBtn = document.getElementById('purchaseBtn');
const updateProfileBtn = document.getElementById('updateProfileBtn');
const viewPurchasesBtn = document.getElementById('viewPurchasesBtn');
const messageDiv = document.getElementById('message');
const consoleSection = document.getElementById('consoleSection');
const eventSummary = document.getElementById('eventSummary');
const activityLog = document.getElementById('activityLog');

document.addEventListener('DOMContentLoaded', () => {
  loginBtn.addEventListener('click', handleLogin);
  logoutBtn.addEventListener('click', handleLogout);
  purchaseBtn.addEventListener('click', handlePurchase);
  updateProfileBtn.addEventListener('click', handleUpdateProfile);
  viewPurchasesBtn.addEventListener('click', handleViewPurchases);
  usernameInput.addEventListener('input', updateUsername);
  
  loadActivity();
});

function updateUsername() {
  currentUsername = usernameInput.value.trim();
}

function toggleConsole() {
  consoleSection.classList.toggle('hidden');
  if (!consoleSection.classList.contains('hidden')) {
    loadActivity();
  }
}


async function handleLogin() {
  const username = usernameInput.value.trim();
  
  if (!username) {
    showMessage('Please enter a username', 'error');
    return;
  }

  try {
    const response = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username })
    });

    const data = await response.json();

    if (data.success) {
      isLoggedIn = true;
      currentUsername = username;
      showMessage(`✓ Welcome ${username}!`, 'success');
      loginBtn.textContent = `Logged in: ${username}`;
      loginBtn.disabled = true;
      usernameInput.disabled = true;
      loadActivity();
    } else {
      showMessage(data.message, 'error');
    }
  } catch (error) {
    showMessage('Login error: ' + error.message, 'error');
  }
}

async function handleLogout() {
  if (!isLoggedIn) {
    showMessage('Not logged in', 'info');
    return;
  }

  try {
    const response = await fetch('/api/logout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: currentUsername })
    });

    const data = await response.json();

    if (data.success) {
      isLoggedIn = false;
      showMessage('✓ Logged out successfully', 'success');
      loginBtn.textContent = 'Login';
      loginBtn.disabled = false;
      usernameInput.disabled = false;
      usernameInput.value = '';
      itemInput.value = '';
      currentUsername = null;
      loadActivity();
    }
  } catch (error) {
    showMessage('Logout error: ' + error.message, 'error');
  }
}

async function handlePurchase() {
  const username = usernameInput.value.trim();
  const item = itemInput.value.trim();
  
  if (!username) {
    showMessage('Please enter a username', 'error');
    return;
  }

  if (!item) {
    showMessage('Please enter an item name', 'error');
    return;
  }

  try {
    const response = await fetch('/api/purchase', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, product: item })
    });

    const data = await response.json();

    if (data.success) {
      showMessage(`✓ ${username} purchased "${item}" for $${data.purchase.price}`, 'success');
      itemInput.value = '';
      loadActivity();
    } else {
      showMessage(data.message, 'error');
    }
  } catch (error) {
    showMessage('Purchase error: ' + error.message, 'error');
  }
}

async function handleUpdateProfile() {
  const username = usernameInput.value.trim();
  
  if (!username) {
    showMessage('Please enter a username', 'error');
    return;
  }

  const fullname = prompt('Enter full name:', username);
  if (fullname === null) return;

  const email = prompt('Enter email address:');
  if (email === null) return;

  try {
    const response = await fetch('/api/profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, fullname, email })
    });

    const data = await response.json();

    if (data.success) {
      showMessage(`✓ Profile updated for ${username}`, 'success');
      loadActivity();
    } else {
      showMessage(data.message, 'error');
    }
  } catch (error) {
    showMessage('Update error: ' + error.message, 'error');
  }
}

async function handleViewPurchases() {
  const username = usernameInput.value.trim();
  
  if (!username) {
    showMessage('Please enter a username', 'error');
    return;
  }

  try {
    const response = await fetch(`/api/purchases?username=${username}`);
    const data = await response.json();

    if (data.success) {
      if (data.purchases.length === 0) {
        showMessage(`No purchases found for ${username}`, 'info');
      } else {
        let purchases = data.purchases.map(p => `• ${p.product} ($${p.price})`).join('\n');
        alert(`Purchase History for ${username}:\n\n${purchases}`);
      }
      loadActivity();
    } else {
      showMessage(data.message, 'error');
    }
  } catch (error) {
    showMessage('Error loading purchases: ' + error.message, 'error');
  }
}

async function loadActivity() {
  try {
    const response = await fetch('/api/activity');
    const data = await response.json();

    if (data.success) {
      const activity = data.activity;
      
      document.getElementById('loginCount').textContent = activity.login;
      document.getElementById('logoutCount').textContent = activity.logout;
      document.getElementById('purchaseCount').textContent = activity.purchase;
      document.getElementById('updateCount').textContent = activity.profileUpdate;
    }
  } catch (error) {
    console.error('Activity load error:', error);
  }
}

function showMessage(message, type) {
  messageDiv.textContent = message;
  messageDiv.className = `message ${type}`;
  setTimeout(() => {
    messageDiv.className = 'message';
  }, 3000);
}
