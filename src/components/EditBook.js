import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom'; // Import useParams
import { toast } from 'react-toastify'; // Import toast from react-toastify
import 'react-toastify/dist/ReactToastify.css'; // Import toast styles
import Layout from './Layout';


function EditBook() {
  const [formData, setFormData] = useState({
    // ... initial empty state
  });

  const navigate = useNavigate();
  const { id } = useParams(); // This captures the ID from the URL
  const toastDuration = 2000; // 2 seconds or any duration you want


  // Load book data when component mounts
  useEffect(() => {
    const fetchBook = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/books/${id}`);
        setFormData(response.data);
      } catch (error) {
        toast.error('Error fetching book data: ' + error.message);
      }
    };

    fetchBook();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.put(`http://localhost:5000/api/books/edit/${id}`, formData);

      if (response.status === 200) {
        toast.success("Book successfully updated!", {
          autoClose: toastDuration,
        });

        // Navigate to books page after toast disappears
        setTimeout(() => {
          navigate("/books");
        }, toastDuration);
      } else {
        toast.error("Failed to update book: " + response.data.error, {
          autoClose: toastDuration,
        });
      }
    } catch (error) {
      toast.error('There was an exception: ' + error.message);
    }
  };

    return (
      <Layout>
        <div className="content-wrapper">
            <div className="card">
                <div className="card-header">Edit Book</div>
                <div className="card-body">
                    {/* Consider adding a component or logic here for rendering errors */}
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label htmlFor="topic">Topic</label>
                            <input type="text" name="topic" className="form-control" value={formData.topic} onChange={handleChange} />
                        </div>
                        <div className="form-group">
                            <label htmlFor="category">Category</label>
                            <input type="text" name="category" className="form-control" value={formData.category} onChange={handleChange} />
                        </div>
                        <div className="form-group">
                            <label htmlFor="subspeciality">Subspeciality</label>
                            <input type="text" name="subspecialty" className="form-control" value={formData.subspecialty} onChange={handleChange} />
                        </div>
                        <div className="form-group">
                            <label htmlFor="title">Title</label>
                            <input type="text" name="title" className="form-control" value={formData.title} onChange={handleChange} />
                        </div>
                        <div className="form-group">
                            <label htmlFor="publisher">Publisher</label>
                            <input type="text" name="publisher" className="form-control" value={formData.publisher} onChange={handleChange} />
                        </div>
                        <div className="form-group">
                            <label htmlFor="year">Year</label>
                            <input type="text" name="year" className="form-control" value={formData.year} onChange={handleChange} />
                        </div>
                        <div className="form-group">
                            <label htmlFor="source">Source</label>
                            <input type="text" name="source" className="form-control" value={formData.source} onChange={handleChange} />
                        </div>
                        <div className="form-group">
                            <label htmlFor="status">Status</label>
                            <input type="text" name="status" className="form-control" value={formData.status} onChange={handleChange} />
                        </div>
                        <div className="form-group">
                            <label htmlFor="payment_status">Payment Status</label>
                            <input type="text" name="is_paid" className="form-control" value={formData.is_paid} onChange={handleChange} />
                        </div>
                        <div className="form-group">
                            <label htmlFor="load_type">Load Type</label>
                            <input type="text" name="load_type" className="form-control" value={formData.load_type} onChange={handleChange} />
                        </div>
                        <div className="form-group">
                            <label htmlFor="patient_population">Patient Population</label>
                            <input type="text" name="patient_population" className="form-control" value={formData.patient_population} onChange={handleChange} />
                        </div>
                        <div className="form-group">
                            <label htmlFor="source_type">Source Type</label>
                            <select name="source_type" className="form-control" value={formData.source_type} onChange={handleChange}>
                                <option value="">Select a source type</option>
                                <option value="guidelines">Guidelines</option>
                                <option value="drugs">Drugs</option>
                            </select>
                        </div>
                        <button type="submit" className="btn btn-primary btn-block">Update</button>
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

export default EditBook;
