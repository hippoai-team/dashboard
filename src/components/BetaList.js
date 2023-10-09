// src/components/SourceList.js
import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Layout from "./Layout";

const BetaList = () => {
    const navigate = useNavigate();
    const [ids, setIds] = useState([]);
    const [search, setSearch] = useState("");
    const [currentPage, setCurrentPage] = useState(1); // Initialize currentPage state
    const [perPage, setPerPage] = useState(10); // Initialize perPage state
    const [selectedIds, setSelectedIds] = useState([]);
    const [totalIds, setTotalIds] = useState(0); // Initialize totalSources state
    const toastDuration = 1000; // 2 seconds
    const API_BASE_URL = process.env.NODE_API_URL ||'https://dashboard-api-woad.vercel.app';
    
    const fetchSources = async () => {
        // Base endpoint
        let endpoint = `${API_BASE_URL}/api/betalist?page=${currentPage}`;
    
        // If there's a search query, append it to the endpoint
        if (search) {
          endpoint += `&search=${search}`;
        }
    
    
        if (perPage) {
          endpoint += `&perPage=${perPage}`;
        }
    
        if (statusFilter) {
          endpoint += `&status=${statusFilter}`;
        }
    
        try {
          // Make a GET request to the endpoint using async/await
          const response = await axios.get(endpoint);
    
          // Destructure the response data
        const { data, totalIds } = response.data;
    
          // Use the response data to update sources state
          setIds(data);
          setTotalIds(totalIds);

        } catch (error) {
          console.error("Error fetching sources:", error);
        }
      };
    
      // useEffect for fetching sources on initial load and when currentPage changes
      useEffect(() => {
        fetchSources();
      }, [currentPage, search, perPage, statusFilter]);
  

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
                      <div className="col-4">
                        <form onSubmit={(e) => e.preventDefault()}>
                          <div className="form-group">
                            <select
                              name="status_filter"
                              className="form-control"
                              value={statusFilter}
                              onChange={(e) => setStatusFilter(e.target.value)}
                            >
                              <option value="">Status Filter</option>
                              <option value="indexed">Indexed</option>
                              <option value="failed_index">Failed Index</option>
                              <option value="failed_download">Failed Download</option>
                              <option value="failed_load">Failed Load</option>
                              <option value="new">New</option>
                            </select>
                          </div>
                        </form>
                      </div>
                      
                      <div className="col-4">
                        <form onSubmit={(e) => e.preventDefault()}>
                          <div className="form-group">
                            <select
                              name="per_page"
                              className="form-control"
                              value={perPage}
                              onChange={(e) => setPerPage(e.target.value)}
                            >
                              <option value="10">10 per page</option>
                              <option value="20">20 per page</option>
                              <option value="50">50 per page</option>
                              <option value="100">100 per page</option>
                            </select>
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
                            <li>New: {statusCounts.new}</li>
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
                          disabled={selectedIds.length === 0}
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
                              <input type="checkbox" id="select_all_ids" 
                              onChange={handleAllCheckboxChange}
                              checked={selectedIds.length === entries.length}
                              />
                            </th>
                            <th style={{ width: "70px" }}>Edit</th>
                            <th style={{ width: "70px" }}>Delete</th>
                            <th style={{ width: "70px" }}>Email</th>
                            <th style={{ width: "70px" }}>Status</th>
                            
                          </tr>
                        </thead>
                        <tbody>
                          {entries.map((entry) => (
                            <tr key={entry._id}>
                              <td>
                                <input
                                  type="checkbox"
                                  name={`ids[${entry._id}]`}
                                  className="checkbox_ids"
                                  value={entry._id}
                                  checked={selectedSourceIds.includes(entry._id)}
                                  onChange={(e) => handleCheckboxChange(e, entry._id)}
                                />
                              </td>
                              <td>
                                <Link
                                  to={`/betalist/edit/${entry._id}`}
                                  className="btn btn-success"
                                >
                                  <i className="fas fa-pencil-alt"></i>
                                </Link>
                              </td>
                              <td>
                                <button
                                  onClick={() => handleDelete(entry._id)}
                                  className="btn btn-danger"
                                >
                                  <i className="fas fa-trash"></i>
                                </button>
                              </td>
                              
                              
                                <td>{entry.email}</td>
                                <td>{entry.status}</td>
                             
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
    
    export default BetaList;
    