import React from "react";
import Chart from "react-apexcharts";
import { Card, CardContent, CardHeader } from "@mui/material";



const defaultOptions = {
    chart: {
      type: 'bar',
    },
    xaxis: {
      type: 'datetime'
    },
    tooltip: {
      x: {
        formatter: (value, { series, seriesIndex, dataPointIndex, w }) => {
          return new Date(value).toLocaleDateString();
        },
      },
      y: {
        formatter: (value, { series, seriesIndex, dataPointIndex, w }) => {
          const date = w.globals.labels[dataPointIndex];
          const users = w.config.userData[date]?.users || [];
          return `Count: ${value} <br> Users: ${users.join(', ')}`;
        }
      }
    }
  };
  
  const DailyChartGraph = ({ series, labels, title, width, height, userData }) => {
    const newOptions = { ...defaultOptions, labels: labels };
    newOptions.tooltip.y = {
      formatter: (value, { series, seriesIndex, dataPointIndex, w }) => {
        const date = Object.keys(userData)[dataPointIndex];
        const users = userData[date]?.users || [];
        const usersString = users.join('<br>');
        return `Count: ${value} <br> Users: <br> ${usersString}`;
      }
    };

    return (

        <Card sx={'sm'}>
        <CardHeader title={title} sx={{backgroundColor: '#3f51b5', color: '#fff'}}/>
        <CardContent>
                    <Chart
                      options= {newOptions}
                      series={series}
                      type={'bar'}
                      width={width}
                        height={height}
                  
                      >
        
                    </Chart>
                    </CardContent>
                    </Card>
        );
        }
    
export default DailyChartGraph;
  