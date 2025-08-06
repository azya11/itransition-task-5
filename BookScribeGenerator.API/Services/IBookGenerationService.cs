using BookScribeGenerator.API.Models;

namespace BookScribeGenerator.API.Services;

public interface IBookGenerationService
{
    List<BookData> GenerateBooks(GenerationRequest request);
    byte[] ExportToCsv(ExportRequest request);
} 