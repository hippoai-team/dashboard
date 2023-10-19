// src/components/SourceList.js
import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Layout from "./Layout";
import Chart from "react-apexcharts";
import NumDisplay from "./numDisplay";
import ChartGraph from "./chartGraph";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Button from "@mui/material/Button"; 
import AddIcon from '@mui/icons-material/Add';
import InteractiveTable from "./interactiveTable";
import PageTitle from "./pageTitle";
const SourceList = () => {
  const navigate = useNavigate();
  const [sources, setSources] = useState([]);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1); // Initialize currentPage state
  const [perPage, setPerPage] = useState(10); // Initialize perPage state
  const [selectedSourceIds, setSelectedSourceIds] = useState([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [totalSources, setTotalSources] = useState(0); // Initialize totalSources state
  const [allSourceTypes, setAllSourceTypes] = useState([]);
  const [sourceTypeFilter, setSourceTypeFilter] = useState("");
  const [processLoading, setProcessLoading] = useState(false);
  const toastDuration = 2000; // 2 seconds
  
  const API_BASE_URL = process.env.REACT_APP_NODE_API_URL ||'https://dashboard-api-woad.vercel.app';
  const chartOptions = {
    chart: {
      id: "basic-bar",
    },
   
  };

  const [statusCounts, setStatusCounts] = useState({
    indexed: 0,
    failed_index: 0,
    New: 0,
    index_deleted: 0,
    remove: 0,
  });

  const [sourceTypeCounts, setSourceTypeCounts] = useState({
    'guidelines': 0,
    'drugs': 0,
    'general': 0,
    'bugs': 0,
    'pearls': 0,
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
      const {
        sources: fetchedSources,
        totalSources,
        statusCounts,
        allSourceTypes,
        sourceTypeCounts,
      } = response.data;

      // Update the state
      setSources(fetchedSources);
      setTotalSources(totalSources);
      setStatusCounts(statusCounts);
      setAllSourceTypes(allSourceTypes);
      setSourceTypeCounts(sourceTypeCounts);
    } catch (error) {
      console.error("Error fetching sources:", error);
    }
  };

  // useEffect for fetching sources on initial load and when currentPage changes
  useEffect(() => {
    fetchSources();
  }, [currentPage, search, sourceTypeFilter, perPage, statusFilter]);

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

  const handleAllCheckboxChange = (event) => {
    if (event.target.checked) {
      const allSourceIds = sources.map((source) => source._id);
      setSelectedSourceIds(allSourceIds);
    } else {
      setSelectedSourceIds([]);
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
    setProcessLoading(true);
    setSelectedSourceIds([sourceId]);
    try {
      const response = await axios.post(`${API_BASE_URL}/api/sources/process/${sourceId}`);
      if (response.status === 200) {
        //get data from response
        //get the status from the response, its in the data object and the key is the sourceId
        setProcessLoading(false);
        const status = response.data[sourceId];
        toast.success(`Source ${response.data.title} status: ${status}`, {
          autoClose: toastDuration+1000,
        });
        // Refresh the list after the toast disappears
        setTimeout(() => {
          fetchSources();
          setSelectedSourceIds([]); // Clear the selectedSourceIds state
        }, toastDuration);
      } else {
        console.error("Failed to start source processing:", response.data);
      }
    } catch (error) {
      // Display error toast
      setProcessLoading(false);
      toast.error("Error starting source processing!", {
        autoClose: toastDuration,
      });
      console.error("Error starting source processing:", error);
    }
  };

  const handleProcessSelected = () => {
    let message = '';
    setProcessLoading(true);
    setSelectedSourceIds(selectedSourceIds);
    axios
      .post(`${API_BASE_URL}/api/sources/process-multiple`, {
        data: { sourceIds: selectedSourceIds },
      })
      .then((response) => {
        setProcessLoading(false);
        const titles = response.data.titles;
        //use selectedSourceIds to get an array of all the statuses from response.data
        const statuses = selectedSourceIds.map((id) => response.data[id]);
        //if all statuses are 'indexed' display success toast
        if (statuses.every((status) => status === "indexed")) {
          let message = `All selected sources processed successfully!`;
          toast.success(message, {
            autoClose: toastDuration,
          });
        }
        //if any statuses are 'failed_index', count number of indexed and failed_index
        else if (statuses.some((status) => status === "failed_index")) {
          const indexed = statuses.filter((status) => status === "indexed")
            .length;
          const failed_index = statuses.filter(
            (status) => status === "failed_index"
          ).length;
          let message = `${indexed} sources indexed, ${failed_index} sources failed to index`;
          toast.success(message, {
            autoClose: toastDuration,
          });
        }
        

        // Refresh the list after the toast disappears
        setTimeout(() => {
          fetchSources();
          setSelectedSourceIds([]); // Clear the selectedSourceIds state
        }, toastDuration);
      })
      .catch((error) => {
        setProcessLoading(false);
        // Display error toast
        toast.error("Error starting selected source processing!", {
          autoClose: toastDuration,
        });
        console.error("Error starting selected source processing:", error);
      });
  };

  const handleCopy = () => {
    //copy all the sources .source fields to clipboard in a comma separated list
    let sourceList = '';
    sources.forEach(source => {
      sourceList += source.source + ',';
    });
    navigator.clipboard.writeText(sourceList);
  }

  return (
    <Layout>
      <div className="content-wrapper">
        <PageTitle title={'Sources'} />
        <section className="content">
                    <div className="container-fluid">
                        <div className="row">
                            <div className="col-12">
                                <div className="card card-primary">
                                    <div className="card-header">
                                        <h3 className="card-title">Sources</h3>
                                    </div>
            {/* Your code for filters and statistics */}
            <div className="card">
              <div className="card-header">
                
             
                <Grid container spacing={3} alignItems="center">
                  <Grid item xs>
                    <ChartGraph title={'Source Type Statistics'} series={Object.values(sourceTypeCounts)} labels={Object.keys(sourceTypeCounts).map(key => `${key}: ${sourceTypeCounts[key]}`)} options={chartOptions}  type={'donut'} width={'100%'} height={450} />
                  </Grid>
                  <Grid item xs>
                    <ChartGraph title={'Source Status Statistics'} series={Object.values(statusCounts)} labels={Object.keys(statusCounts).map(key => `${key}: ${statusCounts[key]}`)} options={chartOptions}  type={'donut'} width={'100%'} height={450} />
                  </Grid>
                  <Grid item xs>
                    <NumDisplay title={'Total Sources'} value={totalSources} sx={{ mb: 3 }} />
                  </Grid>
                </Grid>
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
                          <option value="remove">To be deleted</option>
                          <option value="index_deleted">Deleted</option>
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
                  

                </div>


                <div className="row" style={{marginBottom: '10px'}}>
                <Button
                      variant="contained"
                      color="primary"
                      component={Link}
                      to="/sources/add"
                      style={{textTransform: 'none'}}
                    >
                      <AddIcon style={{marginRight: '5px'}} />
                      Add Source
                    </Button>
                  <div className="col">
                    
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={handleDeleteSelected}
                      disabled={selectedSourceIds.length === 0}
                      style={{marginRight: '10px'}}
                    >
                      Delete Selected
                    </Button>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={handleProcessSelected}
                      disabled={selectedSourceIds.length === 0}
                    >
                      Process Selected
                    </Button>
                  </div>
                </div>
             

                {/* Table with all columns */}
                <InteractiveTable 
                  columns={[
                    { title: 'ID', dataIndex: '_id', copyButton: false },
                    { title: 'Title', dataIndex: 'title', copyButton: false },
                    { title: 'Publisher', dataIndex: 'publisher', copyButton: false },
                    { title: 'Source', dataIndex: 'source', copyButton: true, render: (text, record) => <a href={text} target='_blank'>{text}</a> },
                    { title: 'Status', dataIndex: 'status', copyButton: false }, 
                    { title: 'Year', dataIndex: 'year', copyButton: false },
                    { title: 'Category', dataIndex: 'category', copyButton: false }, 
                    { title: 'Subspecialty', dataIndex: 'subspecialty', copyButton: false }, 
                    { title: 'is_paid', dataIndex: 'is_paid', copyButton: false }, 
                    { title: 'Load type', dataIndex: 'load_type', copyButton: false }, 
                    { title: 'Patient Population', dataIndex: 'patient_population', copyButton: false }, 
                    { title: 'Source Type', dataIndex: 'source_type', copyButton: false }, 
                    { title: 'Date Added', dataIndex: 'date_added', copyButton: false }, 
                    { title: 'Last Modified', dataIndex: 'last_modified', copyButton: false },
                    { title: 'Topic', dataIndex: 'topic', copyButton: false }
                  ]} 
                  dataSource={sources} 
                  totalEntries={totalSources} 
                  handlePrevPage={handlePreviousPage} 
                  handleNextPage={handleNextPage} 
                  setSelectedIds={setSelectedSourceIds} 
                  selectedIds={selectedSourceIds}
                  actionButtons={[
                    { label: 'Edit', onClick: (data) => navigate(`/sources/edit/${data._id}`) }, 
                    { label: 'Delete', onClick: (data) => handleDelete(data._id) },
                    { label: 'Process', onClick: (data) => handleProcess(data._id) , loading: processLoading }
                  ]}
                  handleCheckboxChange={handleCheckboxChange}
                  handleAllCheckboxChange={handleAllCheckboxChange}
                />

              

               
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
</section>
</div>
    </Layout>
  );
};

export default SourceList;
