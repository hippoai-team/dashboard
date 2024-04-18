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
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import InteractiveTable from "./interactiveTable";
import PageTitle from "./pageTitle";
import PropTypes from 'prop-types';
import Typography from '@mui/material/Typography';


function CustomTabPanel(props) {
    const { children, value, index, ...other } = props;
  
    return (
      <div
        role="tabpanel"
        hidden={value !== index}
        id={`simple-tabpanel-${index}`}
        aria-labelledby={`simple-tab-${index}`}
        {...other}
      >
        {value === index && (
          <Box sx={{ p: 3 }}>
            <Typography>{children}</Typography>
          </Box>
        )}
      </div>
    );
  }
  
  CustomTabPanel.propTypes = {
    children: PropTypes.node,
    index: PropTypes.number.isRequired,
    value: PropTypes.number.isRequired,
  };
  
  function a11yProps(index) {
    return {
      id: `simple-tab-${index}`,
      'aria-controls': `simple-tabpanel-${index}`,
    };
  }

const MasterSources = () => {
  const navigate = useNavigate();
  const [sources, setSources] = useState([]);
  const [masterSources, setMasterSources] = useState([]);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1); // Initialize currentPage state
  const [perPage, setPerPage] = useState(50); // Initialize perPage state
  const [selectedSourceIds, setSelectedSourceIds] = useState([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [totalSources, setTotalSources] = useState({});
  const [allSourceTypes, setAllSourceTypes] = useState([]);
  const [sourceTypeFilter, setSourceTypeFilter] = useState("");
  const [approveLoading, setApproveLoading] = useState(false);
  const toastDuration = 2000; // 2 seconds
  const [lastFilters, setLastFilters] = useState({ 0: {}, 1: {} });

const [tab, setTab] = React.useState(0);
  const API_BASE_URL = process.env.REACT_APP_NODE_API_URL ||'https://dashboard-api-woad.vercel.app';
  const chartOptions = {
    chart: {
      id: "basic-bar",
    },
   
  };

 

  const fetchSources = async () => {
    let endpoint = `${API_BASE_URL}/api/master-sources?page=${currentPage}&active_tab=${tab}`;
  
    if (search) endpoint += `&search=${search}`;
    if (sourceTypeFilter) endpoint += `&source_type=${sourceTypeFilter}`;
    if (statusFilter) endpoint += `&status=${statusFilter}`;
    if (perPage) endpoint += `&perPage=${perPage}`;
  
    try {
      const response = await axios.get(endpoint);
      const { sources, source_types, master_sources, total_source_counts } = response.data;
      setAllSourceTypes(source_types);
      if (tab === 0) {
        setSources(sources);
      } else {
        setMasterSources(master_sources);
      }
      setTotalSources(total_source_counts);
    } catch (error) {
      console.error("Error fetching sources:", error);
    }
  };
  

  // useEffect for fetching sources on initial load and when currentPage changes
  useEffect(() => {
    fetchSources();
  }, [currentPage, search, sourceTypeFilter, perPage, statusFilter, tab]);

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

  const handleTabChange = (event, newValue) => {
    // Store current filters before switching
    setLastFilters(prev => ({ ...prev, [tab]: { search, sourceTypeFilter, statusFilter } }));
    
    if (newValue === 1) {
      // Reset filters when moving to master sources tab
      setSearch("");
      setSourceTypeFilter("");
      setStatusFilter("");
    } else if (newValue === 0) {
      // Reapply last used filters or default when moving back to sources tab
      const filters = lastFilters[0];
      setSearch(filters.search || "");
      setSourceTypeFilter(filters.sourceTypeFilter || (allSourceTypes.length > 0 ? allSourceTypes[0] : ""));
      setStatusFilter(filters.statusFilter || "");
    }
    setTab(newValue);
  };

  const handleDeleteSelected = () => {
    axios
      .delete(`${API_BASE_URL}/api/mastersources/delete-multiple`, {
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
    if ((currentPage * perPage) < totalSources[tab === 0 ? 'sources' : 'master_sources']) {
      setCurrentPage(currentPage + 1);
    }
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
        `${API_BASE_URL}/api/master-sources/destroy/${sourceId}`
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

  const handleApprove = async (sourceId, sourceTypeFilter) => {
    setApproveLoading(true);
    setSelectedSourceIds([sourceId]);
    try {
      const response = await axios.post(`${API_BASE_URL}/api/master-sources/approve/${sourceId}`, { sourceType: sourceTypeFilter });
      if (response.status === 200) {
        //get data from response
        //get the status from the response, its in the data object and the key is the sourceId
        setApproveLoading(false);
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
        console.error("Failed to start source approving:", response.data);
      }
    } catch (error) {
      // Display error toast
      setApproveLoading(false);
      toast.error("Error starting source approving!", {
        autoClose: toastDuration,
      });
      console.error("Error starting source approving:", error);
    }
  };

  const handleApproveSelected = () => {
    setApproveLoading(true);
    axios
      .post(`${API_BASE_URL}/api/master-sources/approve-multiple`, {
        sourceIds: selectedSourceIds,
        sourceType: sourceTypeFilter,
      })
      .then((response) => {
        setApproveLoading(false);
        if (response.status === 200) {
          toast.success("Selected sources approved and added to master!", {
            autoClose: toastDuration,
          });
        } else {
          toast.error("Error: Sources could not be approved!", {
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
        setApproveLoading(false);
        toast.error("Error starting selected source approving!", {
          autoClose: toastDuration,
        });
        console.error("Error starting selected source approving:", error);
      });
  };


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
                          onChange={(e) => {
                            setSourceTypeFilter(e.target.value);
                            setCurrentPage(1);
                            }}
                        >
                          <option value="">Source Type</option>
                          {allSourceTypes.map((type) => (
                            <option key={type} value={type}>
                              {type}
                            </option>
                          ))}
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
                      onClick={handleApproveSelected}
                      disabled={selectedSourceIds.length === 0}
                    >
                      Approve Selected
                    </Button>
                  </div>
                </div>
             

                <Tabs value={tab} onChange={handleTabChange} aria-label="basic tabs example">
    <Tab label="Sources Requiring Review" {...a11yProps(0)} />
    <Tab label="Master Source list" {...a11yProps(1)} />
  
        </Tabs>   
        <CustomTabPanel value={tab} index={0}>   
            <InteractiveTable 
                  columns={[
                    { title: 'ID', dataIndex: '_id', copyButton: false },
                    { title: 'Title', dataIndex: 'title', copyButton: false },
                    { title: 'Publisher', dataIndex: 'publisher', copyButton: false },
                    { title: 'Source URL', dataIndex: 'source_url', copyButton: true, render: (text, record) => <a href={text} target='_blank' rel="noopener noreferrer">{text}</a> },
                    { title: 'Date Published', dataIndex: 'date_published', copyButton: false },
                    { title: 'Subject Specialty', dataIndex: 'subject_specialty', copyButton: false },
                    { title: 'Source Type', dataIndex: 'source_type', copyButton: false },
                    { title: 'Access Status', dataIndex: 'access_status', copyButton: false },
                    { title: 'Load Type', dataIndex: 'load_type', copyButton: false },
                    { title: 'Content Type', dataIndex: 'content_type', copyButton: false },
                    { title: 'Language', dataIndex: 'language', copyButton: false },
                    { title: 'Audience', dataIndex: 'audience', copyButton: false },
                    { title: 'Keywords', dataIndex: 'keywords', copyButton: false, render: (keywords) => keywords.join(', ') },
                    { title: 'Country', dataIndex: 'country', copyButton: false }
                  ]}
                  dataSource={sources || []} 
                  totalEntries={totalSources['sources']}
                  handlePrevPage={handlePreviousPage} 
                  handleNextPage={handleNextPage} 
                  setSelectedIds={setSelectedSourceIds} 
                  selectedIds={selectedSourceIds}
                  actionButtons={[
                   // { label: 'Edit', onClick: (data) => navigate(`/sources/edit/${data._id}`) }, 
                  //  { label: 'Delete', onClick: (data) => handleDelete(data._id) },
                    { label: 'Approve', onClick: (data) => handleApprove(data._id, sourceTypeFilter) , loading: approveLoading }
                  ]}
                  handleCheckboxChange={handleCheckboxChange}
                  handleAllCheckboxChange={handleAllCheckboxChange}
                  skip={perPage * (currentPage - 1)}
                    perPage={perPage}
                />
        </CustomTabPanel>
        <CustomTabPanel value={tab} index={1}>
            
              <InteractiveTable 
                  columns={[
                    { title: 'ID', dataIndex: 'source_id', copyButton: false },
                    {title:'Processed', dataIndex:'processed', copyButton:false},
                    { title: 'Title', dataIndex: 'title', copyButton: false },
                    { title: 'Publisher', dataIndex: 'publisher', copyButton: false },
                    { title: 'Source URL', dataIndex: 'source_url', copyButton: true, render: (text, record) => <a href={text} target='_blank' rel="noopener noreferrer">{text}</a> },
                    { title: 'Date Published', dataIndex: 'date_published', copyButton: false },
                    { title: 'Subject Specialty', dataIndex: 'subject_specialty', copyButton: false },
                    { title: 'Source Type', dataIndex: 'source_type', copyButton: false },
                    { title: 'Access Status', dataIndex: 'access_status', copyButton: false },
                    { title: 'Load Type', dataIndex: 'load_type', copyButton: false },
                    { title: 'Content Type', dataIndex: 'content_type', copyButton: false },
                    { title: 'Language', dataIndex: 'language', copyButton: false },
                    { title: 'Audience', dataIndex: 'audience', copyButton: false },
                    { title: 'Keywords', dataIndex: 'keywords', copyButton: false, render: (keywords) => keywords.join(', ') },
                    { title: 'Country', dataIndex: 'country', copyButton: false }
                  ]}
                dataSource={masterSources || []} 
                totalEntries={totalSources['master_sources']}
                handlePrevPage={handlePreviousPage} 
                handleNextPage={handleNextPage} 
                setSelectedIds={setSelectedSourceIds} 
                selectedIds={selectedSourceIds}
                actionButtons={[
                ]}
                handleCheckboxChange={handleCheckboxChange}
                handleAllCheckboxChange={handleAllCheckboxChange}
                skip={perPage * (currentPage - 1)}
                perPage={perPage}
              />
              
        </CustomTabPanel>

               
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

export default MasterSources;
