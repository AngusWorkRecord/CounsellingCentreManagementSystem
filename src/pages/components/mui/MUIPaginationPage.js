import { useState } from 'react';

import { Helmet } from 'react-helmet-async';
// @mui
import { Box, Container, Pagination, TablePagination } from '@mui/material';
import { Masonry } from '@mui/lab';
import { tr, useUiLanguage } from '../../../locales/translate';
// routes
import { PATH_PAGE } from '../../../routes/paths';
// components
import CustomBreadcrumbs from '../../../components/custom-breadcrumbs';
// sections
import { Block } from '../../../sections/_examples/Block';

// ----------------------------------------------------------------------

const COLORS = ['standard', 'primary', 'secondary', 'info', 'success', 'warning', 'error'];

const SIZES = ['small', 'medium', 'large'];

const style = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexWrap: 'wrap',
  '& > *': { my: 1 },
};

// ----------------------------------------------------------------------

export default function MUIPaginationPage() {
  useUiLanguage();
  const [page, setPage] = useState(2);

  const [rowsPerPage, setRowsPerPage] = useState(10);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <>
      <Helmet>
        <title> {tr("MUI Components: Pagination | Counselling Centre Management System")}</title>
      </Helmet>

      <Box
        sx={{
          pt: 6,
          pb: 1,
          bgcolor: (theme) => (theme.palette.mode === 'light' ? 'grey.200' : 'grey.800'),
        }}
      >
        <Container>
          <CustomBreadcrumbs
            heading={tr("Pagination")}
            links={[
              {
                name: tr("Components"),
                href: PATH_PAGE.components,
              },
              { name: tr("Pagination") },
            ]}
            moreLink={['https://mui.com/components/pagination']}
          />
        </Container>
      </Box>

      <Container sx={{ my: 10 }}>
        <Masonry columns={{ xs: 1, md: 2 }} spacing={3}>
          <Block title={tr("Circular")} sx={style}>
            <Pagination shape="circular" count={10} />
            <Pagination shape="circular" count={10} disabled />
            <Pagination shape="circular" count={10} variant="outlined" />
            <Pagination shape="circular" count={10} variant="outlined" disabled />
            <Pagination shape="circular" count={10} variant="soft" />
            <Pagination shape="circular" count={10} variant="soft" disabled />
          </Block>

          <Block title={tr("Rounded")} sx={style}>
            <Pagination shape="rounded" count={10} />
            <Pagination shape="rounded" count={10} disabled />
            <Pagination shape="rounded" count={10} variant="outlined" />
            <Pagination shape="rounded" count={10} variant="outlined" disabled />
            <Pagination shape="rounded" count={10} variant="soft" />
            <Pagination shape="rounded" count={10} variant="soft" disabled />
          </Block>

          <Block title={tr("Colors")} sx={style}>
            {COLORS.map((color) => (
              <Pagination key={color} color={color} count={10} />
            ))}

            {COLORS.map((color) => (
              <Pagination key={color} color={color} count={10} variant="outlined" />
            ))}

            {COLORS.map((color) => (
              <Pagination key={color} color={color} count={10} variant="soft" />
            ))}
          </Block>

          <Block title={tr("Size")} sx={style}>
            {SIZES.map((size) => (
              <Pagination count={10} key={size} size={size} />
            ))}
          </Block>

          <Block title={tr("Buttons")} sx={style}>
            <Pagination count={10} showFirstButton showLastButton />
            <Pagination count={10} hidePrevButton hideNextButton />
          </Block>

          <Block title={tr("Ranges")} sx={style}>
            <Pagination count={11} defaultPage={6} siblingCount={0} />
            <Pagination count={11} defaultPage={6} />
            <Pagination count={11} defaultPage={6} siblingCount={0} boundaryCount={2} />
            <Pagination count={11} defaultPage={6} boundaryCount={2} />
          </Block>

          <Block title={tr("Table")} sx={style}>
            <TablePagination
              component="div"
              count={100}
              page={page}
              onPageChange={handleChangePage}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </Block>
        </Masonry>
      </Container>
    </>
  );
}
