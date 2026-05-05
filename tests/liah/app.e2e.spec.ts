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

    if (url.endsWith('/infoUsuario.php')) {
      await route.fulfill({
        json: {
          enderecos_final: [],
          carteira_final: [],
          shipping_options: [],
          frete: 0
        }
      });
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

  await expect(page.getByPlaceholder('Buscar na loja Liah')).toBeVisible();
  await expect(page.getByText('Prescrição')).toBeVisible();
  await expect(page.getByText('Whey Protein - 900g - Baunilha')).toBeVisible();
});

test('search filters products and opens cart modal', async ({ page }) => {
  await page.goto('/');

  await page.getByPlaceholder('Buscar na loja Liah').fill('whey');
  await expect(page.getByText('Whey Protein - 900g - Baunilha')).toBeVisible();

  await page.getByLabel('Adicionar produto').click();
  await page.getByRole('button', { name: /ir para o carrinho/i }).click();

  await expect(page.getByRole('dialog', { name: 'Carrinho' })).toBeVisible();
  await expect(page.getByText('Resumo do carrinho')).toBeVisible();
});

test('recommendations layout renders section header, carousel, and rating', async ({ page }, testInfo) => {
  await page.goto('/');

  await expect(page.getByText('Prescrição')).toBeVisible();

  const section = page.locator('.section-categoria').filter({ hasText: 'Prescrição' });
  await expect(section).toBeVisible();
  await expect(section.locator('.produtos-categoria')).toBeVisible();
  await expect(section.locator('#produto101')).toBeVisible();
  await expect(section.locator('.liah-react-rating')).toContainText('4.8');
  await expect(section.locator('.liah-react-product')).toContainText('R$ 129,90');

  await page.setViewportSize({ width: 1280, height: 800 });
  await testInfo.attach('home-recommendations-desktop', {
    body: await page.screenshot(),
    contentType: 'image/png'
  });
  await page.setViewportSize({ width: 375, height: 812 });
  await testInfo.attach('home-recommendations-mobile', {
    body: await page.screenshot(),
    contentType: 'image/png'
  });
});

test('search empty state renders when no products match query', async ({ page }, testInfo) => {
  await page.goto('/');

  await page.getByPlaceholder('Buscar na loja Liah').fill('inexistente xpto');
  await expect(page.getByText('Nenhum produto encontrado')).toBeVisible();

  await page.setViewportSize({ width: 1280, height: 800 });
  await testInfo.attach('search-empty-desktop', {
    body: await page.screenshot(),
    contentType: 'image/png'
  });
  await page.setViewportSize({ width: 375, height: 812 });
  await testInfo.attach('search-empty-mobile', {
    body: await page.screenshot(),
    contentType: 'image/png'
  });
});

test('cart FAB appears after adding a product and opens cart modal', async ({ page }, testInfo) => {
  await page.goto('/');

  await page.getByLabel('Adicionar produto').click();

  const fab = page.locator('#div-carrinho');
  await expect(fab).toBeVisible();
  await expect(fab).toContainText('Ir para o carrinho');
  await expect(fab.locator('#quantidadeCarrinhoDiv')).toContainText('1');

  await page.setViewportSize({ width: 1280, height: 800 });
  await testInfo.attach('cart-fab-desktop', {
    body: await page.screenshot(),
    contentType: 'image/png'
  });
  await page.setViewportSize({ width: 375, height: 812 });
  await testInfo.attach('cart-fab-mobile', {
    body: await page.screenshot(),
    contentType: 'image/png'
  });

  await fab.getByRole('button').click();
  const cartDialog = page.getByRole('dialog', { name: 'Carrinho' });
  await expect(cartDialog).toBeVisible();
  await expect(cartDialog.getByText('Resumo do carrinho')).toBeVisible();

  await page.setViewportSize({ width: 1280, height: 800 });
  await testInfo.attach('cart-modal-desktop', {
    body: await page.screenshot(),
    contentType: 'image/png'
  });
  await page.setViewportSize({ width: 375, height: 812 });
  await testInfo.attach('cart-modal-mobile', {
    body: await page.screenshot(),
    contentType: 'image/png'
  });
});

test('product detail modal opens on card click and quantity controls work', async ({ page }, testInfo) => {
  await page.goto('/');

  await expect(page.locator('#produto101')).toBeVisible();
  await page.locator('#produto101').click();

  const dialog = page.getByRole('dialog', { name: 'Detalhes' });
  await expect(dialog).toBeVisible();

  await page.setViewportSize({ width: 1280, height: 800 });
  await testInfo.attach('product-detail-desktop', {
    body: await page.screenshot(),
    contentType: 'image/png'
  });
  await page.setViewportSize({ width: 375, height: 812 });
  await testInfo.attach('product-detail-mobile', {
    body: await page.screenshot(),
    contentType: 'image/png'
  });

  const increaseBtn = dialog.getByRole('button', { name: 'Aumentar quantidade' });
  const decreaseBtn = dialog.getByRole('button', { name: 'Diminuir quantidade' });
  const quantityDisplay = dialog.locator('.quantidadeProduto');

  await expect(quantityDisplay).toHaveText('1');
  await expect(decreaseBtn).toBeDisabled();
  await expect(increaseBtn).not.toBeDisabled();

  await increaseBtn.click();
  await expect(quantityDisplay).toHaveText('2');
  await expect(decreaseBtn).not.toBeDisabled();

  await decreaseBtn.click();
  await expect(quantityDisplay).toHaveText('1');
  await expect(decreaseBtn).toBeDisabled();
});

test('product detail opens via keyboard Enter on card', async ({ page }) => {
  await page.goto('/');

  await expect(page.locator('#produto101')).toBeVisible();
  await page.locator('#produto101').focus();
  await page.keyboard.press('Enter');

  await expect(page.getByRole('dialog', { name: 'Detalhes' })).toBeVisible();
});

test('auth form inputs have name and autocomplete accessibility attributes', async ({ page }) => {
  await page.goto('/');

  await page.getByLabel('Adicionar produto').click();
  await page.locator('#div-carrinho').getByRole('button').click();
  await page.getByRole('button', { name: /finalizar compra/i }).click();

  const loginPhone = page.locator('input[name="login-phone"]');
  await expect(loginPhone).toBeVisible();
  await expect(loginPhone).toHaveAttribute('autocomplete', 'tel');

  const loginPassword = page.locator('input[name="login-password"]');
  await expect(loginPassword).toBeVisible();
  await expect(loginPassword).toHaveAttribute('autocomplete', 'current-password');
  await expect(loginPassword).toHaveAttribute('type', 'password');
});

test('checkout modal renders when user is authenticated', async ({ page }, testInfo) => {
  await page.addInitScript(() => {
    localStorage.setItem('tspayid', 'testuser123');
    localStorage.setItem('tspaytoken', 'testtoken456');
    localStorage.setItem('carrinho', JSON.stringify([101]));
    localStorage.setItem('quantidadeCarrinho', JSON.stringify({ '101': 1 }));
  });

  await page.goto('/');

  const fab = page.locator('#div-carrinho');
  await expect(fab).toBeVisible();
  await fab.getByRole('button').click();

  await page.getByRole('button', { name: /finalizar compra/i }).click();

  const checkoutDialog = page.getByRole('dialog', { name: 'Checkout' });
  await expect(checkoutDialog).toBeVisible();

  await page.setViewportSize({ width: 1280, height: 800 });
  await testInfo.attach('checkout-modal-desktop', {
    body: await page.screenshot(),
    contentType: 'image/png'
  });
  await page.setViewportSize({ width: 375, height: 812 });
  await testInfo.attach('checkout-modal-mobile', {
    body: await page.screenshot(),
    contentType: 'image/png'
  });
});
