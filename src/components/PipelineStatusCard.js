import React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';

const PipelineStatusCard = ({ pipelineStatus, error }) => {

  return (
    <div>
        <Card sx={{ maxWidth: 345, bgcolor: pipelineStatus === 'running' ? '#e8f5e9' : pipelineStatus === 'idle' ? '#fffde7' : pipelineStatus === 'unavailable' ? '#eeeeee' : '#ffebee', margin: '20px' }}>
          <CardContent>
            <Typography variant="h6" component="div" style={{ color: pipelineStatus === 'running' ? 'green' : pipelineStatus === 'idle' ? 'orange' : pipelineStatus === 'unavailable' ? 'grey' : 'red' }}>
              Pipeline Status: {pipelineStatus === 'running' ? 'Running' : pipelineStatus === 'idle' ? 'Idle' : pipelineStatus === 'unavailable' ? 'Unavailable' : 'Error'}
            </Typography>
            {pipelineStatus === 'error' || error && (
              <Typography variant="body2" style={{ color: 'red' }}>
                Error Message: {error}
              </Typography>
            )}
          </CardContent>
        </Card>
    </div>
  );
};

export default PipelineStatusCard;
