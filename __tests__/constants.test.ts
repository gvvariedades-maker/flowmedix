describe('isAdminSessionEmail', () => {
  const originalAdminEmail = process.env.ADMIN_EMAIL;
  const originalAdminEmails = process.env.ADMIN_EMAILS;

  afterEach(() => {
    if (originalAdminEmail === undefined) {
      delete process.env.ADMIN_EMAIL;
    } else {
      process.env.ADMIN_EMAIL = originalAdminEmail;
    }
    if (originalAdminEmails === undefined) {
      delete process.env.ADMIN_EMAILS;
    } else {
      process.env.ADMIN_EMAILS = originalAdminEmails;
    }
    jest.resetModules();
  });

  it('sem ADMIN_EMAIL na env, nenhum e-mail é admin', async () => {
    delete process.env.ADMIN_EMAIL;
    delete process.env.ADMIN_EMAILS;
    const { isAdminSessionEmail } = await import('@/lib/constants');

    expect(isAdminSessionEmail('gvvariedades@gmail.com')).toBe(false);
    expect(isAdminSessionEmail('outro@gmail.com')).toBe(false);
  });

  it('reconhece ADMIN_EMAIL e ADMIN_EMAILS extras', async () => {
    process.env.ADMIN_EMAIL = 'Admin@Exemplo.com';
    process.env.ADMIN_EMAILS = 'segundo@exemplo.com, terceiro@exemplo.com';
    const { isAdminSessionEmail } = await import('@/lib/constants');

    expect(isAdminSessionEmail('admin@exemplo.com')).toBe(true);
    expect(isAdminSessionEmail('segundo@exemplo.com')).toBe(true);
    expect(isAdminSessionEmail('terceiro@exemplo.com')).toBe(true);
    expect(isAdminSessionEmail('gvvariedades@gmail.com')).toBe(false);
  });

  it('relê ADMIN_EMAIL em runtime sem reimport (anti Preview→Promote stale)', async () => {
    delete process.env.ADMIN_EMAIL;
    delete process.env.ADMIN_EMAILS;
    const { isAdminSessionEmail } = await import('@/lib/constants');

    expect(isAdminSessionEmail('gvvariedades@gmail.com')).toBe(false);

    process.env.ADMIN_EMAIL = 'gvvariedades@gmail.com';
    expect(isAdminSessionEmail('gvvariedades@gmail.com')).toBe(true);
  });
});

describe('getFreemiumStatusForUser (admin)', () => {
  const originalAdminEmail = process.env.ADMIN_EMAIL;

  afterEach(() => {
    if (originalAdminEmail === undefined) {
      delete process.env.ADMIN_EMAIL;
    } else {
      process.env.ADMIN_EMAIL = originalAdminEmail;
    }
    jest.resetModules();
  });

  it('libera limite diário para e-mail admin', async () => {
    process.env.ADMIN_EMAIL = 'admin@teste.com';
    jest.resetModules();

    const { getFreemiumStatusForUser } = await import('@/lib/freemium');
    const status = await getFreemiumStatusForUser('user-id-qualquer', 'admin@teste.com');

    expect(status.isPro).toBe(true);
    expect(status.limiteAtingido).toBe(false);
  });
});
