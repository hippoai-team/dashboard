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
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Checkbox from '@mui/material/Checkbox';  // Add this import

const InteractiveTable = ({
  columns = [],
  dataSource = [],
  totalEntries = 0,
  handlePrevPage,
  handleNextPage,
  handleSortOrderChange,
  setSelectedIds,
  selectedIds = [],
  actionButtons = [],
  handleAllCheckboxChange,
  handleCheckboxChange,
  currentPage = 1,
  perPage = 10,
  loading = false,
  expandedNodeData = {},
  fetchNodes = null,
}) => {
  const [expandedRows, setExpandedRows] = useState([]);

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  const skip = perPage * (currentPage - 1);
  const currentEntriesStart = skip + 1;
  const currentEntriesEnd = skip + (dataSource ? dataSource.length : 0);

  const toggleRowExpansion = (id) => {
    const currentExpandedRows = expandedRows.includes(id)
      ? expandedRows.filter(rowId => rowId !== id)
      : [...expandedRows, id];
    setExpandedRows(currentExpandedRows);
    
    if (!expandedNodeData[id] && !expandedRows.includes(id) && fetchNodes) {
      fetchNodes(id);
      console.log(expandedNodeData);
    }
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
                <Checkbox
                  onChange={handleAllCheckboxChange}
                  size="large"  // Set the size to medium for a larger checkbox
                />
              </th>
              {actionButtons && actionButtons.length > 0 && <th>Available Actions</th>}
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
            <tr>
              <td colSpan={columns.length + (actionButtons && actionButtons.length > 0 ? 2 : 1)} style={{textAlign: 'center'}}>
                <CircularProgress />
                <Typography variant="body1" style={{marginLeft: '10px'}}>
                  Fetching data...
                </Typography>
              </td>
            </tr>
            ) : dataSource && dataSource.length > 0 ? (
              dataSource.map((data, i) => (
                <React.Fragment key={data._id || i}>
                  <tr>
                    <td>
                      <Checkbox
                        onChange={(e) => handleCheckboxChange(e, data._id)}
                        checked={selectedIds.includes(data._id)}
                        size="large"  // Set the size to medium for a larger checkbox
                      />
                    </td>
                    {actionButtons && actionButtons.length > 0 && (
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
                      <td colSpan={columns.length + (actionButtons && actionButtons.length > 0 ? 2 : 1)} style={{ maxWidth: '100%', overflowX: 'auto' }}>
                        <Collapse in={expandedRows.includes(data._id)} timeout="auto" unmountOnExit>
                          <Table size="small">
                            <TableBody>
                              {columns.filter(column => column.hidden).map((hiddenColumn, index) => (
                                <React.Fragment key={index}>
                                  <TableRow>
                                    <TableCell colSpan={2} style={{ whiteSpace: 'nowrap', fontWeight: 'bold' }}>
                                      {hiddenColumn.title}
                                    </TableCell>
                                  </TableRow>
                                  <TableRow>
                                    <TableCell colSpan={2} style={{ whiteSpace: 'normal', wordWrap: 'break-word' }}>
                                      {hiddenColumn.dataIndex === 'nodes' ? 
                                        (expandedNodeData[data._id] ? 
                                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                            {expandedNodeData[data._id]['nodes'].map((node, nodeIndex) => (
                                              <Card key={nodeIndex} variant="outlined" sx={{ mb: 1 }}>
                                                <CardContent>
                                                  <ReactMarkdown
                                                    remarkPlugins={[remarkGfm]}
                                                    components={{
                                                      table: ({ node, ...props }) => (
                                                        <table style={{ border: '1px solid black' }} {...props} />
                                                      )
                                                    }}
                                                  >{`Node ${nodeIndex + 1}: ${node}`}</ReactMarkdown>
                                                </CardContent>
                                              </Card>
                                            ))}
                                          </Box>
                                          : <CircularProgress />
                                        )
                                      : hiddenColumn.dataIndex === 'images' ?
                                        (expandedNodeData[data._id] ? 
                                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                            {expandedNodeData[data._id]['images'].map((image, imageIndex) => (
                                              <Card key={imageIndex} variant="outlined" sx={{ mb: 1 }}>
                                                <CardContent>
                                                  <Typography variant="body2">{`Image ${imageIndex + 1}: ${image.title}`}</Typography>
                                                  <Typography variant="body2">{`Description: ${image.description}`}</Typography>
                                                  <img src={image.source_url} alt={`Image ${imageIndex + 1}`} style={{ maxWidth: '100%', height: 'auto' }} />
                                                </CardContent>
                                              </Card>
                                            ))}
                                          </Box>
                                          : <CircularProgress />
                                        )
                                      : (hiddenColumn.render
                                          ? hiddenColumn.render(data[hiddenColumn.dataIndex], data)
                                          : data[hiddenColumn.dataIndex])
                                      }
                                    </TableCell>
                                  </TableRow>
                                </React.Fragment>
                              ))}
                            </TableBody>
                          </Table>
                        </Collapse>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length + (actionButtons && actionButtons.length > 0 ? 2 : 1)} style={{ textAlign: 'center' }}>
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
