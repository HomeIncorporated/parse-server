"use strict";

/*
 * This auth adapter is based on the OAuth 2.0 Token Introspection specification.
 * See RFC 7662 for details (https://tools.ietf.org/html/rfc7662).
 * It's purpose is to validate OAuth2 access tokens using the OAuth2 provider's
 * token introspection endpoint (if implemented by the provider).
 *
 * The adapter accepts the following config parameters:
 *
 * 1. "tokenIntrospectionEndpointUrl" (string, required)
 *      The URL of the token introspection endpoint of the OAuth2 provider that
 *      issued the access token to the client that is to be validated.
 *
 * 2. "useridField" (string, optional)
 *      The name of the field in the token introspection response that contains
 *      the userid. If specified, it will be used to verify the value of the "id"
 *      field in the "authData" JSON that is coming from the client.
 *      This can be the "aud" (i.e. audience), the "sub" (i.e. subject) or the
 *      "username" field in the introspection response, but since only the
 *      "active" field is required and all other reponse fields are optional
 *      in the RFC, it has to be optional in this adapter as well.
 *      Default: - (undefined)
 *
 * 3. "appidField" (string, optional)
 *      The name of the field in the token introspection response that contains
 *      the appId of the client. If specified, it will be used to verify it's
 *      value against the set of appIds in the adapter config. The concept of
 *      appIds comes from the two major social login providers
 *      (Google and Facebook). They have not yet implemented the token
 *      introspection endpoint, but the concept can be valid for any OAuth2
 *      provider.
 *      Default: - (undefined)
 *
 * 4. "appIds" (array of strings, required if appidField is defined)
 *      A set of appIds that are used to restrict accepted access tokens based
 *      on a specific field's value in the token introspection response.
 *      Default: - (undefined)
 *
 * 5. "authorizationHeader" (string, optional)
 *      The value of the "Authorization" HTTP header in requests sent to the
 *      introspection endpoint. It must contain the raw value.
 *      Thus if HTTP Basic authorization is to be used, it must contain the
 *      "Basic" string, followed by whitespace, then by the base64 encoded
 *      version of the concatenated <username> + ":" + <password> string.
 *      Eg. "Basic dXNlcm5hbWU6cGFzc3dvcmQ="
 *
 * The adapter expects requests with the following authData JSON:
 *
 * {
 *   "someadapter": {
 *     "id": "user's OAuth2 provider-specific id as a string",
 *     "access_token": "an authorized OAuth2 access token for the user",
 *   }
 * }
 */
const Parse = require('parse/node').Parse;

const url = require('url');

const querystring = require('querystring');

const httpsRequest = require('./httpsRequest');

const INVALID_ACCESS = 'OAuth2 access token is invalid for this user.';
const INVALID_ACCESS_APPID = "OAuth2: the access_token's appID is empty or is not in the list of permitted appIDs in the auth configuration.";
const MISSING_APPIDS = 'OAuth2 configuration is missing the client app IDs ("appIds" config parameter).';
const MISSING_URL = 'OAuth2 token introspection endpoint URL is missing from configuration!'; // Returns a promise that fulfills if this user id is valid.

function validateAuthData(authData, options) {
  return requestTokenInfo(options, authData.access_token).then(response => {
    if (!response || !response.active || options.useridField && authData.id !== response[options.useridField]) {
      throw new Parse.Error(Parse.Error.OBJECT_NOT_FOUND, INVALID_ACCESS);
    }
  });
}

function validateAppId(appIds, authData, options) {
  if (!options || !options.appidField) {
    return Promise.resolve();
  }

  if (!appIds || appIds.length === 0) {
    throw new Parse.Error(Parse.Error.OBJECT_NOT_FOUND, MISSING_APPIDS);
  }

  return requestTokenInfo(options, authData.access_token).then(response => {
    if (!response || !response.active) {
      throw new Parse.Error(Parse.Error.OBJECT_NOT_FOUND, INVALID_ACCESS);
    }

    const appidField = options.appidField;

    if (!response[appidField]) {
      throw new Parse.Error(Parse.Error.OBJECT_NOT_FOUND, INVALID_ACCESS_APPID);
    }

    const responseValue = response[appidField];

    if (!Array.isArray(responseValue) && appIds.includes(responseValue)) {
      return;
    } else if (Array.isArray(responseValue) && responseValue.some(appId => appIds.includes(appId))) {
      return;
    } else {
      throw new Parse.Error(Parse.Error.OBJECT_NOT_FOUND, INVALID_ACCESS_APPID);
    }
  });
} // A promise wrapper for requests to the OAuth2 token introspection endpoint.


function requestTokenInfo(options, access_token) {
  if (!options || !options.tokenIntrospectionEndpointUrl) {
    throw new Parse.Error(Parse.Error.OBJECT_NOT_FOUND, MISSING_URL);
  }

  const parsedUrl = url.parse(options.tokenIntrospectionEndpointUrl);
  const postData = querystring.stringify({
    token: access_token
  });
  const headers = {
    'Content-Type': 'application/x-www-form-urlencoded',
    'Content-Length': Buffer.byteLength(postData)
  };

  if (options.authorizationHeader) {
    headers['Authorization'] = options.authorizationHeader;
  }

  const postOptions = {
    hostname: parsedUrl.hostname,
    path: parsedUrl.pathname,
    method: 'POST',
    headers: headers
  };
  return httpsRequest.request(postOptions, postData);
}

module.exports = {
  validateAppId: validateAppId,
  validateAuthData: validateAuthData
};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9BZGFwdGVycy9BdXRoL29hdXRoMi5qcyJdLCJuYW1lcyI6WyJQYXJzZSIsInJlcXVpcmUiLCJ1cmwiLCJxdWVyeXN0cmluZyIsImh0dHBzUmVxdWVzdCIsIklOVkFMSURfQUNDRVNTIiwiSU5WQUxJRF9BQ0NFU1NfQVBQSUQiLCJNSVNTSU5HX0FQUElEUyIsIk1JU1NJTkdfVVJMIiwidmFsaWRhdGVBdXRoRGF0YSIsImF1dGhEYXRhIiwib3B0aW9ucyIsInJlcXVlc3RUb2tlbkluZm8iLCJhY2Nlc3NfdG9rZW4iLCJ0aGVuIiwicmVzcG9uc2UiLCJhY3RpdmUiLCJ1c2VyaWRGaWVsZCIsImlkIiwiRXJyb3IiLCJPQkpFQ1RfTk9UX0ZPVU5EIiwidmFsaWRhdGVBcHBJZCIsImFwcElkcyIsImFwcGlkRmllbGQiLCJQcm9taXNlIiwicmVzb2x2ZSIsImxlbmd0aCIsInJlc3BvbnNlVmFsdWUiLCJBcnJheSIsImlzQXJyYXkiLCJpbmNsdWRlcyIsInNvbWUiLCJhcHBJZCIsInRva2VuSW50cm9zcGVjdGlvbkVuZHBvaW50VXJsIiwicGFyc2VkVXJsIiwicGFyc2UiLCJwb3N0RGF0YSIsInN0cmluZ2lmeSIsInRva2VuIiwiaGVhZGVycyIsIkJ1ZmZlciIsImJ5dGVMZW5ndGgiLCJhdXRob3JpemF0aW9uSGVhZGVyIiwicG9zdE9wdGlvbnMiLCJob3N0bmFtZSIsInBhdGgiLCJwYXRobmFtZSIsIm1ldGhvZCIsInJlcXVlc3QiLCJtb2R1bGUiLCJleHBvcnRzIl0sIm1hcHBpbmdzIjoiOztBQUFBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUF1REEsTUFBTUEsS0FBSyxHQUFHQyxPQUFPLENBQUMsWUFBRCxDQUFQLENBQXNCRCxLQUFwQzs7QUFDQSxNQUFNRSxHQUFHLEdBQUdELE9BQU8sQ0FBQyxLQUFELENBQW5COztBQUNBLE1BQU1FLFdBQVcsR0FBR0YsT0FBTyxDQUFDLGFBQUQs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QUQsSUFBWSxDQUFDQSxPQUFPLENBQUNzQiw2QkFBekIsRUFBd0Q7QUFDdEQsVUFBTSxJQUFJakMsS0FBSyxDQUFDbUIsS0FBVixDQUFnQm5CLEtBQUssQ0FBQ21CLEtBQU4sQ0FBWUMsZ0JBQTVCLEVBQThDWixXQUE5QyxDQUFOO0FBQ0Q7O0FBQ0QsUUFBTTBCLFNBQVMsR0FBR2hDLEdBQUcsQ0FBQ2lDLEtBQUosQ0FBVXhCLE9BQU8sQ0FBQ3NCLDZCQUFsQixDQUFsQjtBQUNBLFFBQU1HLFFBQVEsR0FBR2pDLFdBQVcsQ0FBQ2tDLFNBQVosQ0FBc0I7QUFDckNDLElBQUFBLEtBQUssRUFBRXpCO0FBRDhCLEdBQXRCLENBQWpCO0FBR0EsUUFBTTBCLE9BQU8sR0FBRztBQUNkLG9CQUFnQixtQ0FERjtBQUVkLHNCQUFrQkMsTUFBTSxDQUFDQyxVQUFQLENBQWtCTCxRQUFsQjtBQUZKLEdBQWhCOztBQUlBLE1BQUl6QixPQUFPLENBQUMrQixtQkFBWixFQUFpQztBQUMvQkgsSUFBQUEsT0FBTyxDQUFDLGVBQUQsQ0FBUCxHQUEyQjVCLE9BQU8sQ0FBQytCLG1CQUFuQztBQUNEOztBQUNELFFBQU1DLFdBQVcsR0FBRztBQUNsQkMsSUFBQUEsUUFBUSxFQUFFVixTQUFTLENBQUNVLFFBREY7QUFFbEJDLElBQUFBLElBQUksRUFBRVgsU0FBUyxDQUFDWSxRQUZFO0FBR2xCQyxJQUFBQSxNQUFNLEVBQUUsTUFIVTtBQUlsQlIsSUFBQUEsT0FBTyxFQUFFQTtBQUpTLEdBQXBCO0FBTUEsU0FBT25DLFlBQVksQ0FBQzRDLE9BQWIsQ0FBcUJMLFdBQXJCLEVBQWtDUCxRQUFsQyxDQUFQO0FBQ0Q7O0FBRURhLE1BQU0sQ0FBQ0MsT0FBUCxHQUFpQjtBQUNmN0IsRUFBQUEsYUFBYSxFQUFFQSxhQURBO0FBRWZaLEVBQUFBLGdCQUFnQixFQUFFQTtBQUZILENBQWpCIiwic291cmNlc0NvbnRlbnQiOlsiLypcbiAqIFRoaXMgYXV0aCBhZGFwdGVyIGlzIGJhc2VkIG9uIHRoZSBPQXV0aCAyLjAgVG9rZW4gSW50cm9zcGVjdGlvbiBzcGVjaWZpY2F0aW9uLlxuICogU2VlIFJGQyA3NjYyIGZvciBkZXRhaWxzIChodHRwczovL3Rvb2xzLmlldGYub3JnL2h0bWwvcmZjNzY2MikuXG4gKiBJdCdzIHB1cnBvc2UgaXMgdG8gdmFsaWRhdGUgT0F1dGgyIGFjY2VzcyB0b2tlbnMgdXNpbmcgdGhlIE9BdXRoMiBwcm92aWRlcidzXG4gKiB0b2tlbiBpbnRyb3NwZWN0aW9uIGVuZHBvaW50IChpZiBpbXBsZW1lbnRlZCBieSB0aGUgcHJvdmlkZXIpLlxuICpcbiAqIFRoZSBhZGFwdGVyIGFjY2VwdHMgdGhlIGZvbGxvd2luZyBjb25maWcgcGFyYW1ldGVyczpcbiAqXG4gKiAxLiBcInRva2VuSW50cm9zcGVjdGlvbkVuZHBvaW50VXJsXCIgKHN0cmluZywgcmVxdWlyZWQpXG4gKiAgICAgIFRoZSBVUkwgb2YgdGhlIHRva2VuIGludHJvc3BlY3Rpb24gZW5kcG9pbnQgb2YgdGhlIE9BdXRoMiBwcm92aWRlciB0aGF0XG4gKiAgICAgIGlzc3VlZCB0aGUgYWNjZXNzIHRva2VuIHRvIHRoZSBjbGllbnQgdGhhdCBpcyB0byBiZSB2YWxpZGF0ZWQuXG4gKlxuICogMi4gXCJ1c2VyaWRGaWVsZFwiIChzdHJpbmcsIG9wdGlvbmFsKVxuICogICAgICBUaGUgbmFtZSBvZiB0aGUgZmllbGQgaW4gdGhlIHRva2VuIGludHJvc3BlY3Rpb24gcmVzcG9uc2UgdGhhdCBjb250YWluc1xuICogICAgICB0aGUgdXNlcmlkLiBJZiBzcGVjaWZpZWQsIGl0IHdpbGwgYmUgdXNlZCB0byB2ZXJpZnkgdGhlIHZhbHVlIG9mIHRoZSBcImlkXCJcbiAqICAgICAgZmllbGQgaW4gdGhlIFwiYXV0aERhdGFcIiBKU09OIHRoYXQgaXMgY29taW5nIGZyb20gdGhlIGNsaWVudC5cbiAqICAgICAgVGhpcyBjYW4gYmUgdGhlIFwiYXVkXCIgKGkuZS4gYXVkaWVuY2UpLCB0aGUgXCJzdWJcIiAoaS5lLiBzdWJqZWN0KSBvciB0aGVcbiAqICAgICAgXCJ1c2VybmFtZVwiIGZpZWxkIGluIHRoZSBpbnRyb3NwZWN0aW9uIHJlc3BvbnNlLCBidXQgc2luY2Ugb25seSB0aGVcbiAqICAgICAgXCJhY3RpdmVcIiBmaWVsZCBpcyByZXF1aXJlZCBhbmQgYWxsIG90aGVyIHJlcG9uc2UgZmllbGRzIGFyZSBvcHRpb25hbFxuICogICAgICBpbiB0aGUgUkZDLCBpdCBoYXMgdG8gYmUgb3B0aW9uYWwgaW4gdGhpcyBhZGFwdGVyIGFzIHdlbGwuXG4gKiAgICAgIERlZmF1bHQ6IC0gKHVuZGVmaW5lZClcbiAqXG4gKiAzLiBcImFwcGlkRmllbGRcIiAoc3RyaW5nLCBvcHRpb25hbClcbiAqICAgICAgVGhlIG5hbWUgb2YgdGhlIGZpZWxkIGluIHRoZSB0b2tlbiBpbnRyb3NwZWN0aW9uIHJlc3BvbnNlIHRoYXQgY29udGFpbnNcbiAqICAgICAgdGhlIGFwcElkIG9mIHRoZSBjbGllbnQuIElmIHNwZWNpZmllZCwgaXQgd2lsbCBiZSB1c2VkIHRvIHZlcmlmeSBpdCdzXG4gKiAgICAgIHZhbHVlIGFnYWluc3QgdGhlIHNldCBvZiBhcHBJZHMgaW4gdGhlIGFkYXB0ZXIgY29uZmlnLiBUaGUgY29uY2VwdCBvZlxuICogICAgICBhcHBJZHMgY29tZXMgZnJvbSB0aGUgdHdvIG1ham9yIHNvY2lhbCBsb2dpbiBwcm92aWRlcnNcbiAqICAgICAgKEdvb2dsZSBhbmQgRmFjZWJvb2spLiBUaGV5IGhhdmUgbm90IHlldCBpbXBsZW1lbnRlZCB0aGUgdG9rZW5cbiAqICAgICAgaW50cm9zcGVjdGlvbiBlbmRwb2ludCwgYnV0IHRoZSBjb25jZXB0IGNhbiBiZSB2YWxpZCBmb3IgYW55IE9BdXRoMlxuICogICAgICBwcm92aWRlci5cbiAqICAgICAgRGVmYXVsdDogLSAodW5kZWZpbmVkKVxuICpcbiAqIDQuIFwiYXBwSWRzXCIgKGFycmF5IG9mIHN0cmluZ3MsIHJlcXVpcmVkIGlmIGFwcGlkRmllbGQgaXMgZGVmaW5lZClcbiAqICAgICAgQSBzZXQgb2YgYXBwSWRzIHRoYXQgYXJlIHVzZWQgdG8gcmVzdHJpY3QgYWNjZXB0ZWQgYWNjZXNzIHRva2VucyBiYXNlZFxuICogICAgICBvbiBhIHNwZWNpZmljIGZpZWxkJ3MgdmFsdWUgaW4gdGhlIHRva2VuIGludHJvc3BlY3Rpb24gcmVzcG9uc2UuXG4gKiAgICAgIERlZmF1bHQ6IC0gKHVuZGVmaW5lZClcbiAqXG4gKiA1LiBcImF1dGhvcml6YXRpb25IZWFkZXJcIiAoc3RyaW5nLCBvcHRpb25hbClcbiAqICAgICAgVGhlIHZhbHVlIG9mIHRoZSBcIkF1dGhvcml6YXRpb25cIiBIVFRQIGhlYWRlciBpbiByZXF1ZXN0cyBzZW50IHRvIHRoZVxuICogICAgICBpbnRyb3NwZWN0aW9uIGVuZHBvaW50LiBJdCBtdXN0IGNvbnRhaW4gdGhlIHJhdyB2YWx1ZS5cbiAqICAgICAgVGh1cyBpZiBIVFRQIEJhc2ljIGF1dGhvcml6YXRpb24gaXMgdG8gYmUgdXNlZCwgaXQgbXVzdCBjb250YWluIHRoZVxuICogICAgICBcIkJhc2ljXCIgc3RyaW5nLCBmb2xsb3dlZCBieSB3aGl0ZXNwYWNlLCB0aGVuIGJ5IHRoZSBiYXNlNjQgZW5jb2RlZFxuICogICAgICB2ZXJzaW9uIG9mIHRoZSBjb25jYXRlbmF0ZWQgPHVzZXJuYW1lPiArIFwiOlwiICsgPHBhc3N3b3JkPiBzdHJpbmcuXG4gKiAgICAgIEVnLiBcIkJhc2ljIGRYTmxjbTVoYldVNmNHRnpjM2R2Y21RPVwiXG4gKlxuICogVGhlIGFkYXB0ZXIgZXhwZWN0cyByZXF1ZXN0cyB3aXRoIHRoZSBmb2xsb3dpbmcgYXV0aERhdGEgSlNPTjpcbiAqXG4gKiB7XG4gKiAgIFwic29tZWFkYXB0ZXJcIjoge1xuICogICAgIFwiaWRcIjogXCJ1c2VyJ3MgT0F1dGgyIHByb3ZpZGVyLXNwZWNpZmljIGlkIGFzIGEgc3RyaW5nXCIsXG4gKiAgICAgXCJhY2Nlc3NfdG9rZW5cIjogXCJhbiBhdXRob3JpemVkIE9BdXRoMiBhY2Nlc3MgdG9rZW4gZm9yIHRoZSB1c2VyXCIsXG4gKiAgIH1cbiAqIH1cbiAqL1xuXG5jb25zdCBQYXJzZSA9IHJlcXVpcmUoJ3BhcnNlL25vZGUnKS5QYXJzZTtcbmNvbnN0IHVybCA9IHJlcXVpcmUoJ3VybCcpO1xuY29uc3QgcXVlcnlzdHJpbmcgPSByZXF1aXJlKCdxdWVyeXN0cmluZycpO1xuY29uc3QgaHR0cHNSZXF1ZXN0ID0gcmVxdWlyZSgnLi9odHRwc1JlcXVlc3QnKTtcblxuY29uc3QgSU5WQUxJRF9BQ0NFU1MgPSAnT0F1dGgyIGFjY2VzcyB0b2tlbiBpcyBpbnZhbGlkIGZvciB0aGlzIHVzZXIuJztcbmNvbnN0IElOVkFMSURfQUNDRVNTX0FQUElEID1cbiAgXCJPQXV0aDI6IHRoZSBhY2Nlc3NfdG9rZW4ncyBhcHBJRCBpcyBlbXB0eSBvciBpcyBub3QgaW4gdGhlIGxpc3Qgb2YgcGVybWl0dGVkIGFwcElEcyBpbiB0aGUgYXV0aCBjb25maWd1cmF0aW9uLlwiO1xuY29uc3QgTUlTU0lOR19BUFBJRFMgPVxuICAnT0F1dGgyIGNvbmZpZ3VyYXRpb24gaXMgbWlzc2luZyB0aGUgY2xpZW50IGFwcCBJRHMgKFwiYXBwSWRzXCIgY29uZmlnIHBhcmFtZXRlcikuJztcbmNvbnN0IE1JU1NJTkdfVVJMID1cbiAgJ09BdXRoMiB0b2tlbiBpbnRyb3NwZWN0aW9uIGVuZHBvaW50IFVSTCBpcyBtaXNzaW5nIGZyb20gY29uZmlndXJhdGlvbiEnO1xuXG4vLyBSZXR1cm5zIGEgcHJvbWlzZSB0aGF0IGZ1bGZpbGxzIGlmIHRoaXMgdXNlciBpZCBpcyB2YWxpZC5cbmZ1bmN0aW9uIHZhbGlkYXRlQXV0aERhdGEoYXV0aERhdGEsIG9wdGlvbnMpIHtcbiAgcmV0dXJuIHJlcXVlc3RUb2tlbkluZm8ob3B0aW9ucywgYXV0aERhdGEuYWNjZXNzX3Rva2VuKS50aGVuKHJlc3BvbnNlID0+IHtcbiAgICBpZiAoXG4gICAgICAhcmVzcG9uc2UgfHxcbiAgICAgICFyZXNwb25zZS5hY3RpdmUgfHxcbiAgICAgIChvcHRpb25zLnVzZXJpZEZpZWxkICYmIGF1dGhEYXRhLmlkICE9PSByZXNwb25zZVtvcHRpb25zLnVzZXJpZEZpZWxkXSlcbiAgICApIHtcbiAgICAgIHRocm93IG5ldyBQYXJzZS5FcnJvcihQYXJzZS5FcnJvci5PQkpFQ1RfTk9UX0ZPVU5ELCBJTlZBTElEX0FDQ0VTUyk7XG4gICAgfVxuICB9KTtcbn1cblxuZnVuY3Rpb24gdmFsaWRhdGVBcHBJZChhcHBJZHMsIGF1dGhEYXRhLCBvcHRpb25zKSB7XG4gIGlmICghb3B0aW9ucyB8fCAhb3B0aW9ucy5hcHBpZEZpZWxkKSB7XG4gICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSgpO1xuICB9XG4gIGlmICghYXBwSWRzIHx8IGFwcElkcy5sZW5ndGggPT09IDApIHtcbiAgICB0aHJvdyBuZXcgUGFyc2UuRXJyb3IoUGFyc2UuRXJyb3IuT0JKRUNUX05PVF9GT1VORCwgTUlTU0lOR19BUFBJRFMpO1xuICB9XG4gIHJldHVybiByZXF1ZXN0VG9rZW5JbmZvKG9wdGlvbnMsIGF1dGhEYXRhLmFjY2Vzc190b2tlbikudGhlbihyZXNwb25zZSA9PiB7XG4gICAgaWYgKCFyZXNwb25zZSB8fCAhcmVzcG9uc2UuYWN0aXZlKSB7XG4gICAgICB0aHJvdyBuZXcgUGFyc2UuRXJyb3IoUGFyc2UuRXJyb3IuT0JKRUNUX05PVF9GT1VORCwgSU5WQUxJRF9BQ0NFU1MpO1xuICAgIH1cbiAgICBjb25zdCBhcHBpZEZpZWxkID0gb3B0aW9ucy5hcHBpZEZpZWxkO1xuICAgIGlmICghcmVzcG9uc2VbYXBwaWRGaWVsZF0pIHtcbiAgICAgIHRocm93IG5ldyBQYXJzZS5FcnJvcihQYXJzZS5FcnJvci5PQkpFQ1RfTk9UX0ZPVU5ELCBJTlZBTElEX0FDQ0VTU19BUFBJRCk7XG4gICAgfVxuICAgIGNvbnN0IHJlc3BvbnNlVmFsdWUgPSByZXNwb25zZVthcHBpZEZpZWxkXTtcbiAgICBpZiAoIUFycmF5LmlzQXJyYXkocmVzcG9uc2VWYWx1ZSkgJiYgYXBwSWRzLmluY2x1ZGVzKHJlc3BvbnNlVmFsdWUpKSB7XG4gICAgICByZXR1cm47XG4gICAgfSBlbHNlIGlmIChcbiAgICAgIEFycmF5LmlzQXJyYXkocmVzcG9uc2VWYWx1ZSkgJiZcbiAgICAgIHJlc3BvbnNlVmFsdWUuc29tZShhcHBJZCA9PiBhcHBJZHMuaW5jbHVkZXMoYXBwSWQpKVxuICAgICkge1xuICAgICAgcmV0dXJuO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aHJvdyBuZXcgUGFyc2UuRXJyb3IoUGFyc2UuRXJyb3IuT0JKRUNUX05PVF9GT1VORCwgSU5WQUxJRF9BQ0NFU1NfQVBQSUQpO1xuICAgIH1cbiAgfSk7XG59XG5cbi8vIEEgcHJvbWlzZSB3cmFwcGVyIGZvciByZXF1ZXN0cyB0byB0aGUgT0F1dGgyIHRva2VuIGludHJvc3BlY3Rpb24gZW5kcG9pbnQuXG5mdW5jdGlvbiByZXF1ZXN0VG9rZW5JbmZvKG9wdGlvbnMsIGFjY2Vzc190b2tlbikge1xuICBpZiAoIW9wdGlvbnMgfHwgIW9wdGlvbnMudG9rZW5JbnRyb3NwZWN0aW9uRW5kcG9pbnRVcmwpIHtcbiAgICB0aHJvdyBuZXcgUGFyc2UuRXJyb3IoUGFyc2UuRXJyb3IuT0JKRUNUX05PVF9GT1VORCwgTUlTU0lOR19VUkwpO1xuICB9XG4gIGNvbnN0IHBhcnNlZFVybCA9IHVybC5wYXJzZShvcHRpb25zLnRva2VuSW50cm9zcGVjdGlvbkVuZHBvaW50VXJsKTtcbiAgY29uc3QgcG9zdERhdGEgPSBxdWVyeXN0cmluZy5zdHJpbmdpZnkoe1xuICAgIHRva2VuOiBhY2Nlc3NfdG9rZW4sXG4gIH0pO1xuICBjb25zdCBoZWFkZXJzID0ge1xuICAgICdDb250ZW50LVR5cGUnOiAnYXBwbGljYXRpb24veC13d3ctZm9ybS11cmxlbmNvZGVkJyxcbiAgICAnQ29udGVudC1MZW5ndGgnOiBCdWZmZXIuYnl0ZUxlbmd0aChwb3N0RGF0YSksXG4gIH07XG4gIGlmIChvcHRpb25zLmF1dGhvcml6YXRpb25IZWFkZXIpIHtcbiAgICBoZWFkZXJzWydBdXRob3JpemF0aW9uJ10gPSBvcHRpb25zLmF1dGhvcml6YXRpb25IZWFkZXI7XG4gIH1cbiAgY29uc3QgcG9zdE9wdGlvbnMgPSB7XG4gICAgaG9zdG5hbWU6IHBhcnNlZFVybC5ob3N0bmFtZSxcbiAgICBwYXRoOiBwYXJzZWRVcmwucGF0aG5hbWUsXG4gICAgbWV0aG9kOiAnUE9TVCcsXG4gICAgaGVhZGVyczogaGVhZGVycyxcbiAgfTtcbiAgcmV0dXJuIGh0dHBzUmVxdWVzdC5yZXF1ZXN0KHBvc3RPcHRpb25zLCBwb3N0RGF0YSk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICB2YWxpZGF0ZUFwcElkOiB2YWxpZGF0ZUFwcElkLFxuICB2YWxpZGF0ZUF1dGhEYXRhOiB2YWxpZGF0ZUF1dGhEYXRhLFxufTtcbiJdfQ==