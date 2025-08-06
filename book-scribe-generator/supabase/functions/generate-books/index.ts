import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

// Seeded random number generator
class SeededRNG {
  private seed: number;

  constructor(seed: number) {
    this.seed = seed;
  }

  next(): number {
    this.seed = (this.seed * 9301 + 49297) % 233280;
    return this.seed / 233280;
  }

  nextInt(min: number, max: number): number {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }

  choice<T>(array: T[]): T {
    return array[this.nextInt(0, array.length - 1)];
  }
}

interface GenerationParams {
  language: string;
  seed: number;
  avgLikes: number;
  avgReviews: number;
  page: number;
  batchSize: number;
}

interface BookData {
  index: number;
  isbn: string;
  title: string;
  authors: string[];
  publisher: string;
  likes: number;
  reviews: {
    text: string;
    author: string;
    rating: number;
  }[];
}

// Predefined data for different languages
const data = {
  "en-US": {
    titleWords: ["Adventure", "Mystery", "Journey", "Secret", "Legend", "Dream", "Shadow", "Light", "Ocean", "Mountain", "Forest", "Storm", "Fire", "Ice", "Wind", "Thunder", "Star", "Moon", "Sun", "Galaxy", "Universe", "Time", "Space", "Magic", "Power", "Quest", "Destiny", "Fate", "Hope", "Fear"],
    titlePrefixes: ["The", "A", "An", "My", "Our", "Their", "Lost", "Hidden", "Ancient", "Modern", "New", "Old", "Great", "Small", "Dark", "Bright", "Silent", "Loud", "Forgotten", "Eternal"],
    firstNames: ["John", "Jane", "Michael", "Sarah", "David", "Emily", "Robert", "Emma", "William", "Olivia", "James", "Ava", "Benjamin", "Isabella", "Lucas", "Sophia", "Alexander", "Charlotte", "Daniel", "Mia"],
    lastNames: ["Smith", "Johnson", "Brown", "Davis", "Miller", "Wilson", "Moore", "Taylor", "Anderson", "Thomas", "Jackson", "White", "Harris", "Martin", "Thompson", "Garcia", "Martinez", "Robinson", "Clark", "Rodriguez"],
    publishers: ["Atlantic Press", "Phoenix Books", "Modern Publishing", "Classic Literature", "Digital Age Press", "Horizon Books", "Summit Publishing", "River Press", "Mountain View Books", "Seaside Publications"],
    reviews: [
      "This book was absolutely amazing! The plot was engaging and the characters were well-developed.",
      "I couldn't put this book down. Highly recommended for anyone who enjoys this genre.",
      "Great storytelling and excellent character development. Will definitely read more from this author.",
      "The book was okay, but I felt the pacing was a bit slow in some parts.",
      "Fantastic read! The author has a wonderful writing style that kept me engaged throughout.",
      "A masterpiece of modern literature. The themes are profound and thought-provoking.",
      "Well-written and engaging. The author creates a vivid world that draws you in.",
      "Not my favorite book, but it has its moments. Some parts were quite interesting.",
      "Excellent character development and plot twists. Couldn't predict the ending!",
      "A solid read with good character arcs and interesting plot developments."
    ]
  },
  "de-DE": {
    titleWords: ["Abenteuer", "Geheimnis", "Reise", "Legende", "Traum", "Schatten", "Licht", "Ozean", "Berg", "Wald", "Sturm", "Feuer", "Eis", "Wind", "Donner", "Stern", "Mond", "Sonne", "Galaxie", "Universum", "Zeit", "Raum", "Magie", "Kraft", "Aufgabe", "Schicksal", "Hoffnung", "Furcht"],
    titlePrefixes: ["Das", "Die", "Der", "Ein", "Eine", "Mein", "Unser", "Ihr", "Verloren", "Versteckt", "Alt", "Neu", "Groß", "Klein", "Dunkel", "Hell", "Still", "Laut", "Vergessen", "Ewig"],
    firstNames: ["Hans", "Anna", "Klaus", "Maria", "Thomas", "Petra", "Wolfgang", "Sabine", "Jürgen", "Ingrid", "Dieter", "Brigitte", "Helmut", "Monika", "Günter", "Ursula", "Heinrich", "Gisela", "Werner", "Christa"],
    lastNames: ["Müller", "Schmidt", "Schneider", "Fischer", "Weber", "Meyer", "Wagner", "Becker", "Schulz", "Hoffmann", "Schäfer", "Koch", "Bauer", "Richter", "Klein", "Wolf", "Schröder", "Neumann", "Schwarz", "Zimmermann"],
    publishers: ["Deutscher Verlag", "Moderne Bücher", "Klassik Verlag", "Digitale Zeit", "Literatur Haus", "Horizont Bücher", "Gipfel Verlag", "Fluss Presse", "Bergblick Bücher", "Küsten Publikationen"],
    reviews: [
      "Dieses Buch war absolut erstaunlich! Die Handlung war fesselnd und die Charaktere gut entwickelt.",
      "Ich konnte das Buch nicht aus der Hand legen. Sehr empfehlenswert für alle, die dieses Genre mögen.",
      "Großartige Erzählung und ausgezeichnete Charakterentwicklung. Werde definitiv mehr von diesem Autor lesen.",
      "Das Buch war in Ordnung, aber ich fand das Tempo in einigen Teilen etwas langsam.",
      "Fantastische Lektüre! Der Autor hat einen wunderbaren Schreibstil, der mich durchgehend fesselte."
    ]
  },
  "ja-JP": {
    titleWords: ["冒険", "謎", "旅", "秘密", "伝説", "夢", "影", "光", "海", "山", "森", "嵐", "火", "氷", "風", "雷", "星", "月", "太陽", "銀河", "宇宙", "時", "空間", "魔法", "力", "探求", "運命", "希望", "恐怖"],
    titlePrefixes: ["", "新しい", "古い", "大きな", "小さな", "暗い", "明るい", "静かな", "忘れられた", "永遠の"],
    firstNames: ["太郎", "花子", "一郎", "美咲", "健太", "由美", "和夫", "恵子", "博", "真理", "茂", "久美子", "隆", "良子", "正", "明美", "勇", "智子", "進", "幸子"],
    lastNames: ["田中", "佐藤", "鈴木", "高橋", "伊藤", "渡辺", "山本", "中村", "小林", "加藤", "吉田", "山田", "佐々木", "山口", "松本", "井上", "木村", "林", "清水", "山崎"],
    publishers: ["現代出版", "文学社", "デジタル書房", "古典文庫", "新時代出版", "地平線書店", "頂上出版", "川の出版", "山景書房", "海辺出版"],
    reviews: [
      "この本は本当に素晴らしかったです！ストーリーが魅力的で、キャラクターがよく描かれていました。",
      "この本を手放すことができませんでした。このジャンルが好きな人には強くお勧めします。",
      "素晴らしいストーリーテリングと優れたキャラクター開発。この作者の他の作品も必ず読みます。",
      "本は悪くありませんでしたが、一部のペースが少し遅いと感じました。",
      "素晴らしい読書体験！作者は私を最後まで夢中にさせる素晴らしい文体を持っています。"
    ]
  },
  "fr-FR": {
    titleWords: ["Aventure", "Mystère", "Voyage", "Secret", "Légende", "Rêve", "Ombre", "Lumière", "Océan", "Montagne", "Forêt", "Tempête", "Feu", "Glace", "Vent", "Tonnerre", "Étoile", "Lune", "Soleil", "Galaxie", "Univers", "Temps", "Espace", "Magie", "Pouvoir", "Quête", "Destin", "Espoir", "Peur"],
    titlePrefixes: ["Le", "La", "Les", "Un", "Une", "Mon", "Notre", "Leur", "Perdu", "Caché", "Ancien", "Moderne", "Nouveau", "Vieux", "Grand", "Petit", "Sombre", "Brillant", "Silencieux", "Oublié"],
    firstNames: ["Pierre", "Marie", "Jean", "Sophie", "Michel", "Catherine", "Philippe", "Isabelle", "Alain", "Françoise", "Bernard", "Monique", "André", "Sylvie", "Claude", "Nicole", "François", "Martine", "Henri", "Christine"],
    lastNames: ["Martin", "Bernard", "Dubois", "Thomas", "Robert", "Richard", "Petit", "Durand", "Leroy", "Moreau", "Simon", "Laurent", "Lefebvre", "Michel", "Garcia", "David", "Bertrand", "Roux", "Vincent", "Fournier"],
    publishers: ["Éditions Modernes", "Littérature Classique", "Presse Numérique", "Maison du Livre", "Éditions Avenir", "Horizon Livres", "Sommet Éditions", "Presse Rivière", "Livres Mont", "Publications Côte"],
    reviews: [
      "Ce livre était absolument incroyable ! L'intrigue était captivante et les personnages bien développés.",
      "Je n'arrivais pas à lâcher ce livre. Hautement recommandé pour tous ceux qui aiment ce genre.",
      "Excellent récit et développement de personnages remarquable. Je lirai certainement plus de cet auteur.",
      "Le livre était correct, mais j'ai trouvé le rythme un peu lent par endroits.",
      "Lecture fantastique ! L'auteur a un style d'écriture merveilleux qui m'a captivé tout au long."
    ]
  },
  "es-ES": {
    titleWords: ["Aventura", "Misterio", "Viaje", "Secreto", "Leyenda", "Sueño", "Sombra", "Luz", "Océano", "Montaña", "Bosque", "Tormenta", "Fuego", "Hielo", "Viento", "Trueno", "Estrella", "Luna", "Sol", "Galaxia", "Universo", "Tiempo", "Espacio", "Magia", "Poder", "Búsqueda", "Destino", "Esperanza", "Miedo"],
    titlePrefixes: ["El", "La", "Los", "Las", "Un", "Una", "Mi", "Nuestro", "Su", "Perdido", "Oculto", "Antiguo", "Moderno", "Nuevo", "Viejo", "Grande", "Pequeño", "Oscuro", "Brillante", "Olvidado"],
    firstNames: ["Carlos", "María", "José", "Ana", "Manuel", "Carmen", "Francisco", "Isabel", "Antonio", "Dolores", "Jesús", "Pilar", "Ángel", "Mercedes", "Miguel", "Josefa", "Rafael", "Antonia", "Vicente", "Francisca"],
    lastNames: ["García", "González", "Rodríguez", "Fernández", "López", "Martínez", "Sánchez", "Pérez", "Gómez", "Martín", "Jiménez", "Ruiz", "Hernández", "Díaz", "Moreno", "Muñoz", "Álvarez", "Romero", "Alonso", "Gutiérrez"],
    publishers: ["Editorial Moderna", "Literatura Clásica", "Prensa Digital", "Casa del Libro", "Ediciones Futuro", "Libros Horizonte", "Editorial Cumbre", "Prensa Río", "Libros Monte", "Publicaciones Costa"],
    reviews: [
      "¡Este libro fue absolutamente increíble! La trama era cautivadora y los personajes estaban bien desarrollados.",
      "No pude soltar este libro. Muy recomendado para cualquiera que disfrute de este género.",
      "Gran narrativa y excelente desarrollo de personajes. Definitivamente leeré más de este autor.",
      "El libro estaba bien, pero sentí que el ritmo era un poco lento en algunas partes.",
      "¡Lectura fantástica! El autor tiene un estilo de escritura maravilloso que me mantuvo comprometido."
    ]
  }
};

function generateBook(index: number, params: GenerationParams): BookData {
  // Combine user seed with page and index for deterministic generation
  const combinedSeed = params.seed + (params.page * 1000) + index;
  const rng = new SeededRNG(combinedSeed);
  
  const langData = data[params.language as keyof typeof data] || data["en-US"];
  
  // Generate title
  const prefix = rng.choice(langData.titlePrefixes);
  const word1 = rng.choice(langData.titleWords);
  const word2 = rng.choice(langData.titleWords);
  const title = prefix ? `${prefix} ${word1}` : `${word1} ${word2}`;
  
  // Generate authors
  const authorCount = rng.nextInt(1, 3);
  const authors = Array.from({ length: authorCount }, () => {
    const firstName = rng.choice(langData.firstNames);
    const lastName = rng.choice(langData.lastNames);
    return `${firstName} ${lastName}`;
  });
  
  // Generate publisher
  const publisher = rng.choice(langData.publishers);
  
  // Generate ISBN
  const isbn = `978-${rng.nextInt(0, 9)}-${rng.nextInt(100, 999)}-${rng.nextInt(10000, 99999)}-${rng.nextInt(0, 9)}`;

  // Generate likes based on average (fractional probability)
  const likesCount = params.avgLikes === 0 ? 0 : 
    rng.next() < (params.avgLikes % 1) ? Math.ceil(params.avgLikes) : Math.floor(params.avgLikes);

  // Generate reviews based on average (fractional probability)
  const reviewsCount = params.avgReviews === 0 ? 0 :
    rng.next() < (params.avgReviews % 1) ? Math.ceil(params.avgReviews) : Math.floor(params.avgReviews);

  const reviews = Array.from({ length: reviewsCount }, () => ({
    text: rng.choice(langData.reviews),
    author: `${rng.choice(langData.firstNames)} ${rng.choice(langData.lastNames)}`,
    rating: rng.nextInt(1, 5),
  }));

  return {
    index: (params.page * 10) + index + (params.page === 0 ? 0 : 10),
    isbn,
    title,
    authors,
    publisher,
    likes: likesCount,
    reviews,
  };
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  }

  try {
    const params: GenerationParams = await req.json();
    
    // Generate books for the current page
    const books: BookData[] = Array.from({ length: params.batchSize }, (_, i) => 
      generateBook(i, params)
    );

    return new Response(JSON.stringify(books), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }
});