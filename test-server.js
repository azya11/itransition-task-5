const express = require('express');
const cors = require('cors');
const { faker } = require('@faker-js/faker');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// Simple test endpoint
app.get('/api/test', (req, res) => {
  res.json({ message: 'Backend is working!' });
});

// Book generation endpoint
app.post('/api/generate-books', (req, res) => {
  try {
    const { language, seed, avgLikes, avgReviews, page, batchSize = 20 } = req.body;
    
    // Set faker locale based on language
    faker.setLocale(language);
    
    const books = [];
    const startIndex = page * batchSize;
    
    for (let i = 0; i < batchSize; i++) {
      const bookIndex = startIndex + i;
      const bookSeed = seed + bookIndex;
      
      // Simple book generation for testing
      const book = {
        index: bookIndex,
        isbn: faker.commerce.isbn(),
        title: faker.commerce.productName(),
        authors: [faker.person.fullName()],
        publisher: faker.company.name(),
        likes: Math.floor(avgLikes),
        reviews: []
      };
      
      // Add reviews based on avgReviews
      const reviewCount = Math.floor(avgReviews);
      for (let j = 0; j < reviewCount; j++) {
        book.reviews.push({
          text: faker.lorem.sentence(),
          author: faker.person.fullName(),
          rating: faker.number.int({ min: 1, max: 5 })
        });
      }
      
      books.push(book);
    }
    
    res.json(books);
  } catch (error) {
    console.error('Error generating books:', error);
    res.status(500).json({ error: 'Failed to generate books' });
  }
});

app.listen(PORT, () => {
  console.log(`Test server running on port ${PORT}`);
  console.log(`Test endpoint: http://localhost:${PORT}/api/test`);
  console.log(`Book generation endpoint: http://localhost:${PORT}/api/generate-books`);
}); 