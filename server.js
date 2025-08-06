const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const path = require('path');
const { faker } = require('@faker-js/faker');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(compression());
app.use(cors());
app.use(express.json());

// Serve static files from the React app
app.use(express.static(path.join(__dirname, 'book-scribe-generator/dist')));

// Book generation endpoint
app.post('/api/generate-books', (req, res) => {
  try {
    const { language, seed, avgLikes, avgReviews, page, batchSize = 20 } = req.body;
    
    // Set faker locale based on language
    faker.setLocale(language);
    
    // Create seeded random number generator
    const seededRng = createSeededRng(seed + page);
    
    const books = [];
    const startIndex = page * batchSize;
    
    for (let i = 0; i < batchSize; i++) {
      const bookIndex = startIndex + i;
      const bookSeed = seed + bookIndex;
      
      // Generate book data
      const book = generateBook(bookSeed, language, avgLikes, avgReviews);
      books.push(book);
    }
    
    res.json(books);
  } catch (error) {
    console.error('Error generating books:', error);
    res.status(500).json({ error: 'Failed to generate books' });
  }
});

// CSV export endpoint
app.post('/api/export-csv', (req, res) => {
  try {
    const { language, seed, avgLikes, avgReviews, pages } = req.body;
    
    faker.setLocale(language);
    const allBooks = [];
    
    // Generate all books for export
    for (let page = 0; page < pages; page++) {
      const seededRng = createSeededRng(seed + page);
      const batchSize = page === 0 ? 20 : 10;
      const startIndex = page * batchSize;
      
      for (let i = 0; i < batchSize; i++) {
        const bookIndex = startIndex + i;
        const bookSeed = seed + bookIndex;
        const book = generateBook(bookSeed, language, avgLikes, avgReviews);
        allBooks.push(book);
      }
    }
    
    // Create CSV
    const csvWriter = createCsvWriter({
      path: 'books_export.csv',
      header: [
        { id: 'index', title: 'Index' },
        { id: 'isbn', title: 'ISBN' },
        { id: 'title', title: 'Title' },
        { id: 'authors', title: 'Authors' },
        { id: 'publisher', title: 'Publisher' },
        { id: 'likes', title: 'Likes' },
        { id: 'reviewsCount', title: 'Reviews Count' }
      ]
    });
    
    const csvData = allBooks.map(book => ({
      index: book.index,
      isbn: book.isbn,
      title: book.title,
      authors: book.authors.join('; '),
      publisher: book.publisher,
      likes: book.likes,
      reviewsCount: book.reviews.length
    }));
    
    csvWriter.writeRecords(csvData).then(() => {
      res.download('books_export.csv', 'books_export.csv', (err) => {
        if (err) {
          res.status(500).json({ error: 'Failed to download CSV' });
        }
        // Clean up the file after download
        require('fs').unlinkSync('books_export.csv');
      });
    });
    
  } catch (error) {
    console.error('Error exporting CSV:', error);
    res.status(500).json({ error: 'Failed to export CSV' });
  }
});

// Serve React app for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'book-scribe-generator/dist/index.html'));
});

// Seeded Random Number Generator
function createSeededRng(seed) {
  let state = seed;
  
  return {
    next() {
      state = (state * 9301 + 49297) % 233280;
      return state / 233280;
    },
    
    nextInt(min, max) {
      return Math.floor(this.next() * (max - min + 1)) + min;
    },
    
    choice(array) {
      return array[this.nextInt(0, array.length - 1)];
    },
    
    nextFloat(min, max) {
      return this.next() * (max - min) + min;
    }
  };
}

// Generate a single book
function generateBook(seed, language, avgLikes, avgReviews) {
  const rng = createSeededRng(seed);
  
  // Generate title based on language
  const title = generateTitle(rng, language);
  
  // Generate authors
  const authorCount = rng.nextInt(1, 3);
  const authors = [];
  for (let i = 0; i < authorCount; i++) {
    authors.push(generateAuthor(rng, language));
  }
  
  // Generate publisher
  const publisher = generatePublisher(rng, language);
  
  // Generate ISBN
  const isbn = generateISBN(rng);
  
  // Generate likes (using fractional logic)
  const likes = Math.floor(avgLikes);
  const likesFraction = avgLikes - likes;
  const finalLikes = likes + (rng.next() < likesFraction ? 1 : 0);
  
  // Generate reviews (using fractional logic)
  const reviewCount = Math.floor(avgReviews);
  const reviewFraction = avgReviews - reviewCount;
  const finalReviewCount = reviewCount + (rng.next() < reviewFraction ? 1 : 0);
  
  const reviews = [];
  for (let i = 0; i < finalReviewCount; i++) {
    reviews.push(generateReview(rng, language));
  }
  
  return {
    index: seed,
    isbn,
    title,
    authors,
    publisher,
    likes: finalLikes,
    reviews
  };
}

// Title generation based on language
function generateTitle(rng, language) {
  const titles = {
    'en-US': [
      'The Silent Echo', 'Beyond the Horizon', 'Whispers of Time', 'The Last Chapter',
      'Eternal Dreams', 'Shadows of Yesterday', 'The Hidden Truth', 'Lost in Translation',
      'The Art of Living', 'Midnight Reflections', 'The Broken Mirror', 'Echoes of Love',
      'The Forgotten Path', 'Silent Whispers', 'The Last Goodbye', 'Beyond Reality',
      'The Hidden Garden', 'Eternal Flame', 'The Lost City', 'Whispers in the Dark'
    ],
    'de-DE': [
      'Die Stille Echo', 'Jenseits des Horizonts', 'Flüstern der Zeit', 'Das letzte Kapitel',
      'Ewige Träume', 'Schatten von Gestern', 'Die versteckte Wahrheit', 'Verloren in der Übersetzung',
      'Die Kunst des Lebens', 'Mitternachtsreflexionen', 'Der zerbrochene Spiegel', 'Echos der Liebe',
      'Der vergessene Pfad', 'Stille Flüstern', 'Der letzte Abschied', 'Jenseits der Realität',
      'Der versteckte Garten', 'Ewige Flamme', 'Die verlorene Stadt', 'Flüstern im Dunkeln'
    ],
    'ja-JP': [
      '静寂のエコー', '地平線の向こう', '時の囁き', '最後の章',
      '永遠の夢', '昨日の影', '隠された真実', '翻訳の中で失われた',
      '生きる芸術', '真夜中の反射', '壊れた鏡', '愛の反響',
      '忘れられた道', '静寂の囁き', '最後の別れ', '現実の向こう',
      '隠された庭', '永遠の炎', '失われた街', '闇の中の囁き'
    ],
    'fr-FR': [
      'L\'Écho Silencieux', 'Au-delà de l\'Horizon', 'Murmures du Temps', 'Le Dernier Chapitre',
      'Rêves Éternels', 'Ombres d\'Hier', 'La Vérité Cachée', 'Perdu en Traduction',
      'L\'Art de Vivre', 'Réflexions de Minuit', 'Le Miroir Brisé', 'Échos d\'Amour',
      'Le Chemin Oublié', 'Murmures Silencieux', 'Le Dernier Adieu', 'Au-delà de la Réalité',
      'Le Jardin Caché', 'Flamme Éternelle', 'La Ville Perdue', 'Murmures dans l\'Obscurité'
    ],
    'es-ES': [
      'El Eco Silencioso', 'Más Allá del Horizonte', 'Susurros del Tiempo', 'El Último Capítulo',
      'Sueños Eternos', 'Sombras de Ayer', 'La Verdad Oculta', 'Perdido en la Traducción',
      'El Arte de Vivir', 'Reflexiones de Medianoche', 'El Espejo Roto', 'Ecos de Amor',
      'El Camino Olvidado', 'Susurros Silenciosos', 'El Último Adiós', 'Más Allá de la Realidad',
      'El Jardín Oculto', 'Llama Eterna', 'La Ciudad Perdida', 'Susurros en la Oscuridad'
    ]
  };
  
  return rng.choice(titles[language] || titles['en-US']);
}

// Author generation based on language
function generateAuthor(rng, language) {
  const authors = {
    'en-US': [
      'John Smith', 'Emily Johnson', 'Michael Brown', 'Sarah Davis', 'David Wilson',
      'Lisa Anderson', 'Robert Taylor', 'Jennifer Martinez', 'William Garcia', 'Amanda Rodriguez',
      'James Miller', 'Jessica Lopez', 'Christopher Lee', 'Ashley White', 'Daniel Thompson',
      'Nicole Clark', 'Matthew Hall', 'Stephanie Lewis', 'Andrew Young', 'Rachel Walker'
    ],
    'de-DE': [
      'Hans Müller', 'Anna Schmidt', 'Klaus Weber', 'Maria Fischer', 'Peter Meyer',
      'Sabine Wagner', 'Thomas Schulz', 'Petra Becker', 'Wolfgang Hoffmann', 'Monika Schäfer',
      'Jürgen Koch', 'Brigitte Bauer', 'Manfred Richter', 'Renate Klein', 'Dieter Wolf',
      'Ursula Schröder', 'Günther Neumann', 'Helga Zimmermann', 'Werner Braun', 'Elke Krüger'
    ],
    'ja-JP': [
      '田中太郎', '佐藤花子', '鈴木一郎', '高橋美咲', '渡辺健太',
      '伊藤由美', '山田次郎', '中村愛子', '小林正男', '加藤恵美',
      '吉田大輔', '林麻衣', '斎藤健一', '清水美奈', '阿部隆司',
      '森田由香', '石川正人', '佐々木美穂', '山口健二', '松本愛'
    ],
    'fr-FR': [
      'Jean Dupont', 'Marie Martin', 'Pierre Durand', 'Sophie Bernard', 'Michel Petit',
      'Isabelle Moreau', 'François Simon', 'Catherine Leroy', 'Philippe Roux', 'Nathalie David',
      'Laurent Bertrand', 'Valérie Mercier', 'Nicolas Girard', 'Sandrine Bonnet', 'Stéphane Henry',
      'Céline Faure', 'Romain Rousseau', 'Audrey Blanchard', 'Guillaume Garnier', 'Julie Rousseau'
    ],
    'es-ES': [
      'Carlos García', 'María Rodríguez', 'José López', 'Ana Martínez', 'Miguel González',
      'Carmen Pérez', 'Francisco Sánchez', 'Isabel Torres', 'Antonio Ruiz', 'Elena Jiménez',
      'Manuel Moreno', 'Teresa Herrera', 'Javier Díaz', 'Rosa Vega', 'Alberto Morales',
      'Lucía Castro', 'Fernando Ortega', 'Patricia Silva', 'Ricardo Reyes', 'Sonia Mendoza'
    ]
  };
  
  return rng.choice(authors[language] || authors['en-US']);
}

// Publisher generation based on language
function generatePublisher(rng, language) {
  const publishers = {
    'en-US': [
      'Random House', 'Penguin Books', 'HarperCollins', 'Simon & Schuster', 'Macmillan',
      'Scholastic', 'Bloomsbury', 'Hachette', 'Wiley', 'Oxford University Press'
    ],
    'de-DE': [
      'Random House Deutschland', 'Penguin Verlag', 'HarperCollins Deutschland', 'Simon & Schuster Deutschland',
      'Macmillan Deutschland', 'Scholastic Deutschland', 'Bloomsbury Deutschland', 'Hachette Deutschland',
      'Wiley Deutschland', 'Oxford University Press Deutschland'
    ],
    'ja-JP': [
      '講談社', '集英社', '小学館', '角川書店', '新潮社',
      '文藝春秋', '朝日新聞出版', '岩波書店', '筑摩書房', '平凡社'
    ],
    'fr-FR': [
      'Gallimard', 'Albin Michel', 'Flammarion', 'Robert Laffont', 'Fayard',
      'Grasset', 'Seuil', 'Stock', 'Calmann-Lévy', 'Plon'
    ],
    'es-ES': [
      'Planeta', 'Santillana', 'Anagrama', 'Tusquets', 'Alfaguara',
      'Espasa', 'Grijalbo', 'Debolsillo', 'Temas de Hoy', 'Aguilar'
    ]
  };
  
  return rng.choice(publishers[language] || publishers['en-US']);
}

// ISBN generation
function generateISBN(rng) {
  const prefix = rng.choice(['978-0', '978-1', '978-2', '978-3']);
  const group = rng.nextInt(10, 99);
  const publisher = rng.nextInt(10000, 99999);
  const title = rng.nextInt(100, 999);
  const checkDigit = rng.nextInt(0, 9);
  
  return `${prefix}-${group}-${publisher}-${title}-${checkDigit}`;
}

// Review generation based on language
function generateReview(rng, language) {
  const reviews = {
    'en-US': [
      'A compelling narrative that keeps you engaged from start to finish.',
      'Beautifully written with rich character development and vivid descriptions.',
      'An insightful exploration of human nature and contemporary issues.',
      'A masterpiece that transcends genres and speaks to the human condition.',
      'Thought-provoking and emotionally resonant, this book stays with you long after reading.',
      'A fresh perspective on familiar themes, executed with skill and originality.',
      'The author\'s voice is distinctive and the story flows naturally.',
      'A powerful story that challenges readers to think differently about the world.',
      'Rich in detail and atmosphere, this book creates an immersive experience.',
      'A well-crafted story that balances plot, character, and theme perfectly.'
    ],
    'de-DE': [
      'Eine fesselnde Erzählung, die Sie von Anfang bis Ende in Atem hält.',
      'Wunderschön geschrieben mit reicher Charakterentwicklung und lebendigen Beschreibungen.',
      'Eine aufschlussreiche Erkundung der menschlichen Natur und zeitgenössischer Themen.',
      'Ein Meisterwerk, das Genres transzendiert und zur menschlichen Verfassung spricht.',
      'Nachdenklich und emotional berührend, bleibt dieses Buch lange nach dem Lesen in Erinnerung.',
      'Eine frische Perspektive auf vertraute Themen, ausgeführt mit Geschick und Originalität.',
      'Die Stimme des Autors ist unverwechselbar und die Geschichte fließt natürlich.',
      'Eine kraftvolle Geschichte, die Leser herausfordert, anders über die Welt nachzudenken.',
      'Reich an Details und Atmosphäre schafft dieses Buch ein immersives Erlebnis.',
      'Eine gut gestaltete Geschichte, die Handlung, Charakter und Thema perfekt ausbalanciert.'
    ],
    'ja-JP': [
      '最初から最後まで読者を引き込む魅力的な物語です。',
      '豊かなキャラクター開発と鮮やかな描写で美しく書かれています。',
      '人間性と現代の問題を洞察力豊かに探求しています。',
      'ジャンルを超越し、人間の条件に語りかける傑作です。',
      '考えさせられ、感情的に響くこの本は、読んだ後も長く心に残ります。',
      '親しみやすいテーマに対する新鮮な視点で、巧みと独創性を持って実行されています。',
      '作者の声は独特で、物語は自然に流れます。',
      '読者に世界について異なる考え方を促す力強い物語です。',
      '詳細と雰囲気に富み、この本は没入感のある体験を作り出します。',
      'プロット、キャラクター、テーマを完璧にバランスさせた良く作られた物語です。'
    ],
    'fr-FR': [
      'Un récit captivant qui vous tient en haleine du début à la fin.',
      'Magnifiquement écrit avec un riche développement des personnages et des descriptions vivantes.',
      'Une exploration perspicace de la nature humaine et des problèmes contemporains.',
      'Un chef-d\'œuvre qui transcende les genres et parle à la condition humaine.',
      'Provocateur et émotionnellement résonnant, ce livre reste avec vous longtemps après la lecture.',
      'Une perspective fraîche sur des thèmes familiers, exécutée avec habileté et originalité.',
      'La voix de l\'auteur est distinctive et l\'histoire coule naturellement.',
      'Une histoire puissante qui défie les lecteurs de penser différemment du monde.',
      'Riche en détails et en atmosphère, ce livre crée une expérience immersive.',
      'Une histoire bien conçue qui équilibre parfaitement intrigue, personnage et thème.'
    ],
    'es-ES': [
      'Una narrativa convincente que te mantiene comprometido de principio a fin.',
      'Bellamente escrito con rico desarrollo de personajes y descripciones vívidas.',
      'Una exploración perspicaz de la naturaleza humana y temas contemporáneos.',
      'Una obra maestra que trasciende géneros y habla a la condición humana.',
      'Provocador y emocionalmente resonante, este libro permanece contigo mucho después de leerlo.',
      'Una perspectiva fresca sobre temas familiares, ejecutada con habilidad y originalidad.',
      'La voz del autor es distintiva y la historia fluye naturalmente.',
      'Una historia poderosa que desafía a los lectores a pensar diferente sobre el mundo.',
      'Rico en detalles y atmósfera, este libro crea una experiencia inmersiva.',
      'Una historia bien elaborada que equilibra perfectamente trama, personaje y tema.'
    ]
  };
  
  const reviewText = rng.choice(reviews[language] || reviews['en-US']);
  const author = generateAuthor(rng, language);
  const rating = rng.nextInt(1, 5);
  
  return {
    text: reviewText,
    author,
    rating
  };
}

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 