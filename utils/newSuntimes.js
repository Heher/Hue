const SunCalc = require('suncalc');
const { DateTime } = require('luxon');
const dotenv = require('dotenv');

dotenv.config({ path: '/home/pi/Hue/.env' });

const getSunsetTimes = () => {
  const sunTimes = SunCalc.getTimes(new Date(), process.env.SUNSET_LAT, process.env.SUNSET_LONG);
  const sunriseTime = DateTime.fromJSDate(sunTimes.sunrise);
  const sunsetTime = DateTime.fromJSDate(sunTimes.sunset);
  const sunriseThirtyBefore = sunriseTime.minus({minutes: 30});
  const sunsetThirtyBefore = sunsetTime.minus({minutes: 30});

  const now = DateTime.local();

  return {
    sunrise: {
      time: sunriseTime,
      thirtyBefore: sunriseTime.minus({minutes: 30})
    },
    sunset: {
      time: sunsetTime,
      thirtyBefore: sunsetTime.minus({minutes: 30})
    },
    now
  };
};

module.exports = { getSunsetTimes };