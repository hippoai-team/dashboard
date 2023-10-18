import PropTypes from 'prop-types';
import { Avatar, Card, CardContent, Stack, SvgIcon, Typography } from '@mui/material';
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks';
const NumDisplay = (props) => {
  const { title,value, sx } = props;

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
            <Typography variant="h4">
              {value}
            </Typography>
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
};

export default NumDisplay;