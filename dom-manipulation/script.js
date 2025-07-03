 const quoteDisplay = document.getElementById('quoteDisplay');
    const newQuoteBtn = document.getElementById('newQuote');
    const categoryFilter = document.getElementById('categoryFilter');
    const addBtn = document.getElementById('addBtn');
    const importInput = document.getElementById('importFile');
    const exportBtn = document.getElementById('exportBtn');

    let quotes = JSON.parse(localStorage.getItem('quotes')) || [
      { text: "The best way to get started is to quit talking and begin doing.", category: "Motivation" },
      { text: "Don't let yesterday take up too much of today.", category: "Inspiration" },
      { text: "You learn more from failure than from success.", category: "Life" }
    ];

    function saveQuotes() {
      localStorage.setItem('quotes', JSON.stringify(quotes));
    }

    function populateCategories() {
      const categories = [...new Set(quotes.map(q => q.category))];
      categoryFilter.innerHTML = '<option value="all">All Categories</option>';
      categories.forEach(cat => {
        const opt = document.createElement('option');
        opt.value = cat;
        opt.textContent = cat;
        categoryFilter.appendChild(opt);
      });
    }

    function showRandomQuote() {
      const cat = categoryFilter.value;
      const filtered = cat === 'all' ? quotes : quotes.filter(q => q.category === cat);

      if (filtered.length === 0) {
        quoteDisplay.innerHTML = '<em>No quotes available in this category.</em>';
      } else {
        const q = filtered[Math.floor(Math.random() * filtered.length)];
        quoteDisplay.innerHTML = `<q>${q.text}</q> — <strong>${q.category}</strong>`;
        sessionStorage.setItem('lastQuote', JSON.stringify(q));
      }
    }

    function addQuote(text, category) {
      if (!text || !category) return alert('Both fields are required.');
      quotes.push({ text, category });
      saveQuotes();
      populateCategories();
      showRandomQuote();
    }

    function exportToJsonFile() {
      const blob = new Blob([JSON.stringify(quotes, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'quotes.json';
      a.click();
      URL.revokeObjectURL(url);
    }

    function importFromJsonFile(e) {
      const reader = new FileReader();
      reader.onload = function(evt) {
        try {
          const imported = JSON.parse(evt.target.result);
          if (!Array.isArray(imported)) throw new Error('Invalid JSON format');
          quotes = quotes.concat(imported.filter(q => q.text && q.category));
          saveQuotes();
          populateCategories();
          alert('Quotes imported!');
          showRandomQuote();
        } catch (err) {
          alert('Import error: ' + err.message);
        }
      };
      reader.readAsText(e.target.files[0]);
    }

    function restoreLastViewed() {
      const last = sessionStorage.getItem('lastQuote');
      if (last) {
        const q = JSON.parse(last);
        quoteDisplay.innerHTML = `<q>${q.text}</q> — <strong>${q.category}</strong>`;
      } else {
        showRandomQuote();
      }
    }

    newQuoteBtn.addEventListener('click', showRandomQuote);
    categoryFilter.addEventListener('change', showRandomQuote);
    addBtn.addEventListener('click', () => {
      const t = document.getElementById('newQuoteText').value.trim();
      const c = document.getElementById('newQuoteCategory').value.trim();
      addQuote(t, c);
      document.getElementById('newQuoteText').value = '';
      document.getElementById('newQuoteCategory').value = '';
    });
    exportBtn.addEventListener('click', exportToJsonFile);
    importInput.addEventListener('change', importFromJsonFile);

    populateCategories();
    restoreLastViewed();