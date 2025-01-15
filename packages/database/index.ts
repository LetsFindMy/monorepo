import 'server-only';

import { PrismaClient } from '@prisma/client/edge';
import { withAccelerate } from '@prisma/extension-accelerate';
// import { keys } from './keys';

export * from '@prisma/client/edge';

// connectionString: keys().DATABASE_URL

const prisma = new PrismaClient().$extends(withAccelerate());
export default prisma;
export { prisma };
