const calculateHours = require('../src/utils/calculateHours');

test('calculates hours from in/out punches', () => {
  const punches = [
    { type: 'in', time: new Date('2025-11-14T09:00:00Z') },
    { type: 'out', time: new Date('2025-11-14T13:00:00Z') },
    { type: 'in', time: new Date('2025-11-14T14:00:00Z') },
    { type: 'out', time: new Date('2025-11-14T18:00:00Z') }
  ];
  const hours = calculateHours(punches);
  expect(hours).toBe(8);
});
