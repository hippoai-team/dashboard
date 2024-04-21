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
const API_BASE_URL = 'http://localhost:8000';  // Set this to your API base URL

const TaskStatusCards = () => {
  const [tasks, setTasks] = useState({});
  const [pipelineStatus, setPipelineStatus] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const intervalId = setInterval(() => {
      axios.get(`${API_BASE_URL}/status`)
        .then(response => {
          console.log(response.data.tasks)
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
      default:
        return 'grey';
    }
  };

  const removeTask = (taskId) => {
    axios.delete(`${API_BASE_URL}/task/${taskId}`)
      .then(() => {
        // Remove the task from the state
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

  return (
    <Card sx={{ margin: '20px' }}>
      <CardContent>
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
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {Object.entries(tasks).map(([taskID, taskInfo]) => (
                <TableRow
                  key={taskID}
                  sx={{ '&:last-child td, &:last-child th': { border: 0 }, bgcolor: getStatusColor(taskInfo.status) }}
                >
                  <TableCell component="th" scope="row">
                    {taskID}
                  </TableCell>
                  <TableCell align="right">{taskInfo.status.charAt(0).toUpperCase() + taskInfo.status.slice(1)}</TableCell>
                  <Tooltip title={JSON.stringify(taskInfo.details) || ''} placement="bottom" arrow>
                    <TableCell align="right">{taskInfo.status === 'error' && taskInfo.error ? taskInfo.error : 'N/A'}</TableCell>
                  </Tooltip>
                  <TableCell align="right">
                    <IconButton onClick={() => removeTask(taskID)}>
                      <ClearIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  );
};

export default TaskStatusCards;
