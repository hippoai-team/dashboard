import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom"; // Import useHistory
import { toast } from 'react-toastify'; // Import toast from react-toastify
import 'react-toastify/dist/ReactToastify.css'; // Import toast styles
import Layout from './Layout';



function AddBook() {
  const [formData, setFormData] = useState({
    topic: "",
    category: "",
    subspecialty: "",
    title: "",
    publisher: "",
    year: "",
    source: "",
    status: "",
    is_paid: false,
    load_type: "",
    patient_population: "",
    source_type: "",
    ids: "",
    date_added: "",
    date_modified: "",
  });

  const toastDuration = 2000; // 2 seconds or any duration you want
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      console.log("Sending formData:", formData);
      const response = await axios.post(
        "http://localhost:5000/api/books/store",
        formData
      );

      if (response.status === 201) {
        // Show success toast
        toast.success("Book successfully created!", {
          autoClose: toastDuration,
        });

        // Navigate to books page after toast disappears
        setTimeout(() => {
          navigate("/books");
        }, toastDuration);
      } else {
        // Show error toast
        toast.error("Failed to create book: " + response.data.error, {
          autoClose: toastDuration,
        });
      }
    } catch (error) {
      // Show error toast
      toast.error("There was an exception: " + error.message, {
        autoClose: toastDuration,
      });
    }
  };

  return (
    <Layout>
      <div className="content-wrapper">
        <div className="card">
          <div className="card-header">Add a New Book</div>
          <div className="card-body">
            {/* Consider adding a component or logic here for rendering errors */}
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="topic">Topic</label>
                <input
                  type="text"
                  name="topic"
                  className="form-control"
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label htmlFor="category">Category</label>
                <input
                  type="text"
                  name="category"
                  className="form-control"
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label htmlFor="subspeciality">Subspeciality</label>
                <input
                  type="text"
                  name="subspecialty"
                  className="form-control"
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label htmlFor="title">Title</label>
                <input
                  type="text"
                  name="title"
                  className="form-control"
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label htmlFor="publisher">Publisher</label>
                <input
                  type="text"
                  name="publisher"
                  className="form-control"
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label htmlFor="year">Year</label>
                <input
                  type="text"
                  name="year"
                  className="form-control"
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label htmlFor="source">Source</label>
                <input
                  type="text"
                  name="source"
                  className="form-control"
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label htmlFor="status">Status</label>
                <input
                  type="text"
                  name="status"
                  className="form-control"
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label>Payment Status</label>
                <input
                  type="text"
                  name="is_paid"
                  className="form-control"
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label htmlFor="load_type">Load Type</label>
                <input
                  type="text"
                  name="load_type"
                  className="form-control"
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label htmlFor="patient_population">Patient Population</label>
                <input
                  type="text"
                  name="patient_population"
                  className="form-control"
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label htmlFor="source_type">Source Type</label>
                <select
                  name="source_type"
                  className="form-control"
                  onChange={handleChange}
                >
                  <option value="">Select a source type</option>
                  <option value="guidelines">Guidelines</option>
                  <option value="drugs">Drugs</option>
                </select>
              </div>
              <div className="form-group">
                <label>IDs</label>
                <input
                  type="text"
                  name="ids"
                  className="form-control"
                  onChange={handleChange}
                />
              </div>
              <button type="submit" className="btn btn-primary btn-block">
                Add
              </button>
              <a href="/books" className="btn btn-danger btn-block">
                Cancel
              </a>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default AddBook;
