import { UserPartial } from '@/db/zod/index.js';

export function prepareUserResponse(user: UserPartial) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
  };
}
