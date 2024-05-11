import React from 'react';
import Modal from '@mui/material/Modal';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';


const RejectModal = ({ showRejectModal, setShowRejectModal, rejectReason, setRejectReason, customRejectReason, setCustomRejectReason, selectedSourceIds, handleSubmitRejectSource, closeRejectModal }) => (
    
    <Modal
      open={showRejectModal}
      onClose={() => setShowRejectModal(false)}
      aria-labelledby="reject-source-modal-title"
      aria-describedby="reject-source-modal-description"
      style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
    >
      <Box
        sx={{
          backgroundColor: 'background.paper',
          borderRadius: 2,
          boxShadow: 24,
          p: 4,
          width: '50%',
          maxWidth: '500px',
        }}
      >
        <h3 id="reject-source-modal-title">Reject Source</h3>
        <FormControlLabel
          control={<Checkbox id="outdated" name="rejectReason" value="Outdated" checked={rejectReason === "Outdated"} onChange={(e) => setRejectReason(e.target.checked ? e.target.value : '')} />}
          label="Outdated"
        />
        <FormControlLabel
          control={<Checkbox id="irrelevant" name="rejectReason" value="Irrelevant" checked={rejectReason === "Irrelevant"} onChange={(e) => setRejectReason(e.target.checked ? e.target.value : '')} />}
          label="Irrelevant"
        />
        <FormControlLabel
          control={<Checkbox id="broken" name="rejectReason" value="Broken" checked={rejectReason === "Broken"} onChange={(e) => setRejectReason(e.target.checked ? e.target.value : '')} />}
          label="Broken"
        />
        <FormControlLabel
          control={<Checkbox id="paywalled" name="rejectReason" value="Paywalled" checked={rejectReason === "Paywalled"} onChange={(e) => setRejectReason(e.target.checked ? e.target.value : '')} />}
          label="Paywalled"
        />
        <TextField
          id="custom-reject-reason"
          label="If other, please specify"
          multiline
          rows={4}
          variant="outlined"
          fullWidth
          value={customRejectReason}
          onChange={(e) => setCustomRejectReason(e.target.value)}
          margin="normal"
        />
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
          <Button variant="contained" color="primary" onClick={() => handleSubmitRejectSource(selectedSourceIds)}>
            Submit
          </Button>
          <Button variant="outlined" color="secondary" onClick={closeRejectModal}>
            Cancel
          </Button>
        </Box>
      </Box>
    </Modal>
  );

export default RejectModal;