# Book Scribe Generator

A web application for generating realistic fake book information for testing book store applications. This tool helps developers and testers create comprehensive test data with support for multiple languages and regions.

## Features

- **Multi-language Support**: Generate books in English (USA), German (Germany), Japanese (Japan), French (France), and Spanish (Spain)
- **Seeded Random Generation**: Consistent data generation using seed values
- **Fractional Logic**: Support for fractional likes and reviews per book
- **Infinite Scrolling**: Dynamic loading of books as you scroll
- **Gallery & Table Views**: Two different viewing modes for the generated books
- **CSV Export**: Export generated data to CSV format
- **Expandable Details**: Click on books to see detailed information including reviews
- **Realistic Data**: Books, authors, and publishers that look authentic for each language

## Technology Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS, Shadcn/ui
- **Backend**: .NET 8, ASP.NET Core Web API
- **Data Generation**: Bogus for realistic fake data
- **Build Tool**: Vite

## Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/azya11/book-scribe-generator.git
   cd book-scribe-generator
   ```

2. **Install frontend dependencies**
   ```bash
   cd book-scribe-generator
   npm install
   ```

3. **Build the frontend**
   ```bash
   npm run build
   ```

4. **Start the .NET backend**
   ```bash
   cd BookScribeGenerator.API
   dotnet run
   ```

5. **Access the application**
   - Backend API: http://localhost:5000
   - Swagger UI: http://localhost:5000/swagger
   - Frontend: http://localhost:5000 (served by .NET backend)

## Usage

### Basic Usage

1. **Select Language & Region**: Choose from English (USA), German (Germany), Japanese (Japan), French (France), or Spanish (Spain)
2. **Set Seed Value**: Enter a custom seed or generate a random one using the shuffle button
3. **Configure Likes**: Use the slider to set average likes per book (0-10 with fractional support)
4. **Configure Reviews**: Set the average number of reviews per book (supports fractional values)
5. **View Results**: The table/gallery will automatically update as you change parameters

### Advanced Features

- **Infinite Scrolling**: Scroll down to load more books (10 additional books per scroll)
- **Gallery View**: Switch to gallery view for a different visual experience
- **Expandable Details**: Click on any book to see detailed information including reviews
- **CSV Export**: Export all currently displayed books to CSV format

### Fractional Logic Explained

The application implements sophisticated fractional logic for both likes and reviews:

- **Likes**: If you set 1.2 likes, each book will have 1 like plus a 20% chance of having a 2nd like
- **Reviews**: If you set 4.7 reviews, each book will have 4 reviews plus a 70% chance of having a 5th review
- **Zero Values**: If you set 0.5 reviews, each book has a 50% chance of having 1 review

**Key Implementation Details:**
- Uses multiple seeded random generators to ensure consistency
- Book titles, authors, and publishers remain the same when only likes/reviews change
- Each book gets its own seeded generator for likes and reviews
- The same seed will always produce the same books with the same titles/authors

## API Endpoints

### POST /api/book/generate
Generates a batch of books based on the provided parameters.

**Request Body:**
```json
{
  "language": "en-US",
  "seed": 42,
  "avgLikes": 3.7,
  "avgReviews": 2.5,
  "page": 0,
  "batchSize": 20
}
```

**Response:**
```json
[
  {
    "index": 42,
    "isbn": "978-0-12345-678-9",
    "title": "The Silent Echo",
    "authors": ["John Smith"],
    "publisher": "Random House",
    "likes": 4,
    "reviews": [
      {
        "text": "A compelling narrative...",
        "author": "Jane Doe",
        "rating": 5
      }
    ]
  }
]
```

### POST /api/book/export-csv
Exports generated books to CSV format.

**Request Body:**
```json
{
  "language": "en-US",
  "seed": 42,
  "avgLikes": 3.7,
  "avgReviews": 2.5,
  "pages": 5
}
```

## Development

### Project Structure
```
book-scribe-generator/
├── BookScribeGenerator.API/     # .NET Web API backend
│   ├── Controllers/             # API controllers
│   ├── Models/                  # Data models
│   ├── Services/                # Business logic services
│   ├── Properties/              # Configuration files
│   └── Program.cs               # Application entry point
├── book-scribe-generator/       # Frontend React application
│   ├── src/
│   │   ├── components/         # React components
│   │   ├── pages/             # Page components
│   │   └── lib/               # Utility functions
│   ├── package.json           # Frontend dependencies
│   └── vite.config.ts         # Vite configuration
└── README.md
```

### Running in Development Mode

1. **Start the .NET backend**
   ```bash
   cd BookScribeGenerator.API
   dotnet run
   ```

2. **For frontend development (optional)**
   ```bash
   cd book-scribe-generator
   npm run dev
   ```

3. **Access the application**
   - Backend API: http://localhost:5000
   - Swagger UI: http://localhost:5000/swagger
   - Frontend: http://localhost:5000 (served by .NET backend)

### Building for Production

1. **Build the frontend**
   ```bash
   cd book-scribe-generator
   npm run build
   ```

2. **Build and run the .NET backend**
   ```bash
   cd BookScribeGenerator.API
   dotnet build --configuration Release
   dotnet run --configuration Release
   ```

## Deployment

The application is designed to be easily deployable to various platforms:

### Heroku
```bash
git push heroku main
```

### Vercel
```bash
vercel --prod
```

### Railway
```bash
railway up
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Author

Aziz Shamuratov

## Demo Video Requirements

For submission, please record a video demonstrating:

1. **Language/Region Changes**: Show generation for different regions (German, Japanese, French, Spanish)
2. **Infinite Scrolling**: Demonstrate loading 5-10 pages of books
3. **Fractional Logic**: Change likes from 0 to 0.5, then to 5
4. **Seed Consistency**: Change seed, demonstrate data changes, then return to original seed to show same data
5. **CSV Export**: Show the export functionality
6. **Gallery View**: Demonstrate the alternative view mode

The video should be clear, well-paced, and show all the key features of the application. 