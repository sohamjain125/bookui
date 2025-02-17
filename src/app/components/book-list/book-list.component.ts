import { Component, OnInit } from '@angular/core';
import { BookService } from '../../services/book.service';
import { Book } from '../../models/book.model';

@Component({
  selector: 'app-book-list',
  templateUrl: './book-list.component.html',
  styleUrls: ['./book-list.component.css']
})
export class BookListComponent implements OnInit {
  books: Book[] = [];
  loading: boolean = false;
  error: string = '';
  showAddForm: boolean = false;
  newBook: Book = {
    title: '',
    author: '',
    price: 0,
    description: ''
  };

  constructor(private bookService: BookService) { }

  ngOnInit() {
    this.loadBooks();
  }

  loadBooks() {
    this.loading = true;
    this.bookService.getBooks().subscribe({
      next: (books) => {
        this.books = books;
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Error loading books';
        this.loading = false;
      }
    });
  }

  onAddBook() {
    this.bookService.createBook(this.newBook).subscribe({
      next: (book) => {
        this.books.push(book);
        this.showAddForm = false;
        this.newBook = {
          title: '',
          author: '',
          price: 0,
          description: ''
        };
      },
      error: (error) => {
        this.error = 'Error adding book';
      }
    });
  }

  onDeleteBook(id: number) {
    if (confirm('Are you sure you want to delete this book?')) {
      this.bookService.deleteBook(id).subscribe({
        next: () => {
          this.books = this.books.filter(book => book.id !== id);
        },
        error: (error) => {
          this.error = 'Error deleting book';
        }
      });
    }
  }
}