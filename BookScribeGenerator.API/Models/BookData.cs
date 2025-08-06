namespace BookScribeGenerator.API.Models;

public class BookData
{
    public int Index { get; set; }
    public string Isbn { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public List<string> Authors { get; set; } = new();
    public string Publisher { get; set; } = string.Empty;
    public int Likes { get; set; }
    public List<Review> Reviews { get; set; } = new();
}

public class Review
{
    public string Text { get; set; } = string.Empty;
    public string Author { get; set; } = string.Empty;
    public int Rating { get; set; }
}

public class GenerationRequest
{
    public string Language { get; set; } = "en-US";
    public int Seed { get; set; }
    public double AvgLikes { get; set; }
    public double AvgReviews { get; set; }
    public int Page { get; set; }
    public int BatchSize { get; set; } = 20;
}

public class ExportRequest
{
    public string Language { get; set; } = "en-US";
    public int Seed { get; set; }
    public double AvgLikes { get; set; }
    public double AvgReviews { get; set; }
    public int Pages { get; set; }
} 