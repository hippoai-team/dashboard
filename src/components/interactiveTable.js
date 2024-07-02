import React, { useState } from 'react';
import Button from '@mui/material/Button';
import FileCopyIcon from '@mui/icons-material/FileCopy';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import IconButton from '@mui/material/IconButton';
import ButtonGroup from '@mui/material/ButtonGroup';
import Collapse from '@mui/material/Collapse';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';

const InteractiveTable = ({
  columns,
  dataSource,
  totalEntries,
  handlePrevPage,
  handleNextPage,
  handleSortOrderChange,
  setSelectedIds,
  selectedIds,
  actionButtons,
  handleAllCheckboxChange,
  handleCheckboxChange,
  currentPage,
  perPage,
  loading,
}) => {
  const [expandedRows, setExpandedRows] = useState([]);

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  const skip = perPage * (currentPage - 1);
  const currentEntriesStart = skip + 1;
  const currentEntriesEnd = skip + dataSource.length;

  const toggleRowExpansion = (id) => {
    const currentExpandedRows = expandedRows.includes(id)
      ? expandedRows.filter(rowId => rowId !== id)
      : [...expandedRows, id];
    setExpandedRows(currentExpandedRows);
  };

  return (
    <>
      <Box sx={{ width: '100%', overflowX: 'auto', position: 'sticky', top: 0, bgcolor: 'background.paper', zIndex: 1 }}>
        <Button onClick={handlePrevPage} disabled={currentPage === 1}>Previous</Button>
        <Typography component="span">
          Page {currentPage} of {Math.ceil(totalEntries / perPage)}
        </Typography>
        <Button onClick={handleNextPage} disabled={currentEntriesEnd >= totalEntries}>Next</Button>
        <Typography component="span">
          Showing {currentEntriesStart} to {currentEntriesEnd} of {totalEntries} entries
        </Typography>
      </Box>
      <div className="table-responsive">
        <table className="table table-bordered table-hover">
          <thead>
            <tr>
              <th>
                <input type="checkbox" onChange={handleAllCheckboxChange}></input>
              </th>
              {actionButtons && <th>Available Actions</th>}
              {columns.filter(column => !column.hidden).map((column, i) => (
                <th key={i} >
                  {column.title}
                  {column.title === 'timestamp' && (
                    <ButtonGroup>
                      <IconButton size="small" onClick={() => handleSortOrderChange('asc')}>
                        <ArrowUpwardIcon fontSize="inherit" />
                      </IconButton>
                      <IconButton size="small" onClick={() => handleSortOrderChange('desc')}>
                        <ArrowDownwardIcon fontSize="inherit" />
                      </IconButton>
                    </ButtonGroup>
                  )}
                  {column.copyButton && (
                    <Button variant="outlined" onClick={() => {
                      const copiedData = dataSource.map(data => data[column.dataIndex]);
                      copyToClipboard(copiedData.join(','));
                    }} sx={{ ml: 1 }}>
                      <FileCopyIcon style={{ fontSize: 'small' }} />
                    </Button>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 10 }).map((_, i) => (
                <tr key={i}>
                  {Array.from({ length: columns.length + (actionButtons ? 2 : 1) }).map((_, j) => (
                    <td key={j}><CircularProgress /></td>
                  ))}
                </tr>
              ))
            ) : dataSource.length > 0 ? (
              dataSource.map((data, i) => (
                <>
                  <tr key={data._id}>
                    <td>
                      <input type="checkbox" onChange={(e) => handleCheckboxChange(e, data._id)} value={data._id} checked={selectedIds.includes(data._id)}></input>
                    </td>
                    {actionButtons && (
                      <td>
                        {actionButtons.map((button, k) => (
                          <Button key={k} onClick={() => button.onClick(data)}
                            disabled={button.loading}
                          >{button.loading && selectedIds.includes(data._id) ? <CircularProgress size={20} /> : button.label}</Button>
                        ))}
                        {data.processed && (
                      
                      <Button onClick={() => toggleRowExpansion(data._id)}>
                          {expandedRows.includes(data._id) ? 'Collapse' : 'Expand'}
                        </Button>
                 
                  )}
                      </td>
                    )}
                    
                    {columns.filter(column => !column.hidden).map((column, j) => (
                      <td key={j}>
                        {column.render
                          ? column.render(data[column.dataIndex], data)
                          : typeof data[column.dataIndex] === 'boolean'
                            ? data[column.dataIndex].toString()
                            : data[column.dataIndex]
                        }
                        
                      </td>
                    ))}
                  </tr>
                  {expandedRows.includes(data._id) && (
                    <tr>
                      <td colSpan={columns.length + (actionButtons ? 2 : 1)} style={{ maxWidth: '100%', overflowX: 'auto' }}>
                        <Collapse in={expandedRows.includes(data._id)} timeout="auto" unmountOnExit>
                          <Table size="small">
                            <TableBody>
                              {columns.filter(column => column.hidden).map((hiddenColumn, index) => (
                                <>
                                  <TableRow key={`title-${index}`}>
                                    <TableCell colSpan={2} style={{ whiteSpace: 'nowrap', fontWeight: 'bold' }}>
                                      {hiddenColumn.title}
                                    </TableCell>
                                  </TableRow>
                                  <TableRow key={`data-${index}`}>
                                    <TableCell colSpan={2} style={{ whiteSpace: 'normal', wordWrap: 'break-word' }}>
                                      {hiddenColumn.render
                                        ? hiddenColumn.render(data[hiddenColumn.dataIndex], data)
                                        : data[hiddenColumn.dataIndex]
                                      }
                                    </TableCell>
                                  </TableRow>
                                </>
                              ))}
                            </TableBody>
                          </Table>
                        </Collapse>
                      </td>
                    </tr>
                  )}
                </>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length + (actionButtons ? 2 : 1)} style={{ textAlign: 'center' }}>
                  No data found for the given query or filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <Box sx={{ width: '100%', overflowX: 'auto', position: 'sticky', bottom: 0, bgcolor: 'background.paper', zIndex: 1 }}>
        <Button onClick={handlePrevPage} disabled={currentPage === 1}>Previous</Button>
        <Typography component="span">
          Page {currentPage} of {Math.ceil(totalEntries / perPage)}
        </Typography>
        <Button onClick={handleNextPage} disabled={currentEntriesEnd >= totalEntries}>Next</Button>
        <Typography component="span">
          Showing {currentEntriesStart} to {currentEntriesEnd} of {totalEntries} entries
        </Typography>
      </Box>
    </>
  );
};

export default InteractiveTable;
