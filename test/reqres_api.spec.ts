import pactum from 'pactum';
import { SimpleReporter } from '../simple-reporter';
import { faker } from '@faker-js/faker';
import { StatusCodes } from 'http-status-codes';

describe('Postman Echo API - Teste de CRUD com PactumJS', () => {
  const p = pactum;
  const rep = SimpleReporter;
  const baseUrl = 'https://postman-echo.com';

  p.request.setDefaultTimeout(30000);

  beforeAll(async () => {
    p.reporter.add(rep);
  });

  describe('Cenário 1: POST - Enviar dados com validação', () => {
    it('Deve fazer POST com sucesso retornando status 200', async () => {
      await p
        .spec()
        .post(`${baseUrl}/post`)
        .withJson({
          name: faker.person.fullName(),
          email: faker.internet.email(),
          message: faker.lorem.sentence()
        })
        .expectStatus(StatusCodes.OK)
        .expectJsonSchema({
          type: 'object',
          properties: {
            data: {
              type: 'object',
              properties: {
                name: { type: 'string' },
                email: { type: 'string' },
                message: { type: 'string' }
              }
            }
          },
          required: ['data']
        })
        .expectBodyContains('data');
    });

    it('Deve validar estrutura de resposta POST com múltiplos campos', async () => {
      await p
        .spec()
        .post(`${baseUrl}/post`)
        .withJson({
          title: faker.commerce.productName(),
          description: faker.lorem.paragraph(),
          category: 'testing',
          status: 'active'
        })
        .expectStatus(StatusCodes.OK)
        .expectBodyContains('title');
    });
  });

  describe('Cenário 2: PUT - Atualizar dados completamente', () => {
    it('Deve fazer PUT e retornar status 200 com dados atualizados', async () => {
      await p
        .spec()
        .put(`${baseUrl}/put`)
        .withJson({
          id: 1,
          name: 'Updated Name',
          description: faker.lorem.sentence(),
          status: 'updated'
        })
        .expectStatus(StatusCodes.OK)
        .expectJsonSchema({
          type: 'object',
          properties: {
            data: {
              type: 'object',
              properties: {
                name: { type: 'string' },
                status: { type: 'string' }
              }
            }
          },
          required: ['data']
        })
        .expectBodyContains('updated');
    });

    it('Deve validar que PUT preserva estrutura de dados', async () => {
      await p
        .spec()
        .put(`${baseUrl}/put`)
        .withJson({
          userId: 123,
          title: 'Complete Update',
          content: faker.lorem.paragraph()
        })
        .expectStatus(StatusCodes.OK)
        .expectBodyContains('userId');
    });
  });

  describe('Cenário 3: PATCH - Atualizar dados parcialmente', () => {
    it('Deve fazer PATCH com alguns campos e retornar status 200', async () => {
      await p
        .spec()
        .patch(`${baseUrl}/patch`)
        .withJson({
          status: 'modified',
          lastModified: new Date().toISOString()
        })
        .expectStatus(StatusCodes.OK)
        .expectJsonSchema({
          type: 'object',
          properties: {
            data: {
              type: 'object',
              properties: {
                status: { type: 'string' }
              }
            }
          },
          required: ['data']
        })
        .expectBodyContains('modified');
    });

    it('Deve validar resposta de PATCH com múltiplos campos parciais', async () => {
      await p
        .spec()
        .patch(`${baseUrl}/patch`)
        .withJson({
          category: 'updated-category',
          tags: ['test', 'api', 'pactum']
        })
        .expectStatus(StatusCodes.OK)
        .expectBodyContains('category');
    });
  });

  describe('Cenário 4: DELETE - Remover dados', () => {
    it('Deve fazer DELETE e retornar status 200 com confirmação', async () => {
      await p
        .spec()
        .delete(`${baseUrl}/delete`)
        .withJson({
          id: 1,
          reason: 'test deletion'
        })
        .expectStatus(StatusCodes.OK)
        .expectJsonSchema({
          type: 'object',
          properties: {
            data: { type: 'object' }
          },
          required: ['data']
        });
    });

    it('Deve validar estrutura de resposta DELETE', async () => {
      await p
        .spec()
        .delete(`${baseUrl}/delete`)
        .withJson({
          resourceId: 999,
          confirmed: true
        })
        .expectStatus(StatusCodes.OK)
        .expectBodyContains('data');
    });
  });

  describe('Cenário 5: Ciclo completo de operações sem GET', () => {
    it('Deve criar um novo recurso com POST', async () => {
      await p
        .spec()
        .post(`${baseUrl}/post`)
        .withJson({
          resource: 'complete-cycle',
          action: 'create',
          timestamp: new Date().toISOString()
        })
        .expectStatus(StatusCodes.OK)
        .expectBodyContains('resource');
    });

    it('Deve atualizar completamente com PUT', async () => {
      await p
        .spec()
        .put(`${baseUrl}/put`)
        .withJson({
          resource: 'complete-cycle',
          action: 'update-full',
          version: 2
        })
        .expectStatus(StatusCodes.OK)
        .expectBodyContains('version');
    });

    it('Deve fazer atualização parcial com PATCH', async () => {
      await p
        .spec()
        .patch(`${baseUrl}/patch`)
        .withJson({
          action: 'update-partial',
          version: 3
        })
        .expectStatus(StatusCodes.OK)
        .expectBodyContains('action');
    });

    it('Deve deletar o recurso com DELETE', async () => {
      await p
        .spec()
        .delete(`${baseUrl}/delete`)
        .withJson({
          resource: 'complete-cycle',
          action: 'delete'
        })
        .expectStatus(StatusCodes.OK)
        .expectBodyContains('data');
    });

    it('Deve validar ciclo completo sem requisições GET', async () => {
      const resourceData = {
        resource: 'validation-test',
        createdAt: new Date().toISOString()
      };

      await p
        .spec()
        .post(`${baseUrl}/post`)
        .withJson(resourceData)
        .expectStatus(StatusCodes.OK)
        .expectBodyContains('resource');

      await p
        .spec()
        .put(`${baseUrl}/put`)
        .withJson({ ...resourceData, status: 'modified' })
        .expectStatus(StatusCodes.OK);

      await p
        .spec()
        .patch(`${baseUrl}/patch`)
        .withJson({ status: 'finalized' })
        .expectStatus(StatusCodes.OK);

      await p
        .spec()
        .delete(`${baseUrl}/delete`)
        .withJson({ resource: 'validation-test' })
        .expectStatus(StatusCodes.OK);
    });
  });

  afterAll(() => p.reporter.end());
});
