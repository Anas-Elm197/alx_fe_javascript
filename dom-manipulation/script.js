// Initial quotes
let quotes = [
  { text: "The best way to get started is to quit talking and begin doing.", category: "Motivation" },
  { text: "Don't let yesterday take up too much of today.", category: "Inspiration" },
  { text: "You learn more from failure than from success.", category: "Life" },
];

// DOM references
const quoteDisplay = document.getElementById('quoteDisplay');
const newQuoteBtn = document.getElementById('newQuote');
const addQuoteFormContainer = document.getElementById('addQuoteFormContainer');
const categoryFilter = document.getElementById('categoryFilter');

// Load saved quotes and filter from localStorage if available
if (localStorage.getItem('quotes')) {
  quotes = JSON.parse(localStorage.getItem('quotes'));
}

if (localStorage.getItem('selectedCategory')) {
  categoryFilter.value = localStorage.getItem('selectedCategory');
}

// Populate the category filter dropdown dynamically from quotes array
function populateCategories() {
  // Get unique categories
  const categories = [...new Set(quotes.map(q => q.category))];

  // Clear old categories except "All Categories"
  while (categoryFilter.options.length > 1) {
    categoryFilter.remove(1);
  }

  // Add categories as options
  categories.forEach(cat => {
    const option = document.createElement('option');
    option.value = cat;
    option.textContent = cat;
    categoryFilter.appendChild(option);
  });
}

// Show random quote matching current filter
function showRandomQuote() {
  const selectedCategory = categoryFilter.value;

  // Filter quotes according to selected category
  const filteredQuotes = selectedCategory === 'all' 
    ? quotes 
    : quotes.filter(q => q.category === selectedCategory);

  if (filteredQuotes.length === 0) {
    quoteDisplay.innerHTML = "<em>No quotes available for this category. Add some below!</em>";
    return;
  }

  const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
  const quote = filteredQuotes[randomIndex];
  quoteDisplay.innerHTML = `<q>${quote.text}</q> — <strong>[${quote.category}]</strong>`;
}

// Filter quotes when category dropdown changes
function filterQuotes() {
  localStorage.setItem('selectedCategory', categoryFilter.value);
  showRandomQuote();
}

// Create add-quote form dynamically
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

// Add a new quote and update categories & storage
function addQuote(text, category) {
  if (!text.trim() || !category.trim()) {
    alert('Please enter both quote text and category.');
    return;
  }

  // Add new quote
  quotes.push({ text: text.trim(), category: category.trim() });

  // Save quotes to localStorage
  localStorage.setItem('quotes', JSON.stringify(quotes));

  // Refresh category dropdown (in case new category added)
  populateCategories();

  // Optionally, set filter to new category so user sees their quote
  categoryFilter.value = category.trim();
  localStorage.setItem('selectedCategory', category.trim());

  alert('Quote added!');
  showRandomQuote();
}

// Initialization
populateCategories();
showRandomQuote();
createAddQuoteForm();

newQuoteBtn.addEventListener('click', showRandomQuote);
categoryFilter.addEventListener('change', filterQuotes);
