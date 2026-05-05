import { MapPin } from 'lucide-react';
import { useCheckout } from './useCheckout';

export function CheckoutDeliverySection() {
  const {
    addressForm,
    fillCep,
    saveAddress,
    saving,
    selectedAddress,
    setAddressForm,
    setSelectedAddress,
    setShowAddressForm,
    showAddressForm,
    userInfo
  } = useCheckout();

  if (!userInfo) return null;

  return (
    <section className="liah-react-checkout-section">
      <h3>
        <MapPin size={18} aria-hidden="true" />
        Entrega
      </h3>
      {userInfo.enderecos_final.length ? (
        <div className="liah-react-options">
          {userInfo.enderecos_final.map((address) => (
            <label key={address.id}>
              <input
                type="radio"
                name="address"
                checked={selectedAddress === address.id}
                onChange={() => setSelectedAddress(address.id)}
              />
              <span>
                <strong>
                  {address.endereco}, {address.numero}
                </strong>
                {address.bairro} - {address.cidade}/{address.estado}
              </span>
            </label>
          ))}
        </div>
      ) : (
        <p>Adicione um endereço para entrega.</p>
      )}
      <button className="secondary-btn" type="button" onClick={() => setShowAddressForm((value) => !value)}>
        {showAddressForm ? 'Fechar' : 'Adicionar endereço'}
      </button>
      {showAddressForm ? (
        <form className="liah-react-form liah-react-inline-form" onSubmit={(event) => event.preventDefault()}>
          <AddressInputs addressForm={addressForm} fillCep={fillCep} setAddressForm={setAddressForm} />
          <button className="primary-btn" disabled={saving} type="button" onClick={() => void saveAddress()}>
            Salvar endereço
          </button>
        </form>
      ) : null}
    </section>
  );
}

function AddressInputs({
  addressForm,
  fillCep,
  setAddressForm
}: Pick<ReturnType<typeof useCheckout>, 'addressForm' | 'fillCep' | 'setAddressForm'>) {
  return (
    <>
      <label>
        CEP
        <input
          name="shipping-postal-code"
          autoComplete="postal-code"
          inputMode="numeric"
          value={addressForm.cep}
          onChange={(event) => void fillCep(event.target.value)}
        />
      </label>
      <label>
        Endereço
        <input
          name="shipping-address-line1"
          autoComplete="address-line1"
          value={addressForm.endereco}
          onChange={(event) => setAddressForm((current) => ({ ...current, endereco: event.target.value }))}
        />
      </label>
      <label>
        Número
        <input
          name="shipping-address-number"
          autoComplete="address-line2"
          value={addressForm.numero}
          onChange={(event) => setAddressForm((current) => ({ ...current, numero: event.target.value }))}
        />
      </label>
      <label>
        Complemento
        <input
          name="shipping-address-complement"
          autoComplete="address-line3"
          value={addressForm.complemento}
          onChange={(event) => setAddressForm((current) => ({ ...current, complemento: event.target.value }))}
        />
      </label>
      <label>
        Bairro
        <input
          name="shipping-address-district"
          autoComplete="off"
          value={addressForm.bairro}
          onChange={(event) => setAddressForm((current) => ({ ...current, bairro: event.target.value }))}
        />
      </label>
      <label>
        Cidade
        <input
          name="shipping-address-city"
          autoComplete="address-level2"
          value={addressForm.cidade}
          onChange={(event) => setAddressForm((current) => ({ ...current, cidade: event.target.value }))}
        />
      </label>
      <label>
        Estado
        <input
          name="shipping-address-state"
          autoComplete="address-level1"
          value={addressForm.estado}
          onChange={(event) => setAddressForm((current) => ({ ...current, estado: event.target.value.toUpperCase().slice(0, 2) }))}
        />
      </label>
    </>
  );
}
