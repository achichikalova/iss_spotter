//It will contain most of the logic for fetching the data from each API endpoint.
/**
 * Makes a single API request to retrieve the user's IP address.
 * Input:
 *   - A callback (to pass back an error or the IP string)
 * Returns (via Callback):
 *   - An error, if any (nullable)
 *   - The IP address as a string (null if error). Example: "162.245.144.188"
 */
const request = require('request');

const fetchMyIP = (callback) => {
  // use request to fetch IP address from JSON API
  const domain = 'https://api.ipify.org?format=json';

  request(domain, (error, response, body) => {
    // error can be set if invalid domain, user is offline, etc.
    if (error) {
      return callback(error, null);
    }
    // if non-200 status, assume server error
    if (response.statusCode !== 200) {
      const err = `Status Code ${response.statusCode} when fetching IP. Response: ${body}`;
      callback(Error(err), null);
      return;
    }
    const ip = JSON.parse(body).ip;
    callback(null, ip);
  
  });
};

const fetchCoordsByIP = (ip, callback) => {
  const domain = `https://freegeoip.app/json/${ip}`;

  request(domain, (error, response, body) => {
    // error can be set if invalid domain, user is offline, etc.
    if (error) {
      callback(error, null);
      return;
    }
    // if non-200 status, assume server error
    if (response.statusCode !== 200) {
      const err = `Status Code ${response.statusCode} when fetching coordinates for IP. Response: ${body}`;
      callback(Error(err), null);
      return;
    }
    //getting coordinates
    const { latitude, longitude } = JSON.parse(body);

    callback(null, { latitude, longitude });
  
  });

};

const fetchISSFlyOverTimes = (coords, callback) => {
  const domain = `https://iss-pass.herokuapp.com/json/?lat=${coords.latitude}&lon=${coords.longitude}`;

  request(domain, (error, response, body) => {
    // error can be set if invalid domain, user is offline, etc.
    if (error) {
      callback(error, null);
      return;
    }
    // if non-200 status, assume server error
    if (response.statusCode !== 200) {
      const err = `Status Code ${response.statusCode} when fetching coordinates for IP. Response: ${body}`;
      callback(Error(err), null);
      return;
    }
    //getting coordinates
    const passes = JSON.parse(body).response;

    callback(null, passes);
  
  });
};

const nextISSTimesForMyLocation = (callback) => {
  fetchMyIP((error, ip) => {
    if (error) {
      return callback(error, null);
    }
    fetchCoordsByIP(ip, (error, coords) => {
      if (error) {
        return callback(error, null);
      }
      fetchISSFlyOverTimes(coords, (error, nextPasses) => {
        if (error) {
          return callback(error, null);
        }
        callback(null, nextPasses);
      });
    });
  });
};

module.exports = { nextISSTimesForMyLocation };