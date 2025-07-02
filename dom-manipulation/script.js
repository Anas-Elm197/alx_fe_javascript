// DOM references
const quoteDisplay = document.getElementById('quoteDisplay');
const newQuoteBtn = document.getElementById('newQuote');
const addQuoteFormContainer = document.getElementById('addQuoteFormContainer');
const categoryFilter = document.getElementById('categoryFilter');
const syncNotification = document.getElementById('syncNotification');

// Server API URLs and sync interval
const SERVER_API_URL = 'https://jsonplaceholder.typicode.com/posts?_limit=5';
const SERVER_POST_URL = 'https://jsonplaceholder.typicode.com/posts';
const SYNC_INTERVAL_MS = 30000; // 30 seconds

// Load saved quotes or use default ones
let localQuotes = JSON.parse(localStorage.getItem('quotes')) || [
  { id: 1, text: "The best way to get started is to quit talking and begin doing.", category: "Motivation" },
  { id: 2, text: "Don't let yesterday take up too much of today.", category: "Inspiration" },
  { id: 3, text: "You learn more from failure than from success.", category: "Life" },
];

// Assign negative IDs to local quotes without IDs (local only)
localQuotes = localQuotes.map((q, i) => q.id ? q : { ...q, id: -(i + 1) });

// Restore last selected category filter
if (localStorage.getItem('selectedCategory')) {
  categoryFilter.value = localStorage.getItem('selectedCategory');
} else {
  categoryFilter.value = 'all';
}

// Save local quotes to localStorage
function saveLocalQuotes() {
  localStorage.setItem('quotes', JSON.stringify(localQuotes));
}

// Generate unique negative ID for new local quotes
function generateLocalId() {
  return localQuotes.reduce((minId, q) => (q.id < minId ? q.id : minId), 0) - 1;
}

// Populate category dropdown dynamically
function populateCategories() {
  const categories = [...new Set(localQuotes.map(q => q.category))];
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

// Update quote display when category filter changes
function filterQuotes() {
  localStorage.setItem('selectedCategory', categoryFilter.value);
  showRandomQuote();
}

// Create and inject the add-quote form dynamically
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

  addButton.addEventListener('click', async () => {
    await addQuote(quoteInput.value, categoryInput.value);
    quoteInput.value = '';
    categoryInput.value = '';
  });

  form.appendChild(quoteInput);
  form.appendChild(categoryInput);
  form.appendChild(addButton);

  addQuoteFormContainer.appendChild(form);
}

// Add new quote locally and post to server
async function addQuote(text, category) {
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

  await postQuoteToServer({ title: newQuote.text, body: newQuote.category });
}

// Convert server response post to quote format
function serverPostToQuote(post) {
  return {
    id: post.id,
    text: post.title,
    category: post.body || 'General',
  };
}

// Show sync notifications in UI
function showSyncNotification(message, isError = false) {
  syncNotification.textContent = message;
  syncNotification.style.color = isError ? 'red' : 'green';
  setTimeout(() => {
    syncNotification.textContent = '';
  }, 5000);
}

// Fetch quotes from server
async function fetchQuotesFromServer() {
  try {
    const response = await fetch(SERVER_API_URL);
    if (!response.ok) throw new Error('Network response was not ok');
    const data = await response.json();
    return data.map(serverPostToQuote);
  } catch (error) {
    console.error('Fetch error:', error);
    return [];
  }
}

// Post new quote to server
async function postQuoteToServer(quote) {
  try {
    const response = await fetch(SERVER_POST_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(quote),
    });

    if (!response.ok) throw new Error('Failed to post quote');

    const data = await response.json();
    console.log('Quote posted:', data);
    return data;
  } catch (error) {
    console.error('Error posting quote:', error);
  }
}

// The main sync function called periodically
async function syncQuotes() {
  try {
    const serverQuotes = await fetchQuotesFromServer();
    let updated = false;

    serverQuotes.forEach(serverQ => {
      const localIndex = localQuotes.findIndex(q => q.id === serverQ.id);
      if (localIndex === -1) {
        // New quote from server, add it locally
        localQuotes.push(serverQ);
        updated = true;
      } else {
        // Conflict resolution: server data takes precedence
        const localQ = localQuotes[localIndex];
        if (localQ.text !== serverQ.text || localQ.category !== serverQ.category) {
          localQuotes[localIndex] = serverQ;
          updated = true;
          showSyncNotification(`Conflict resolved for quote ID ${serverQ.id}`, true);
        }
      }
    });

    if (updated) {
      saveLocalQuotes();
      populateCategories();

      // Reset category filter if current category no longer exists
      if (![...new Set(localQuotes.map(q => q.category))].includes(categoryFilter.value)) {
        categoryFilter.value = 'all';
        localStorage.setItem('selectedCategory', 'all');
      }

      filterQuotes();
      showSyncNotification('Data synced and updated from server.');
    } else {
      showSyncNotification('Data synced with server. No changes.');
    }
  } catch (error) {
    showSyncNotification('Sync failed: ' + error.message, true);
  }
}

// Initialization
populateCategories();
showRandomQuote();
createAddQuoteForm();

newQuoteBtn.addEventListener('click', showRandomQuote);
categoryFilter.addEventListener('change', filterQuotes);

// Start periodic sync every 30 seconds
setInterval(syncQuotes, SYNC_INTERVAL_MS);

// Initial sync on page load
syncQuotes();
if (updated) {
  saveLocalQuotes();
  populateCategories();

  // Reset category filter if needed
  if (![...new Set(localQuotes.map(q => q.category))].includes(categoryFilter.value)) {
    categoryFilter.value = 'all';
    localStorage.setItem('selectedCategory', 'all');
  }

  filterQuotes();
  showSyncNotification('Quotes synced with server!'); // <-- exact message here
} else {
  showSyncNotification('Quotes synced with server! No changes.');
}
