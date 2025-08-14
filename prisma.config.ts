import { defineConfig } from 'prisma/config';
import 'dotenv/config';

export default defineConfig({
  schema: 'src/shared/prisma/schema.prisma',
  typedSql: {
    path: 'src/shared/prisma/sql',
  },
});
