const select=document.querySelector('[data-maintenance-select]');
select?.addEventListener('change',()=>{for(const panel of document.querySelectorAll('[data-maintenance-panel]'))panel.hidden=panel.dataset.maintenancePanel!==select.value;});
