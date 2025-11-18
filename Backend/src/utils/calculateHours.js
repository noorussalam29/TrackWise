// calculate total hours (decimal) from punches array [{type:'in'|'out', time:Date}]
module.exports = function calculateHours(punches = []) {
  if (!Array.isArray(punches) || punches.length === 0) return 0;
  let totalMs = 0;
  for (let i = 0; i < punches.length; i++) {
    const p = punches[i];
    if (p.type === 'in') {
      const next = punches[i+1];
      if (next && next.type === 'out') {
        totalMs += new Date(next.time) - new Date(p.time);
      }
    }
  }
  const hours = totalMs / (1000 * 60 * 60);
  return Math.round(hours * 100) / 100; // two decimals
};
