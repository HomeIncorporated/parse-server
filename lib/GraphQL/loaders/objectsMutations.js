"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.load = exports.deleteObject = exports.updateObject = exports.createObject = void 0;

var _graphql = require("graphql");

var defaultGraphQLTypes = _interopRequireWildcard(require("./defaultGraphQLTypes"));

var _rest = _interopRequireDefault(require("../../rest"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

const createObject = async (className, fields, config, auth, info) => {
  if (!fields) {
    fields = {};
  }

  return (await _rest.default.create(config, auth, className, fields, info.clientSDK)).response;
};

exports.createObject = createObject;

const updateObject = async (className, objectId, fields, config, auth, info) => {
  if (!fields) {
    fields = {};
  }

  return (await _rest.default.update(config, auth, className, {
    objectId
  }, fields, info.clientSDK)).response;
};

exports.updateObject = updateObject;

const deleteObject = async (className, objectId, config, auth, info) => {
  await _rest.default.del(config, auth, className, objectId, info.clientSDK);
  return true;
};

exports.deleteObject = deleteObject;

const load = parseGraphQLSchema => {
  parseGraphQLSchema.addGraphQLMutation('create', {
    description: 'The create mutation can be used to create a new object of a certain class.',
    args: {
      className: defaultGraphQLTypes.CLASS_NAME_ATT,
      fields: defaultGraphQLTypes.FIELDS_ATT
    },
    type: new _graphql.GraphQLNonNull(defaultGraphQLTypes.CREATE_RESULT),

    async resolve(_source, args, context) {
      try {
        const {
          className,
          fields
        } = args;
        const {
          config,
          auth,
          info
        } = context;
        return await createObject(className, fields, config, auth, info);
      } catch (e) {
        parseGraphQLSchema.handleError(e);
      }
    }

  }, true, true);
  parseGraphQLSchema.addGraphQLMutation('update', {
    description: 'The update mutation can be used to update an object of a certain class.',
    args: {
      className: defaultGraphQLTypes.CLASS_NAME_ATT,
      objectId: defaultGraphQLTypes.OBJECT_ID_ATT,
      fields: defaultGraphQLTypes.FIELDS_ATT
    },
    type: new _graphql.GraphQLNonNull(defaultGraphQLTypes.UPDATE_RESULT),

    async resolve(_source, args, context) {
      try {
        const {
          className,
          objectId,
          fields
        } = args;
        const {
          config,
          auth,
          info
        } = context;
        return await updateObject(className, objectId, fields, config, auth, info);
      } catch (e) {
        parseGraphQLSchema.handleError(e);
      }
    }

  }, true, true);
  parseGraphQLSchema.addGraphQLMutation('delete', {
    description: 'The delete mutation can be used to delete an object of a certain class.',
    args: {
      className: defaultGraphQLTypes.CLASS_NAME_ATT,
      objectId: defaultGraphQLTypes.OBJECT_ID_ATT
    },
    type: new _graphql.GraphQLNonNull(_graphql.GraphQLBoolean),

    async resolve(_source, args, context) {
      try {
        const {
          className,
          objectId
        } = args;
        const {
          config,
          auth,
          info
        } = context;
        return await deleteObject(className, objectId, config, auth, info);
      } catch (e) {
        parseGraphQLSchema.handleError(e);
      }
    }

  }, true, true);
};

exports.load = load;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9HcmFwaFFML2xvYWRlcnMvb2JqZWN0c011dGF0aW9ucy5qcyJdLCJuYW1lcyI6WyJjcmVhdGVPYmplY3QiLCJjbGFzc05hbWUiLCJmaWVsZHMiLCJjb25maWciLCJhdXRoIiwiaW5mbyIsInJlc3QiLCJjcmVhdGUiLCJjbGllbnRTREsiLCJyZXNwb25zZSIsInVwZGF0ZU9iamVjdCIsIm9iamVjdElkIiwidXBkYXRlIiwiZGVsZXRlT2JqZWN0IiwiZGVsIiwibG9hZCIsInBhcnNlR3JhcGhRTFNjaGVtYSIsImFkZEdyYXBoUUxNdXRhdGlvbiIsImRlc2NyaXB0aW9uIiwiYXJncyIsImRlZmF1bHRHcmFwaFFMVHlwZXMiLCJDTEFTU19OQU1FX0FUVCIsIkZJRUxEU19BVFQiLCJ0eXBlIiwiR3JhcGhRTE5vbk51bGwiLCJDUkVBVEVfUkVTVUxUIiwicmVzb2x2ZSIsIl9zb3VyY2UiLCJjb250ZXh0IiwiZSIsImhhbmRsZUVycm9yIiwiT0JKRUNUX0lEX0FUVCIsIlVQREFURV9SRVNVTFQiLCJHcmFwaFFMQm9vbGVhbiJdLCJtYXBwaW5ncyI6Ijs7Ozs7OztBQUFBOztBQUNBOztBQUNBOzs7Ozs7QUFFQSxNQUFNQSxZQUFZLEdBQUcsT0FBT0MsU0FBUCxFQUFrQkMsTUFBbEIsRUFBMEJDLE1BQTFCLEVBQWtDQyxJQUFsQyxFQUF3Q0MsSUFBeEMsS0FBaUQ7QUFDcEUsTUFBSSxDQUFDSCxNQUFMLEVBQWE7QUFDWEEsSUFBQUEsTUFBTSxHQUFHLEVBQVQ7QUFDRDs7QUFFRCxTQUFPLENBQUMsTUFBTUksY0FBS0MsTUFBTCxDQUFZSixNQUFaLEVBQW9CQyxJQUFwQixFQUEwQkgsU0FBMUIsRUFBcUNDLE1BQXJDLEVBQTZDRyxJQUFJLENBQUNHLFNBQWxELENBQVAsRUFDSkMsUUFESDtBQUVELENBUEQ7Ozs7QUFTQSxNQUFNQyxZQUFZLEdBQUcsT0FDbkJULFNBRG1CLEVBRW5CVSxRQUZtQixFQUduQlQsTUFIbUIsRUFJbkJDLE1BSm1CLEVB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QUF6QjtBQVFELE9BWkQsQ0FZRSxPQUFPd0IsQ0FBUCxFQUFVO0FBQ1ZiLFFBQUFBLGtCQUFrQixDQUFDYyxXQUFuQixDQUErQkQsQ0FBL0I7QUFDRDtBQUNGOztBQXpCSCxHQUZGLEVBNkJFLElBN0JGLEVBOEJFLElBOUJGO0FBaUNBYixFQUFBQSxrQkFBa0IsQ0FBQ0Msa0JBQW5CLENBQ0UsUUFERixFQUVFO0FBQ0VDLElBQUFBLFdBQVcsRUFDVCx5RUFGSjtBQUdFQyxJQUFBQSxJQUFJLEVBQUU7QUFDSmxCLE1BQUFBLFNBQVMsRUFBRW1CLG1CQUFtQixDQUFDQyxjQUQzQjtBQUVKVixNQUFBQSxRQUFRLEVBQUVTLG1CQUFtQixDQUFDVztBQUYxQixLQUhSO0FBT0VSLElBQUFBLElBQUksRUFBRSxJQUFJQyx1QkFBSixDQUFtQlMsdUJBQW5CLENBUFI7O0FBUUUsVUFBTVAsT0FBTixDQUFjQyxPQUFkLEVBQXVCUixJQUF2QixFQUE2QlMsT0FBN0IsRUFBc0M7QUFDcEMsVUFBSTtBQUNGLGNBQU07QUFBRTNCLFVBQUFBLFNBQUY7QUFBYVUsVUFBQUE7QUFBYixZQUEwQlEsSUFBaEM7QUFDQSxjQUFNO0FBQUVoQixVQUFBQSxNQUFGO0FBQVVDLFVBQUFBLElBQVY7QUFBZ0JDLFVBQUFBO0FBQWhCLFlBQXlCdUIsT0FBL0I7QUFFQSxlQUFPLE1BQU1mLFlBQVksQ0FBQ1osU0FBRCxFQUFZVSxRQUFaLEVBQXNCUixNQUF0QixFQUE4QkMsSUFBOUIsRUFBb0NDLElBQXBDLENBQXpCO0FBQ0QsT0FMRCxDQUtFLE9BQU93QixDQUFQLEVBQVU7QUFDVmIsUUFBQUEsa0JBQWtCLENBQUNjLFdBQW5CLENBQStCRCxDQUEvQjtBQUNEO0FBQ0Y7O0FBakJILEdBRkYsRUFxQkUsSUFyQkYsRUFzQkUsSUF0QkY7QUF3QkQsQ0FuRkQiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBHcmFwaFFMTm9uTnVsbCwgR3JhcGhRTEJvb2xlYW4gfSBmcm9tICdncmFwaHFsJztcbmltcG9ydCAqIGFzIGRlZmF1bHRHcmFwaFFMVHlwZXMgZnJvbSAnLi9kZWZhdWx0R3JhcGhRTFR5cGVzJztcbmltcG9ydCByZXN0IGZyb20gJy4uLy4uL3Jlc3QnO1xuXG5jb25zdCBjcmVhdGVPYmplY3QgPSBhc3luYyAoY2xhc3NOYW1lLCBmaWVsZHMsIGNvbmZpZywgYXV0aCwgaW5mbykgPT4ge1xuICBpZiAoIWZpZWxkcykge1xuICAgIGZpZWxkcyA9IHt9O1xuICB9XG5cbiAgcmV0dXJuIChhd2FpdCByZXN0LmNyZWF0ZShjb25maWcsIGF1dGgsIGNsYXNzTmFtZSwgZmllbGRzLCBpbmZvLmNsaWVudFNESykpXG4gICAgLnJlc3BvbnNlO1xufTtcblxuY29uc3QgdXBkYXRlT2JqZWN0ID0gYXN5bmMgKFxuICBjbGFzc05hbWUsXG4gIG9iamVjdElkLFxuICBmaWVsZHMsXG4gIGNvbmZpZyxcbiAgYXV0aCxcbiAgaW5mb1xuKSA9PiB7XG4gIGlmICghZmllbGRzKSB7XG4gICAgZmllbGRzID0ge307XG4gIH1cblxuICByZXR1cm4gKGF3YWl0IHJlc3QudXBkYXRlKFxuICAgIGNvbmZpZyxcbiAgICBhdXRoLFxuICAgIGNsYXNzTmFtZSxcbiAgICB7IG9iamVjdElkIH0sXG4gICAgZmllbGRzLFxuICAgIGluZm8uY2xpZW50U0RLXG4gICkpLnJlc3BvbnNlO1xufTtcblxuY29uc3QgZGVsZXRlT2JqZWN0ID0gYXN5bmMgKGNsYXNzTmFtZSwgb2JqZWN0SWQsIGNvbmZpZywgYXV0aCwgaW5mbykgPT4ge1xuICBhd2FpdCByZXN0LmRlbChjb25maWcsIGF1dGgsIGNsYXNzTmFtZSwgb2JqZWN0SWQsIGluZm8uY2xpZW50U0RLKTtcbiAgcmV0dXJuIHRydWU7XG59O1xuXG5jb25zdCBsb2FkID0gcGFyc2VHcmFwaFFMU2NoZW1hID0+IHtcbiAgcGFyc2VHcmFwaFFMU2NoZW1hLmFkZEdyYXBoUUxNdXRhdGlvbihcbiAgICAnY3JlYXRlJyxcbiAgICB7XG4gICAgICBkZXNjcmlwdGlvbjpcbiAgICAgICAgJ1RoZSBjcmVhdGUgbXV0YXRpb24gY2FuIGJlIHVzZWQgdG8gY3JlYXRlIGEgbmV3IG9iamVjdCBvZiBhIGNlcnRhaW4gY2xhc3MuJyxcbiAgICAgIGFyZ3M6IHtcbiAgICAgICAgY2xhc3NOYW1lOiBkZWZhdWx0R3JhcGhRTFR5cGVzLkNMQVNTX05BTUVfQVRULFxuICAgICAgICBmaWVsZHM6IGRlZmF1bHRHcmFwaFFMVHlwZXMuRklFTERTX0FUVCxcbiAgICAgIH0sXG4gICAgICB0eXBlOiBuZXcgR3JhcGhRTE5vbk51bGwoZGVmYXVsdEdyYXBoUUxUeXBlcy5DUkVBVEVfUkVTVUxUKSxcbiAgICAgIGFzeW5jIHJlc29sdmUoX3NvdXJjZSwgYXJncywgY29udGV4dCkge1xuICAgICAgICB0cnkge1xuICAgICAgICAgIGNvbnN0IHsgY2xhc3NOYW1lLCBmaWVsZHMgfSA9IGFyZ3M7XG4gICAgICAgICAgY29uc3QgeyBjb25maWcsIGF1dGgsIGluZm8gfSA9IGNvbnRleHQ7XG5cbiAgICAgICAgICByZXR1cm4gYXdhaXQgY3JlYXRlT2JqZWN0KGNsYXNzTmFtZSwgZmllbGRzLCBjb25maWcsIGF1dGgsIGluZm8pO1xuICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgcGFyc2VHcmFwaFFMU2NoZW1hLmhhbmRsZUVycm9yKGUpO1xuICAgICAgICB9XG4gICAgICB9LFxuICAgIH0sXG4gICAgdHJ1ZSxcbiAgICB0cnVlXG4gICk7XG5cbiAgcGFyc2VHcmFwaFFMU2NoZW1hLmFkZEdyYXBoUUxNdXRhdGlvbihcbiAgICAndXBkYXRlJyxcbiAgICB7XG4gICAgICBkZXNjcmlwdGlvbjpcbiAgICAgICAgJ1RoZSB1cGRhdGUgbXV0YXRpb24gY2FuIGJlIHVzZWQgdG8gdXBkYXRlIGFuIG9iamVjdCBvZiBhIGNlcnRhaW4gY2xhc3MuJyxcbiAgICAgIGFyZ3M6IHtcbiAgICAgICAgY2xhc3NOYW1lOiBkZWZhdWx0R3JhcGhRTFR5cGVzLkNMQVNTX05BTUVfQVRULFxuICAgICAgICBvYmplY3RJZDogZGVmYXVsdEdyYXBoUUxUeXBlcy5PQkpFQ1RfSURfQVRULFxuICAgICAgICBmaWVsZHM6IGRlZmF1bHRHcmFwaFFMVHlwZXMuRklFTERTX0FUVCxcbiAgICAgIH0sXG4gICAgICB0eXBlOiBuZXcgR3JhcGhRTE5vbk51bGwoZGVmYXVsdEdyYXBoUUxUeXBlcy5VUERBVEVfUkVTVUxUKSxcbiAgICAgIGFzeW5jIHJlc29sdmUoX3NvdXJjZSwgYXJncywgY29udGV4dCkge1xuICAgICAgICB0cnkge1xuICAgICAgICAgIGNvbnN0IHsgY2xhc3NOYW1lLCBvYmplY3RJZCwgZmllbGRzIH0gPSBhcmdzO1xuICAgICAgICAgIGNvbnN0IHsgY29uZmlnLCBhdXRoLCBpbmZvIH0gPSBjb250ZXh0O1xuXG4gICAgICAgICAgcmV0dXJuIGF3YWl0IHVwZGF0ZU9iamVjdChcbiAgICAgICAgICAgIGNsYXNzTmFtZSxcbiAgICAgICAgICAgIG9iamVjdElkLFxuICAgICAgICAgICAgZmllbGRzLFxuICAgICAgICAgICAgY29uZmlnLFxuICAgICAgICAgICAgYXV0aCxcbiAgICAgICAgICAgIGluZm9cbiAgICAgICAgICApO1xuICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgcGFyc2VHcmFwaFFMU2NoZW1hLmhhbmRsZUVycm9yKGUpO1xuICAgICAgICB9XG4gICAgICB9LFxuICAgIH0sXG4gICAgdHJ1ZSxcbiAgICB0cnVlXG4gICk7XG5cbiAgcGFyc2VHcmFwaFFMU2NoZW1hLmFkZEdyYXBoUUxNdXRhdGlvbihcbiAgICAnZGVsZXRlJyxcbiAgICB7XG4gICAgICBkZXNjcmlwdGlvbjpcbiAgICAgICAgJ1RoZSBkZWxldGUgbXV0YXRpb24gY2FuIGJlIHVzZWQgdG8gZGVsZXRlIGFuIG9iamVjdCBvZiBhIGNlcnRhaW4gY2xhc3MuJyxcbiAgICAgIGFyZ3M6IHtcbiAgICAgICAgY2xhc3NOYW1lOiBkZWZhdWx0R3JhcGhRTFR5cGVzLkNMQVNTX05BTUVfQVRULFxuICAgICAgICBvYmplY3RJZDogZGVmYXVsdEdyYXBoUUxUeXBlcy5PQkpFQ1RfSURfQVRULFxuICAgICAgfSxcbiAgICAgIHR5cGU6IG5ldyBHcmFwaFFMTm9uTnVsbChHcmFwaFFMQm9vbGVhbiksXG4gICAgICBhc3luYyByZXNvbHZlKF9zb3VyY2UsIGFyZ3MsIGNvbnRleHQpIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICBjb25zdCB7IGNsYXNzTmFtZSwgb2JqZWN0SWQgfSA9IGFyZ3M7XG4gICAgICAgICAgY29uc3QgeyBjb25maWcsIGF1dGgsIGluZm8gfSA9IGNvbnRleHQ7XG5cbiAgICAgICAgICByZXR1cm4gYXdhaXQgZGVsZXRlT2JqZWN0KGNsYXNzTmFtZSwgb2JqZWN0SWQsIGNvbmZpZywgYXV0aCwgaW5mbyk7XG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICBwYXJzZUdyYXBoUUxTY2hlbWEuaGFuZGxlRXJyb3IoZSk7XG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgfSxcbiAgICB0cnVlLFxuICAgIHRydWVcbiAgKTtcbn07XG5cbmV4cG9ydCB7IGNyZWF0ZU9iamVjdCwgdXBkYXRlT2JqZWN0LCBkZWxldGVPYmplY3QsIGxvYWQgfTtcbiJdfQ==