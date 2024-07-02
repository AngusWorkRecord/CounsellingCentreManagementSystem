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
import EventInfoDialog from '../EventInfoDialog';

// ----------------------------------------------------------------------

EventTableRow.propTypes = {
	row: PropTypes.object,
	selected: PropTypes.bool,
	onEditRow: PropTypes.func,
	onDeleteRow: PropTypes.func,
	onSelectRow: PropTypes.func,
};

export default function EventTableRow({ row, selected, onEditRow, onSelectRow, onDeleteRow }) {
	const {
		EventName,
		EventType,
		EventWebContent,
		EventWebURL,
		EventLocationType,
		EventPhysicalLocation,
		EventVirtualLocation,
		EventStartDatetime,
		EventEndDatetime,
		Participants,
		Status,
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
		if (status === "finished") return "success"
		if (status === "ongoing") return "info"
		if (status === "incoming") return "error"
		if (status === "cancelled") return "default"
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
				{/* <TableCell padding="checkbox">
					<Checkbox checked={selected} onClick={onSelectRow} />
				</TableCell> */}

				<TableCell>
					<Stack direction="row" alignItems="left" spacing={2}>
						{/* <Avatar alt={name} ../../../../..={avatarUrl} /> */}

						{
							!isStringNullOrEmpty(EventWebURL) ?
								<Link href={EventWebURL} target="_blank" sx={{ fontWeight: 500, color: '#151515', textTransform: 'capitalize', fontSize: 15 }}>
									<Iconify icon='fluent-mdl2:open-in-new-tab' sx={{ width: 12, height: 12, mr: 1, }} />
									{EventName}
								</Link>
								:
								<Typography variant="subtitle2" noWrap>
									{EventName}
								</Typography>
						}
					</Stack>
				</TableCell>

				<TableCell align="left">{EventType}</TableCell>

				<TableCell align="left" sx={{ textTransform: 'capitalize' }}>
					<Box>
						<b>Start time: {EventStartDatetime}</b>
						<br />
						<b>End time: {EventEndDatetime}</b>
						{renderLocations(EventLocationType, EventPhysicalLocation, EventVirtualLocation)}

					</Box>
				</TableCell>

				<TableCell align="center">
					<Iconify
						icon='mdi:user-group'
						sx={{
							width: 20,
							height: 20,
						}}
					/>
					{" "}
					{Participants}
				</TableCell>

				<TableCell align="left">
					<Label
						variant="soft"
						color={(Status && renderStatus(Status))}
						sx={{ textTransform: 'capitalize' }}
					>
						{Status}
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
					disabled={Status && (Status !== "incoming")}
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

			<EventInfoDialog
				open={openInfo}
				handleClose={handleCloseInfo}
				title=""
				event={row}
			/>
		</>
	);
}
