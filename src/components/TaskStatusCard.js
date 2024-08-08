import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import IconButton from '@mui/material/IconButton';
import ClearIcon from '@mui/icons-material/Clear';
import Tooltip from '@mui/material/Tooltip';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import Collapse from '@mui/material/Collapse';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';


const API_BASE_URL = process.env.REACT_APP_PIPELINE_API_URL || 'https://pendiumdev.com/pipeline';

const TaskStatusCards = () => {
  const [currentTab, setCurrentTab] = useState(0);
  const [tasks, setTasks] = useState({});
  const [logs, setLogs] = useState([]);
  const [pipelineStatus, setPipelineStatus] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [selectedLog, setSelectedLog] = useState(null);
  const [expanded, setExpanded] = useState(false);
  
  useEffect(() => {
    const intervalId = setInterval(() => {
      axios.get(`${API_BASE_URL}/status`)
        .then(response => {
          setTasks(response.data.tasks);
          setPipelineStatus(response.data.pipeline_status);
          setErrorMessage(""); // Clear any previous error messages
        })
        .catch(error => {
          console.error('Error fetching tasks status:', error);
          setPipelineStatus("unavailable");
          setErrorMessage("Unable to reach the pipeline.");
        });
    }, 10000); // Poll every 10 seconds

    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/logs`);
        setLogs(response.data.logs); // assuming response data is an array of log messages
      } catch (error) {
        console.error('Error fetching logs:', error);
      }
    };

    if (currentTab === 1) { // Only fetch logs if the Logs tab is active
      fetchLogs();
    }
  }, [currentTab]);

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'running':
        return 'green';
      case 'idle':
        return 'orange';
      case 'error':
        return 'red';
      case 'unavailable':
        return 'grey';
      case 'warning':
        return 'yellow';
      default:
        return 'grey';
      
    }
  };

  const parseLogEntry = (logEntry) => {
  const parts = logEntry.match(/(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2},\d{3}) - (\w+) - (.*)/);
  if (parts) {
    return {
      timestamp: parts[1],
      level: parts[2],
      message: parts[3]
    };
  }
  return null; // or a default structure
};

const logLevelColor = (level) => {
  switch (level) {
    case 'INFO':
      return 'blue';
    case 'WARNING':
      return 'orange';
    case 'ERROR':
      return 'red';
    default:
      return 'black';
  }
};

  const removeTask = (taskId) => {
    axios.delete(`${API_BASE_URL}/task/${taskId}`)
      .then(() => {
        setTasks((prevTasks) => {
          const updatedTasks = { ...prevTasks };
          delete updatedTasks[taskId];
          return updatedTasks;
        });
      })
      .catch(error => {
        console.error('Error removing task:', error);
      });
  };

  const logItems = logs.map((log, index) => (
    <Typography key={index} variant="body2" style={{ fontFamily: 'Monospace', whiteSpace: 'pre-wrap', margin: '5px 0' }}>
      {log}
    </Typography>
  ));

  return (
    <Card sx={{ margin: '20px' }}>
      <CardContent>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={currentTab} onChange={handleTabChange} aria-label="basic tabs example">
            <Tab label="Tasks" />
            <Tab label="Logs" />
          </Tabs>
        </Box>
        {currentTab === 0 && (
          <>
            <Typography variant="h5" component="div" style={{ color: getStatusColor(pipelineStatus), marginBottom: '20px' }}>
              Pipeline Status: {pipelineStatus !== "unavailable" ? pipelineStatus.charAt(0).toUpperCase() + pipelineStatus.slice(1) : "Unavailable"}
            </Typography>
            {errorMessage && (
              <Typography variant="subtitle1" style={{ color: 'red', marginBottom: '20px' }}>
                {errorMessage}
              </Typography>
            )}
            <TableContainer component={Paper}>
              <Table sx={{ minWidth: 650 }} aria-label="simple table">
                <TableHead>
                  <TableRow>
                    <TableCell>Task ID</TableCell>
                    <TableCell align="right">Status</TableCell>
                    <TableCell align="right">Error Message</TableCell>
                    <TableCell align="right">Elapsed Time (min)</TableCell>
                    <TableCell align="right">Details</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {Object.entries(tasks).map(([taskID, taskInfo]) => {
                    const elapsedTime = taskInfo.timestamp && taskInfo.created_at ? 
                      Math.round((new Date(taskInfo.timestamp) - new Date(taskInfo.created_at)) / 60000) : 'N/A';
                    return (
                      <React.Fragment key={taskID}>
                        <TableRow sx={{ bgcolor: getStatusColor(taskInfo.status) }}>
                          <TableCell component="th" scope="row">
                            {taskID}
                          </TableCell>
                          <TableCell align="right">{taskInfo.status.charAt(0).toUpperCase() + taskInfo.status.slice(1)}</TableCell>
                          <TableCell align="right">{taskInfo.status === 'error' && taskInfo.error ? taskInfo.error : 'N/A'}</TableCell>
                          <TableCell align="right">{elapsedTime}</TableCell>
                          <TableCell align="right">
                            <IconButton
                              onClick={() => setExpanded(expanded => expanded === taskID ? false : taskID)}
                              aria-expanded={expanded === taskID}
                              aria-label="show more"
                            >
                              <ExpandMoreIcon />
                            </IconButton>
                          </TableCell>
                          <TableCell align="right">
                            <IconButton onClick={() => removeTask(taskID)}>
                              <ClearIcon />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
                            <Collapse in={expanded === taskID} timeout="auto" unmountOnExit>
                              <Box margin={1}>
                                <Typography variant="h6" gutterBottom component="div">
                                  Details
                                </Typography>
                                {taskInfo.details && <Typography gutterBottom>{`Details: ${taskInfo.details}`}</Typography>}
                                {taskInfo.cost && <Typography gutterBottom>{`Cost: ${taskInfo.cost}`}</Typography>}
                              </Box>
                            </Collapse>
                          </TableCell>
                        </TableRow>
                      </React.Fragment>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
            
          </>
        )}
        {currentTab === 1 && (
  <Box sx={{ padding: '20px', maxHeight: '300px', overflowY: 'auto' }}>
    <TableContainer component={Paper}>
      <Table stickyHeader>
        <TableHead>
          <TableRow>
            <TableCell>Timestamp</TableCell>
            <TableCell>Level</TableCell>
            <TableCell>Message</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {logs.length > 0 ? (
            logs.map((log, index) => {
              const parsedLog = parseLogEntry(log);
              return parsedLog ? (
                <TableRow key={index} hover>
                  <TableCell>{parsedLog.timestamp}</TableCell>
                  <TableCell style={{ color: logLevelColor(parsedLog.level) }}>{parsedLog.level}</TableCell>
                  <TableCell>{parsedLog.message}</TableCell>
                </TableRow>
              ) : null;
            })
          ) : (
            <TableRow>
              <TableCell colSpan={3}>
                <Typography>No logs available.</Typography>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  </Box>
)}
      </CardContent>
    </Card>
  );
};

export default TaskStatusCards;

