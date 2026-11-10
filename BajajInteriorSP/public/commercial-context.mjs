// Public commercial context only. No personal data or contact submission.
export function financeContext(data, search = '', savedUnit = '') {
  const params = new URLSearchParams(search);
  const model = params.get('modelo') || '';
  const unit = params.get('unidade') || savedUnit;
  return {
    model: data.models.some(item => item.id === model) ? model : '',
    unit: data.units.some(item => item.id === unit) ? unit :
      data.units.some(item => item.id === savedUnit) ? savedUnit : ''
  };
}
export function simulationPath(data, model = '', unit = '') {
  const params = new URLSearchParams();
  if (data.models.some(item => item.id === model)) params.set('modelo', model);
  if (data.units.some(item => item.id === unit)) params.set('unidade', unit);
  return '/financiamento/' + (params.size ? '?' + params.toString() : '') + '#simulacao';
}
