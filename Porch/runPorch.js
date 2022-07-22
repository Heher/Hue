const { setPorch } = require('../Porch/setPorch');
const { getSunsetTimes } = require('../utils/suntimes');

const sunTimes = getSunsetTimes();

setPorch(sunTimes);