// src/components/SourceList.js
import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Layout from "./Layout";
import { Modal, Box, Checkbox, FormControlLabel, TextField, Button, Card, CardContent, Tooltip } from '@mui/material';
import remarkGfm from 'remark-gfm';
import PlayCircleFilledIcon from '@mui/icons-material/PlayCircleFilled';
import PlayCircleIcon from '@mui/icons-material/PlayCircle';
import StopCircleIcon from '@mui/icons-material/StopCircle';
import AddIcon from '@mui/icons-material/Add';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import InteractiveTable from "./interactiveTable";
import PageTitle from "./pageTitle";
import PropTypes from 'prop-types';
import Typography from '@mui/material/Typography';
import TaskStatusCards from "./TaskStatusCard";
import RefreshIcon from '@mui/icons-material/Refresh';
import IconButton from '@mui/material/IconButton';
import RejectModal from "./rejectModal";
import ReactMarkdown from 'react-markdown';
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
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1); // Initialize currentPage state
  const [perPage, setPerPage] = useState(50); // Initialize perPage state
  const [loadingData, setLoadingData] = useState(false);
  const [selectedSourceIds, setSelectedSourceIds] = useState([]);
  const [statusFilter, setStatusFilter] = useState("")
  const [totalSources, setTotalSources] = useState(0);
  const [allSourceTypes, setAllSourceTypes] = useState([]);
  const [sourceTypeFilter, setSourceTypeFilter] = useState("clinical_guidelines");
  const [actionLoading, setActionLoading] = useState(false);
  const toastDuration = 2000; // 2 seconds
  const [lastFilters, setLastFilters] = useState({ 0: {}, 1: {} });
const [pipelineStatus, setPipelineStatus] = React.useState('idle');
const [error, setError] = React.useState(null);
const [tab, setTab] = React.useState(0);
const [sortOrder, setSortOrder] = React.useState('desc');
const [showRejectModal, setShowRejectModal] = useState(false);
const [rejectReason, setRejectReason] = useState('');
const [customRejectReason, setCustomRejectReason] = useState('');
const [pipelineState, setPipelineState] = useState('unknown');
const API_BASE_URL = process.env.REACT_APP_NODE_API_URL ||'https://dashboard-api-woad.vercel.app';

  const chartOptions = {
    chart: {
      id: "basic-bar",
    },
   
  };

 

  const fetchSources = async () => {
    setLoadingData(true);
    let endpoint = `${API_BASE_URL}/api/master-sources?page=${currentPage}&active_tab=${tab}`;
  
    if (search) endpoint += `&search=${search}`;
    if (sourceTypeFilter) endpoint += `&source_type=${sourceTypeFilter}`;
    if (statusFilter) endpoint += `&status=${statusFilter}`;
    if (perPage) endpoint += `&perPage=${perPage}`;
    if (sortOrder) endpoint += `&sortOrder=${sortOrder}`;
  
    try {
      const response = await axios.get(endpoint);
      const { sources, source_types, total_source_counts} = response.data;
      setAllSourceTypes(source_types);
      setTotalSources(total_source_counts);
      setSources(sources);
      setLoadingData(false);
    } catch (error) {
      console.error("Error fetching sources:", error);
      setLoadingData(false);
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
      const allSourceIds = tab === 0 ? sources.map((source) => source._id) : sources.map((source) => source._id);
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

    const handleSortOrderChange = (order) => {
    setSortOrder(order);
    fetchSources();
    };
  // Function to handle clicking the "Next" button
  const handleNextPage = () => {
    if ((currentPage * perPage) < totalSources) {
      setCurrentPage(currentPage + 1);
    }
  };

  // Function to handle clicking the "Previous" button
  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

// Function to determine action type
const getActionType = (tab, action) => {
    if (tab === 0) {
      return action === 'approve' ? 'approve' : 'reject';
    } else if (tab === 1) {
      return action === 'process' ? 'process' : 'delete';
    }
    else if (tab === 2) {
      return action === 'process' ? 'process-images' : 'delete-images';
    }
  };
  
  // Function to handle API requests
  const performAction = async ({ endpoint, payload, successMessage, errorMessage }) => {
    try {
      const response = await axios.post(endpoint, payload);
      if (response.status === 200) {
        if (response.data.statusReport) {
          toast.success(
            <div>
              {successMessage}
              <ul>
                {response.data.statusReport.map((report, index) => (
                  <li key={index}>
                    {report.title} ({report.url}): {report.status}
                  </li>
                ))}
              </ul>
            </div>, 
            { autoClose: toastDuration + 1000 }
          );
        } else {
          toast.success(successMessage, { autoClose: toastDuration + 1000 });
        }
        return true;
      } else {
        console.error(errorMessage, response.data);
        throw new Error(errorMessage);
      }
    } catch (error) {
      toast.error(`${errorMessage} Error: ${error.message}`, { autoClose: toastDuration });
      console.error(errorMessage, error);
      return false;
    }
  };
  
  // Function to handle source actions
  const handleSourceAction = async (sourceIds, sourceTypeFilter, tab, action, rejectReason = '') => {
    setActionLoading(true);
    const actionType = getActionType(tab, action);
    const endpoint = `${API_BASE_URL}/api/master-sources/${actionType}`;
    const payload = actionType === 'reject' ? { sourceIds, sourceType: sourceTypeFilter, rejectReason } : { sourceIds, sourceType: sourceTypeFilter };
    const successMessage = `Task to ${actionType} source(s) has been successfully submitted. Check the status above for updates.`
    const errorMessage = `Failed to ${actionType}`;
  
    const success = await performAction({ endpoint, payload, successMessage, errorMessage });
    if (success) {
      setTimeout(() => {
        fetchSources();
        setSelectedSourceIds([]); // Clear the selectedSourceIds state
        setActionLoading(false);
      }, toastDuration);
    } else {
      setActionLoading(false);  
    }
  };


  const handleRejectSource = (sourceIds) => {
    setShowRejectModal(true);
    setSelectedSourceIds(sourceIds);

  };

  const handleSubmitRejectSource = (sourceIds) => {
    if (rejectReason || customRejectReason) {
      handleSourceAction(sourceIds, sourceTypeFilter, tab, 'reject', rejectReason || customRejectReason);
      setShowRejectModal(false);
      setRejectReason(''); // Reset the selected reason
      setCustomRejectReason(''); // Reset the custom reason
    } else {
      alert('Please select or enter a reason for rejection.');
    }
  };

  const handleLaunchPipeline = async () => {
    try {
      console.log('sending start signal')
      const response = await axios.post(`${API_BASE_URL}/api/pipeline/start`);
      toast.success('Starting amazon server instance, this may take a few minutes')
      startPolling();
    } catch (error) {
      console.error(error);
    }
  };

  const handleStopPipeline = async () => {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/pipeline/stop`);
      toast.success('Stopping amazon server instance, this may take a few minutes')
      startPolling();
    } catch (error) {
      console.error(error);
    }
  };

  const pollPipelineState = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/pipeline/check-state`);
      console.log('pipeline', response.data.state);
      setPipelineState(response.data.state);
    } catch (error) {
      console.error('Error fetching pipeline state:', error);
    }
  };

  const startPolling = () => {
    pollPipelineState();
    const intervalId = setInterval(async () => {
      await pollPipelineState();
      if (pipelineState === 'running' || pipelineState === 'stopped') {
        clearInterval(intervalId);
      }
    }, 5000);
    return intervalId;
  };

  useEffect(() => {
    let intervalId;

    // Initial state check on component mount
    pollPipelineState();

    if (pipelineState === 'pending' || pipelineState === 'stopping' || pipelineState === 'initializing' || pipelineState === 'starting') {
      intervalId = startPolling();
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [pipelineState]);
  
  // Ensure that closing the modal only happens in response to user action
  const closeRejectModal = () => {
    setShowRejectModal(false);
    setRejectReason(''); // Clear reject reason when closing
    setCustomRejectReason(''); // Clear custom reject reason when closing
  };

 
 
  return (
    <Layout>
      <RejectModal 
        showRejectModal={showRejectModal}
        setShowRejectModal={setShowRejectModal}
        rejectReason={rejectReason}
        setRejectReason={setRejectReason}
        customRejectReason={customRejectReason}
        setCustomRejectReason={setCustomRejectReason}
        selectedSourceIds={selectedSourceIds}
        handleSubmitRejectSource={handleSubmitRejectSource}
        closeRejectModal={closeRejectModal}
      />

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
                          {tab==1 && <option value="">Source Type</option>}
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
                
                <div className="col-4">
                    <form onSubmit={(e) => e.preventDefault()}>
                        <div className="form-group">
                            <select
                            name="status"
                            className="form-control"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            >
                            <option value="">Status</option>
                            {tab === 0 && <>
                              <option value="pending">Pending</option>
                              <option value="approved">Approved</option>
                              <option value="rejected">Rejected</option>
                            </>}
                            {tab === 1 && <>
                              <option value="active">Pending</option>
                              <option value="processed">Processed</option>
                              <option value="inactive">Inactive</option>
                            </>}
                            {tab === 2 && <>
                              <option value="pending">Pending</option>
                              <option value="processed">Processed</option>
                              <option value="inactive">Inactive</option>
                            </>}
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
                      to="/source-form"
                      style={{textTransform: 'none'}}
                    >
                      <AddIcon style={{marginRight: '5px'}} />
                      Add Source
                    </Button>
                  <div className="col">
                    
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() => handleSourceAction(selectedSourceIds, sourceTypeFilter, tab, tab === 0 ? 'reject' : 'delete')}
                      disabled={selectedSourceIds.length === 0}
                      style={{marginRight: '10px'}}
                    >
                      {tab === 0 ? 'Reject Selected' : 'Delete Selected'}
                    </Button>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() => handleSourceAction(selectedSourceIds, sourceTypeFilter, tab, tab === 0 ? 'approve' : 'process')}
                      disabled={selectedSourceIds.length === 0}
                    >
                        {tab === 0 ? 'Approve Selected' : 'Process Selected'}
                    </Button>
                  </div>
                </div>


                <Tabs value={tab} onChange={handleTabChange} aria-label="basic tabs example">
    <Tab label="Sources Requiring Review" {...a11yProps(0)} />
    <Tab label="Master Source list" {...a11yProps(1)} />
    <Tab label="Image Sources" {...a11yProps(2)} />
    <IconButton
            onClick={() => fetchSources()}
            >
            <RefreshIcon />
        </IconButton>         
        </Tabs>  
        {(tab === 1 || tab === 2) && (
          <>
              <Box display="flex" alignItems="center">
      <Tooltip title={pipelineState === 'stopped' ? "Start the server to process documents" : "Stop the server when done processing"}>
        <IconButton
          color="primary"
          onClick={() => {
            console.log('clicked')
            if (pipelineState === 'stopped') {
              handleLaunchPipeline();
            } else if (pipelineState === 'running') {
              handleStopPipeline();
            }
          }}
          disabled={pipelineState === 'stopping' || pipelineState === 'starting'}
          size="large"
        >
          {pipelineState === 'stopped' ? <PlayCircleFilledIcon fontSize="large" /> : <StopCircleIcon fontSize="large" />}
        </IconButton>
      </Tooltip>
      <Tooltip title={`Server is currently ${pipelineState}, it can take several minutes for the pipeline to start after server start`}>
        <Typography variant="h6" color="textSecondary" style={{ marginLeft: '10px' }}>
          Amazon Server Status: {pipelineState}
        </Typography>
      </Tooltip>
    </Box>
                    <TaskStatusCards />
                   
                    </>
                )}
        {!loadingData && sources.length > 0 && (
          <>
        <CustomTabPanel value={tab} index={0}>   
            <InteractiveTable 
                  columns={[
                    {title: 'timestamp', dataIndex: 'timestamp', copyButton: false},
                    { title: 'ID', dataIndex: '_id', copyButton: false },
                    {title: 'Status', dataIndex:'status', copyButton:false},
                    { title: 'Title', dataIndex: 'title', copyButton: false },
                    { title: 'Publisher', dataIndex: 'publisher', copyButton: false },
                    { title: 'Source URL', dataIndex: 'source_url', copyButton: false, render: (text, record) => <a href={text} target='_blank' rel="noopener noreferrer">{text}</a> },
                    { title: 'Date Published', dataIndex: 'date_published', copyButton: false },
                    { title: 'Subject Specialty', dataIndex: 'subject_specialty', copyButton: false },
                    { title: 'Source Type', dataIndex: 'source_type', copyButton: false },
                    { title: 'Access Status', dataIndex: 'access_status', copyButton: false },
                    { title: 'Load Type', dataIndex: 'load_type', copyButton: false },
                    { title: 'Content Type', dataIndex: 'content_type', copyButton: false },
                    { title: 'Language', dataIndex: 'language', copyButton: false },
                    { title: 'Audience', dataIndex: 'audience', copyButton: false },
                    { title: 'Keywords', dataIndex: 'keywords', copyButton: false, render: (keywords) => keywords ? keywords.join(', ') : 'No Keywords' },
                    { title: 'Country', dataIndex: 'country', copyButton: false },

                  ]}
                  dataSource={sources || []} 
                  totalEntries={totalSources}
                  handlePrevPage={handlePreviousPage} 
                  handleNextPage={handleNextPage} 
                  handleSortOrderChange={handleSortOrderChange}
                  setSelectedIds={setSelectedSourceIds} 
                  selectedIds={selectedSourceIds}
                  actionButtons={[
                  
                    { label: 'Approve', onClick: (data) => handleSourceAction([data._id], sourceTypeFilter, tab, 'approve'), loading: actionLoading },
                    { label: 'Reject', onClick: (data) => handleRejectSource([data._id]), loading: actionLoading },
                    {label: 'Edit', onClick: (data) => navigate(`/source-form/${data._id}/${tab}/${sourceTypeFilter}` )}


                  ]}
                  handleCheckboxChange={handleCheckboxChange}
                  handleAllCheckboxChange={handleAllCheckboxChange}
                  currentPage={currentPage}
                    perPage={perPage}
                />
        </CustomTabPanel>
        <CustomTabPanel value={tab} index={1}>
            
              <InteractiveTable 
                  columns={[
                    {title: 'timestamp', dataIndex: 'timestamp', copyButton: false},
                    { title: 'ID', dataIndex: 'source_id', copyButton: false },
                    {title:'Processed', dataIndex:'processed', copyButton:false},
                    {title:'Status', dataIndex:'status', copyButton:false},
                    { title: 'Title', dataIndex: 'title', copyButton: false },
                    { title: 'Publisher', dataIndex: 'publisher', copyButton: false },
                    { title: 'Source URL', dataIndex: 'source_url', copyButton: false, render: (text, record) => <a href={text} target='_blank' rel="noopener noreferrer">{text}</a> },
                    { title: 'Date Published', dataIndex: 'date_published', copyButton: false },
                    { title: 'Subject Specialty', dataIndex: 'subject_specialty', copyButton: false },
                    { title: 'Source Type', dataIndex: 'source_type', copyButton: false },
                    { title: 'Access Status', dataIndex: 'access_status', copyButton: false },
                    { title: 'Load Type', dataIndex: 'load_type', copyButton: false },
                    { title: 'Content Type', dataIndex: 'content_type', copyButton: false },
                    { title: 'Language', dataIndex: 'language', copyButton: false },
                    { title: 'Audience', dataIndex: 'audience', copyButton: false },
                    { title: 'Keywords', dataIndex: 'keywords', copyButton: false, render: (keywords) => keywords ? keywords.join(', ') : 'No Keywords' },
                    { title: 'Country', dataIndex: 'country', copyButton: false },
                    { title: 'Nodes', dataIndex: 'nodes', copyButton: false, hidden: true, render: (nodes) => (
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        {nodes ? nodes.map((node, index) => (
                          <Card key={index} variant="outlined" sx={{ mb: 1 }}>
                            <CardContent>
                              <ReactMarkdown
                              remarkPlugins={[remarkGfm]}
                              children={node}
                              components={{
                                  table: ({ node, ...props }) => (
                                    <table style={{ border: '1px solid black' }} {...props} />
                                  )}}>{`Node ${index + 1}: ${node}`}</ReactMarkdown>
                            </CardContent>
                          </Card>
                        )) : <Typography variant="body2">No Nodes</Typography>}
                      </Box>
                    )},
                    {title: 'Processed Images', dataIndex: 'images', copyButton: false, hidden: true, render: (images) => (
                      <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', gap: 1 }}>
                        {images ? images.map((image, index) => (
                          <Card key={index} variant="outlined" sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', width: '100%' }}>
                            <Box sx={{ display: 'flex', flexDirection: 'column', p: 2 }}>
                              <Typography variant="body2">{`Title: ${image.title}`}</Typography>
                              <Typography variant="body2">{`Description: ${image.description}`}</Typography>
                            </Box>
                            <Box sx={{ p: 2 }}>
                              <img src={image.source_url} alt={`Image ${index}`} style={{ width: '200px', height: 'auto' }} />
                            </Box>
                          </Card>
                        )) : <Typography variant="body2">No Images</Typography>}
                      </Box>
                    )},
                  ]}
                dataSource={sources || []} 
                totalEntries={totalSources}
                handlePrevPage={handlePreviousPage} 
                handleNextPage={handleNextPage} 
                handleSortOrderChange={handleSortOrderChange}
                setSelectedIds={setSelectedSourceIds} 
                selectedIds={selectedSourceIds}
                actionButtons={
                    (pipelineStatus !== 'error' && pipelineStatus !== 'unavailable') ? [
                        {label: 'Process', onClick: (data) => handleSourceAction([data._id], sourceTypeFilter, tab, 'process'), loading: actionLoading},
                        {label: 'Delete', onClick: (data) => handleSourceAction([data._id], sourceTypeFilter, tab, 'delete'), loading: actionLoading},
                        {label: 'Edit', onClick: (data) => navigate(`/source-form/${data._id}/${tab}` )}
                    ] : []
                }


                    
                handleCheckboxChange={handleCheckboxChange}
                handleAllCheckboxChange={handleAllCheckboxChange}
                currentPage={currentPage}
                perPage={perPage}
              />
              
        </CustomTabPanel>
        <CustomTabPanel value={tab} index={2}>
          <InteractiveTable 
            columns={[
              {title: 'timestamp', dataIndex: 'date_added', copyButton: false},
              { title: 'Image ID', dataIndex: '_id', copyButton: false },
              {title: "Image", dataIndex: "source_url", render: (text, record) => <a href={text} target="_blank" rel="noopener noreferrer"><img src={text} alt="source" style={{width: '100px'}} /></a>},
              { title: 'Article Title', dataIndex: 'title', copyButton: false },
              {title:'Processed', dataIndex:'processed', copyButton:false},
              {title:'Image Title', dataIndex:'image_title', copyButton:false, hidden: true},
              {title:'Image Description', dataIndex:'description', copyButton:false, hidden: true},

            ]}
            dataSource={sources || []}
            totalEntries={totalSources}
            handlePrevPage={handlePreviousPage}
            handleNextPage={handleNextPage}
            handleSortOrderChange={handleSortOrderChange}
            setSelectedIds={setSelectedSourceIds}
            selectedIds={selectedSourceIds}
            actionButtons={
              (pipelineStatus !== 'error' && pipelineStatus !== 'unavailable') ? [
                {label: 'Process', onClick: (data) => handleSourceAction([{'image_id':data._id,'source_id':data.source_id}], sourceTypeFilter, tab, 'process'), loading: actionLoading},
                {label: 'Reject', onClick: (data) => handleSourceAction([data._id], sourceTypeFilter, tab, 'delete'), loading: actionLoading},
              ] : []
            }
            handleCheckboxChange={handleCheckboxChange}
            handleAllCheckboxChange={handleAllCheckboxChange}
            currentPage={currentPage}
            perPage={perPage}

          />
        </CustomTabPanel>
        </>
        )}

               
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
