using BookScribeGenerator.API.Models;
using Bogus;
using CsvHelper;
using System.Globalization;
using System.Text;

namespace BookScribeGenerator.API.Services;

public class BookGenerationService : IBookGenerationService
{
    private readonly Dictionary<string, Faker> _fakers = new();
    private readonly Dictionary<string, string[]> _titles = new();
    private readonly Dictionary<string, string[]> _authors = new();
    private readonly Dictionary<string, string[]> _publishers = new();
    private readonly Dictionary<string, string[]> _reviews = new();

    public BookGenerationService()
    {
        InitializeData();
    }

    public List<BookData> GenerateBooks(GenerationRequest request)
    {
        var books = new List<BookData>();
        var startIndex = request.Page * request.BatchSize;
        
        for (int i = 0; i < request.BatchSize; i++)
        {
            var bookIndex = startIndex + i;
            var bookSeed = request.Seed + bookIndex;
            
            var book = GenerateBook(bookSeed, request.Language, request.AvgLikes, request.AvgReviews);
            books.Add(book);
        }
        
        return books;
    }

    public byte[] ExportToCsv(ExportRequest request)
    {
        var allBooks = new List<BookData>();
        
        for (int page = 0; page < request.Pages; page++)
        {
            var batchSize = page == 0 ? 20 : 10;
            var startIndex = page * batchSize;
            
            for (int i = 0; i < batchSize; i++)
            {
                var bookIndex = startIndex + i;
                var bookSeed = request.Seed + bookIndex;
                var book = GenerateBook(bookSeed, request.Language, request.AvgLikes, request.AvgReviews);
                allBooks.Add(book);
            }
        }
        
        using var memoryStream = new MemoryStream();
        using var writer = new StreamWriter(memoryStream, Encoding.UTF8);
        using var csv = new CsvWriter(writer, CultureInfo.InvariantCulture);
        
        var csvData = allBooks.Select(book => new
        {
            Index = book.Index,
            Isbn = book.Isbn,
            Title = book.Title,
            Authors = string.Join("; ", book.Authors),
            Publisher = book.Publisher,
            Likes = book.Likes,
            ReviewsCount = book.Reviews.Count
        }).ToList();
        
        csv.WriteRecords(csvData);
        writer.Flush();
        
        return memoryStream.ToArray();
    }

    private BookData GenerateBook(int seed, string language, double avgLikes, double avgReviews)
    {
        // Main book generator - this determines titles, authors, publishers
        var bookRng = new Random(seed);
        
        var title = GenerateTitle(bookRng, language);
        var authors = GenerateAuthors(bookRng, language);
        var publisher = GeneratePublisher(bookRng, language);
        var isbn = GenerateIsbn(bookRng);
        
        // Separate generator for likes (seeded from book generator)
        var likesRng = new Random(bookRng.Next());
        var likes = (int)Math.Floor(avgLikes);
        var likesFraction = avgLikes - likes;
        var finalLikes = likes + (likesRng.NextDouble() < likesFraction ? 1 : 0);
        
        // Separate generator for reviews (seeded from book generator)
        var reviewsRng = new Random(bookRng.Next());
        var reviewCount = (int)Math.Floor(avgReviews);
        var reviewFraction = avgReviews - reviewCount;
        var finalReviewCount = reviewCount + (reviewsRng.NextDouble() < reviewFraction ? 1 : 0);
        
        var reviews = new List<Review>();
        for (int i = 0; i < finalReviewCount; i++)
        {
            // Each review gets its own generator seeded from the reviews generator
            var reviewRng = new Random(reviewsRng.Next());
            reviews.Add(GenerateReview(reviewRng, language));
        }
        
        return new BookData
        {
            Index = seed,
            Isbn = isbn,
            Title = title,
            Authors = authors,
            Publisher = publisher,
            Likes = (int)finalLikes,
            Reviews = reviews
        };
    }

    private string GenerateTitle(Random rng, string language)
    {
        if (_titles.TryGetValue(language, out var titles))
        {
            return titles[rng.Next(titles.Length)];
        }
        return _titles["en-US"][rng.Next(_titles["en-US"].Length)];
    }

    private List<string> GenerateAuthors(Random rng, string language)
    {
        var authorCount = rng.Next(1, 4);
        var authors = new List<string>();
        
        if (_authors.TryGetValue(language, out var authorList))
        {
            for (int i = 0; i < authorCount; i++)
            {
                authors.Add(authorList[rng.Next(authorList.Length)]);
            }
        }
        else
        {
            for (int i = 0; i < authorCount; i++)
            {
                authors.Add(_authors["en-US"][rng.Next(_authors["en-US"].Length)]);
            }
        }
        
        return authors;
    }

    private string GeneratePublisher(Random rng, string language)
    {
        if (_publishers.TryGetValue(language, out var publishers))
        {
            return publishers[rng.Next(publishers.Length)];
        }
        return _publishers["en-US"][rng.Next(_publishers["en-US"].Length)];
    }

    private string GenerateIsbn(Random rng)
    {
        var prefixes = new[] { "978-0", "978-1", "978-2", "978-3" };
        var prefix = prefixes[rng.Next(prefixes.Length)];
        var group = rng.Next(10, 100);
        var publisher = rng.Next(10000, 100000);
        var title = rng.Next(100, 1000);
        var checkDigit = rng.Next(0, 10);
        
        return $"{prefix}-{group}-{publisher}-{title}-{checkDigit}";
    }

    private Review GenerateReview(Random rng, string language)
    {
        string reviewText;
        if (_reviews.TryGetValue(language, out var reviews))
        {
            reviewText = reviews[rng.Next(reviews.Length)];
        }
        else
        {
            reviewText = _reviews["en-US"][rng.Next(_reviews["en-US"].Length)];
        }
        
        var author = GenerateAuthors(rng, language)[0];
        var rating = rng.Next(1, 6);
        
        return new Review
        {
            Text = reviewText,
            Author = author,
            Rating = rating
        };
    }

    private void InitializeData()
    {
        // English titles
        _titles["en-US"] = new[]
        {
            "The Silent Echo", "Beyond the Horizon", "Whispers of Time", "The Last Chapter",
            "Eternal Dreams", "Shadows of Yesterday", "The Hidden Truth", "Lost in Translation",
            "The Art of Living", "Midnight Reflections", "The Broken Mirror", "Echoes of Love",
            "The Forgotten Path", "Silent Whispers", "The Last Goodbye", "Beyond Reality",
            "The Hidden Garden", "Eternal Flame", "The Lost City", "Whispers in the Dark"
        };

        // German titles
        _titles["de-DE"] = new[]
        {
            "Die Stille Echo", "Jenseits des Horizonts", "Flüstern der Zeit", "Das letzte Kapitel",
            "Ewige Träume", "Schatten von Gestern", "Die versteckte Wahrheit", "Verloren in der Übersetzung",
            "Die Kunst des Lebens", "Mitternachtsreflexionen", "Der zerbrochene Spiegel", "Echos der Liebe",
            "Der vergessene Pfad", "Stille Flüstern", "Der letzte Abschied", "Jenseits der Realität",
            "Der versteckte Garten", "Ewige Flamme", "Die verlorene Stadt", "Flüstern im Dunkeln"
        };

        // Japanese titles
        _titles["ja-JP"] = new[]
        {
            "静寂のエコー", "地平線の向こう", "時の囁き", "最後の章",
            "永遠の夢", "昨日の影", "隠された真実", "翻訳の中で失われた",
            "生きる芸術", "真夜中の反射", "壊れた鏡", "愛の反響",
            "忘れられた道", "静寂の囁き", "最後の別れ", "現実の向こう",
            "隠された庭", "永遠の炎", "失われた街", "闇の中の囁き"
        };

        // French titles
        _titles["fr-FR"] = new[]
        {
            "L'Écho Silencieux", "Au-delà de l'Horizon", "Murmures du Temps", "Le Dernier Chapitre",
            "Rêves Éternels", "Ombres d'Hier", "La Vérité Cachée", "Perdu en Traduction",
            "L'Art de Vivre", "Réflexions de Minuit", "Le Miroir Brisé", "Échos d'Amour",
            "Le Chemin Oublié", "Murmures Silencieux", "Le Dernier Adieu", "Au-delà de la Réalité",
            "Le Jardin Caché", "Flamme Éternelle", "La Ville Perdue", "Murmures dans l'Obscurité"
        };

        // Spanish titles
        _titles["es-ES"] = new[]
        {
            "El Eco Silencioso", "Más Allá del Horizonte", "Susurros del Tiempo", "El Último Capítulo",
            "Sueños Eternos", "Sombras de Ayer", "La Verdad Oculta", "Perdido en la Traducción",
            "El Arte de Vivir", "Reflexiones de Medianoche", "El Espejo Roto", "Ecos de Amor",
            "El Camino Olvidado", "Susurros Silenciosos", "El Último Adiós", "Más Allá de la Realidad",
            "El Jardín Oculto", "Llama Eterna", "La Ciudad Perdida", "Susurros en la Oscuridad"
        };

        // English authors
        _authors["en-US"] = new[]
        {
            "John Smith", "Emily Johnson", "Michael Brown", "Sarah Davis", "David Wilson",
            "Lisa Anderson", "Robert Taylor", "Jennifer Martinez", "William Garcia", "Amanda Rodriguez",
            "James Miller", "Jessica Lopez", "Christopher Lee", "Ashley White", "Daniel Thompson",
            "Nicole Clark", "Matthew Hall", "Stephanie Lewis", "Andrew Young", "Rachel Walker"
        };

        // German authors
        _authors["de-DE"] = new[]
        {
            "Hans Müller", "Anna Schmidt", "Klaus Weber", "Maria Fischer", "Peter Meyer",
            "Sabine Wagner", "Thomas Schulz", "Petra Becker", "Wolfgang Hoffmann", "Monika Schäfer",
            "Jürgen Koch", "Brigitte Bauer", "Manfred Richter", "Renate Klein", "Dieter Wolf",
            "Ursula Schröder", "Günther Neumann", "Helga Zimmermann", "Werner Braun", "Elke Krüger"
        };

        // Japanese authors
        _authors["ja-JP"] = new[]
        {
            "田中太郎", "佐藤花子", "鈴木一郎", "高橋美咲", "渡辺健太",
            "伊藤由美", "山田次郎", "中村愛子", "小林正男", "加藤恵美",
            "吉田大輔", "林麻衣", "斎藤健一", "清水美奈", "阿部隆司",
            "森田由香", "石川正人", "佐々木美穂", "山口健二", "松本愛"
        };

        // French authors
        _authors["fr-FR"] = new[]
        {
            "Jean Dupont", "Marie Martin", "Pierre Durand", "Sophie Bernard", "Michel Petit",
            "Isabelle Moreau", "François Simon", "Catherine Leroy", "Philippe Roux", "Nathalie David",
            "Laurent Bertrand", "Valérie Mercier", "Nicolas Girard", "Sandrine Bonnet", "Stéphane Henry",
            "Céline Faure", "Romain Rousseau", "Audrey Blanchard", "Guillaume Garnier", "Julie Rousseau"
        };

        // Spanish authors
        _authors["es-ES"] = new[]
        {
            "Carlos García", "María Rodríguez", "José López", "Ana Martínez", "Miguel González",
            "Carmen Pérez", "Francisco Sánchez", "Isabel Torres", "Antonio Ruiz", "Elena Jiménez",
            "Manuel Moreno", "Teresa Herrera", "Javier Díaz", "Rosa Vega", "Alberto Morales",
            "Lucía Castro", "Fernando Ortega", "Patricia Silva", "Ricardo Reyes", "Sonia Mendoza"
        };

        // English publishers
        _publishers["en-US"] = new[]
        {
            "Random House", "Penguin Books", "HarperCollins", "Simon & Schuster", "Macmillan",
            "Scholastic", "Bloomsbury", "Hachette", "Wiley", "Oxford University Press"
        };

        // German publishers
        _publishers["de-DE"] = new[]
        {
            "Random House Deutschland", "Penguin Verlag", "HarperCollins Deutschland", "Simon & Schuster Deutschland",
            "Macmillan Deutschland", "Scholastic Deutschland", "Bloomsbury Deutschland", "Hachette Deutschland",
            "Wiley Deutschland", "Oxford University Press Deutschland"
        };

        // Japanese publishers
        _publishers["ja-JP"] = new[]
        {
            "講談社", "集英社", "小学館", "角川書店", "新潮社",
            "文藝春秋", "朝日新聞出版", "岩波書店", "筑摩書房", "平凡社"
        };

        // French publishers
        _publishers["fr-FR"] = new[]
        {
            "Gallimard", "Albin Michel", "Flammarion", "Robert Laffont", "Fayard",
            "Grasset", "Seuil", "Stock", "Calmann-Lévy", "Plon"
        };

        // Spanish publishers
        _publishers["es-ES"] = new[]
        {
            "Planeta", "Santillana", "Anagrama", "Tusquets", "Alfaguara",
            "Espasa", "Grijalbo", "Debolsillo", "Temas de Hoy", "Aguilar"
        };

        // English reviews
        _reviews["en-US"] = new[]
        {
            "A compelling narrative that keeps you engaged from start to finish.",
            "Beautifully written with rich character development and vivid descriptions.",
            "An insightful exploration of human nature and contemporary issues.",
            "A masterpiece that transcends genres and speaks to the human condition.",
            "Thought-provoking and emotionally resonant, this book stays with you long after reading.",
            "A fresh perspective on familiar themes, executed with skill and originality.",
            "The author's voice is distinctive and the story flows naturally.",
            "A powerful story that challenges readers to think differently about the world.",
            "Rich in detail and atmosphere, this book creates an immersive experience.",
            "A well-crafted story that balances plot, character, and theme perfectly."
        };

        // German reviews
        _reviews["de-DE"] = new[]
        {
            "Eine fesselnde Erzählung, die Sie von Anfang bis Ende in Atem hält.",
            "Wunderschön geschrieben mit reicher Charakterentwicklung und lebendigen Beschreibungen.",
            "Eine aufschlussreiche Erkundung der menschlichen Natur und zeitgenössischer Themen.",
            "Ein Meisterwerk, das Genres transzendiert und zur menschlichen Verfassung spricht.",
            "Nachdenklich und emotional berührend, bleibt dieses Buch lange nach dem Lesen in Erinnerung.",
            "Eine frische Perspektive auf vertraute Themen, ausgeführt mit Geschick und Originalität.",
            "Die Stimme des Autors ist unverwechselbar und die Geschichte fließt natürlich.",
            "Eine kraftvolle Geschichte, die Leser herausfordert, anders über die Welt nachzudenken.",
            "Reich an Details und Atmosphäre schafft dieses Buch ein immersives Erlebnis.",
            "Eine gut gestaltete Geschichte, die Handlung, Charakter und Thema perfekt ausbalanciert."
        };

        // Japanese reviews
        _reviews["ja-JP"] = new[]
        {
            "最初から最後まで読者を引き込む魅力的な物語です。",
            "豊かなキャラクター開発と鮮やかな描写で美しく書かれています。",
            "人間性と現代の問題を洞察力豊かに探求しています。",
            "ジャンルを超越し、人間の条件に語りかける傑作です。",
            "考えさせられ、感情的に響くこの本は、読んだ後も長く心に残ります。",
            "親しみやすいテーマに対する新鮮な視点で、巧みと独創性を持って実行されています。",
            "作者の声は独特で、物語は自然に流れます。",
            "読者に世界について異なる考え方を促す力強い物語です。",
            "詳細と雰囲気に富み、この本は没入感のある体験を作り出します。",
            "プロット、キャラクター、テーマを完璧にバランスさせた良く作られた物語です。"
        };

        // French reviews
        _reviews["fr-FR"] = new[]
        {
            "Un récit captivant qui vous tient en haleine du début à la fin.",
            "Magnifiquement écrit avec un riche développement des personnages et des descriptions vivantes.",
            "Une exploration perspicace de la nature humaine et des problèmes contemporains.",
            "Un chef-d'œuvre qui transcende les genres et parle à la condition humaine.",
            "Provocateur et émotionnellement résonnant, ce livre reste avec vous longtemps après la lecture.",
            "Une perspective fraîche sur des thèmes familiers, exécutée avec habileté et originalité.",
            "La voix de l'auteur est distinctive et l'histoire coule naturellement.",
            "Une histoire puissante qui défie les lecteurs de penser différemment du monde.",
            "Riche en détails et en atmosphère, ce livre crée une expérience immersive.",
            "Une histoire bien conçue qui équilibre parfaitement intrigue, personnage et thème."
        };

        // Spanish reviews
        _reviews["es-ES"] = new[]
        {
            "Una narrativa convincente que te mantiene comprometido de principio a fin.",
            "Bellamente escrito con rico desarrollo de personajes y descripciones vívidas.",
            "Una exploración perspicaz de la naturaleza humana y temas contemporáneos.",
            "Una obra maestra que trasciende géneros y habla a la condición humana.",
            "Provocador y emocionalmente resonante, este libro permanece contigo mucho después de leerlo.",
            "Una perspectiva fresca sobre temas familiares, ejecutada con habilidad y originalidad.",
            "La voz del autor es distintiva y la historia fluye naturalmente.",
            "Una historia poderosa que desafía a los lectores a pensar diferente sobre el mundo.",
            "Rico en detalles y atmósfera, este libro crea una experiencia inmersiva.",
            "Una historia bien elaborada que equilibra perfectamente trama, personaje y tema."
        };
    }
} 