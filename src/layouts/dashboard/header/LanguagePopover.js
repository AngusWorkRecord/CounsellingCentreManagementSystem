import { ToggleButton, ToggleButtonGroup } from '@mui/material';
import { useLocales } from '../../../locales';

export default function LanguagePopover() {
  const { currentLang, onChangeLang } = useLocales();
  return (
    <ToggleButtonGroup size="small" exclusive value={currentLang.value}
      aria-label="华文 / English"
      onChange={(_, language) => { if (language) onChangeLang(language); }}
      sx={{ flexShrink: 0, bgcolor: 'background.paper', '& .MuiToggleButton-root': { px: 1, textTransform: 'none', whiteSpace: 'nowrap' } }}>
      <ToggleButton value="cn" lang="zh-CN">华文</ToggleButton>
      <ToggleButton value="en" lang="en">English</ToggleButton>
    </ToggleButtonGroup>
  );
}
