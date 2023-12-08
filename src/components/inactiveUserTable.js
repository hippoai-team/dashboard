
import React from 'react';
import { Grid, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,Typography } from '@mui/material';


export default function InactiveUserTable({ churnData }) {

return (

<Grid item xs={12} sm={6} md={4}>
<Typography variant="h6" gutterBottom component="div">
Inactive Users
</Typography>
<TableContainer component={Paper}>
  <Table>
    <TableHead>

      <TableRow>
        <TableCell>Email</TableCell>
        <TableCell align="right">Days Since Last Active</TableCell>
      </TableRow>
    </TableHead>
    <TableBody>
      {churnData['inactiveUsers'] && churnData['inactiveUsers'].length > 0 ? (
        churnData['inactiveUsers'].map((user) => (
          <TableRow key={user.email}>
            <TableCell component="th" scope="row">
              {user.email}
            </TableCell>
            <TableCell align="right">{user.daysSinceLastActive}</TableCell>
          </TableRow>
        ))
      ) : (
        <TableRow>
          <TableCell colSpan={2}>No inactive users</TableCell>
        </TableRow>
      )}
    </TableBody>
  </Table>
</TableContainer>
</Grid>
    
    );
    }   
