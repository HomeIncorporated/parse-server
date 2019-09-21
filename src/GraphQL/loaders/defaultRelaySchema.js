import { nodeDefinitions, fromGlobalId } from 'graphql-relay';
import getFieldNames from 'graphql-list-fields';
import * as defaultGraphQLTypes from './defaultGraphQLTypes';
import * as objectsQueries from './objectsQueries';
import { extractKeysAndInclude } from './parseClassTypes';

const GLOBAL_ID_ATT = {
  description: 'This is the global id.',
  type: defaultGraphQLTypes.OBJECT_ID,
  resolve: ({ objectId }) => objectId,
};

const load = parseGraphQLSchema => {
  const { nodeInterface, nodeField } = nodeDefinitions(
    async (globalId, context, queryInfo) => {
      try {
        const { type, id } = fromGlobalId(globalId);
        const { config, auth, info } = context;
        const selectedFields = getFieldNames(queryInfo);

        const { keys, include } = extractKeysAndInclude(selectedFields);

        return {
          className: type,
          ...(await objectsQueries.getObject(
            type,
            id,
            keys,
            include,
            undefined,
            undefined,
            config,
            auth,
            info
          )),
        };
      } catch (e) {
        parseGraphQLSchema.handleError(e);
      }
    },
    obj => {
      return parseGraphQLSchema.parseClassTypes[obj.className]
        .classGraphQLOutputType;
    }
  );

  parseGraphQLSchema.relayNodeInterface = nodeInterface;
  parseGraphQLSchema.addGraphQLType(nodeInterface, true);
  parseGraphQLSchema.addGraphQLQuery('node', nodeField, true);
};

export { GLOBAL_ID_ATT, load };
