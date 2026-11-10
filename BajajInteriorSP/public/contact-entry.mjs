import {initContactCapture} from './contact-capture.mjs';
fetch('/data.json').then(r=>r.ok?r.json():Promise.reject()).then(data=>initContactCapture(data)).catch(()=>{});
