// Quotes array with initial quotes
const quotes = [
  { text: "The best way to get started is to quit talking and begin doing.", category: "Motivation" },
  { text: "Don't let yesterday take up too much of today.", category: "Inspiration" },
  { text: "You learn more from failure than from success.", category: "Life" },
];

// Reference DOM elements
const quoteDisplay = document.getElementById('quoteDisplay');
const newQuoteBtn = document.getElementById('newQuote');
const addQuoteFormContainer = document.getElementById('addQuoteFormContainer');

// Function to show a random quote
function showRandomQuote() {
  if (quotes.length === 0) {
    quoteDisplay.textContent = "No quotes available. Add some below!";
    return;
  }
  const randomIndex = Math.floor(Math.random() * quotes.length);
  const quote = quotes[randomIndex];
  quoteDisplay.textContent = `"${quote.text}" — [${quote.category}]`;
}

// Function to create the Add Quote form dynamically
function createAddQuoteForm() {
  // Create form elements
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

  // Add event listener to the button
  addButton.addEventListener('click', () => {
    addQuote(quoteInput.value, categoryInput.value);
    quoteInput.value = '';
    categoryInput.value = '';
  });

  // Append inputs and button to form container
  form.appendChild(quoteInput);
  form.appendChild(categoryInput);
  form.appendChild(addButton);

  addQuoteFormContainer.appendChild(form);
}

// Function to add a new quote to the array and update display
function addQuote(text, category) {
  if (!text.trim() || !category.trim()) {
    alert('Please enter both quote text and category.');
    return;
  }

  quotes.push({ text: text.trim(), category: category.trim() });
  alert('Quote added!');
  showRandomQuote();
}


// Initial setup
showRandomQuote();
createAddQuoteForm();
newQuoteBtn.addEventListener('click', showRandomQuote);
