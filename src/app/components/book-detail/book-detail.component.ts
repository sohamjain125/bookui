import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BookService } from '../../services/book.service';
import { Book } from '../../models/book.model';

@Component({
  selector: 'app-book-detail',
  templateUrl: './book-detail.component.html',
  styleUrls: ['./book-detail.component.css']
})
export class BookDetailComponent implements OnInit {
  book!: Book;
  loading: boolean = false;
  error: string = '';
  editing: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private bookService: BookService
  ) { }

  ngOnInit() {
    this.loadBook();
  }

  loadBook() {
    this.loading = true;
    const id = +(this.route.snapshot.paramMap.get('id')??0);
    this.bookService.getBook(id).subscribe({
      next: (book) => {
        this.book = book;
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Error loading book details';
        this.loading = false;
      }
    });
  }

  onUpdateBook() {
    this.loading = true;
    this.bookService.updateBook(this.book.id!, this.book).subscribe({
      next: () => {
        this.editing = false;
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Error updating book';
        this.loading = false;
      }
    });
  }

  onDeleteBook() {
    if (confirm('Are you sure you want to delete this book?')) {
      this.bookService.deleteBook(this.book.id!).subscribe({
        next: () => {
          this.router.navigate(['/books']);
        },
        error: (error) => {
          this.error = 'Error deleting book';
        }
      });
    }
  }
}