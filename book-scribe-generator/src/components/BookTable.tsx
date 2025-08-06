import { useState, useCallback, useEffect } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, ChevronRight, Heart, Star, BookOpen } from "lucide-react";
import { BookData } from "./BookGenerator";
import { cn } from "@/lib/utils";

interface BookTableProps {
  books: BookData[];
  loading: boolean;
  onLoadMore: () => void;
  viewMode: "table" | "gallery";
}

const BookCover = ({ book }: { book: BookData }) => {
  return (
    <div className="relative w-32 h-48 bg-gradient-dark rounded-lg shadow-glow overflow-hidden border border-border/20">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20" />
      <div className="absolute inset-0 bg-black/30" />
      <div className="absolute inset-0 p-3 flex flex-col justify-between text-white">
        <div>
          <h4 className="font-bold text-sm leading-tight mb-1 text-shadow">{book.title}</h4>
          <p className="text-xs opacity-90 text-shadow">{book.authors.join(", ")}</p>
        </div>
        <div className="text-xs opacity-75 text-shadow">
          {book.publisher}
        </div>
      </div>
    </div>
  );
};

const BookGalleryCard = ({ book, isExpanded, onToggle }: { 
  book: BookData; 
  isExpanded: boolean; 
  onToggle: () => void; 
}) => {
  return (
    <Card className="shadow-card hover:shadow-elegant transition-shadow cursor-pointer" onClick={onToggle}>
      <CardContent className="p-4">
        <div className="flex gap-4">
          <BookCover book={book} />
          <div className="flex-1 space-y-2">
            <div>
              <h3 className="font-semibold text-lg">{book.title}</h3>
              <p className="text-muted-foreground">{book.authors.join(", ")}</p>
              <p className="text-sm text-muted-foreground">{book.publisher}</p>
            </div>
            
            <div className="flex items-center gap-4">
              <Badge variant="secondary" className="gap-1">
                <Heart className="h-3 w-3" />
                {book.likes}
              </Badge>
              <Badge variant="outline" className="gap-1">
                <BookOpen className="h-3 w-3" />
                {book.reviews.length} reviews
              </Badge>
            </div>
            
            <div className="text-xs text-muted-foreground">
              ISBN: {book.isbn}
            </div>
          </div>
        </div>
        
        {isExpanded && (
          <div className="mt-4 pt-4 border-t space-y-3">
            {book.reviews.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">Reviews</h4>
                <div className="space-y-2">
                  {book.reviews.slice(0, 3).map((review, idx) => (
                    <div key={idx} className="bg-muted/50 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm">{review.author}</span>
                        <div className="flex">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={cn(
                                "h-3 w-3",
                                i < review.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                              )}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">{review.text}</p>
                    </div>
                  ))}
                  {book.reviews.length > 3 && (
                    <p className="text-xs text-muted-foreground">
                      +{book.reviews.length - 3} more reviews
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const BookTableRow = ({ book, isExpanded, onToggle }: { 
  book: BookData; 
  isExpanded: boolean; 
  onToggle: () => void; 
}) => {
  return (
    <Collapsible open={isExpanded} onOpenChange={onToggle}>
      <CollapsibleTrigger asChild>
        <TableRow className="cursor-pointer hover:bg-muted/50 transition-colors">
          <TableCell className="w-12">
            {isExpanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </TableCell>
          <TableCell className="font-medium">{book.index}</TableCell>
          <TableCell className="font-mono text-sm">{book.isbn}</TableCell>
          <TableCell className="font-medium">{book.title}</TableCell>
          <TableCell>{book.authors.join(", ")}</TableCell>
          <TableCell>{book.publisher}</TableCell>
          <TableCell>
            <Badge variant="secondary" className="gap-1">
              <Heart className="h-3 w-3" />
              {book.likes}
            </Badge>
          </TableCell>
          <TableCell>
            <Badge variant="outline" className="gap-1">
              <BookOpen className="h-3 w-3" />
              {book.reviews.length}
            </Badge>
          </TableCell>
        </TableRow>
      </CollapsibleTrigger>
      <CollapsibleContent asChild>
        <TableRow>
          <TableCell colSpan={8} className="bg-muted/30">
            <div className="p-4 space-y-4">
              <div className="flex gap-4">
                <BookCover book={book} />
                <div className="flex-1 space-y-3">
                  <div>
                    <h3 className="text-lg font-semibold">{book.title}</h3>
                    <p className="text-muted-foreground">by {book.authors.join(", ")}</p>
                    <p className="text-sm text-muted-foreground">Published by {book.publisher}</p>
                    <p className="text-sm text-muted-foreground">ISBN: {book.isbn}</p>
                  </div>
                  
                  {book.reviews.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2">Customer Reviews</h4>
                      <div className="grid gap-3 max-h-60 overflow-y-auto">
                        {book.reviews.map((review, idx) => (
                          <div key={idx} className="bg-card rounded-lg p-3 border">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="font-medium">{review.author}</span>
                              <div className="flex">
                                {Array.from({ length: 5 }).map((_, i) => (
                                  <Star
                                    key={i}
                                    className={cn(
                                      "h-4 w-4",
                                      i < review.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                                    )}
                                  />
                                ))}
                              </div>
                            </div>
                            <p className="text-sm text-muted-foreground">{review.text}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </TableCell>
        </TableRow>
      </CollapsibleContent>
    </Collapsible>
  );
};

export const BookTable = ({ books, loading, onLoadMore, viewMode }: BookTableProps) => {
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set());
  const [hasMore, setHasMore] = useState(true);

  const toggleExpanded = useCallback((index: number) => {
    setExpandedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  }, []);

  // Infinite scroll detection
  useEffect(() => {
    const handleScroll = () => {
      if (loading || !hasMore) return;
      
      const scrollTop = window.pageYOffset;
      const windowHeight = window.innerHeight;
      const docHeight = document.documentElement.offsetHeight;
      
      if (scrollTop + windowHeight >= docHeight - 1000) {
        onLoadMore();
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [loading, hasMore, onLoadMore]);

  if (books.length === 0 && !loading) {
    return (
      <Card className="shadow-card">
        <CardContent className="text-center py-12">
          <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No books generated yet</h3>
          <p className="text-muted-foreground">Adjust the parameters above to generate book data</p>
        </CardContent>
      </Card>
    );
  }

  if (viewMode === "gallery") {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {books.map(book => (
            <BookGalleryCard
              key={book.index}
              book={book}
              isExpanded={expandedItems.has(book.index)}
              onToggle={() => toggleExpanded(book.index)}
            />
          ))}
        </div>
        
        {hasMore && (
          <div className="text-center py-8">
            {loading ? (
              <div className="space-y-2">
                <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto" />
                <p className="text-muted-foreground">Loading more books...</p>
              </div>
            ) : (
              <Button onClick={onLoadMore} variant="outline">
                Load More Books
              </Button>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <Card className="shadow-card">
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12"></TableHead>
                <TableHead className="w-16">#</TableHead>
                <TableHead className="min-w-40">ISBN</TableHead>
                <TableHead className="min-w-48">Title</TableHead>
                <TableHead className="min-w-48">Author(s)</TableHead>
                <TableHead className="min-w-40">Publisher</TableHead>
                <TableHead className="w-20">Likes</TableHead>
                <TableHead className="w-24">Reviews</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {books.map(book => (
                <BookTableRow
                  key={book.index}
                  book={book}
                  isExpanded={expandedItems.has(book.index)}
                  onToggle={() => toggleExpanded(book.index)}
                />
              ))}
            </TableBody>
          </Table>
        </div>
        
        {hasMore && (
          <div className="text-center py-8 border-t">
            {loading ? (
              <div className="space-y-2">
                <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto" />
                <p className="text-muted-foreground">Loading more books...</p>
              </div>
            ) : (
              <Button onClick={onLoadMore} variant="outline">
                Load More Books
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};