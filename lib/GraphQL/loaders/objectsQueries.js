"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.load = exports.findObjects = exports.getObject = void 0;

var _graphql = require("graphql");

var _graphqlListFields = _interopRequireDefault(require("graphql-list-fields"));

var _node = _interopRequireDefault(require("parse/node"));

var defaultGraphQLTypes = _interopRequireWildcard(require("./defaultGraphQLTypes"));

var _rest = _interopRequireDefault(require("../../rest"));

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(source, true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

const getObject = async (className, objectId, keys, include, readPreference, includeReadPreference, config, auth, info) => {
  const options = {};

  if (keys) {
    options.keys = keys;
  }

  if (include) {
    options.include = include;

    if (includeReadPreference) {
      options.includeReadPreference = includeReadPreference;
    }
  }

  if (readPreference) {
    options.readPreference = readPreference;
  }

  const response = await _rest.default.get(config, auth, className, objectId, options, info.clientSDK);

  if (!response.results || response.results.length == 0) {
    throw new _node.default.Error(_node.default.Error.OBJECT_NOT_FOUND, 'Object not found.');
  }

  if (className === '_User') {
    delete response.results[0].sessionToken;
  }

  return response.results[0];
};

exports.getObject = getObject;
const parseMap = {
  _or: '$or',
  _and: '$and',
  _nor: '$nor',
  _relatedTo: '$relatedTo',
  _eq: '$eq',
  _ne: '$ne',
  _lt: '$lt',
  _lte: '$lte',
  _gt: '$gt',
  _gte: '$gte',
  _in: '$in',
  _nin: '$nin',
  _exists: '$exists',
  _select: '$select',
  _dontSelect: '$dontSelect',
  _inQuery: '$inQuery',
  _notInQuery: '$notInQuery',
  _containedBy: '$containedBy',
  _all: '$all',
  _regex: '$regex',
  _options: '$options',
  _text: '$text',
  _search: '$search',
  _term: '$term',
  _language: '$language',
  _caseSensitive: '$caseSensitive',
  _diacriticSensitive: '$diacriticSensitive',
  _nearSphere: '$nearSphere',
  _maxDistance: '$maxDistance',
  _maxDistanceInRadians: '$maxDistanceInRadians',
  _maxDistanceInMiles: '$maxDistanceInMiles',
  _maxDistanceInKilometers: '$maxDistanceInKilometers',
  _within: '$within',
  _box: '$box',
  _geoWithin: '$geoWithin',
  _polygon: '$polygon',
  _centerSphere: '$centerSphere',
  _geoIntersects: '$geoIntersects',
  _point: '$point'
};

const transformToParse = constraints => {
  if (!constraints || typeof constraints !== 'object') {
    return;
  }

  Object.keys(constraints).forEach(fieldName => {
    let fieldValue = constraints[fieldName];

    if (parseMap[fieldName]) {
      delete constraints[fieldName];
      fieldName = parseMap[fieldName];
      constraints[fieldName] = fieldValue;
    }

    switch (fieldName) {
      case '$point':
      case '$nearSphere':
        if (typeof fieldValue === 'object' && !fieldValue.__type) {
          fieldValue.__type = 'GeoPoint';
        }

        break;

      case '$box':
        if (typeof fieldValue === 'object' && fieldValue.bottomLeft && fieldValue.upperRight) {
          fieldValue = [_objectSpread({
            __type: 'GeoPoint'
          }, fieldValue.bottomLeft), _objectSpread({
            __type: 'GeoPoint'
          }, fieldValue.upperRight)];
          constraints[fieldName] = fieldValue;
        }

        break;

      case '$polygon':
        if (fieldValue instanceof Array) {
          fieldValue.forEach(geoPoint => {
            if (typeof geoPoint === 'object' && !geoPoint.__type) {
              geoPoint.__type = 'GeoPoint';
            }
          });
        }

        break;

      case '$centerSphere':
        if (typeof fieldValue === 'object' && fieldValue.center && fieldValue.distance) {
          fieldValue = [_objectSpread({
            __type: 'GeoPoint'
          }, fieldValue.center), fieldValue.distance];
          constraints[fieldName] = fieldValue;
        }

        break;
    }

    if (typeof fieldValue === 'object') {
      transformToParse(fieldValue);
    }
  });
};

const findObjects = async (className, where, order, skip, limit, keys, include, includeAll, readPreference, includeReadPreference, subqueryReadPreference, config, auth, info, selectedFields) => {
  if (!where) {
    where = {};
  }

  transformToParse(where);
  const options = {};

  if (selectedFields.includes('results')) {
    if (limit || limit === 0) {
      options.limit = limit;
    }

    if (options.limit !== 0) {
      if (order) {
        options.order = order;
      }

      if (skip) {
        options.skip = skip;
      }

      if (config.maxLimit && options.limit > config.maxLimit) {
        // Silently replace the limit on the query with the max configured
        options.limit = config.maxLimit;
      }

      if (keys) {
        options.keys = keys;
      }

      if (includeAll === true) {
        options.includeAll = includeAll;
      }

      if (!options.includeAll && include) {
        options.include = include;
      }

      if ((options.includeAll || options.include) && includeReadPreference) {
        options.includeReadPreference = includeReadPreference;
      }
    }
  } else {
    options.limit = 0;
  }

  if (selectedFields.includes('count')) {
    options.count = true;
  }

  if (readPreference) {
    options.readPreference = readPreference;
  }

  if (Object.keys(where).length > 0 && subqueryReadPreference) {
    options.subqueryReadPreference = subqueryReadPreference;
  }

  return await _rest.default.find(config, auth, className, where, options, info.clientSDK);
};

exports.findObjects = findObjects;

const load = parseGraphQLSchema => {
  parseGraphQLSchema.graphQLObjectsQueries.get = {
    description: 'The get query can be used to get an object of a certain class by its objectId.',
    args: {
      className: defaultGraphQLTypes.CLASS_NAME_ATT,
      objectId: defaultGraphQLTypes.OBJECT_ID_ATT,
      keys: defaultGraphQLTypes.KEYS_ATT,
      include: defaultGraphQLTypes.INCLUDE_ATT,
      readPreference: defaultGraphQLTypes.READ_PREFERENCE_ATT,
      includeReadPreference: defaultGraphQLTypes.INCLUDE_READ_PREFERENCE_ATT
    },
    type: new _graphql.GraphQLNonNull(defaultGraphQLTypes.OBJECT),

    async resolve(_source, args, context) {
      try {
        const {
          className,
          objectId,
          keys,
          include,
          readPreference,
          includeReadPreference
        } = args;
        const {
          config,
          auth,
          info
        } = context;
        return await getObject(className, objectId, keys, include, readPreference, includeReadPreference, config, auth, info);
      } catch (e) {
        parseGraphQLSchema.handleError(e);
      }
    }

  };
  parseGraphQLSchema.graphQLObjectsQueries.find = {
    description: 'The find query can be used to find objects of a certain class.',
    args: {
      className: defaultGraphQLTypes.CLASS_NAME_ATT,
      where: defaultGraphQLTypes.WHERE_ATT,
      order: {
        description: 'This is the order in which the objects should be returned',
        type: _graphql.GraphQLString
      },
      skip: defaultGraphQLTypes.SKIP_ATT,
      limit: defaultGraphQLTypes.LIMIT_ATT,
      keys: defaultGraphQLTypes.KEYS_ATT,
      include: defaultGraphQLTypes.INCLUDE_ATT,
      includeAll: {
        description: 'All pointers will be returned',
        type: _graphql.GraphQLBoolean
      },
      readPreference: defaultGraphQLTypes.READ_PREFERENCE_ATT,
      includeReadPreference: defaultGraphQLTypes.INCLUDE_READ_PREFERENCE_ATT,
      subqueryReadPreference: defaultGraphQLTypes.SUBQUERY_READ_PREFERENCE_ATT
    },
    type: new _graphql.GraphQLNonNull(defaultGraphQLTypes.FIND_RESULT),

    async resolve(_source, args, context, queryInfo) {
      try {
        const {
          className,
          where,
          order,
          skip,
          limit,
          keys,
          include,
          includeAll,
          readPreference,
          includeReadPreference,
          subqueryReadPreference
        } = args;
        const {
          config,
          auth,
          info
        } = context;
        const selectedFields = (0, _graphqlListFields.default)(queryInfo);
        return await findObjects(className, where, order, skip, limit, keys, include, includeAll, readPreference, includeReadPreference, subqueryReadPreference, config, auth, info, selectedFields);
      } catch (e) {
        parseGraphQLSchema.handleError(e);
      }
    }

  };
  const objectsQuery = new _graphql.GraphQLObjectType({
    name: 'ObjectsQuery',
    description: 'ObjectsQuery is the top level type for objects queries.',
    fields: parseGraphQLSchema.graphQLObjectsQueries
  });
  parseGraphQLSchema.graphQLTypes.push(objectsQuery);
  parseGraphQLSchema.graphQLQueries.objects = {
    description: 'This is the top level for objects queries.',
    type: objectsQuery,
    resolve: () => new Object()
  };
};

exports.load = load;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9HcmFwaFFML2xvYWRlcnMvb2JqZWN0c1F1ZXJpZXMuanMiXSwibmFtZXMiOlsiZ2V0T2JqZWN0IiwiY2xhc3NOYW1lIiwib2JqZWN0SWQiLCJrZXlzIiwiaW5jbHVkZSIsInJlYWRQcmVmZXJlbmNlIiwiaW5jbHVkZVJlYWRQcmVmZXJlbmNlIiwiY29uZmlnIiwiYXV0aCIsImluZm8iLCJvcHRpb25zIiwicmVzcG9uc2UiLCJyZXN0IiwiZ2V0IiwiY2xpZW50U0RLIiwicmVzdWx0cyIsImxlbmd0aCIsIlBhcnNlIiwiRXJyb3IiLCJPQkpFQ1RfTk9UX0ZPVU5EIiwic2Vzc2lvblRva2VuIiwicGFyc2VNYXAiLCJfb3IiLCJfYW5kIiwiX25vciIsIl9yZWxhdGVkVG8iLCJfZXEiLCJfbmUiLCJfbHQiLCJfbHRlIiwiX2d0IiwiX2d0ZSIsIl9pbiIsIl9uaW4iLCJfZXhpc3RzIiwiX3NlbGVjdCIsIl9kb250U2VsZWN0IiwiX2luUXVlcnkiLCJfbm90SW5RdWVyeSIsIl9jb250YWluZWRCeSIsIl9hbGwiLCJfcmVnZXgiLCJfb3B0aW9ucyIsIl90ZXh0IiwiX3NlYXJjaCIsIl90ZXJtIiwiX2xhbmd1YWdlIiwiX2Nhc2VTZW5zaXRpdmUiLCJfZGlhY3JpdGljU2Vuc2l0aXZlIiwiX25lYXJTcGhlcmUiLCJfbWF4RGlzdGFuY2UiLCJfbWF4RGlzdGFuY2VJblJhZGlhbnMiLCJfbWF4RGlzdGFuY2VJbk1pbGVzIiwiX21heERpc3RhbmNlSW5LaWxvbWV0ZXJzIiwiX3dpdGhpbiIsIl9ib3giLCJfZ2VvV2l0aGluIiwiX3BvbHlnb24iLCJfY2VudGVyU3BoZXJlIiwiX2dlb0ludGVyc2VjdHMiLCJfcG9pbnQiLCJ0cmFuc2Zvcm1Ub1BhcnNlIiwiY29uc3RyYWludHMiLCJPYmplY3QiLCJmb3JFYWNoIiwiZmllbGROYW1lIiwiZmllbGRWYWx1ZSIsIl9fdHlwZSIsImJvdHRvbUxlZnQiLCJ1cHBlclJpZ2h0IiwiQXJyYXkiLCJnZW9Qb2ludCIsImNlbnRlciIsImRpc3RhbmNlIiwiZmluZE9iamVjdHMiLCJ3aGVyZSIsIm9yZGVyIiwic2tpcCIsImxpbWl0IiwiaW5jbHVkZUFsbCIsInN1YnF1ZXJ5UmVhZFByZWZlcmVuY2UiLCJzZWxlY3RlZEZpZWxkcyIsImluY2x1ZGVzIiwibWF4TGltaXQiLCJjb3VudCIsImZpbmQiLCJsb2FkIiwicGFyc2VHcmFwaFFMU2NoZW1hIiwiZ3JhcGhRTE9iamVjdHNRdWVyaWVzIiwiZGVzY3JpcHRpb24iLCJhcmdzIiwiZGVmYXVsdEdyYXBoUUxUeXBlcyIsIkNMQVNTX05BTUVfQVRUIiwiT0JKRUNUX0lEX0FUVCIsIktFWVNfQVRUIiwiSU5DTFVERV9BVFQiLCJSRUFEX1BSRUZFUkVOQ0VfQVRUIiwiSU5DTFVERV9SRUFEX1BSRUZFUkVOQ0VfQVRUIiwidHlwZSIsIkdyYXBoUUxOb25OdWxsIiwiT0JKRUNUIiwicmVzb2x2ZSIsIl9zb3VyY2UiLCJjb250ZXh0IiwiZSIsImhhbmRsZUVycm9yIiwiV0hFUkVfQVRUIiwiR3JhcGhRTFN0cmluZyIsIlNLSVBfQVRUIiwiTElNSVRfQVRUIiwiR3JhcGhRTEJvb2xlYW4iLCJTVUJRVUVSWV9SRUFEX1BSRUZFUkVOQ0VfQVRUIiwiRklORF9SRVNVTFQiLCJxdWVyeUluZm8iLCJvYmplY3RzUXVlcnkiLCJHcmFwaFFMT2JqZWN0VHlwZSIsIm5hbWUiLCJmaWVsZHMiLCJncmFwaFFMVHlwZXMiLCJwdXNoIiwiZ3JhcGhRTFF1ZXJpZXMiLCJvYmplY3RzIl0sIm1hcHBpbmdzIjoiOzs7Ozs7O0FBQUE7O0FBTUE7O0FBQ0E7O0FBQ0E7O0FBQ0E7Ozs7Ozs7Ozs7OztBQUVBLE1BQU1BLFNBQVMsR0FBRyxPQUNoQkMsU0FEZ0IsRUFFaEJDLFFBRmdCLEVBR2hCQyxJQUhnQixFQUloQkMsT0FKZ0IsRUFLaEJDLGNBTGdCLEVBTWhCQyxxQkFOZ0IsRUFPaEJDLE1BUGdCLEVBUWhCQyxJQVJnQixFQVNoQkMsSUFUZ0IsS0FVYjtBQUNILFFBQU1DLE9BQU8sR0FBRyxFQUFo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dEIsY0FBYyxHQUFHLGdDQUFjZ0MsU0FBZCxDQUF2QjtBQUVBLGVBQU8sTUFBTXZDLFdBQVcsQ0FDdEJ6RSxTQURzQixFQUV0QjBFLEtBRnNCLEVBR3RCQyxLQUhzQixFQUl0QkMsSUFKc0IsRUFLdEJDLEtBTHNCLEVBTXRCM0UsSUFOc0IsRUFPdEJDLE9BUHNCLEVBUXRCMkUsVUFSc0IsRUFTdEIxRSxjQVRzQixFQVV0QkMscUJBVnNCLEVBV3RCMEUsc0JBWHNCLEVBWXRCekUsTUFac0IsRUFhdEJDLElBYnNCLEVBY3RCQyxJQWRzQixFQWV0QndFLGNBZnNCLENBQXhCO0FBaUJELE9BbENELENBa0NFLE9BQU91QixDQUFQLEVBQVU7QUFDVmpCLFFBQUFBLGtCQUFrQixDQUFDa0IsV0FBbkIsQ0FBK0JELENBQS9CO0FBQ0Q7QUFDRjs7QUE5RDZDLEdBQWhEO0FBaUVBLFFBQU1VLFlBQVksR0FBRyxJQUFJQywwQkFBSixDQUFzQjtBQUN6Q0MsSUFBQUEsSUFBSSxFQUFFLGNBRG1DO0FBRXpDM0IsSUFBQUEsV0FBVyxFQUFFLHlEQUY0QjtBQUd6QzRCLElBQUFBLE1BQU0sRUFBRTlCLGtCQUFrQixDQUFDQztBQUhjLEdBQXRCLENBQXJCO0FBS0FELEVBQUFBLGtCQUFrQixDQUFDK0IsWUFBbkIsQ0FBZ0NDLElBQWhDLENBQXFDTCxZQUFyQztBQUVBM0IsRUFBQUEsa0JBQWtCLENBQUNpQyxjQUFuQixDQUFrQ0MsT0FBbEMsR0FBNEM7QUFDMUNoQyxJQUFBQSxXQUFXLEVBQUUsNENBRDZCO0FBRTFDUyxJQUFBQSxJQUFJLEVBQUVnQixZQUZvQztBQUcxQ2IsSUFBQUEsT0FBTyxFQUFFLE1BQU0sSUFBSXRDLE1BQUo7QUFIMkIsR0FBNUM7QUFLRCxDQXZIRCIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7XG4gIEdyYXBoUUxOb25OdWxsLFxuICBHcmFwaFFMQm9vbGVhbixcbiAgR3JhcGhRTFN0cmluZyxcbiAgR3JhcGhRTE9iamVjdFR5cGUsXG59IGZyb20gJ2dyYXBocWwnO1xuaW1wb3J0IGdldEZpZWxkTmFtZXMgZnJvbSAnZ3JhcGhxbC1saXN0LWZpZWxkcyc7XG5pbXBvcnQgUGFyc2UgZnJvbSAncGFyc2Uvbm9kZSc7XG5pbXBvcnQgKiBhcyBkZWZhdWx0R3JhcGhRTFR5cGVzIGZyb20gJy4vZGVmYXVsdEdyYXBoUUxUeXBlcyc7XG5pbXBvcnQgcmVzdCBmcm9tICcuLi8uLi9yZXN0JztcblxuY29uc3QgZ2V0T2JqZWN0ID0gYXN5bmMgKFxuICBjbGFzc05hbWUsXG4gIG9iamVjdElkLFxuICBrZXlzLFxuICBpbmNsdWRlLFxuICByZWFkUHJlZmVyZW5jZSxcbiAgaW5jbHVkZVJlYWRQcmVmZXJlbmNlLFxuICBjb25maWcsXG4gIGF1dGgsXG4gIGluZm9cbikgPT4ge1xuICBjb25zdCBvcHRpb25zID0ge307XG4gIGlmIChrZXlzKSB7XG4gICAgb3B0aW9ucy5rZXlzID0ga2V5cztcbiAgfVxuICBpZiAoaW5jbHVkZSkge1xuICAgIG9wdGlvbnMuaW5jbHVkZSA9IGluY2x1ZGU7XG4gICAgaWYgKGluY2x1ZGVSZWFkUHJlZmVyZW5jZSkge1xuICAgICAgb3B0aW9ucy5pbmNsdWRlUmVhZFByZWZlcmVuY2UgPSBpbmNsdWRlUmVhZFByZWZlcmVuY2U7XG4gICAgfVxuICB9XG4gIGlmIChyZWFkUHJlZmVyZW5jZSkge1xuICAgIG9wdGlvbnMucmVhZFByZWZlcmVuY2UgPSByZWFkUHJlZmVyZW5jZTtcbiAgfVxuXG4gIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgcmVzdC5nZXQoXG4gICAgY29uZmlnLFxuICAgIGF1dGgsXG4gICAgY2xhc3NOYW1lLFxuICAgIG9iamVjdElkLFxuICAgIG9wdGlvbnMsXG4gICAgaW5mby5jbGllbnRTREtcbiAgKTtcblxuICBpZiAoIXJlc3BvbnNlLnJlc3VsdHMgfHwgcmVzcG9uc2UucmVzdWx0cy5sZW5ndGggPT0gMCkge1xuICAgIHRocm93IG5ldyBQYXJzZS5FcnJvcihQYXJzZS5FcnJvci5PQkpFQ1RfTk9UX0ZPVU5ELCAnT2JqZWN0IG5vdCBmb3VuZC4nKTtcbiAgfVxuXG4gIGlmIChjbGFzc05hbWUgPT09ICdfVXNlcicpIHtcbiAgICBkZWxldGUgcmVzcG9uc2UucmVzdWx0c1swXS5zZXNzaW9uVG9rZW47XG4gIH1cblxuICByZXR1cm4gcmVzcG9uc2UucmVzdWx0c1swXTtcbn07XG5cbmNvbnN0IHBhcnNlTWFwID0ge1xuICBfb3I6ICckb3InLFxuICBfYW5kOiAnJGFuZCcsXG4gIF9ub3I6ICckbm9yJyxcbiAgX3JlbGF0ZWRUbzogJyRyZWxhdGVkVG8nLFxuICBfZXE6ICckZXEnLFxuICBfbmU6ICckbmUnLFxuICBfbHQ6ICckbHQnLFxuICBfbHRlOiAnJGx0ZScsXG4gIF9ndDogJyRndCcsXG4gIF9ndGU6ICckZ3RlJyxcbiAgX2luOiAnJGluJyxcbiAgX25pbjogJyRuaW4nLFxuICBfZXhpc3RzOiAnJGV4aXN0cycsXG4gIF9zZWxlY3Q6ICckc2VsZWN0JyxcbiAgX2RvbnRTZWxlY3Q6ICckZG9udFNlbGVjdCcsXG4gIF9pblF1ZXJ5OiAnJGluUXVlcnknLFxuICBfbm90SW5RdWVyeTogJyRub3RJblF1ZXJ5JyxcbiAgX2NvbnRhaW5lZEJ5OiAnJGNvbnRhaW5lZEJ5JyxcbiAgX2FsbDogJyRhbGwnLFxuICBfcmVnZXg6ICckcmVnZXgnLFxuICBfb3B0aW9uczogJyRvcHRpb25zJyxcbiAgX3RleHQ6ICckdGV4dCcsXG4gIF9zZWFyY2g6ICckc2VhcmNoJyxcbiAgX3Rlcm06ICckdGVybScsXG4gIF9sYW5ndWFnZTogJyRsYW5ndWFnZScsXG4gIF9jYXNlU2Vuc2l0aXZlOiAnJGNhc2VTZW5zaXRpdmUnLFxuICBfZGlhY3JpdGljU2Vuc2l0aXZlOiAnJGRpYWNyaXRpY1NlbnNpdGl2ZScsXG4gIF9uZWFyU3BoZXJlOiAnJG5lYXJTcGhlcmUnLFxuICBfbWF4RGlzdGFuY2U6ICckbWF4RGlzdGFuY2UnLFxuICBfbWF4RGlzdGFuY2VJblJhZGlhbnM6ICckbWF4RGlzdGFuY2VJblJhZGlhbnMnLFxuICBfbWF4RGlzdGFuY2VJbk1pbGVzOiAnJG1heERpc3RhbmNlSW5NaWxlcycsXG4gIF9tYXhEaXN0YW5jZUluS2lsb21ldGVyczogJyRtYXhEaXN0YW5jZUluS2lsb21ldGVycycsXG4gIF93aXRoaW46ICckd2l0aGluJyxcbiAgX2JveDogJyRib3gnLFxuICBfZ2VvV2l0aGluOiAnJGdlb1dpdGhpbicsXG4gIF9wb2x5Z29uOiAnJHBvbHlnb24nLFxuICBfY2VudGVyU3BoZXJlOiAnJGNlbnRlclNwaGVyZScsXG4gIF9nZW9JbnRlcnNlY3RzOiAnJGdlb0ludGVyc2VjdHMnLFxuICBfcG9pbnQ6ICckcG9pbnQnLFxufTtcblxuY29uc3QgdHJhbnNmb3JtVG9QYXJzZSA9IGNvbnN0cmFpbnRzID0+IHtcbiAgaWYgKCFjb25zdHJhaW50cyB8fCB0eXBlb2YgY29uc3RyYWludHMgIT09ICdvYmplY3QnKSB7XG4gICAgcmV0dXJuO1xuICB9XG4gIE9iamVjdC5rZXlzKGNvbnN0cmFpbnRzKS5mb3JFYWNoKGZpZWxkTmFtZSA9PiB7XG4gICAgbGV0IGZpZWxkVmFsdWUgPSBjb25zdHJhaW50c1tmaWVsZE5hbWVdO1xuICAgIGlmIChwYXJzZU1hcFtmaWVsZE5hbWVdKSB7XG4gICAgICBkZWxldGUgY29uc3RyYWludHNbZmllbGROYW1lXTtcbiAgICAgIGZpZWxkTmFtZSA9IHBhcnNlTWFwW2ZpZWxkTmFtZV07XG4gICAgICBjb25zdHJhaW50c1tmaWVsZE5hbWVdID0gZmllbGRWYWx1ZTtcbiAgICB9XG4gICAgc3dpdGNoIChmaWVsZE5hbWUpIHtcbiAgICAgIGNhc2UgJyRwb2ludCc6XG4gICAgICBjYXNlICckbmVhclNwaGVyZSc6XG4gICAgICAgIGlmICh0eXBlb2YgZmllbGRWYWx1ZSA9PT0gJ29iamVjdCcgJiYgIWZpZWxkVmFsdWUuX190eXBlKSB7XG4gICAgICAgICAgZmllbGRWYWx1ZS5fX3R5cGUgPSAnR2VvUG9pbnQnO1xuICAgICAgICB9XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAnJGJveCc6XG4gICAgICAgIGlmIChcbiAgICAgICAgICB0eXBlb2YgZmllbGRWYWx1ZSA9PT0gJ29iamVjdCcgJiZcbiAgICAgICAgICBmaWVsZFZhbHVlLmJvdHRvbUxlZnQgJiZcbiAgICAgICAgICBmaWVsZFZhbHVlLnVwcGVyUmlnaHRcbiAgICAgICAgKSB7XG4gICAgICAgICAgZmllbGRWYWx1ZSA9IFtcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgX190eXBlOiAnR2VvUG9pbnQnLFxuICAgICAgICAgICAgICAuLi5maWVsZFZhbHVlLmJvdHRvbUxlZnQsXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICBfX3R5cGU6ICdHZW9Qb2ludCcsXG4gICAgICAgICAgICAgIC4uLmZpZWxkVmFsdWUudXBwZXJSaWdodCxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgXTtcbiAgICAgICAgICBjb25zdHJhaW50c1tmaWVsZE5hbWVdID0gZmllbGRWYWx1ZTtcbiAgICAgICAgfVxuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJyRwb2x5Z29uJzpcbiAgICAgICAgaWYgKGZpZWxkVmFsdWUgaW5zdGFuY2VvZiBBcnJheSkge1xuICAgICAgICAgIGZpZWxkVmFsdWUuZm9yRWFjaChnZW9Qb2ludCA9PiB7XG4gICAgICAgICAgICBpZiAodHlwZW9mIGdlb1BvaW50ID09PSAnb2JqZWN0JyAmJiAhZ2VvUG9pbnQuX190eXBlKSB7XG4gICAgICAgICAgICAgIGdlb1BvaW50Ll9fdHlwZSA9ICdHZW9Qb2ludCc7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICckY2VudGVyU3BoZXJlJzpcbiAgICAgICAgaWYgKFxuICAgICAgICAgIHR5cGVvZiBmaWVsZFZhbHVlID09PSAnb2JqZWN0JyAmJlxuICAgICAgICAgIGZpZWxkVmFsdWUuY2VudGVyICYmXG4gICAgICAgICAgZmllbGRWYWx1ZS5kaXN0YW5jZVxuICAgICAgICApIHtcbiAgICAgICAgICBmaWVsZFZhbHVlID0gW1xuICAgICAgICAgICAge1xuICAgICAgICAgICAgICBfX3R5cGU6ICdHZW9Qb2ludCcsXG4gICAgICAgICAgICAgIC4uLmZpZWxkVmFsdWUuY2VudGVyLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGZpZWxkVmFsdWUuZGlzdGFuY2UsXG4gICAgICAgICAgXTtcbiAgICAgICAgICBjb25zdHJhaW50c1tmaWVsZE5hbWVdID0gZmllbGRWYWx1ZTtcbiAgICAgICAgfVxuICAgICAgICBicmVhaztcbiAgICB9XG4gICAgaWYgKHR5cGVvZiBmaWVsZFZhbHVlID09PSAnb2JqZWN0Jykge1xuICAgICAgdHJhbnNmb3JtVG9QYXJzZShmaWVsZFZhbHVlKTtcbiAgICB9XG4gIH0pO1xufTtcblxuY29uc3QgZmluZE9iamVjdHMgPSBhc3luYyAoXG4gIGNsYXNzTmFtZSxcbiAgd2hlcmUsXG4gIG9yZGVyLFxuICBza2lwLFxuICBsaW1pdCxcbiAga2V5cyxcbiAgaW5jbHVkZSxcbiAgaW5jbHVkZUFsbCxcbiAgcmVhZFByZWZlcmVuY2UsXG4gIGluY2x1ZGVSZWFkUHJlZmVyZW5jZSxcbiAgc3VicXVlcnlSZWFkUHJlZmVyZW5jZSxcbiAgY29uZmlnLFxuICBhdXRoLFxuICBpbmZvLFxuICBzZWxlY3RlZEZpZWxkc1xuKSA9PiB7XG4gIGlmICghd2hlcmUpIHtcbiAgICB3aGVyZSA9IHt9O1xuICB9XG5cbiAgdHJhbnNmb3JtVG9QYXJzZSh3aGVyZSk7XG5cbiAgY29uc3Qgb3B0aW9ucyA9IHt9O1xuXG4gIGlmIChzZWxlY3RlZEZpZWxkcy5pbmNsdWRlcygncmVzdWx0cycpKSB7XG4gICAgaWYgKGxpbWl0IHx8IGxpbWl0ID09PSAwKSB7XG4gICAgICBvcHRpb25zLmxpbWl0ID0gbGltaXQ7XG4gICAgfVxuICAgIGlmIChvcHRpb25zLmxpbWl0ICE9PSAwKSB7XG4gICAgICBpZiAob3JkZXIpIHtcbiAgICAgICAgb3B0aW9ucy5vcmRlciA9IG9yZGVyO1xuICAgICAgfVxuICAgICAgaWYgKHNraXApIHtcbiAgICAgICAgb3B0aW9ucy5za2lwID0gc2tpcDtcbiAgICAgIH1cbiAgICAgIGlmIChjb25maWcubWF4TGltaXQgJiYgb3B0aW9ucy5saW1pdCA+IGNvbmZpZy5tYXhMaW1pdCkge1xuICAgICAgICAvLyBTaWxlbnRseSByZXBsYWNlIHRoZSBsaW1pdCBvbiB0aGUgcXVlcnkgd2l0aCB0aGUgbWF4IGNvbmZpZ3VyZWRcbiAgICAgICAgb3B0aW9ucy5saW1pdCA9IGNvbmZpZy5tYXhMaW1pdDtcbiAgICAgIH1cbiAgICAgIGlmIChrZXlzKSB7XG4gICAgICAgIG9wdGlvbnMua2V5cyA9IGtleXM7XG4gICAgICB9XG4gICAgICBpZiAoaW5jbHVkZUFsbCA9PT0gdHJ1ZSkge1xuICAgICAgICBvcHRpb25zLmluY2x1ZGVBbGwgPSBpbmNsdWRlQWxsO1xuICAgICAgfVxuICAgICAgaWYgKCFvcHRpb25zLmluY2x1ZGVBbGwgJiYgaW5jbHVkZSkge1xuICAgICAgICBvcHRpb25zLmluY2x1ZGUgPSBpbmNsdWRlO1xuICAgICAgfVxuICAgICAgaWYgKChvcHRpb25zLmluY2x1ZGVBbGwgfHwgb3B0aW9ucy5pbmNsdWRlKSAmJiBpbmNsdWRlUmVhZFByZWZlcmVuY2UpIHtcbiAgICAgICAgb3B0aW9ucy5pbmNsdWRlUmVhZFByZWZlcmVuY2UgPSBpbmNsdWRlUmVhZFByZWZlcmVuY2U7XG4gICAgICB9XG4gICAgfVxuICB9IGVsc2Uge1xuICAgIG9wdGlvbnMubGltaXQgPSAwO1xuICB9XG5cbiAgaWYgKHNlbGVjdGVkRmllbGRzLmluY2x1ZGVzKCdjb3VudCcpKSB7XG4gICAgb3B0aW9ucy5jb3VudCA9IHRydWU7XG4gIH1cblxuICBpZiAocmVhZFByZWZlcmVuY2UpIHtcbiAgICBvcHRpb25zLnJlYWRQcmVmZXJlbmNlID0gcmVhZFByZWZlcmVuY2U7XG4gIH1cbiAgaWYgKE9iamVjdC5rZXlzKHdoZXJlKS5sZW5ndGggPiAwICYmIHN1YnF1ZXJ5UmVhZFByZWZlcmVuY2UpIHtcbiAgICBvcHRpb25zLnN1YnF1ZXJ5UmVhZFByZWZlcmVuY2UgPSBzdWJxdWVyeVJlYWRQcmVmZXJlbmNlO1xuICB9XG5cbiAgcmV0dXJuIGF3YWl0IHJlc3QuZmluZChcbiAgICBjb25maWcsXG4gICAgYXV0aCxcbiAgICBjbGFzc05hbWUsXG4gICAgd2hlcmUsXG4gICAgb3B0aW9ucyxcbiAgICBpbmZvLmNsaWVudFNES1xuICApO1xufTtcblxuY29uc3QgbG9hZCA9IHBhcnNlR3JhcGhRTFNjaGVtYSA9PiB7XG4gIHBhcnNlR3JhcGhRTFNjaGVtYS5ncmFwaFFMT2JqZWN0c1F1ZXJpZXMuZ2V0ID0ge1xuICAgIGRlc2NyaXB0aW9uOlxuICAgICAgJ1RoZSBnZXQgcXVlcnkgY2FuIGJlIHVzZWQgdG8gZ2V0IGFuIG9iamVjdCBvZiBhIGNlcnRhaW4gY2xhc3MgYnkgaXRzIG9iamVjdElkLicsXG4gICAgYXJnczoge1xuICAgICAgY2xhc3NOYW1lOiBkZWZhdWx0R3JhcGhRTFR5cGVzLkNMQVNTX05BTUVfQVRULFxuICAgICAgb2JqZWN0SWQ6IGRlZmF1bHRHcmFwaFFMVHlwZXMuT0JKRUNUX0lEX0FUVCxcbiAgICAgIGtleXM6IGRlZmF1bHRHcmFwaFFMVHlwZXMuS0VZU19BVFQsXG4gICAgICBpbmNsdWRlOiBkZWZhdWx0R3JhcGhRTFR5cGVzLklOQ0xVREVfQVRULFxuICAgICAgcmVhZFByZWZlcmVuY2U6IGRlZmF1bHRHcmFwaFFMVHlwZXMuUkVBRF9QUkVGRVJFTkNFX0FUVCxcbiAgICAgIGluY2x1ZGVSZWFkUHJlZmVyZW5jZTogZGVmYXVsdEdyYXBoUUxUeXBlcy5JTkNMVURFX1JFQURfUFJFRkVSRU5DRV9BVFQsXG4gICAgfSxcbiAgICB0eXBlOiBuZXcgR3JhcGhRTE5vbk51bGwoZGVmYXVsdEdyYXBoUUxUeXBlcy5PQkpFQ1QpLFxuICAgIGFzeW5jIHJlc29sdmUoX3NvdXJjZSwgYXJncywgY29udGV4dCkge1xuICAgICAgdHJ5IHtcbiAgICAgICAgY29uc3Qge1xuICAgICAgICAgIGNsYXNzTmFtZSxcbiAgICAgICAgICBvYmplY3RJZCxcbiAgICAgICAgICBrZXlzLFxuICAgICAgICAgIGluY2x1ZGUsXG4gICAgICAgICAgcmVhZFByZWZlcmVuY2UsXG4gICAgICAgICAgaW5jbHVkZVJlYWRQcmVmZXJlbmNlLFxuICAgICAgICB9ID0gYXJncztcbiAgICAgICAgY29uc3QgeyBjb25maWcsIGF1dGgsIGluZm8gfSA9IGNvbnRleHQ7XG5cbiAgICAgICAgcmV0dXJuIGF3YWl0IGdldE9iamVjdChcbiAgICAgICAgICBjbGFzc05hbWUsXG4gICAgICAgICAgb2JqZWN0SWQsXG4gICAgICAgICAga2V5cyxcbiAgICAgICAgICBpbmNsdWRlLFxuICAgICAgICAgIHJlYWRQcmVmZXJlbmNlLFxuICAgICAgICAgIGluY2x1ZGVSZWFkUHJlZmVyZW5jZSxcbiAgICAgICAgICBjb25maWcsXG4gICAgICAgICAgYXV0aCxcbiAgICAgICAgICBpbmZvXG4gICAgICAgICk7XG4gICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIHBhcnNlR3JhcGhRTFNjaGVtYS5oYW5kbGVFcnJvcihlKTtcbiAgICAgIH1cbiAgICB9LFxuICB9O1xuXG4gIHBhcnNlR3JhcGhRTFNjaGVtYS5ncmFwaFFMT2JqZWN0c1F1ZXJpZXMuZmluZCA9IHtcbiAgICBkZXNjcmlwdGlvbjpcbiAgICAgICdUaGUgZmluZCBxdWVyeSBjYW4gYmUgdXNlZCB0byBmaW5kIG9iamVjdHMgb2YgYSBjZXJ0YWluIGNsYXNzLicsXG4gICAgYXJnczoge1xuICAgICAgY2xhc3NOYW1lOiBkZWZhdWx0R3JhcGhRTFR5cGVzLkNMQVNTX05BTUVfQVRULFxuICAgICAgd2hlcmU6IGRlZmF1bHRHcmFwaFFMVHlwZXMuV0hFUkVfQVRULFxuICAgICAgb3JkZXI6IHtcbiAgICAgICAgZGVzY3JpcHRpb246XG4gICAgICAgICAgJ1RoaXMgaXMgdGhlIG9yZGVyIGluIHdoaWNoIHRoZSBvYmplY3RzIHNob3VsZCBiZSByZXR1cm5lZCcsXG4gICAgICAgIHR5cGU6IEdyYXBoUUxTdHJpbmcsXG4gICAgICB9LFxuICAgICAgc2tpcDogZGVmYXVsdEdyYXBoUUxUeXBlcy5TS0lQX0FUVCxcbiAgICAgIGxpbWl0OiBkZWZhdWx0R3JhcGhRTFR5cGVzLkxJTUlUX0FUVCxcbiAgICAgIGtleXM6IGRlZmF1bHRHcmFwaFFMVHlwZXMuS0VZU19BVFQsXG4gICAgICBpbmNsdWRlOiBkZWZhdWx0R3JhcGhRTFR5cGVzLklOQ0xVREVfQVRULFxuICAgICAgaW5jbHVkZUFsbDoge1xuICAgICAgICBkZXNjcmlwdGlvbjogJ0FsbCBwb2ludGVycyB3aWxsIGJlIHJldHVybmVkJyxcbiAgICAgICAgdHlwZTogR3JhcGhRTEJvb2xlYW4sXG4gICAgICB9LFxuICAgICAgcmVhZFByZWZlcmVuY2U6IGRlZmF1bHRHcmFwaFFMVHlwZXMuUkVBRF9QUkVGRVJFTkNFX0FUVCxcbiAgICAgIGluY2x1ZGVSZWFkUHJlZmVyZW5jZTogZGVmYXVsdEdyYXBoUUxUeXBlcy5JTkNMVURFX1JFQURfUFJFRkVSRU5DRV9BVFQsXG4gICAgICBzdWJxdWVyeVJlYWRQcmVmZXJlbmNlOiBkZWZhdWx0R3JhcGhRTFR5cGVzLlNVQlFVRVJZX1JFQURfUFJFRkVSRU5DRV9BVFQsXG4gICAgfSxcbiAgICB0eXBlOiBuZXcgR3JhcGhRTE5vbk51bGwoZGVmYXVsdEdyYXBoUUxUeXBlcy5GSU5EX1JFU1VMVCksXG4gICAgYXN5bmMgcmVzb2x2ZShfc291cmNlLCBhcmdzLCBjb250ZXh0LCBxdWVyeUluZm8pIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IHtcbiAgICAgICAgICBjbGFzc05hbWUsXG4gICAgICAgICAgd2hlcmUsXG4gICAgICAgICAgb3JkZXIsXG4gICAgICAgICAgc2tpcCxcbiAgICAgICAgICBsaW1pdCxcbiAgICAgICAgICBrZXlzLFxuICAgICAgICAgIGluY2x1ZGUsXG4gICAgICAgICAgaW5jbHVkZUFsbCxcbiAgICAgICAgICByZWFkUHJlZmVyZW5jZSxcbiAgICAgICAgICBpbmNsdWRlUmVhZFByZWZlcmVuY2UsXG4gICAgICAgICAgc3VicXVlcnlSZWFkUHJlZmVyZW5jZSxcbiAgICAgICAgfSA9IGFyZ3M7XG4gICAgICAgIGNvbnN0IHsgY29uZmlnLCBhdXRoLCBpbmZvIH0gPSBjb250ZXh0O1xuICAgICAgICBjb25zdCBzZWxlY3RlZEZpZWxkcyA9IGdldEZpZWxkTmFtZXMocXVlcnlJbmZvKTtcblxuICAgICAgICByZXR1cm4gYXdhaXQgZmluZE9iamVjdHMoXG4gICAgICAgICAgY2xhc3NOYW1lLFxuICAgICAgICAgIHdoZXJlLFxuICAgICAgICAgIG9yZGVyLFxuICAgICAgICAgIHNraXAsXG4gICAgICAgICAgbGltaXQsXG4gICAgICAgICAga2V5cyxcbiAgICAgICAgICBpbmNsdWRlLFxuICAgICAgICAgIGluY2x1ZGVBbGwsXG4gICAgICAgICAgcmVhZFByZWZlcmVuY2UsXG4gICAgICAgICAgaW5jbHVkZVJlYWRQcmVmZXJlbmNlLFxuICAgICAgICAgIHN1YnF1ZXJ5UmVhZFByZWZlcmVuY2UsXG4gICAgICAgICAgY29uZmlnLFxuICAgICAgICAgIGF1dGgsXG4gICAgICAgICAgaW5mbyxcbiAgICAgICAgICBzZWxlY3RlZEZpZWxkc1xuICAgICAgICApO1xuICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBwYXJzZUdyYXBoUUxTY2hlbWEuaGFuZGxlRXJyb3IoZSk7XG4gICAgICB9XG4gICAgfSxcbiAgfTtcblxuICBjb25zdCBvYmplY3RzUXVlcnkgPSBuZXcgR3JhcGhRTE9iamVjdFR5cGUoe1xuICAgIG5hbWU6ICdPYmplY3RzUXVlcnknLFxuICAgIGRlc2NyaXB0aW9uOiAnT2JqZWN0c1F1ZXJ5IGlzIHRoZSB0b3AgbGV2ZWwgdHlwZSBmb3Igb2JqZWN0cyBxdWVyaWVzLicsXG4gICAgZmllbGRzOiBwYXJzZUdyYXBoUUxTY2hlbWEuZ3JhcGhRTE9iamVjdHNRdWVyaWVzLFxuICB9KTtcbiAgcGFyc2VHcmFwaFFMU2NoZW1hLmdyYXBoUUxUeXBlcy5wdXNoKG9iamVjdHNRdWVyeSk7XG5cbiAgcGFyc2VHcmFwaFFMU2NoZW1hLmdyYXBoUUxRdWVyaWVzLm9iamVjdHMgPSB7XG4gICAgZGVzY3JpcHRpb246ICdUaGlzIGlzIHRoZSB0b3AgbGV2ZWwgZm9yIG9iamVjdHMgcXVlcmllcy4nLFxuICAgIHR5cGU6IG9iamVjdHNRdWVyeSxcbiAgICByZXNvbHZlOiAoKSA9PiBuZXcgT2JqZWN0KCksXG4gIH07XG59O1xuXG5leHBvcnQgeyBnZXRPYmplY3QsIGZpbmRPYmplY3RzLCBsb2FkIH07XG4iXX0=