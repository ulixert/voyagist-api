export const enum HttpStatusCode {
  OK = 200,
  CREATED = 201,
  NO_CONTENT = 204,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  NOT_FOUND = 404,
  CONFLICT = 409,
  SERVER_ERROR = 500,
}

function generateEntityMessages(entity: string) {
  return {
    NOT_FOUND: `${entity} not found`,
    CREATED: `${entity} created successfully`,
    UPDATED: `${entity} updated successfully`,
    DELETED: `${entity} deleted successfully`,
    ALREADY_EXISTS: `${entity} already exists`,
  };
}

export const AppMessage = {
  SERVER_ERROR: 'An error occurred on the server. Please try again later.',
  DATABASE_ERROR: 'There was a database error.',
  ID_FORMAT_ERROR: 'ID must be a positive number',
  NOT_FOUND: 'Not found',
};
export const TourMessage = generateEntityMessages('Tour');
// export const UserMessage = generateEntityMessages('User');
export const UserMessage = {
  ...generateEntityMessages('User'),
  EMAIL_ALREADY_EXISTS: 'Email already exists',
  AUTHENTICATION_FAILED: 'Incorrect email or password',
} as const;
