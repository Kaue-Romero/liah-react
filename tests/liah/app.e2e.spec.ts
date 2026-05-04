import { expect, test, type Page } from '@playwright/test';

const product = {
  id: 101,
  nome: 'Whey Protein',
  marca: 'Liah Labs',
  sabor: 'Baunilha',
  peso: '900g',
  foto: '/img/loading.gif',
  preco: 12990,
  precoNaoPromocional: 14990,
  precoOriginal: 12990,
  nota: 4.8,
  categoria: ['Proteínas'],
  disponivel: 1,
  palavrasChave: ['whey', 'proteina']
};

async function mockLiahApi(page: Page) {
  await page.route('https://hubdiet.com/api_app/**', async (route) => {
    const url = route.request().url();

    if (url.endsWith('/carregarProdutos_v4.php')) {
      await route.fulfill({
        json: {
          produtos: {
            [product.id]: product
          },
          indicados: [
            {
              'nome-lista': 'Prescrição',
              produtos: [{ id: product.id }]
            }
          ]
        }
      });
      return;
    }

    if (url.endsWith('/carregarCategorias.php')) {
      await route.fulfill({
        json: [
          {
            id: 'proteinas',
            titulo: 'Proteínas',
            chave: 'proteinas',
            produtos: [product.id]
          }
        ]
      });
      return;
    }

    if (url.endsWith('/checkStatusCliente.php')) {
      await route.fulfill({ json: { campanhas: [] } });
      return;
    }

    if (url.endsWith('/get_carrossel_liah.php')) {
      await route.fulfill({ json: { data: [] } });
      return;
    }

    if (url.endsWith('/carregarDetalhesProduto.php')) {
      await route.fulfill({ json: { descricao: 'Suplemento proteico.' } });
      return;
    }

    await route.fulfill({ json: {} });
  });
}

test.beforeEach(async ({ page }) => {
  await mockLiahApi(page);
});

test('renders recommendations from mocked API', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByPlaceholder('Buscar na loja Liah…')).toBeVisible();
  await expect(page.getByText('Prescrição')).toBeVisible();
  await expect(page.getByText('Whey Protein - 900g - Baunilha')).toBeVisible();
});

test('search filters products and opens cart modal', async ({ page }) => {
  await page.goto('/');

  await page.getByPlaceholder('Buscar na loja Liah…').fill('whey');
  await expect(page.getByText('Whey Protein - 900g - Baunilha')).toBeVisible();

  await page.getByLabel('Adicionar produto').click();
  await page.getByRole('button', { name: /ir para o carrinho/i }).click();

  await expect(page.getByRole('dialog', { name: 'Carrinho' })).toBeVisible();
  await expect(page.getByText('Resumo do carrinho')).toBeVisible();
});
