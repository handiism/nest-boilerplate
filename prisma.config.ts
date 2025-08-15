import { defineConfig } from 'prisma/config';
import 'dotenv/config';

export default defineConfig({
  schema: 'src/shared/app/prisma/schema.prisma',
  typedSql: {
    path: 'src/shared/app/prisma/sql',
  },
});
