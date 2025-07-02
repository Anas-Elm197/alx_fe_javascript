// DOM references
const quoteDisplay = document.getElementById('quoteDisplay');
const newQuoteBtn = document.getElementById('newQuote');
const addQuoteFormContainer = document.getElementById('addQuoteFormContainer');
const categoryFilter = document.getElementById('categoryFilter');
const syncNotification = document.getElementById('syncNotification');

// Server API simulation
const SERVER_API_URL = 'https://jsonplaceholder.typicode.com/posts?_limit=5';
const SYNC_INTERVAL_MS = 30000; // 30 seconds

// Load saved quotes or default
let localQuotes = JSON.parse(localStorage.getItem('quotes')) || [
  { id: 1, text: "The best way to get started is to quit talking and begin doing.", category: "Motivation" },
  { id: 2, text: "Don't let yesterday take up too much of today.", category: "Inspiration" },
  { id: 3, text: "You learn more from failure than from success.", category: "Life" },
];

// Ensure all quotes have IDs (assign negative IDs if missing)
localQuotes = localQuotes.map((q, i) => q.id ? q : {...q, id: -(i + 1)});

// Load last selected category
if (localStorage.getItem('selectedCategory')) {
  categoryFilter.value = localStorage.getItem('selectedCategory');
} else {
  categoryFilter.value = 'all';
}

// Save quotes helper
function saveLocalQuotes() {
  localStorage.setItem('quotes', JSON.stringify(localQuotes));
}

// Generate unique negative ID for local-only quotes
function generateLocalId() {
  return localQuotes.reduce((minId, q) => (q.id < minId ? q.id : minId), 0) - 1;
}

// Populate categories dropdown dynamically
function populateCategories() {
  const categories = [...new Set(localQuotes.map(q => q.category))];

  // Remove old categories except "All Categories"
  while (categoryFilter.options.length > 1) {
    categoryFilter.remove(1);
  }

  categories.forEach(cat => {
    const option = document.createElement('option');
    option.value = cat;
    option.textContent = cat;
    categoryFilter.appendChild(option);
  });
}

// Show random quote filtered by category
function showRandomQuote() {
  const selectedCategory = categoryFilter.value;

  const filteredQuotes = selectedCategory === 'all' 
    ? localQuotes 
    : localQuotes.filter(q => q.category === selectedCategory);

  if (filteredQuotes.length === 0) {
    quoteDisplay.innerHTML = "<em>No quotes available for this category. Add some below!</em>";
    return;
  }

  const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
  const quote = filteredQuotes[randomIndex];
  quoteDisplay.innerHTML = `<q>${quote.text}</q> — <strong>[${quote.category}]</strong>`;
}

// Filter quotes on category change
function filterQuotes() {
  localStorage.setItem('selectedCategory', categoryFilter.value);
  showRandomQuote();
}

// Create add quote form dynamically
function createAddQuoteForm() {
  const form = document.createElement('div');
  form.id = 'addQuoteForm';

  const quoteInput = document.createElement('input');
  quoteInput.id = 'newQuoteText';
  quoteInput.type = 'text';
  quoteInput.placeholder = 'Enter a new quote';

  const categoryInput = document.createElement('input');
  categoryInput.id = 'newQuoteCategory';
  categoryInput.type = 'text';
  categoryInput.placeholder = 'Enter quote category';

  const addButton = document.createElement('button');
  addButton.textContent = 'Add Quote';

  addButton.addEventListener('click', () => {
    addQuote(quoteInput.value, categoryInput.value);
    quoteInput.value = '';
    categoryInput.value = '';
  });

  form.appendChild(quoteInput);
  form.appendChild(categoryInput);
  form.appendChild(addButton);

  addQuoteFormContainer.appendChild(form);
}

// Add new quote
function addQuote(text, category) {
  if (!text.trim() || !category.trim()) {
    alert('Please enter both quote text and category.');
    return;
  }

  const newQuote = {
    id: generateLocalId(),
    text: text.trim(),
    category: category.trim(),
  };

  localQuotes.push(newQuote);
  saveLocalQuotes();

  populateCategories();

  categoryFilter.value = category.trim();
  localStorage.setItem('selectedCategory', category.trim());

  alert('Quote added!');
  showRandomQuote();
}

// Convert server post to quote format
function serverPostToQuote(post) {
  return {
    id: post.id,
    text: post.title,
    category: post.body || 'General',
  };
}

// Show sync notifications
function showSyncNotification(message, isError = false) {
  syncNotification.textContent = message;
  syncNotification.style.color = isError ? 'red' : 'green';
  setTimeout(() => {
    syncNotification.textContent = '';
  }, 5000);
}

// Sync with server and merge data
async function syncWithServer() {
  try {
    const response = await fetch(SERVER_API_URL);
    if (!response.ok) throw new Error('Network response was not ok');

    const serverPosts = await response.json();
    const serverQuotes = serverPosts.map(serverPostToQuote);

    let updated = false;

    serverQuotes.forEach(serverQ => {
      const localIndex = localQuotes.findIndex(q => q.id === serverQ.id);
      if (localIndex === -1) {
        // New quote from server
        localQuotes.push(serverQ);
        updated = true;
      } else {
        // Conflict resolution: server wins
        const localQ = localQuotes[localIndex];
        if (localQ.text !== serverQ.text || localQ.category !== serverQ.category) {
          localQuotes[localIndex] = serverQ;
          updated = true;
        }
      }
    });

    if (updated) {
      saveLocalQuotes();
      populateCategories();

      if (![...new Set(localQuotes.map(q => q.category))].includes(categoryFilter.value)) {
        categoryFilter.value = 'all';
        localStorage.setItem('selectedCategory', 'all');
      }

      filterQuotes();
      showSyncNotification('Data synced with server and updated.');
    } else {
      showSyncNotification('Data synced with server. No changes.');
    }
  } catch (error) {
    showSyncNotification('Sync failed: ' + error.message, true);
  }
}

async function fetchQuotesFromServer() {
  try {
    const response = await fetch('https://jsonplaceholder.typicode.com/posts?_limit=5');
    if (!response.ok) throw new Error('Network response was not ok');
    const data = await response.json();
    return data.map(post => ({
      id: post.id,
      text: post.title,
      category: post.body || 'General',
    }));
  } catch (error) {
    console.error('Fetch error:', error);
    return [];
  }
}

// Initialization
populateCategories();
showRandomQuote();
createAddQuoteForm();

newQuoteBtn.addEventListener('click', showRandomQuote);
categoryFilter.addEventListener('change', filterQuotes);

// Start periodic sync
setInterval(syncWithServer, SYNC_INTERVAL_MS);

// Sync once on page load
syncWithServer();
