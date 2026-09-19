import { useEffect, useReducer, useRef, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import { tr, useUiLanguage } from '../../locales/translate';
import { useSettingsContext } from '../../components/settings/SettingsContext';
import LanguagePopover from '../../layouts/dashboard/header/LanguagePopover';
import { deckFilters } from './data';
import {
  activeDeck,
  initialTable,
  readTable,
  saveTable,
  shuffled,
  tableReducer,
  TABLE_WIDTH,
  TABLE_HEIGHT,
  CARD_WIDTH,
  CARD_HEIGHT,
} from './tableState';
import TableCard from './TableCard';
import SelectionMenu from './SelectionMenu';
import useTableGestures from './useTableGestures';
import './table.css';

function loadTable() {
  try {
    return readTable(window.localStorage);
  } catch {
    return { state: initialTable(), issue: 'storage' };
  }
}

export default function LoveDesignTable() {
  useUiLanguage();
  const theme = useTheme();
  const { themeStretch, themeContrast } = useSettingsContext();
  const [restored] = useState(loadTable);
  const [state, dispatch] = useReducer(tableReducer, restored.state);
  const [issue, setIssue] = useState(restored.issue);
  const [confirmation, setConfirmation] = useState(null);
  const [menu, setMenu] = useState(null);
  const viewportRef = useRef(null);
  const [shuffleTurn, setShuffleTurn] = useState(0);
  const interaction = useTableGestures(state.tableCards, viewportRef, dispatch);
  const { selectedIds, setSelectedIds, selectCard, tool, preview, marquee } = interaction;
  const selectedCards = state.tableCards.filter((card) => selectedIds.includes(card.cardId));
  const remaining = activeDeck(state);
  const selected = deckFilters.find((deck) => deck.id === state.selectedDeck);
  const { palette } = theme;

  useEffect(() => {
    try {
      if (!saveTable(window.localStorage, state)) setIssue('storage');
    } catch {
      setIssue('storage');
    }
  }, [state]);

  const draw = () => {
    const viewport = viewportRef.current;
    const offset = (state.tableCards.length % 7) * 18;
    dispatch({
      type: 'DRAW',
      randomValue: Math.random(),
      rotation: Math.random() * 6 - 3,
      x: viewport.scrollLeft + Math.max(24, (viewport.clientWidth - CARD_WIDTH) / 2) + offset,
      y:
        viewport.scrollTop +
        Math.max(viewport.clientWidth < 600 ? 176 : 24, (viewport.clientHeight - CARD_HEIGHT) / 2) +
        offset,
    });
  };
  const shuffle = () => {
    dispatch({ type: 'SHUFFLE', order: shuffled(remaining) });
    setShuffleTurn((value) => value + 1);
  };
  const confirm = () => {
    dispatch(
      confirmation === 'selected'
        ? { type: 'RETURN_MANY', cardIds: selectedIds }
        : { type: confirmation === 'reset' ? 'RESET' : 'COLLECT' }
    );
    setSelectedIds([]);
    if (confirmation === 'reset') {
      viewportRef.current.scrollLeft = 0;
      viewportRef.current.scrollTop = 0;
      setIssue(null);
    }
    setConfirmation(null);
  };
  const openMenu = (event, cardId) => {
    event.preventDefault();
    event.stopPropagation();
    if (cardId) selectCard(cardId);
    const rect = event.currentTarget.getBoundingClientRect();
    setMenu({ left: event.clientX || rect.left, top: event.clientY || rect.bottom });
  };
  const menuAction = (action) => {
    setMenu(null);
    if (action === 'return') setConfirmation('selected');
    else if (action === 'clear') setSelectedIds([]);
    else
      dispatch({
        type: { front: 'FRONT_MANY', back: 'BACK_MANY' }[action] || 'LAYOUT',
        cardIds: selectedIds,
        layout: action,
      });
  };

  return (
    <Box
      className="love-table"
      dir={theme.direction}
      sx={{
        fontFamily: theme.typography.fontFamily,
        width: '100%',
        maxWidth: { xl: themeStretch ? 'none' : theme.breakpoints.values.xl },
        mx: 'auto',
      }}
      style={{
        '--ldt-bg': palette.background.default,
        '--ldt-paper': palette.background.paper,
        '--ldt-text': palette.text.primary,
        '--ldt-muted': palette.text.secondary,
        '--ldt-primary': palette.primary.main,
        '--ldt-primary-text':
          palette.mode === 'dark' ? palette.primary.light : palette.primary.dark,
        '--ldt-tint': alpha(palette.primary.main, palette.mode === 'dark' ? 0.24 : 0.12),
        '--ldt-border': themeContrast === 'bold' ? palette.text.secondary : palette.divider,
        '--ldt-table': palette.background.neutral || palette.background.default,
        '--ldt-dot': alpha(palette.text.primary, themeContrast === 'bold' ? 0.18 : 0.07),
        '--ldt-shadow': alpha(palette.common.black, palette.mode === 'dark' ? 0.45 : 0.16),
        '--ldt-selection': alpha(palette.primary.main, 0.2),
      }}
    >
      <header className="ldt-header">
        <div className="ldt-brand">
          <span aria-hidden="true">✳</span>
          <h1>
            {tr('爱情设计卡')}
            <small>Love Design</small>
          </h1>
        </div>
        <LanguagePopover />
      </header>
      <div className="ldt-toolbar">
        <ToggleButtonGroup
          className="ldt-filters"
          exclusive
          value={state.selectedDeck}
          aria-label={tr('牌堆筛选')}
          onChange={(_, deckId) => {
            if (deckId) dispatch({ type: 'FILTER', deckId });
          }}
        >
          {deckFilters.map((deck) => (
            <ToggleButton key={deck.id} value={deck.id}>
              <span>{tr(deck.name)}</span>
              <span className="ldt-filter-count">{deck.count}</span>
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
        <ToggleButtonGroup
          className="ldt-tools"
          exclusive
          value={tool}
          aria-label={tr('牌桌工具')}
          onChange={(_, value) => {
            if (value) interaction.setTool(value);
          }}
        >
          <ToggleButton value="select">{tr('选择')}</ToggleButton>
          <ToggleButton value="pan">{tr('平移')}</ToggleButton>
        </ToggleButtonGroup>
        <ToggleButtonGroup
          className="ldt-draw-mode"
          exclusive
          size="small"
          value={state.drawMode}
          aria-label={tr('抽牌方式')}
          onChange={(_, mode) => {
            if (mode) dispatch({ type: 'DRAW_MODE', mode });
          }}
          sx={{ flexShrink: 0 }}
        >
          <ToggleButton value="random">{tr('随机抽牌')}</ToggleButton>
          <ToggleButton value="sequential">{tr('按顺序抽牌')}</ToggleButton>
        </ToggleButtonGroup>
        <div className="ldt-table-actions">
          <Button onClick={shuffle} disabled={remaining.length < 2}>
            {tr('洗牌')}
          </Button>
          <Button onClick={() => setConfirmation('collect')} disabled={!state.tableCards.length}>
            {tr('全部收回')}
          </Button>
          <Button onClick={() => setConfirmation('reset')}>{tr('重置')}</Button>
        </div>
      </div>
      {selectedIds.length > 0 && (
        <div className="ldt-selection-bar">
          <span role="status">{tr('已选择 {{count}} 张', { count: selectedIds.length })}</span>
          <Button
            aria-haspopup="menu"
            aria-expanded={Boolean(menu)}
            onClick={(event) => openMenu(event)}
          >
            {tr('选中卡片操作')}
          </Button>
          <Button onClick={() => setSelectedIds([])}>{tr('取消选择')}</Button>
        </div>
      )}
      {issue && (
        <Alert
          className="ldt-alert"
          severity="warning"
          onClose={() => setIssue(null)}
          closeText={tr('关闭')}
        >
          {issue === 'invalid'
            ? tr('保存的牌桌无法恢复，已打开空牌桌。')
            : tr('浏览器无法保存牌桌，刷新后可能丢失位置。')}
        </Alert>
      )}
      <main className="ldt-surface">
        {/* eslint-disable jsx-a11y/no-noninteractive-tabindex, jsx-a11y/no-noninteractive-element-interactions -- The scroll region provides scoped canvas keyboard commands. */}
        <div
          className={`ldt-viewport ldt-tool-${tool} ${interaction.active ? 'ldt-interacting' : ''}`}
          dir="ltr"
          ref={viewportRef}
          tabIndex={0}
          role="region"
          aria-label={tr('牌桌')}
          onKeyDown={interaction.onKeyDown}
        >
          {/* eslint-enable jsx-a11y/no-noninteractive-tabindex, jsx-a11y/no-noninteractive-element-interactions */}
          <div
            className="ldt-workspace"
            style={{ width: TABLE_WIDTH, height: TABLE_HEIGHT }}
            {...interaction.handlers}
            onContextMenu={(event) => {
              const id = event.target.closest('[data-card-id]')?.dataset.cardId;
              if (id) openMenu(event, id);
            }}
          >
            {state.tableCards.map((placement) => (
              <TableCard
                key={placement.cardId}
                placement={placement}
                position={preview?.[placement.cardId] || placement}
                selected={selectedIds.includes(placement.cardId)}
                dragging={Boolean(preview?.[placement.cardId])}
                direction={theme.direction}
                selectCard={selectCard}
                openMenu={openMenu}
              />
            ))}
            {marquee && (
              <div
                className="ldt-marquee"
                aria-hidden="true"
                style={{
                  left: marquee.left,
                  top: marquee.top,
                  width: marquee.right - marquee.left,
                  height: marquee.bottom - marquee.top,
                }}
              />
            )}
          </div>
        </div>
        <div className="ldt-pile-dock">
          <button
            type="button"
            className="ldt-pile"
            key={shuffleTurn}
            onClick={draw}
            disabled={!remaining.length}
            aria-label={tr('从{{deck}}抽一张，剩余 {{count}} 张', {
              deck: tr(selected.name),
              count: remaining.length,
            })}
          >
            <span className="ldt-pile-type">{tr(selected.name)}</span>
            <span className="ldt-pile-symbol" aria-hidden="true">
              ✳
            </span>
            <span className="ldt-pile-count" aria-live="polite">
              {tr('{{count}} 张', { count: remaining.length })}
            </span>
          </button>
        </div>
      </main>
      <SelectionMenu
        anchor={menu}
        onClose={() => setMenu(null)}
        cards={selectedCards}
        onAction={menuAction}
      />
      <Dialog
        open={Boolean(confirmation)}
        onClose={() => setConfirmation(null)}
        aria-labelledby="ldt-confirm-title"
        sx={{ '& .MuiButton-root': { minHeight: 44 } }}
      >
        <DialogTitle id="ldt-confirm-title">
          {confirmation === 'reset' && tr('重置牌桌？')}
          {confirmation === 'selected' &&
            tr('收回选中的 {{count}} 张卡片？', { count: selectedIds.length })}
          {confirmation === 'collect' && tr('全部收回？')}
        </DialogTitle>
        <DialogContent>
          {confirmation === 'reset' && tr('清空牌桌并恢复初始牌序。')}
          {confirmation === 'selected' &&
            tr('仅将选中的 {{count}} 张卡片放回各自牌堆。', { count: selectedIds.length })}
          {confirmation === 'collect' &&
            tr('将桌上的 {{count}} 张卡片放回各自牌堆。', { count: state.tableCards.length })}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmation(null)}>{tr('取消')}</Button>
          <Button onClick={confirm} variant="contained">
            {tr('确认')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
