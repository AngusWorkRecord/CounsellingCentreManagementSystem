import { Helmet } from 'react-helmet-async';
// @mui
import { alpha, styled } from '@mui/material/styles';
import { Box, Container } from '@mui/material';
import { TreeView, TreeItem, treeItemClasses } from '@mui/lab';
import { tr, useUiLanguage } from '../../../locales/translate';
// routes
import { PATH_PAGE } from '../../../routes/paths';
// components
import Iconify from '../../../components/iconify';
import CustomBreadcrumbs from '../../../components/custom-breadcrumbs';
// sections
import { Block } from '../../../sections/_examples/Block';

// ----------------------------------------------------------------------

const StyledTreeView = styled(TreeView)({
  height: 240,
  flexGrow: 1,
  maxWidth: 400,
});

const StyledTreeItem = styled((props) => <TreeItem {...props} />)(({ theme }) => ({
  [`& .${treeItemClasses.iconContainer}`]: {
    '& .close': {
      opacity: 0.3,
    },
  },
  [`& .${treeItemClasses.group}`]: {
    marginLeft: 15,
    paddingLeft: 18,
    borderLeft: `1px dashed ${alpha(theme.palette.text.primary, 0.4)}`,
  },
}));

// ----------------------------------------------------------------------

export default function MUITreesViewPage() {
  useUiLanguage();
  return (
    <>
      <Helmet>
        <title> {tr("MUI Components: Tree View | Counselling Centre Management System")}</title>
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
            heading={tr("Tree View")}
            links={[
              {
                name: tr("Components"),
                href: PATH_PAGE.components,
              },
              { name: tr("Tree View") },
            ]}
            moreLink={['https://mui.com/components/tree-view']}
          />
        </Container>
      </Box>

      <Container sx={{ my: 10 }}>
        <Box
          gap={3}
          display="grid"
          gridTemplateColumns={{
            xs: 'repeat(1, 1fr)',
            md: 'repeat(3, 1fr)',
          }}
        >
          <Block title={tr("Basic")}>
            <StyledTreeView
              defaultCollapseIcon={<Iconify icon="eva:chevron-down-fill" />}
              defaultExpandIcon={<Iconify icon="eva:chevron-right-fill" />}
              defaultEndIcon={null}
            >
              <TreeItem nodeId="1" label={tr("Applications")}>
                <TreeItem nodeId="2" label={tr("Calendar")} />
                <TreeItem nodeId="3" label="Chrome" />
                <TreeItem nodeId="4" label="Webstorm" />
              </TreeItem>
              <TreeItem nodeId="5" label={tr("Documents")}>
                <TreeItem nodeId="10" label="OSS" />
                <TreeItem nodeId="6" label="Material-UI">
                  <TreeItem nodeId="7" label="src">
                    <TreeItem nodeId="8" label="index.js" />
                    <TreeItem nodeId="9" label="tree-view.js" />
                  </TreeItem>
                </TreeItem>
              </TreeItem>
            </StyledTreeView>
          </Block>

          <Block title={tr("Multi Select")}>
            <StyledTreeView
              multiSelect
              defaultCollapseIcon={<Iconify icon="eva:chevron-down-fill" />}
              defaultExpandIcon={<Iconify icon="eva:chevron-right-fill" />}
              defaultEndIcon={null}
            >
              <TreeItem nodeId="1" label={tr("Applications")}>
                <TreeItem nodeId="2" label={tr("Calendar")} />
                <TreeItem nodeId="3" label="Chrome" />
                <TreeItem nodeId="4" label="Webstorm" />
              </TreeItem>
              <TreeItem nodeId="5" label={tr("Documents")}>
                <TreeItem nodeId="6" label="Material-UI">
                  <TreeItem nodeId="7" label="src">
                    <TreeItem nodeId="8" label="index.js" />
                    <TreeItem nodeId="9" label="tree-view.js" />
                  </TreeItem>
                </TreeItem>
              </TreeItem>
            </StyledTreeView>
          </Block>

          <Block title={tr("Customization")}>
            <StyledTreeView defaultExpanded={['1']}>
              <StyledTreeItem nodeId="1" label={tr("Main")}>
                <StyledTreeItem nodeId="2" label={tr("Hello")} />
                <StyledTreeItem nodeId="3" label={tr("Subtree with children")}>
                  <StyledTreeItem nodeId="6" label={tr("Hello")} />
                  <StyledTreeItem nodeId="7" label={tr("Sub-subtree with children")}>
                    <StyledTreeItem nodeId="9" label={tr("Child 1")} />
                    <StyledTreeItem nodeId="10" label={tr("Child 2")} />
                    <StyledTreeItem nodeId="11" label={tr("Child 3")} />
                  </StyledTreeItem>
                  <StyledTreeItem nodeId="8" label={tr("Hello")} />
                </StyledTreeItem>
                <StyledTreeItem nodeId="4" label={tr("World")} />
                <StyledTreeItem nodeId="5" label={tr("Something something")} />
              </StyledTreeItem>
            </StyledTreeView>
          </Block>
        </Box>
      </Container>
    </>
  );
}
