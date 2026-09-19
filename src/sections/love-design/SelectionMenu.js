import PropTypes from 'prop-types';
import { Divider, ListSubheader, Menu, MenuItem } from '@mui/material';
import { tr, useUiLanguage } from '../../locales/translate';
import { layoutCards } from './tableGeometry';

const alignments = [
  ['left', '左对齐'],
  ['right', '右对齐'],
  ['top', '顶部对齐'],
  ['bottom', '底部对齐'],
  ['center-x', '水平居中'],
  ['center-y', '垂直居中'],
];
const arrangements = [
  ['row', '横排'],
  ['column', '竖排'],
  ['grid', '网格排列'],
];

export default function SelectionMenu({ anchor, onClose, cards, onAction }) {
  useUiLanguage();
  const itemStyle = { minHeight: 44, whiteSpace: 'normal' };
  return (
    <Menu
      open={Boolean(anchor) && cards.length > 0}
      onClose={onClose}
      anchorReference="anchorPosition"
      anchorPosition={anchor || undefined}
      PaperProps={{ sx: { maxHeight: '75vh', width: 280, maxWidth: 'calc(100vw - 32px)' } }}
      MenuListProps={{ 'aria-label': tr('选中卡片操作') }}
    >
      <MenuItem sx={itemStyle} onClick={() => onAction('return')}>
        {tr('收回选中卡片')}
      </MenuItem>
      <MenuItem sx={itemStyle} onClick={() => onAction('front')}>
        {tr('整组置顶')}
      </MenuItem>
      <MenuItem sx={itemStyle} onClick={() => onAction('back')}>
        {tr('整组置底')}
      </MenuItem>
      <Divider />
      <ListSubheader disableSticky>{tr('对齐')}</ListSubheader>
      {alignments.map(([mode, label]) => (
        <MenuItem sx={itemStyle} key={mode} onClick={() => onAction(mode)}>
          {tr(label)}
        </MenuItem>
      ))}
      <Divider />
      <ListSubheader disableSticky>{tr('排列')}</ListSubheader>
      {arrangements.map(([mode, label]) => {
        const fits = Boolean(layoutCards(cards, mode));
        return (
          <MenuItem
            sx={{ ...itemStyle, display: 'block' }}
            key={mode}
            disabled={!fits}
            onClick={() => onAction(mode)}
          >
            {tr(label)}
            {!fits && (
              <small style={{ display: 'block' }}>{tr('牌桌空间不足，无法按此方式排列。')}</small>
            )}
          </MenuItem>
        );
      })}
      <Divider />
      <MenuItem sx={itemStyle} onClick={() => onAction('clear')}>
        {tr('取消选择')}
      </MenuItem>
    </Menu>
  );
}
SelectionMenu.propTypes = {
  anchor: PropTypes.object,
  onClose: PropTypes.func.isRequired,
  cards: PropTypes.array.isRequired,
  onAction: PropTypes.func.isRequired,
};
