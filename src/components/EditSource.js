import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom'; // Import useParams
import { toast } from 'react-toastify'; // Import toast from react-toastify
import 'react-toastify/dist/ReactToastify.css'; // Import toast styles
import Layout from './Layout';


function EditSource() {
  const [formData, setFormData] = useState({
    // ... initial empty state
  });

  const navigate = useNavigate();
  const { id } = useParams(); // This captures the ID from the URL
  const toastDuration = 2000; // 2 seconds or any duration you want
  const API_BASE_URL = process.env.NODE_API_URL || 'https://dashboard-api-woad.vercel.app';



  // Load source data when component mounts
  useEffect(() => {
    const fetchSource = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/sources/${id}`);
        setFormData(response.data);
      } catch (error) {
        toast.error('Error fetching source data: ' + error.message);
      }
    };

    fetchSource();
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
      const response = await axios.put(`${API_BASE_URL}/api/sources/edit/${id}`, formData);

      if (response.status === 200) {
        toast.success("Source successfully updated!", {
          autoClose: toastDuration,
        });

        // Navigate to sources page after toast disappears
        setTimeout(() => {
          navigate("/sources");
        }, toastDuration);
      } else {
        toast.error("Failed to update source: " + response.data.error, {
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
                <div className="card-header">Edit Source</div>
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
                            <select name="load_type" className="form-control" value={formData.load_type} onChange={handleChange}>
                                <option value="">Select a load type</option>
                                <option value="pdf">PDF (from disk or url)</option>
                                <option value="web-pdf">Web PDF (drug monograph)</option>
                                <option value='url'>Website</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label htmlFor="patient_population">Patient Population</label>
                            <select name="patient_population" className="form-control" value={formData.patient_population} onChange={handleChange}>
                                <option value="">Select a patient population</option>
                                <option value="Adult">Adult</option>
                                <option value="Pediatric">Pediatric</option>
                            </select>
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
                        <a href="/sources" className="btn btn-danger btn-block">
                            Cancel
                        </a>
                    </form>
                </div>
            </div>
        </div>
      </Layout>
    );



}

export default EditSource;
