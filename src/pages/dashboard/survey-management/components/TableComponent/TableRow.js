import PropTypes from 'prop-types';
import { useState } from 'react';
// @mui
import {
	Stack,
	Button,
	Checkbox,
	TableRow,
	MenuItem,
	TableCell,
	IconButton,
	Typography,
	Box,
	Divider,
	Link,
} from '@mui/material';
// components
import Label from '../../../../../components/label'
import Iconify from '../../../../../components/iconify'
import MenuPopover from '../../../../../components/menu-popover';
import ConfirmDialog from '../../../../../components/confirm-dialog';
import { isStringNullOrEmpty } from '../../../../../utils/Helpers';
import SurveyInfoDialog from '../SurveyInfoDialog';

// ----------------------------------------------------------------------

SurveyTableRow.propTypes = {
	row: PropTypes.object,
	selected: PropTypes.bool,
	onEditRow: PropTypes.func,
	onDeleteRow: PropTypes.func,
	onSelectRow: PropTypes.func,
};

export default function SurveyTableRow({ row, selected, onEditRow, onSelectRow, onDeleteRow }) {
	const {
		FormID,
		FormTitle,
		FormType,
		FormDescription,
		isArchived,
		Respondent,
		FormQuestions,
		CreatedDate,
	} = row;

	const [openConfirm, setOpenConfirm] = useState(false);

	const [openPopover, setOpenPopover] = useState(null);

	const [openInfo, setOpenInfo] = useState(false);

	const handleOpenConfirm = () => {
		setOpenConfirm(true);
	};


	const handleCloseConfirm = () => {
		setOpenConfirm(false);
	};

	const handleOpenPopover = (event) => {
		setOpenPopover(event.currentTarget);
	};

	const handleClosePopover = () => {
		setOpenPopover(null);
	};

	const handleOpenInfo = () => {
		setOpenInfo(true);
	};

	const handleCloseInfo = () => {
		setOpenInfo(false);
	};


	function renderStatus(status) {
		if (status === "active") return "primary"
		if (status === "archived") return "info"
		return "primary"
	}

	function renderLocations(locationType, physical, virtual) {
		if (locationType === "Physical & Virtual")
			return (
				<Box>
					<b>Physical</b>: {physical}
					<br />
					<b>Virtual</b>:
					<Button variant="text" size="small" target="_blank" rel="noopener" href={virtual}>
						Virtual Location Link
					</Button>
				</Box>
			)
		if (locationType === "Physical")
			return <Box><b>Physical</b>: {physical}</Box>
		if (locationType === "Virtual")
			return (
				<Box>
					<b>Virtual</b>:
					<Button variant="text" size="small" target="_blank" rel="noopener" href={virtual}>
						Virtual Location Link
					</Button>
				</Box>
			)
		return <></>
	}


	return (
		<>
			<TableRow hover selected={selected}>
				<TableCell padding="checkbox">
					<Checkbox checked={selected} onClick={onSelectRow} />
				</TableCell>

				<TableCell>
					<Stack spacing={0}>
						<Typography variant="subtitle2" noWrap>
							{FormTitle}
						</Typography>
						<Typography variant="caption">
							{CreatedDate}
						</Typography>
					</Stack>
				</TableCell>

				<TableCell align="left">{FormType}</TableCell>

				{/* <TableCell align="center">
					<Iconify
						icon='mdi:user-group'
						sx={{
							width: 20,
							height: 20,
						}}
					/>
					{" "}
					{Respondent}
				</TableCell> */}

				<TableCell align="left">
					<Label
						variant="soft"
						color={(isArchived && renderStatus(isArchived))}
						sx={{ textTransform: 'capitalize' }}
					>
						{isArchived}
					</Label>
				</TableCell>

				<TableCell align="right">
					<IconButton color={openPopover ? 'inherit' : 'default'} onClick={handleOpenPopover}>
						<Iconify icon="eva:more-vertical-fill" />
					</IconButton>
				</TableCell>
			</TableRow>

			<MenuPopover
				open={openPopover}
				onClose={handleClosePopover}
				arrow="right-top"
				sx={{ width: 140 }}
			>
				<MenuItem
					onClick={() => {
						handleOpenInfo();
						handleClosePopover();
					}}
				>
					<Iconify icon="eva:info-outline" />
					Info
				</MenuItem>

				<MenuItem
					onClick={() => {
						onEditRow();
						handleClosePopover();
					}}
				>
					<Iconify icon="eva:edit-fill" />
					Edit
				</MenuItem>

				<MenuItem
					onClick={() => {
						handleOpenConfirm();
						handleClosePopover();
					}}
					sx={{ color: 'error.main' }}
				>
					<Iconify icon="eva:trash-2-outline" />
					Delete
				</MenuItem>

			</MenuPopover>

			<ConfirmDialog
				open={openConfirm}
				onClose={handleCloseConfirm}
				title="Delete"
				content="Are you sure want to delete?"
				action={
					<Button variant="contained" color="error" onClick={onDeleteRow}>
						Delete
					</Button>
				}
			/>
			<SurveyInfoDialog
				open={openInfo}
				handleClose={handleCloseInfo}
				title=""
				event={row}
			/>
		</>
	);
}
