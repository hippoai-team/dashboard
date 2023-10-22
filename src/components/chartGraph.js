import React from "react";
import Chart from "react-apexcharts";
import { Card, CardContent, CardHeader, Tooltip } from "@mui/material";


const ChartGraph = (props) => {
    const { series, labels, title, options, type, width, height, description } = props;
    const newOptions = JSON.parse(JSON.stringify(options)); // Deep copy
    newOptions.labels = labels;
    newOptions.subtitle = { text: description };

    return (

<Card sx={'sm'}>
<CardHeader title={title} sx={{backgroundColor: '#3f51b5', color: '#fff'}}>
{title}
</CardHeader>
<CardContent>
            <Chart
              options= {newOptions}
              series={series}
              type={type}
              width={width}
                height={height}
          
              >

            </Chart>
            </CardContent>
            </Card>
);
}

export default ChartGraph;
