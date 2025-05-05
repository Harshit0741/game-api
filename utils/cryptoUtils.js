function getCrashPoint() {
    const maxCrash = 100;
    const seed = Math.random();
    return +(1 + seed * (maxCrash - 1)).toFixed(2);
  }
  
  module.exports = { getCrashPoint };
  