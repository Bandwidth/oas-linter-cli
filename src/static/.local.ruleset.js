import { truthy, falsy, casing, pattern } from "@stoplight/spectral-functions";
import { oas } from "@stoplight/spectral-rulesets";

// Custom Ruleset Functions
const validate5xx = (input) => {
  // Compile a list of all the status codes defined for a response object
  const statusCodeArray = [];
  for (let x in input) {
    statusCodeArray.push(x);
  }

  // Check to see if one of the status codes in the array matches our regex pattern for 5XX errors
  const match = statusCodeArray.find((value) =>
    /(5[0-9][0-9])|5XX/.test(value)
  );

  // If no match is found, return an error
  if (!match) {
    return [
      {
        message: "Responses must document a 5XX error.",
      },
    ];
  }
};

// Ruleset
export default {
  extends: oas,
  rules: {
    openApiFields: {
      description: "There should be components, security, and a tags object.",
      message: "The spec is missing the '{{property}}' object.",
      given: "$",
      severity: "error",
      then: [
        {
          field: "security",
          function: truthy,
        },
        {
          field: "tags",
          function: truthy,
        },
        {
          field: "components",
          function: truthy,
        },
      ],
    },
    infoFieldsRequired: {
      description:
        "The Info object must include a title, version, description, and termsOfService.",
      message: "The Info object is missing the '{{property}}' property.",
      given: "$.info",
      severity: "error",
      then: [
        {
          field: "title",
          function: truthy,
        },
        {
          field: "version",
          function: truthy,
        },
        {
          field: "description",
          function: truthy,
        },
        {
          field: "termsOfService",
          function: truthy,
        },
      ],
    },
    validSemanticVersion: {
      description:
        "Verifies that the version is a valid semantic version in the format `x.x.x`.",
      message:
        "The spec should follow semantic versioning. '{{value}}' is not a valid version.",
      severity: "error",
      given: "$.info.version",
      then: [
        {
          function: pattern,
          functionOptions: {
            match:
              "^(0|[1-9]\\d*)\\.(0|[1-9]\\d*)\\.(0|[1-9]\\d*)(?:-((?:0|[1-9]\\d*|\\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\\.(?:0|[1-9]\\d*|\\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\\+([0-9a-zA-Z-]+(?:\\.[0-9a-zA-Z-]+)*))?$",
          },
        },
      ],
    },
    pathsSummary: {
      description: "There needs to be a summary field for every method.",
      message: "There needs to be a summary property for every method.",
      given: "$.paths.*.*",
      resolved: false,
      severity: "error",
      then: [
        {
          field: "summary",
          function: truthy,
        },
      ],
    },
    componentsFieldsRequired: {
      description:
        "All of the following components sections must exist - Schemas, Responses, and SecuritySchema.",
      message: "Components is missing the '{{property}}' section.",
      given: "$.components",
      severity: "error",
      then: [
        {
          field: "schemas",
          function: truthy,
        },
        {
          field: "responses",
          function: truthy,
        },
        {
          field: "securitySchemes",
          function: truthy,
        },
      ],
    },
    pathsParametersUsesGlobalReference: {
      description: "There should be a parameters sections within components.",
      message:
        "{{property}} is not using a globally defined parameter. All parameters must be defined and referenced using the `$.components.parameters` section.",
      given: "$.paths.[*][*].parameters[*]",
      resolved: false,
      severity: "warn",
      then: [
        {
          field: "$ref",
          function: truthy,
        },
      ],
    },
    pathsRequestBodiesUsesGlobalReference: {
      description:
        "Request bodies for operations should be a reference a globally defined component.",
      message:
        "{{property}} is missing the '$ref' attribute. Global requestBody reference not properly implemented",
      given: "$.paths.[*].[put,patch,post].requestBody",
      severity: "warn",
      resolved: false,
      then: [
        {
          field: "$ref",
          function: truthy,
        },
      ],
    },
    pathsRequestBodiesCantDefineContent: {
      description:
        "Request bodies for operations should not define their own 'content' properties.",
      message:
        "Opertaion request bodies cannot define their own {{property}} properties - please define and refernece using the `$.components.requestBodues` section.",
      given: "$.paths.[*].[put,patch,post].requestBody",
      severity: "warn",
      resolved: false,
      then: [
        {
          field: "content",
          function: falsy,
        },
      ],
    },
    camelCaseOperationId: {
      description: "All operationIds should be written in camelCase.",
      message: "'{{value}}' needs to be written in camelCase.",
      type: "style",
      given: "$.paths.*.*.operationId",
      severity: "error",
      then: [
        {
          function: casing,
          functionOptions: {
            type: "camel",
          },
        },
      ],
    },
    camelCaseComponents: {
      description:
        "All components (schemas, parameters, etc) should be named in camelCase.",
      message: "'{{property}}' needs to be written in camelCase.",
      type: "style",
      given:
        "$.components.[schemas,parameters,requestBodies,examples,responses].*~",
      severity: "warn",
      then: [
        {
          function: casing,
          functionOptions: {
            type: "camel",
          },
        },
      ],
    },
    camelCaseComponentNames: {
      description: "All component names should be written in camelCase.",
      message: "'{{property}}' needs to be written in camelCase.",
      type: "style",
      given:
        "$.components.[schemas,parameters,requestBodies,examples,responses].*.name",
      severity: "warn",
      then: [
        {
          function: casing,
          functionOptions: {
            type: "camel",
          },
        },
      ],
    },
    sentenceCaseDescriptions: {
      description: "Descriptions should be written in a normal sentence case.",
      message: "'{{value}}' needs to be written in sentence case.",
      type: "style",
      given: "$..description",
      severity: "warn",
      then: [
        {
          function: pattern,
          functionOptions: {
            match: "(^[A-Z]|(?<=[.?!]))*[A-Z][-_`)(A-Za-z0-9,;'\"\\s]*[.?!]",
          },
        },
      ],
    },
    macroCaseEnum: {
      description: "Enums should be in MACRO_CASE.",
      message: "Enum value '{{value}}' should be written in MACRO_CASE",
      type: "style",
      given: "$.components..enum.[*]",
      severity: "warn",
      then: [
        {
          function: casing,
          functionOptions: {
            type: "macro",
          },
        },
      ],
    },
    required4xxResponses: {
      description:
        "Resources must declare a response for HTTP 400, 401, 403, 404, 405, and 429 errors.",
      message:
        "The resource is missing a definition for a '{{property}}' response.",
      given: "$.paths..responses",
      severity: "warn",
      then: [
        {
          field: "400",
          function: truthy,
        },
        {
          field: "401",
          function: truthy,
        },
        {
          field: "403",
          function: truthy,
        },
        {
          field: "404",
          function: truthy,
        },
        {
          field: "405",
          function: truthy,
        },
        {
          field: "429",
          function: truthy,
        },
      ],
    },
    internalServerError: {
      description:
        "Resources must declare a response for a HTTP 500 Internal Server error",
      message: "{{error}}",
      given: "$.paths..responses",
      severity: "warn",
      then: [
        {
          function: validate5xx,
        },
      ],
    },
    globallyDefinedResponses: {
      description:
        "Responses should be defined globally and referenced elsewhere.",
      message:
        "All responses should be defined globally and only referenced everywhere else.",
      given: '$.paths.[*].responses[?(!@path.includes("204"))]',
      resolved: false,
      severity: "error",
      then: [
        {
          field: "$ref",
          function: truthy,
        },
      ],
    },
    serversUseHttps: {
      description: "All servers should point to an HTTPS URL.",
      message: "'{{value}}' is not an https url.",
      severity: "warn",
      given: [
        "$.servers..url",
        "$.paths.[*].servers..url",
        "$.paths.[*][*].servers..url",
      ],
      then: [
        {
          function: pattern,
          functionOptions: {
            match:
              "^https:\\/\\/(www\\.)?[-a-zA-Z0-9@:%._\\+~#=]{1,256}\\.[a-zA-Z0-9()]{1,6}\\b([-a-zA-Z0-9()@:%_\\+.~#?&\\/\\/=]*)",
          },
        },
      ],
    },
    noEmptyPath: {
      description: "Paths should not contain double '/' characters.",
      message: "'{{property}}' contains double `/` characters.",
      severity: "error",
      given: "$.paths",
      then: {
        field: "@key",
        function: pattern,
        functionOptions: {
          notMatch: "(\\/){2,}",
        },
      },
    },
    noEmptyPathInServer: {
      description: "Servers should not contain double '/' after the protocol.",
      message: "'{{value}}' contains double `/` characters.",
      severity: "error",
      given: [
        "$.servers..url",
        "$.paths.[*].servers..url",
        "$.paths.[*][*].servers..url",
      ],
      then: {
        function: pattern,
        functionOptions: {
          notMatch: "(?<!https:|http:)(\\/){2,}",
        },
      },
    },
    propertiesHaveExamples: {
      description: "All schema properties should have an `example` defined.",
      message: "{{path}} is missing an example.",
      severity: "error",
      given:
        "$..schemas..[?(@property !== 'properties' && (@.type || @.format || @.$ref) && @.type != 'object')]",
      then: {
        field: "example",
        function: truthy,
      },
    },
  },
};
