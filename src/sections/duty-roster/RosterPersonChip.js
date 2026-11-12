import { useState } from 'react';
import PropTypes from 'prop-types';
import { Alert, Box, Button, Stack, Typography } from '@mui/material';
import { tr, useUiLanguage } from '../../locales/translate';
import { swapIssueText } from './PersonSwapDialog';

export default function RosterPersonChip({
  shiftId,
  personId,
  name,
  drag,
  blocked = false,
  onChoose,
}) {
  useUiLanguage();
  const [over, setOver] = useState(false);
  const target =
    over && drag.session ? drag.inspect(shiftId, personId) : { status: 'none', issues: [] };
  const source =
    drag.session?.scope === drag.scope &&
    drag.session?.shiftId === shiftId &&
    drag.session?.personId === personId;
  const colors = { valid: 'success', warning: 'warning', invalid: 'error' };
  const color = colors[target.status];
  const hint = target.issues.length
    ? tr(target.issues[0].reason)
    : tr('Drag onto another person to swap, or click to choose a shift.');
  return (
    <Stack direction="row" alignItems="center" sx={{ minWidth: 0 }}>
      <Button
        type="button"
        size="small"
        disabled={blocked}
        draggable={drag.enabled}
        data-roster-person={`${shiftId}:${personId}`}
        title={drag.enabled ? hint : tr('Click to swap this person.')}
        onMouseDownCapture={(event) => event.stopPropagation()}
        onPointerDownCapture={(event) => event.stopPropagation()}
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          if (!drag.suppressClick(event)) {
            if (shiftId && drag.edit)
              drag.edit({ sourceShiftId: shiftId, sourcePersonId: personId });
            else onChoose();
          }
        }}
        onDragStart={(event) => {
          event.stopPropagation();
          drag.start(event, shiftId, personId);
        }}
        onDragEnd={(event) => {
          event.stopPropagation();
          setOver(false);
          drag.cancel();
        }}
        onDragEnter={(event) => {
          event.preventDefault();
          event.stopPropagation();
          setOver(true);
          drag.hover(shiftId, personId);
        }}
        onDragLeave={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget)) {
            setOver(false);
            drag.clearHover();
          }
        }}
        onDragOver={(event) => {
          if (drag.session) {
            event.preventDefault();
            event.stopPropagation();
            event.dataTransfer.dropEffect = 'move';
          }
        }}
        onDrop={(event) => {
          setOver(false);
          drag.clearHover();
          drag.drop(event, shiftId, personId);
        }}
        sx={{
          width: '100%',
          minWidth: 0,
          justifyContent: 'flex-start',
          textAlign: 'left',
          overflowWrap: 'anywhere',
          whiteSpace: 'normal',
          textTransform: 'none',
          lineHeight: 1.3,
          fontSize: 'inherit',
          px: 0.5,
          cursor: drag.enabled ? 'grab' : 'pointer',
          opacity: source ? 0.45 : 1,
          border: '1px solid',
          borderColor: color ? `${color}.main` : 'transparent',
          bgcolor: color ? `${color}.light` : 'transparent',
          '&:active': { cursor: drag.enabled ? 'grabbing' : 'pointer' },
        }}
      >
        {drag.enabled && (
          <Box component="span" aria-hidden="true" sx={{ mr: 0.5, pointerEvents: 'none' }}>
            ⠿
          </Box>
        )}
        {name}
      </Button>
      {shiftId && drag.apply && (
        <Button
          size="small"
          aria-label={tr('Remove person {{person}}', { person: name })}
          sx={{ minWidth: 28, px: 0.5 }}
          onMouseDownCapture={(event) => event.stopPropagation()}
          onPointerDownCapture={(event) => event.stopPropagation()}
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            drag.apply({ kind: 'remove', sourceShiftId: shiftId, sourcePersonId: personId });
          }}
        >
          &times;
        </Button>
      )}
    </Stack>
  );
}

export function DragSwapFeedback({ drag, knownPeople }) {
  useUiLanguage();
  const hoverColor = { valid: 'success', warning: 'warning', invalid: 'error' };
  return (
    <Stack spacing={1} role="status" aria-live="polite" sx={{ minWidth: 0 }}>
      {drag.hoverFeedback && (
        <Alert
          severity={hoverColor[drag.hoverFeedback.status] || 'info'}
          sx={{
            position: 'fixed',
            bottom: 16,
            left: 16,
            maxWidth: 'min(640px, calc(100vw - 32px))',
            zIndex: 1500,
            pointerEvents: 'none',
          }}
        >
          {drag.hoverFeedback.status === 'valid'
            ? tr('Release to update this assignment.')
            : drag.hoverFeedback.issues.map((item) => (
                <Typography key={item.id} variant="body2" sx={{ overflowWrap: 'anywhere' }}>
                  {swapIssueText(item, knownPeople)}
                </Typography>
              ))}
        </Alert>
      )}
      {drag.feedback && (
        <Alert severity={drag.feedback.severity} onClose={drag.dismissFeedback}>
          {drag.feedback.issues.map((item, index) => (
            <Typography
              key={`${item.id}:${index}`}
              variant="body2"
              sx={{ overflowWrap: 'anywhere' }}
            >
              {swapIssueText(item, knownPeople)}
            </Typography>
          ))}
        </Alert>
      )}
      {drag.hasUndo && (
        <Alert
          severity={drag.canUndo ? 'info' : 'warning'}
          action={
            <Button color="inherit" disabled={!drag.canUndo} onClick={drag.undo}>
              {tr('Undo manual change')}
            </Button>
          }
        >
          {drag.canUndo
            ? tr('The last manual change can be undone.')
            : tr('The affected assignments changed. This operation can no longer be undone.')}
        </Alert>
      )}
    </Stack>
  );
}

RosterPersonChip.propTypes = {
  shiftId: PropTypes.string.isRequired,
  personId: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  drag: PropTypes.object.isRequired,
  blocked: PropTypes.bool,
  onChoose: PropTypes.func.isRequired,
};
DragSwapFeedback.propTypes = {
  drag: PropTypes.object.isRequired,
  knownPeople: PropTypes.object.isRequired,
};
