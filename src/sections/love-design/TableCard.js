import PropTypes from 'prop-types';
import { IconButton } from '@mui/material';
import { tr, useUiLanguage } from '../../locales/translate';
import { domainLabel } from '../../locales/domainLabels';
import { cardById } from './data';

export default function TableCard({
  placement,
  position,
  selected,
  dragging,
  direction,
  openMenu,
  selectCard,
}) {
  useUiLanguage();
  const card = cardById[placement.cardId];
  const text = tr(card.text);
  return (
    <article
      className={`ldt-card ${selected ? 'ldt-selected' : ''} ${dragging ? 'ldt-dragging' : ''}`}
      data-card-id={card.id}
      dir={direction}
      style={{
        left: position.x,
        top: position.y,
        zIndex: placement.zIndex,
        '--card-rotation': `${placement.rotation}deg`,
        '--category': card.color,
      }}
    >
      <button
        type="button"
        className="ldt-card-face"
        aria-label={tr('{{category}}：{{text}}', { category: domainLabel(card.category), text })}
        aria-roledescription={tr('可移动卡片')}
        aria-pressed={selected}
        onClick={(event) => {
          if (event.detail === 0) selectCard(card.id, event.ctrlKey || event.metaKey);
        }}
        onContextMenu={(event) => openMenu(event, card.id)}
        onKeyDown={(event) => {
          if (event.key === 'ContextMenu' || (event.shiftKey && event.key === 'F10'))
            openMenu(event, card.id);
        }}
      >
        <span className="ldt-card-category">
          <i />
          {domainLabel(card.category)}
        </span>
        <span className={`ldt-card-text ${text.length > 100 ? 'ldt-long-text' : ''}`}>
          <span>{text}</span>
        </span>
      </button>
      <div className="ldt-card-footer">
        <span>{tr(card.deckName)}</span>
        <IconButton
          data-card-menu
          aria-label={tr('卡片操作')}
          aria-haspopup="menu"
          onClick={(event) => openMenu(event, card.id)}
          sx={{ minWidth: 44, minHeight: 44 }}
        >
          <span aria-hidden="true">···</span>
        </IconButton>
      </div>
    </article>
  );
}
TableCard.propTypes = {
  placement: PropTypes.object.isRequired,
  position: PropTypes.object.isRequired,
  selected: PropTypes.bool.isRequired,
  dragging: PropTypes.bool.isRequired,
  direction: PropTypes.string.isRequired,
  openMenu: PropTypes.func.isRequired,
  selectCard: PropTypes.func.isRequired,
};
