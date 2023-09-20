// src/components/BookList.js
import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Layout from "./Layout";

const BookList = () => {
  const navigate = useNavigate();
  const [books, setBooks] = useState([]);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1); // Initialize currentPage state

  const [selectedBookIds, setSelectedBookIds] = useState([]);
  const [totalBooks, setTotalBooks] = useState(0); // Initialize totalBooks state
  const [allSourceTypes, setAllSourceTypes] = useState([]);
  const [sourceTypeFilter, setSourceTypeFilter] = useState("");
  const toastDuration = 2000; // 2 seconds
  const API_BASE_URL = process.env.NODE_API_URL || 'https://express-vercel-demo-six.vercel.app';


  const [statusCounts, setStatusCounts] = useState({
    indexed: 0,
    failed_index: 0,
    failed_download: 0,
    failed_load: 0,
    New: 0,
  });

  const fetchBooks = async () => {
    // Base endpoint
    let endpoint = `${API_BASE_URL}/api/books?page=${currentPage}`;

    // If there's a search query, append it to the endpoint
    if (search) {
      endpoint += `&search=${search}`;
    }

    if (sourceTypeFilter) {
      endpoint += `&source_type=${sourceTypeFilter}`;
    }

    try {
      // Make a GET request to the endpoint using async/await
      const response = await axios.get(endpoint);

      // Destructure the response data
      const {
        books: fetchedBooks,
        totalBooks,
        statusCounts,
        allSourceTypes,
      } = response.data;

      // Update the state
      setBooks(fetchedBooks);
      setTotalBooks(totalBooks);
      setStatusCounts(statusCounts);
      setAllSourceTypes(allSourceTypes);
    } catch (error) {
      console.error("Error fetching books:", error);
    }
  };

  // useEffect for fetching books on initial load and when currentPage changes
  useEffect(() => {
    fetchBooks();
  }, [currentPage, search, sourceTypeFilter]);

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
  };

  const handleCheckboxChange = (event, bookId) => {
    if (event.target.checked) {
      setSelectedBookIds((prevSelected) => [...prevSelected, bookId]);
    } else {
      setSelectedBookIds((prevSelected) =>
        prevSelected.filter((id) => id !== bookId)
      );
    }
  };

  const handleDeleteSelected = () => {
    axios
      .delete(`${API_BASE_URL}/api/books/delete-multiple`, {
        data: { bookIds: selectedBookIds },
      })
      .then((response) => {
        // Display success toast
        toast.success("Selected books deleted successfully!", {
          autoClose: toastDuration,
        });

        // Refresh the list after the toast disappears
        setTimeout(() => {
          fetchBooks();
          setSelectedBookIds([]); // Clear the selectedBookIds state
        }, toastDuration);
      })
      .catch((error) => {
        // Display error toast
        toast.error("Error deleting selected books!", {
          autoClose: toastDuration,
        });
        console.error("Error deleting selected books:", error);
      });
  };

  // Function to handle clicking the "Next" button
  const handleNextPage = () => {
    setCurrentPage(currentPage + 1);
  };

  // Function to handle clicking the "Previous" button
  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleDelete = async (bookId) => {
    try {
      const response = await axios.delete(
        `${API_BASE_URL}/api/books/destroy/${bookId}`
      );

      if (response.status === 200) {
        // Display success toast
        toast.success("Book successfully deleted!", {
          autoClose: toastDuration,
        });

        // Refresh the list after the toast disappears
        setTimeout(() => {
          fetchBooks();
        }, toastDuration);
      } else {
        console.error("Failed to delete book:", response.data);
      }
    } catch (error) {
      // Display error toast
      toast.error("Error deleting the book!", { autoClose: toastDuration });
      console.error("Error deleting the book:", error);
    }
  };

  return (
    <Layout>
      <div className="">
        <div className="main-panel">
          <div className="content-wrapper">
            {/* Your code for filters and statistics */}
            <div className="card">
              <div className="card-header">
                <h1>Books</h1>
              </div>
              <div className="card-body mt-4">
                <div className="row">
                  <div className="col-4">
                    <form onSubmit={(e) => e.preventDefault()}>
                      <div className="input-group">
                        <div className="input-group-prepend">
                          <span className="input-group-text">
                            <i className="fas fa-search"></i>
                          </span>
                        </div>
                        <input
                          type="search"
                          name="search"
                          className="form-control"
                          placeholder="Search Fields"
                          value={search}
                          onChange={handleSearchChange} // <-- Add this line
                        />
                      </div>
                      {/* <button type='submit' className="btn btn-primary mt-2 rounded-pill">Search</button> */}
                    </form>
                  </div>

                  <div className="col-4">
                    <form onSubmit={(e) => e.preventDefault()}>
                      <div className="form-group">
                        <select
                          name="source_type"
                          className="form-control"
                          value={sourceTypeFilter}
                          onChange={(e) => setSourceTypeFilter(e.target.value)}
                        >
                          <option value="">Source Types</option>
                          {allSourceTypes.map((type) => (
                            <option key={type} value={type}>
                              {type}
                            </option>
                          ))}
                        </select>
                        {/* <button 
                              className="btn btn-primary mt-2 rounded-pill"
                              onClick={fetchBooks}
                          >
                              Filter by Source Type
                          </button> */}
                      </div>
                    </form>
                  </div>

                  <div className="col-2"></div>

                  <div className="col-2">
                    <Link
                      to="/books/add"
                      className="btn btn-primary btn-lg rounded-pill"
                    >
                      <i className="fas fa-plus mr-2"></i>Add Book
                    </Link>
                  </div>
                </div>

                <div className="mt-3">
                  <div className="row">
                    <div className="col">
                      <h3>Statistics</h3>
                      <p>Total number of books = {totalBooks}</p>
                      <ul>
                        <li>Indexed: {statusCounts.indexed}</li>
                        <li>Failed Index: {statusCounts.failed_index}</li>
                        <li>Failed Download: {statusCounts.failed_download}</li>
                        <li>Failed Load: {statusCounts.failed_load}</li>
                        <li>New: {statusCounts.New}</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="row">
                  <div className="col">
                    <button
                      className="btn btn-dark mb-2"
                      onClick={handleDeleteSelected}
                      disabled={selectedBookIds.length === 0}
                    >
                      Delete Selected
                    </button>
                  </div>
                </div>

                {/* Table with all columns */}
                <div className="table-responsive">
                  <table
                    className="table table-borderless table-hover"
                    style={{ tableLayout: "fixed" }}
                  >
                    <thead>
                      <tr className="table-active">
                        <th style={{ width: "50px" }}>
                          <input type="checkbox" id="select_all_ids" />
                        </th>
                        <th style={{ width: "100px" }}>Topic</th>
                        <th style={{ width: "100px" }}>Category</th>
                        <th style={{ width: "130px" }}>Subspeciality</th>
                        <th style={{ width: "210px" }}>Title</th>
                        <th style={{ width: "200px" }}>Publisher</th>
                        <th style={{ width: "100px" }}>Year</th>
                        <th style={{ width: "100px" }}>Status</th>
                        <th style={{ width: "80px" }}>is_paid</th>
                        <th style={{ width: "100px" }}>Load type</th>
                        <th style={{ width: "110px" }}>Patient Population</th>
                        <th style={{ width: "150px" }}>Source</th>
                        <th style={{ width: "100px" }}>Source Type</th>
                        <th style={{ width: "100px" }}>Date Added</th>
                        <th style={{ width: "100px" }}>Last Modified</th>
                        <th style={{ width: "70px" }}>Edit</th>
                        <th style={{ width: "70px" }}>Delete</th>
                      </tr>
                    </thead>
                    <tbody>
                      {books.map((book) => (
                        <tr key={book._id}>
                          <td>
                            <input
                              type="checkbox"
                              name={`ids[${book._id}]`}
                              className="checkbox_ids"
                              value={book._id}
                              checked={selectedBookIds.includes(book._id)}
                              onChange={(e) => handleCheckboxChange(e, book._id)}
                            />
                          </td>
                          <td>{book.topic}</td>
                          <td>{book.category}</td>
                          <td>{book.subspecialty}</td>
                          <td>{book.title}</td>
                          <td>{book.publisher}</td>
                          <td>{book.year}</td>
                          <td>{book.status}</td>
                          <td>{book.is_paid ? "Yes" : "No"}</td>
                          <td>{book.load_type}</td>
                          <td>{book.patient_population}</td>
                          <td>{book.source}</td>
                          <td>{book.source_type}</td>
                          <td>
                            {book.date_added
                              ? new Date(book.date_added).toLocaleDateString()
                              : ""}
                          </td>
                          <td>
                            {book.date_modified
                              ? new Date(book.date_modified).toLocaleDateString()
                              : ""}
                          </td>
                          <td>
                            <Link
                              to={`/books/edit/${book._id}`}
                              className="btn btn-success"
                            >
                              <i className="fas fa-pencil-alt"></i>
                            </Link>
                          </td>
                          <td>
                            <button
                              onClick={() => handleDelete(book._id)}
                              className="btn btn-danger"
                            >
                              <i className="fas fa-trash"></i>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination controls */}
                <div className="row mt-4">
                  <div className="col">
                    <button
                      className="btn btn-dark mb-2"
                      onClick={handlePreviousPage}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </button>
                    <button
                      className="btn btn-dark mb-2 ml-2"
                      onClick={handleNextPage}
                      disabled={books.length < 5} // Disable if there are no more pages
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default BookList;
