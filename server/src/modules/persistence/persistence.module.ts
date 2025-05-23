import { Module, Global } from '@nestjs/common';
import { RedisModule } from './redis/redis.module';
import { MongodbModule } from './mongodb/mongodb.module';

@Global()
@Module({
  imports: [RedisModule, MongodbModule],
  exports: [RedisModule, MongodbModule],
})
export class PersistenceModule {}