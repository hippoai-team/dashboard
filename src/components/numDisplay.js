import PropTypes from 'prop-types';
import { Avatar, Card, CardContent, Stack, SvgIcon, Typography, Tooltip } from '@mui/material';
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks';
import { alpha } from '@mui/material/styles';
const NumDisplay = (props) => {
  const { title,value, description } = props;
  //if sx not defined, set default

   const sx = props.sx || {
    
      backgroundColor: alpha('#2196F3', 0.1),
      color: '#2196F3',
      margin: '10px'
  }

  if (Array.isArray(value)) {
    return (
      <>
        <Card sx={sx}>
          <CardContent>
            <Stack
              alignItems="flex-start"
              direction="row"
              justifyContent="space-between"
              spacing={3}
            >
              {title.map((item, index) => (
                <Stack key={index} spacing={1}>
                  <Typography
                    color="text.secondary"
                    variant="overline"
                  >
                    {item}
                  </Typography>
                  <Tooltip title={description[index]}>
                    <Typography variant="h4">
                      {value[index]}
                    </Typography>
                  </Tooltip>
                </Stack>
              ))}
            </Stack>
          </CardContent>
        </Card>
      </>
    );
  } else {
    return (
      <Card sx={sx}>
        <CardContent>
          <Stack
            alignItems="flex-start"
            direction="row"
            justifyContent="space-between"
            spacing={3}
          >
            <Stack spacing={1}>
              <Typography
                color="text.secondary"
                variant="overline"
              >
                {title}
              </Typography>
              <Tooltip title={description}>
                <Typography variant="h4">
                  {value}
                </Typography>
              </Tooltip>
            </Stack>
            <SvgIcon
              sx={{
                color: 'primary.main',
                height: 56,
                width: 56
              }}
            >
              <LibraryBooksIcon />
            </SvgIcon>
          </Stack>
        </CardContent>
      </Card>
    );
  }
};

export default NumDisplay;
