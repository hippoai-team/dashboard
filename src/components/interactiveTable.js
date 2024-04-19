import React from 'react';
import Button from '@mui/material/Button';
import FileCopyIcon from '@mui/icons-material/FileCopy';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
const InteractiveTable = ({
  columns,
  dataSource,
  totalEntries,
  handlePrevPage,
  handleNextPage,
  setSelectedIds,
    selectedIds,
  actionButtons,
  handleAllCheckboxChange,
  handleCheckboxChange,
  currentPage,
  perPage,
}) => {
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  const skip = perPage * (currentPage - 1);


  
  return (
    <>
 
    <div className="table-responsive">
        <div className="col-sm-12 col-md-7">
          <div className="dataTables_paginate paging_simple_numbers">
            <ul className="pagination">
              <li className="paginate_button page-item previous">
                <button className="page-link" onClick={handlePrevPage}>Previous</button>
              </li>
              <li className="paginate_button page-item next">
                <button className="page-link" onClick={handleNextPage}>Next</button>
              </li>
              <Box component="span" sx={{ display: 'flex', alignItems: 'center', ml: 2 }}>
                <Typography component="span">Page </Typography>
                <Typography component="span" sx={{ ml: 0.5 }}>
                  {currentPage}
                </Typography>
              </Box>
            </ul>
            <div className="col-sm-12 col-md-5">
          <div className="dataTables_info">Showing {skip + 1}-{Math.min(skip + perPage, totalEntries)} of {totalEntries} entries</div>

        </div>
          </div>
        </div>

      <table className="table table-bordered table-hover">
        <thead>
          <tr>
            <th>
              <input type="checkbox" onChange={handleAllCheckboxChange} ></input>
            </th>
            {actionButtons && <th>Available Actions</th>}

            {columns.map((column, i) => (
              <th key={i}>
                {column.title}
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
          {dataSource.map((data, i) => (
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
                </td>
              )}
              {columns.map((column, j) => (
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
          ))}
        </tbody>
      </table>
      <div className="row">
        
        <div className="col-sm-12 col-md-7">
          <div className="dataTables_paginate paging_simple_numbers">
            <ul className="pagination">
              <li className="paginate_button page-item previous">
                <button className="page-link" onClick={handlePrevPage}>Previous</button>
              </li>
              <li className="paginate_button page-item next">
                <button className="page-link" onClick={handleNextPage}>Next</button>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
    </>
  );
};

export default InteractiveTable;
