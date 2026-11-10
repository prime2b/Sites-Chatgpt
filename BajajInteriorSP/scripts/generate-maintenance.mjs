import {writeFile} from 'node:fs/promises';
import {initialState} from '../lib/maintenance-domain.mjs';
import {tablesMarkup} from '../lib/maintenance-view.mjs';
await writeFile(new URL('../sections/maintenance.html',import.meta.url),tablesMarkup(initialState()));
