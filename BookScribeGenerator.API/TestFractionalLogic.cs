using BookScribeGenerator.API.Services;

namespace BookScribeGenerator.API.Tests;

public class TestFractionalLogic
{
    public static void RunTest()
    {
        var service = new BookGenerationService();
        
        Console.WriteLine("=== Testing Fractional Logic ===");
        Console.WriteLine();
        
        // Test with 4.7 reviews - should get 4 reviews + 70% chance of 5th review
        Console.WriteLine("Testing with 4.7 reviews:");
        var request1 = new Models.GenerationRequest
        {
            Language = "en-US",
            Seed = 42,
            AvgLikes = 3.0,
            AvgReviews = 4.7,
            Page = 0,
            BatchSize = 10
        };
        
        var books1 = service.GenerateBooks(request1);
        foreach (var book in books1.Take(5))
        {
            Console.WriteLine($"Book: {book.Title} - Reviews: {book.Reviews.Count}");
        }
        
        Console.WriteLine();
        
        // Test with 0.5 reviews - should get 0 reviews + 50% chance of 1 review
        Console.WriteLine("Testing with 0.5 reviews:");
        var request2 = new Models.GenerationRequest
        {
            Language = "en-US",
            Seed = 42,
            AvgLikes = 3.0,
            AvgReviews = 0.5,
            Page = 0,
            BatchSize = 10
        };
        
        var books2 = service.GenerateBooks(request2);
        foreach (var book in books2.Take(5))
        {
            Console.WriteLine($"Book: {book.Title} - Reviews: {book.Reviews.Count}");
        }
        
        Console.WriteLine();
        
        // Test with 1.2 likes - should get 1 like + 20% chance of 2nd like
        Console.WriteLine("Testing with 1.2 likes:");
        var request3 = new Models.GenerationRequest
        {
            Language = "en-US",
            Seed = 42,
            AvgLikes = 1.2,
            AvgReviews = 2.0,
            Page = 0,
            BatchSize = 10
        };
        
        var books3 = service.GenerateBooks(request3);
        foreach (var book in books3.Take(5))
        {
            Console.WriteLine($"Book: {book.Title} - Likes: {book.Likes}");
        }
        
        Console.WriteLine();
        Console.WriteLine("=== Consistency Test ===");
        Console.WriteLine("Same seed should produce same books:");
        
        var books4a = service.GenerateBooks(request1);
        var books4b = service.GenerateBooks(request1);
        
        for (int i = 0; i < 3; i++)
        {
            Console.WriteLine($"Book {i}: {books4a[i].Title} vs {books4b[i].Title}");
            Console.WriteLine($"  Reviews: {books4a[i].Reviews.Count} vs {books4b[i].Reviews.Count}");
            Console.WriteLine($"  Likes: {books4a[i].Likes} vs {books4b[i].Likes}");
        }
    }
} 