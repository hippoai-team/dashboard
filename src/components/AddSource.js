import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom"; // Import useHistory
import { toast } from 'react-toastify'; // Import toast from react-toastify
import 'react-toastify/dist/ReactToastify.css'; // Import toast styles
import Layout from './Layout';
import {Link} from 'react-router-dom'


function AddBook() {
  const [formData, setFormData] = useState({
    topic: "",
    category: "",
    subspecialty: "",
    title: "",
    publisher: "",
    year: "",
    source: "",
    status: "new",
    is_paid: false,
    load_type: null,
    patient_population: null,
    source_type: "",
    ids: "",
    date_added: "",
    date_modified: "",
  });

  const API_BASE_URL = process.env.NODE_API_URL || 'https://dashboard-api-woad.vercel.app'


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
        `${API_BASE_URL}/api/sources/store`,
        formData
      );

      if (response.status === 201) {
        // Show success toast
        toast.success("source successfully created!", {
          autoClose: toastDuration,
        });

        // Navigate to sources page after toast disappears
        setTimeout(() => {
          navigate("/sources");
        }, toastDuration);
      } else {
        // Show error toast
        toast.error("Failed to create source: " + response.data.error, {
          autoClose: toastDuration,
        });
      }
    } catch (error) {
      toast.error("There was an exception: " + error.response.data.error, {
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
                <label>Paywall status</label>
                <select
                  name="is_paid"
                  className="form-control"
                  onChange={handleChange}
                  value={formData.is_paid}
                >
                  <option value="">Select paid status</option>
                  <option value={false}>No</option>
                  <option value={true}>Yes</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="topic">Topic</label>
                <input
                  type="text"
                  name="topic"
                  className="form-control"
                  placeholder="Optional topic"
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label htmlFor="category">Category</label>
                <input
                  type="text"
                  name="category"
                  placeholder="Optional category"
                  className="form-control"
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label htmlFor="subspeciality">Subspeciality</label>
                <input
                  type="text"
                  name="subspecialty"
                  placeholder="Required subspeciality"
                  className="form-control"
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label htmlFor="title">Title</label>
                <input
                  type="text"
                  name="title"
                  placeholder="Required title"
                  className="form-control"
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label htmlFor="publisher">Publisher</label>
                <input
                  type="text"
                  name="publisher"
                  placeholder="Required publisher"
                  className="form-control"
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label htmlFor="year">Year</label>
                <input
                  type="text"
                  name="year"
                  placeholder="Required year"
                  className="form-control"
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label htmlFor="source">Source</label>
                <input
                  type="text"
                  name="source"
                  placeholder="Required source"
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
                  value={formData.status}
                  onChange={handleChange}
                />
              </div>

              <button type="submit" className="btn btn-primary btn-block">
                Add
              </button>
              <Link to="/sources" className="btn btn-danger btn-block">
                Cancel
              </Link>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default AddBook;
