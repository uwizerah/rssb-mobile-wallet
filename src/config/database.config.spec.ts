describe('TypeORM Config', () => {
  beforeEach(() => {
    jest.resetModules();

    process.env.DATABASE_HOST = 'localhost';
    process.env.DATABASE_PORT = '5432';
    process.env.DATABASE_USERNAME = 'testuser';
    process.env.DATABASE_PASSWORD = 'testpass';
    process.env.DATABASE_NAME = 'testdb';
  });

  it('should return the correct TypeORM configuration based on environment variables', async () => {
    const { typeOrmConfig } = await import('./database.config');

    expect(typeOrmConfig).toEqual({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'testuser',
      password: 'testpass',
      database: 'testdb',
      entities: [expect.stringContaining('/../**/*.entity{.ts,.js}')],
      synchronize: true,
    });
  });

  it('should return default values when environment variables are not set', async () => {
    jest.resetModules();

    // Clear environment variables
    delete process.env.DATABASE_HOST;
    delete process.env.DATABASE_PORT;
    delete process.env.DATABASE_USERNAME;
    delete process.env.DATABASE_PASSWORD;
    delete process.env.DATABASE_NAME;

    const { typeOrmConfig } = await import('./database.config');

    expect(typeOrmConfig).toEqual({
      type: 'postgres',
      host: 'db',
      port: 5432,
      username: 'user',
      password: 'password',
      database: 'mydb',
      entities: [expect.stringContaining('/../**/*.entity{.ts,.js}')],
      synchronize: true,
    });
  });
});
