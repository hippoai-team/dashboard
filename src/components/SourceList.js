// src/components/SourceList.js
import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Layout from "./Layout";

const SourceList = () => {
  const navigate = useNavigate();
  const [sources, setSources] = useState([]);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1); // Initialize currentPage state

  const [selectedSourceIds, setSelectedSourceIds] = useState([]);
  const [totalSources, setTotalSources] = useState(0); // Initialize totalSources state
  const [allSourceTypes, setAllSourceTypes] = useState([]);
  const [sourceTypeFilter, setSourceTypeFilter] = useState("");
  const toastDuration = 2000; // 2 seconds
  const API_BASE_URL = process.env.NODE_API_URL ||'https://dashboard-api-woad.vercel.app';


  const [statusCounts, setStatusCounts] = useState({
    indexed: 0,
    failed_index: 0,
    failed_download: 0,
    failed_load: 0,
    New: 0,
  });

  const fetchSources = async () => {
    // Base endpoint
    let endpoint = `${API_BASE_URL}/api/sources?page=${currentPage}`;

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
        sources: fetchedSources,
        totalSources,
        statusCounts,
        allSourceTypes,
      } = response.data;

      // Update the state
      setSources(fetchedSources);
      setTotalSources(totalSources);
      setStatusCounts(statusCounts);
      setAllSourceTypes(allSourceTypes);
    } catch (error) {
      console.error("Error fetching sources:", error);
    }
  };

  // useEffect for fetching sources on initial load and when currentPage changes
  useEffect(() => {
    fetchSources();
  }, [currentPage, search, sourceTypeFilter]);

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
  };

  const handleCheckboxChange = (event, sourceId) => {
    if (event.target.checked) {
      setSelectedSourceIds((prevSelected) => [...prevSelected, sourceId]);
    } else {
      setSelectedSourceIds((prevSelected) =>
        prevSelected.filter((id) => id !== sourceId)
      );
    }
  };

  const handleDeleteSelected = () => {
    axios
      .delete(`${API_BASE_URL}/api/sources/delete-multiple`, {
        data: { sourceIds: selectedSourceIds },
      })
      .then((response) => {
        // Display success toast
        toast.success("Selected sources deleted successfully!", {
          autoClose: toastDuration,
        });

        // Refresh the list after the toast disappears
        setTimeout(() => {
          fetchSources();
          setSelectedSourceIds([]); // Clear the selectedSourceIds state
        }, toastDuration);
      })
      .catch((error) => {
        // Display error toast
        toast.error("Error deleting selected sources!", {
          autoClose: toastDuration,
        });
        console.error("Error deleting selected sources:", error);
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

  const handleDelete = async (sourceId) => {
    try {
      const response = await axios.delete(
        `${API_BASE_URL}/api/sources/destroy/${sourceId}`
      );

      if (response.status === 200) {
        // Display success toast
        toast.success("Source successfully deleted!", {
          autoClose: toastDuration,
        });

        // Refresh the list after the toast disappears
        setTimeout(() => {
          fetchSources();
        }, toastDuration);
      } else {
        console.error("Failed to delete source:", response.data);
      }
    } catch (error) {
      // Display error toast
      toast.error("Error deleting the source!", { autoClose: toastDuration });
      console.error("Error deleting the source:", error);
    }
  };

  const handleProcess = async (sourceId) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/sources/process/${sourceId}`);
      if (response.status === 200) {
        // Display success toast
        toast.success("Source processing started successfully!", {
          autoClose: toastDuration,
        });
        // Refresh the list after the toast disappears
        setTimeout(() => {
          fetchSources();
        }, toastDuration);
      } else {
        console.error("Failed to start source processing:", response.data);
      }
    } catch (error) {
      // Display error toast
      toast.error("Error starting source processing!", {
        autoClose: toastDuration,
      });
      console.error("Error starting source processing:", error);
    }
  };

  const handleProcessSelected = () => {
    axios
      .post(`${API_BASE_URL}/api/sources/process-multiple`, {
        data: { sourceIds: selectedSourceIds },
      })
      .then((response) => {
        // Display success toast
        toast.success("Selected sources processing started successfully!", {
          autoClose: toastDuration,
        });

        // Refresh the list after the toast disappears
        setTimeout(() => {
          fetchSources();
          setSelectedSourceIds([]); // Clear the selectedSourceIds state
        }, toastDuration);
      })
      .catch((error) => {
        // Display error toast
        toast.error("Error starting selected source processing!", {
          autoClose: toastDuration,
        });
        console.error("Error starting selected source processing:", error);
      });
  };
  

  return (
    <Layout>
      <div className="">
        <div className="main-panel">
          <div className="content-wrapper">
            {/* Your code for filters and statistics */}
            <div className="card">
              <div className="card-header">
                <h1>Sources</h1>
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
                              onClick={fetchSources}
                          >
                              Filter by Source Type
                          </button> */}
                      </div>
                    </form>
                  </div>

                  <div className="col-2"></div>

                  <div className="col-2">
                    <Link
                      to="/sources/add"
                      className="btn btn-primary btn-lg rounded-pill"
                    >
                      <i className="fas fa-plus mr-2"></i>Add Source
                    </Link>
                  </div>
                </div>

                <div className="mt-3">
                  <div className="row">
                    <div className="col">
                      <h3>Statistics</h3>
                      <p>Total number of sources = {totalSources}</p>
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
                      disabled={selectedSourceIds.length === 0}
                    >
                      Delete Selected
                    </button>
                    <button
                      className="btn btn-dark mb-2"
                      onClick={handleProcessSelected}
                      disabled={selectedSourceIds.length === 0}
                    >
                      Process Selected
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
                        <th style={{ width: "70px" }}>Edit</th>
                        <th style={{ width: "70px" }}>Delete</th>
                        <th style={{ width: "70px" }}>Run</th>
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
                        
                      </tr>
                    </thead>
                    <tbody>
                      {sources.map((source) => (
                        <tr key={source._id}>
                          <td>
                            <input
                              type="checkbox"
                              name={`ids[${source._id}]`}
                              className="checkbox_ids"
                              value={source._id}
                              checked={selectedSourceIds.includes(source._id)}
                              onChange={(e) => handleCheckboxChange(e, source._id)}
                            />
                          </td>
                          <td>
                            <Link
                              to={`/sources/edit/${source._id}`}
                              className="btn btn-success"
                            >
                              <i className="fas fa-pencil-alt"></i>
                            </Link>
                          </td>
                          <td>
                            <button
                              onClick={() => handleDelete(source._id)}
                              className="btn btn-danger"
                            >
                              <i className="fas fa-trash"></i>
                            </button>
                          </td>
                          <td>
                            <button
                            onClick={() => handleProcess(`/sources/process/${source._id}`)}
                            className="btn btn-primary"
                          >
                            <i className="fas fa-sync"></i>
                          </button>
                          </td>
                          <td>{source.topic}</td>
                          <td>{source.category}</td>
                          <td>{source.subspecialty}</td>
                          <td>{source.title}</td>
                          <td>{source.publisher}</td>
                          <td>{source.year}</td>
                          <td>{source.status}</td>
                          <td>{source.is_paid ? "Yes" : "No"}</td>
                          <td>{source.load_type}</td>
                          <td>{source.patient_population}</td>
                          <td><a href={source.source}>{source.source}</a></td>
                          <td>{source.source_type}</td>
                          <td>
                            {source.date_added
                              ? new Date(source.date_added).toLocaleDateString()
                              : ""}
                          </td>
                          <td>
                            {source.date_modified
                              ? new Date(source.date_modified).toLocaleDateString()
                              : ""}
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
                      disabled={sources.length < 5} // Disable if there are no more pages
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

export default SourceList;
