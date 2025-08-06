import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { BookTable } from "./BookTable";
import { Shuffle, Download, Grid, List } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export interface BookData {
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
  cover?: string;
}

export interface GenerationParams {
  language: string;
  seed: number;
  avgLikes: number;
  avgReviews: number;
}

const languages = [
  { code: "en-US", name: "English (USA)", flag: "🇺🇸" },
  { code: "de-DE", name: "German (Germany)", flag: "🇩🇪" },
  { code: "ja-JP", name: "Japanese (Japan)", flag: "🇯🇵" },
  { code: "fr-FR", name: "French (France)", flag: "🇫🇷" },
  { code: "es-ES", name: "Spanish (Spain)", flag: "🇪🇸" },
];

export const BookGenerator = () => {
  const [params, setParams] = useState<GenerationParams>({
    language: "en-US",
    seed: Math.floor(Math.random() * 1000000),
    avgLikes: 5,
    avgReviews: 2.5,
  });
  
  const [books, setBooks] = useState<BookData[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [viewMode, setViewMode] = useState<"table" | "gallery">("table");

  const generateRandomSeed = () => {
    const newSeed = Math.floor(Math.random() * 1000000);
    setParams(prev => ({ ...prev, seed: newSeed }));
  };

  const fetchBooks = useCallback(async (pageNum: number, reset: boolean = false) => {
    setLoading(true);
    try {
      const response = await fetch('/api/book/generate', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...params,
          page: pageNum,
          batchSize: pageNum === 0 ? 20 : 10,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch books');
      }
      
      const newBooks = await response.json();
      
      if (reset || pageNum === 0) {
        setBooks(newBooks);
      } else {
        setBooks(prev => [...prev, ...newBooks]);
      }
    } catch (error) {
      console.error('Failed to fetch books:', error);
      // Fallback to client-side generation if server fails
      generateClientSideBooks(pageNum, reset);
    } finally {
      setLoading(false);
    }
  }, [params]);

  // Fallback client-side generation with comprehensive data
  const generateClientSideBooks = (pageNum: number, reset: boolean = false) => {
    // Seeded random number generator
    class SeededRNG {
      private seed: number;
      constructor(seed: number) { this.seed = seed; }
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

    const data = {
      "en-US": {
        titleWords: ["Adventure", "Mystery", "Journey", "Secret", "Legend", "Dream", "Shadow", "Light", "Ocean", "Mountain", "Forest", "Storm", "Fire", "Ice", "Wind", "Thunder", "Star", "Moon", "Sun", "Galaxy"],
        titlePrefixes: ["The", "A", "My", "Our", "Lost", "Hidden", "Ancient", "Modern", "Great", "Dark", "Bright", "Silent", "Forgotten", "Eternal"],
        firstNames: ["John", "Jane", "Michael", "Sarah", "David", "Emily", "Robert", "Emma", "William", "Olivia", "James", "Ava", "Benjamin", "Isabella"],
        lastNames: ["Smith", "Johnson", "Brown", "Davis", "Miller", "Wilson", "Moore", "Taylor", "Anderson", "Thomas", "Jackson", "White", "Harris", "Martin"],
        publishers: ["Atlantic Press", "Phoenix Books", "Modern Publishing", "Classic Literature", "Digital Age Press", "Horizon Books", "Summit Publishing"],
        reviews: ["This book was absolutely amazing!", "I couldn't put this book down.", "Great storytelling and excellent character development.", "The book was okay, but felt slow in parts.", "Fantastic read with wonderful writing style."]
      },
      "de-DE": {
        titleWords: ["Abenteuer", "Geheimnis", "Reise", "Legende", "Traum", "Schatten", "Licht", "Ozean", "Berg", "Wald", "Sturm", "Feuer", "Eis", "Wind", "Donner"],
        titlePrefixes: ["Das", "Die", "Der", "Ein", "Mein", "Unser", "Verloren", "Versteckt", "Alt", "Neu", "Groß", "Dunkel", "Hell", "Vergessen"],
        firstNames: ["Hans", "Anna", "Klaus", "Maria", "Thomas", "Petra", "Wolfgang", "Sabine", "Jürgen", "Ingrid", "Dieter", "Brigitte"],
        lastNames: ["Müller", "Schmidt", "Schneider", "Fischer", "Weber", "Meyer", "Wagner", "Becker", "Schulz", "Hoffmann", "Koch", "Klein"],
        publishers: ["Deutscher Verlag", "Moderne Bücher", "Klassik Verlag", "Digitale Zeit", "Literatur Haus", "Horizont Bücher"],
        reviews: ["Dieses Buch war absolut erstaunlich!", "Ich konnte das Buch nicht aus der Hand legen.", "Großartige Erzählung.", "Das Buch war in Ordnung.", "Fantastische Lektüre!"]
      },
      "ja-JP": {
        titleWords: ["冒険", "謎", "旅", "秘密", "伝説", "夢", "影", "光", "海", "山", "森", "嵐", "火", "氷", "風"],
        titlePrefixes: ["", "新しい", "古い", "大きな", "小さな", "暗い", "明るい", "静かな", "忘れられた", "永遠の"],
        firstNames: ["太郎", "花子", "一郎", "美咲", "健太", "由美", "和夫", "恵子", "博", "真理", "茂", "久美子"],
        lastNames: ["田中", "佐藤", "鈴木", "高橋", "伊藤", "渡辺", "山本", "中村", "小林", "加藤", "吉田", "山田"],
        publishers: ["現代出版", "文学社", "デジタル書房", "古典文庫", "新時代出版", "地平線書店"],
        reviews: ["この本は本当に素晴らしかったです！", "この本を手放すことができませんでした。", "素晴らしいストーリーテリング。", "本は悪くありませんでした。", "素晴らしい読書体験！"]
      },
      "fr-FR": {
        titleWords: ["Aventure", "Mystère", "Voyage", "Secret", "Légende", "Rêve", "Ombre", "Lumière", "Océan", "Montagne", "Forêt", "Tempête", "Feu", "Glace"],
        titlePrefixes: ["Le", "La", "Les", "Un", "Une", "Mon", "Notre", "Perdu", "Caché", "Ancien", "Moderne", "Grand", "Sombre", "Oublié"],
        firstNames: ["Pierre", "Marie", "Jean", "Sophie", "Michel", "Catherine", "Philippe", "Isabelle", "Alain", "Françoise", "Bernard", "Monique"],
        lastNames: ["Martin", "Bernard", "Dubois", "Thomas", "Robert", "Richard", "Petit", "Durand", "Leroy", "Moreau", "Simon", "Laurent"],
        publishers: ["Éditions Modernes", "Littérature Classique", "Presse Numérique", "Maison du Livre", "Éditions Avenir", "Horizon Livres"],
        reviews: ["Ce livre était absolument incroyable !", "Je n'arrivais pas à lâcher ce livre.", "Excellent récit.", "Le livre était correct.", "Lecture fantastique !"]
      },
      "es-ES": {
        titleWords: ["Aventura", "Misterio", "Viaje", "Secreto", "Leyenda", "Sueño", "Sombra", "Luz", "Océano", "Montaña", "Bosque", "Tormenta", "Fuego"],
        titlePrefixes: ["El", "La", "Los", "Las", "Un", "Una", "Mi", "Nuestro", "Perdido", "Oculto", "Antiguo", "Moderno", "Grande", "Olvidado"],
        firstNames: ["Carlos", "María", "José", "Ana", "Manuel", "Carmen", "Francisco", "Isabel", "Antonio", "Dolores", "Jesús", "Pilar"],
        lastNames: ["García", "González", "Rodríguez", "Fernández", "López", "Martínez", "Sánchez", "Pérez", "Gómez", "Martín", "Jiménez", "Ruiz"],
        publishers: ["Editorial Moderna", "Literatura Clásica", "Prensa Digital", "Casa del Libro", "Ediciones Futuro", "Libros Horizonte"],
        reviews: ["¡Este libro fue absolutamente increíble!", "No pude soltar este libro.", "Gran narrativa.", "El libro estaba bien.", "¡Lectura fantástica!"]
      }
    };

         const batchSize = pageNum === 0 ? 20 : 10;
     const newBooks: BookData[] = Array.from({ length: batchSize }, (_, i) => {
       const combinedSeed = params.seed + (pageNum * 1000) + i;
       const bookRng = new SeededRNG(combinedSeed);
       
       const langData = data[params.language as keyof typeof data] || data["en-US"];
       
       // Generate title
       const prefix = bookRng.choice(langData.titlePrefixes);
       const word1 = bookRng.choice(langData.titleWords);
       const word2 = bookRng.choice(langData.titleWords);
       const title = prefix ? `${prefix} ${word1}` : `${word1} ${word2}`;
       
       // Generate authors
       const authorCount = bookRng.nextInt(1, 3);
       const authors = Array.from({ length: authorCount }, () => {
         const firstName = bookRng.choice(langData.firstNames);
         const lastName = bookRng.choice(langData.lastNames);
         return `${firstName} ${lastName}`;
       });
       
       const publisher = bookRng.choice(langData.publishers);
       const isbn = `978-${bookRng.nextInt(0, 9)}-${bookRng.nextInt(100, 999)}-${bookRng.nextInt(10000, 99999)}-${bookRng.nextInt(0, 9)}`;

       // Separate generator for likes (seeded from book generator)
       const likesRng = new SeededRNG(bookRng.nextInt());
       const likes = Math.floor(params.avgLikes);
       const likesFraction = params.avgLikes - likes;
       const finalLikes = likes + (likesRng.next() < likesFraction ? 1 : 0);
       
       // Separate generator for reviews (seeded from book generator)
       const reviewsRng = new SeededRNG(bookRng.nextInt());
       const reviewCount = Math.floor(params.avgReviews);
       const reviewFraction = params.avgReviews - reviewCount;
       const finalReviewCount = reviewCount + (reviewsRng.next() < reviewFraction ? 1 : 0);

       return {
         index: (pageNum * 10) + i + (pageNum === 0 ? 0 : 10) + 1,
         isbn,
         title,
         authors,
         publisher,
         likes: finalLikes,
         reviews: Array.from({ length: finalReviewCount }, () => {
           // Each review gets its own generator seeded from the reviews generator
           const reviewRng = new SeededRNG(reviewsRng.nextInt());
           return {
             text: reviewRng.choice(langData.reviews),
             author: `${reviewRng.choice(langData.firstNames)} ${reviewRng.choice(langData.lastNames)}`,
             rating: reviewRng.nextInt(1, 5),
           };
         }),
       };
     });
    
    if (reset || pageNum === 0) {
      setBooks(newBooks);
    } else {
      setBooks(prev => [...prev, ...newBooks]);
    }
  };

  useEffect(() => {
    setPage(0);
    fetchBooks(0, true);
  }, [params]);

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchBooks(nextPage);
  };

  const exportToCsv = async () => {
    try {
      const response = await fetch('/api/book/export-csv', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...params,
          pages: Math.ceil(books.length / 20), // Calculate pages based on current books
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to export CSV');
      }
      
      // Create blob from response and download
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'books_export.csv';
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export CSV:', error);
      // Fallback to client-side export
      const csvContent = [
        ['Index', 'ISBN', 'Title', 'Authors', 'Publisher', 'Likes', 'Reviews Count'],
        ...books.map(book => [
          book.index,
          book.isbn,
          book.title,
          book.authors.join('; '),
          book.publisher,
          book.likes,
          book.reviews.length
        ])
      ].map(row => row.map(field => `"${field}"`).join(',')).join('\n');
      
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'books.csv';
      link.click();
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Book Store Testing Tool
          </h1>
          <p className="text-muted-foreground">Generate realistic fake book data for testing purposes</p>
        </div>

        {/* Controls */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shuffle className="h-5 w-5" />
              Generation Parameters
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Language Selection */}
              <div className="space-y-2">
                <Label htmlFor="language">Language & Region</Label>
                <Select
                  value={params.language}
                  onValueChange={(value) => setParams(prev => ({ ...prev, language: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {languages.map(lang => (
                      <SelectItem key={lang.code} value={lang.code}>
                        <span className="flex items-center gap-2">
                          <span>{lang.flag}</span>
                          {lang.name}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Seed Value */}
              <div className="space-y-2">
                <Label htmlFor="seed">Seed Value</Label>
                <div className="flex gap-2">
                  <Input
                    id="seed"
                    type="number"
                    value={params.seed}
                    onChange={(e) => setParams(prev => ({ ...prev, seed: parseInt(e.target.value) || 0 }))}
                    className="flex-1"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={generateRandomSeed}
                    title="Generate random seed"
                  >
                    <Shuffle className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Average Likes */}
              <div className="space-y-2">
                <Label htmlFor="likes">Average Likes: {params.avgLikes}</Label>
                <Slider
                  id="likes"
                  min={0}
                  max={10}
                  step={0.1}
                  value={[params.avgLikes]}
                  onValueChange={([value]) => setParams(prev => ({ ...prev, avgLikes: value }))}
                  className="w-full"
                />
              </div>

              {/* Average Reviews */}
              <div className="space-y-2">
                <Label htmlFor="reviews">Average Reviews</Label>
                <Input
                  id="reviews"
                  type="number"
                  min="0"
                  step="0.1"
                  value={params.avgReviews}
                  onChange={(e) => setParams(prev => ({ ...prev, avgReviews: parseFloat(e.target.value) || 0 }))}
                />
              </div>
            </div>

            <Separator />

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <Badge variant="secondary">
                  {books.length} books generated
                </Badge>
                {loading && <Badge variant="outline">Loading...</Badge>}
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  onClick={exportToCsv}
                  disabled={books.length === 0}
                  className="gap-2"
                >
                  <Download className="h-4 w-4" />
                  Export CSV
                </Button>

                <Tabs value={viewMode} onValueChange={(value: string) => setViewMode(value as "table" | "gallery")}>
                  <TabsList>
                    <TabsTrigger value="table" className="gap-2">
                      <List className="h-4 w-4" />
                      Table
                    </TabsTrigger>
                    <TabsTrigger value="gallery" className="gap-2">
                      <Grid className="h-4 w-4" />
                      Gallery
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Books Display */}
        <BookTable 
          books={books} 
          loading={loading} 
          onLoadMore={loadMore}
          viewMode={viewMode}
        />
      </div>
    </div>
  );
};