import { Helmet } from 'react-helmet-async';
import { tr, useUiLanguage } from '../locales/translate';
import LoveDesignTable from '../sections/love-design/LoveDesignTable';

export default function LoveDesignPage() {
  useUiLanguage();
  return (
    <>
      <Helmet>
        <title>{tr('Love Design｜爱情设计卡')}</title>
      </Helmet>
      <LoveDesignTable />
    </>
  );
}
