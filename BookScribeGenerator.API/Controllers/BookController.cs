using BookScribeGenerator.API.Models;
using BookScribeGenerator.API.Services;
using Microsoft.AspNetCore.Mvc;

namespace BookScribeGenerator.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class BookController : ControllerBase
{
    private readonly IBookGenerationService _bookGenerationService;

    public BookController(IBookGenerationService bookGenerationService)
    {
        _bookGenerationService = bookGenerationService;
    }

    [HttpPost("generate")]
    public ActionResult<List<BookData>> GenerateBooks([FromBody] GenerationRequest request)
    {
        try
        {
            var books = _bookGenerationService.GenerateBooks(request);
            return Ok(books);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = "Failed to generate books", message = ex.Message });
        }
    }

    [HttpPost("export-csv")]
    public ActionResult ExportToCsv([FromBody] ExportRequest request)
    {
        try
        {
            var csvData = _bookGenerationService.ExportToCsv(request);
            
            return File(
                csvData,
                "text/csv",
                $"books_export_{DateTime.Now:yyyyMMdd_HHmmss}.csv"
            );
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = "Failed to export CSV", message = ex.Message });
        }
    }

    [HttpGet("test")]
    public ActionResult<string> Test()
    {
        return Ok("Book Scribe Generator API is running!");
    }
} 