const v3 = require('node-hue-api').v3;

const { findBridgeAndApi } = require('../utils/api');

const LightState = v3.lightStates.LightState;

let api;

// const lightSettings = {
//   day: {
//     bri: 254,
//     xy: [ 0.4586, 0.4104 ]
//   },
//   night: {
//     bri: 242,
//     xy: [ 0.5266, 0.4133 ]
//   }
// };

const setApi = async () => {
  if (!api) {
    api = await findBridgeAndApi();
  }

  return;
};

const lightIsOff = (light) => {
  return !light.data.state.on;
}

const transitionLight = async (light, now, thirtyBefore, sunrise) => {
  await setApi();

  const briStep = 178 / 30;

  const { minutes } = now.diff(thirtyBefore, 'minutes').toObject();

  const newState = new LightState().on().bri(sunrise ? Math.floor(70 - (briStep * minutes)) : Math.floor(briStep * minutes));

  await api.lights.setLightState(light.data.id, newState);
};

const setPorch = async (sunTimes) => {
  await setApi();

  const [ light ] = await api.lights.getLightByName('Porch');
  
  const lightOff = lightIsOff(light);

  const day = sunTimes.now > sunTimes.sunrise.time && sunTimes.now < sunTimes.sunset.thirtyBefore;

  if (day) {
    //* Daytime
    if (lightOff) {
      return;
    }

    //* Turn off light
    const newState = new LightState().off();

    await api.lights.setLightState(light.data.id, newState);
  } else if (sunTimes.now <= sunTimes.sunrise.time && sunTimes.now >= sunTimes.sunrise.thirtyBefore) {
    //* Transition to daytime
    await transitionLight(light, sunTimes.now, sunTimes.sunrise.thirtyBefore, true);
  } else if (sunTimes.now <= sunTimes.sunset.time && sunTimes.now >= sunTimes.sunset.thirtyBefore) {
    //* Transition to nighttime
    await transitionLight(light, sunTimes.now, sunTimes.sunset.thirtyBefore, false);
  } else {
    //* Nighttime

    if (!lightOff) {
      return;
    }

    //* Turn on light
    const newState = new LightState().on().bri(178);

    await api.lights.setLightState(light.data.id, newState);
  }
};

module.exports = { setPorch };
