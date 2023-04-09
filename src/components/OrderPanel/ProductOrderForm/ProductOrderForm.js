import React, { useRef } from 'react';
import { bool, func, number, string } from 'prop-types';
import { Form as FinalForm, FormSpy } from 'react-final-form';

import config from '../../../config';
import { FormattedMessage, useIntl } from '../../../util/reactIntl';
import { propTypes } from '../../../util/types';
import { formatMoney } from '../../../util/currency';
import { numberAtLeast, required } from '../../../util/validators';

import {
  Form,
  FieldSelect,
  FieldTextInput,
  InlineTextButton,
  PrimaryButton,
} from '../../../components';

import EstimatedCustomerBreakdownMaybe from '../EstimatedCustomerBreakdownMaybe';

import css from './ProductOrderForm.module.css';
import { forEach } from 'lodash';

import { types as sdkTypes } from '../../../util/sdkLoader';

const { Money } = sdkTypes;

const renderForm = formRenderProps => {
  const {
    // FormRenderProps from final-form
    handleSubmit,
    form: formApi,

    // Custom props passed to the form component
    intl,
    formId,
    currentStock,
    hasMultipleDeliveryMethods,
    listingId,
    isOwnListing,
    onFetchTransactionLineItems,
    onContactUser,
    lineItems,
    fetchLineItemsInProgress,
    fetchLineItemsError,
    values,
    variants,
    price,
  } = formRenderProps;

  const handleOnChange = formValues => {
    const { quantity: quantityRaw, deliveryMethod, variant: variantId } = formValues.values;

    const quantityInt = Number.parseInt(quantityRaw, 10);
    const isBrowser = typeof window !== 'undefined';
    const variantInt = variants?(Number.parseInt(variants[variantId-1]?variants[variantId-1]['variantStok']:null, 10)):0;
    const quantity = quantityInt ? quantityInt : variantInt ? variantInt: 0;

    if (isBrowser && quantity && deliveryMethod && !fetchLineItemsInProgress) {
      onFetchTransactionLineItems({
        orderData: { quantity, deliveryMethod, variantId },
        listingId,
        isOwnListing,
      });
    }

  };

  const handleOnChangeForm = formData => {
    if(formData.target.name == 'variant'){
      formRenderProps.form.getFieldState('quantity').change('');
    }else if(formData.target.name == 'quantity'){
      formRenderProps.form.getFieldState('variant')?formRenderProps.form.getFieldState('variant').change(''):null;
    }
  }

  // In case quantity and deliveryMethod are missing focus on that select-input.
  // Otherwise continue with the default handleSubmit function.
  const handleFormSubmit = e => {
    const { quantity, deliveryMethod, variant } = values || {};

    console.log(!quantity || quantity < 1 || !variant);

    if ((!quantity || quantity < 1) || !variant) {
      e.preventDefault();
      // Blur event will show validator message
      formApi.blur('quantity');
      formApi.focus('quantity');
    } else if (!deliveryMethod) {
      e.preventDefault();
      // Blur event will show validator message
      formApi.blur('deliveryMethod');
      formApi.focus('deliveryMethod');
    } else {
      handleSubmit(e);
    }
  };

  const breakdownData = {};
  const showBreakdown =
    breakdownData && lineItems && !fetchLineItemsInProgress && !fetchLineItemsError;
  const breakdown = showBreakdown ? (
    <div className={css.breakdownWrapper}>
      <h3>
        <FormattedMessage id="ProductOrderForm.breakdownTitle" />
      </h3>
      <EstimatedCustomerBreakdownMaybe
        unitType={config.lineItemUnitType}
        breakdownData={breakdownData}
        lineItems={lineItems}
      />
    </div>
  ) : null;

  const showContactUser = typeof onContactUser === 'function';

  const onClickContactUser = e => {
    e.preventDefault();
    onContactUser();
  };

  const hasVarinats = (currentStock,variants) => {
    return !variants ? null : (()=>{
      const result = [];
      forEach(variants,(e,i)=>{
        e.variantStok < currentStock ? result[i] = e : null;
      })
      return result.length ? result : null;
    })();
  }

  const formatVariantLabel = (intl,variant,price) => {
    const amount = variant.variantPrice * variant.variantStok;
    const variantPrice = new Money(amount,price.currency);

    return formatMoney(intl, variantPrice) +' '+ variant.variantLabel;
  }

  const clearValidation = msg => () =>{
    const quantity = formRenderProps.form.getFieldState('quantity').value;
    const variant = formRenderProps.form.getFieldState('variant')?formRenderProps.form.getFieldState('variant').value:null;

    return numberAtLeast(msg, 1)(quantity ? quantity : variant);
  }

  const contactSellerLink = (
    <InlineTextButton onClick={onClickContactUser}>
      <FormattedMessage id="ProductOrderForm.finePrintNoStockLinkText" />
    </InlineTextButton>
  );
  const quantityRequiredMsg = intl.formatMessage({ id: 'ProductOrderForm.quantityRequired' });
  const quantityVariantRequiredMsg = intl.formatMessage({ id: 'ProductOrderForm.quantityvariantRequired' });

  const hasStock = currentStock && currentStock > 0;
  const quantities = hasStock ? [...Array(currentStock).keys()].map(i => i + 1) : [];
  const variantsMap = hasStock ? hasVarinats(currentStock,variants) : null;
  const hasNoStockLeft = typeof currentStock != null && currentStock === 0;
  const hasOneItemLeft = typeof currentStock != null && currentStock === 1;

  const submitInProgress = fetchLineItemsInProgress;
  const submitDisabled = !hasStock;

  return (
    <Form onSubmit={handleFormSubmit} onChange={handleOnChangeForm}>
      <FormSpy subscription={{ values: true, active: true }} onChange={handleOnChange} />

      {!variantsMap ? null : (
        
        <FieldSelect
          id={`${formId}.variant`}
          className={css.quantityField}
          name="variant"
          disabled={!hasStock}
          label={intl.formatMessage({ id: 'ProductOrderForm.quantityVariantLabel' })}
          validate={clearValidation(quantityVariantRequiredMsg)}
        >
          <option disabled value="">
            {intl.formatMessage({ id: 'ProductOrderForm.selectQuantityVariantOption' })}
          </option>

          {variantsMap.map((variant,index) => (

            <option key={index++} value={index++}>
              {formatVariantLabel(intl,variant,price)}
            </option>
          ))}
        </FieldSelect>
      )}

      {hasNoStockLeft ? null : hasOneItemLeft ? (
        <FieldTextInput
          id={`${formId}.quantity`}
          className={css.quantityField}
          name="quantity"
          type="hidden"
          validate={numberAtLeast(quantityRequiredMsg, 1)}
        />
      ) : (
        <FieldSelect
          id={`${formId}.quantity`}
          className={css.quantityField}
          name="quantity"
          disabled={!hasStock}
          label={intl.formatMessage({ id: 'ProductOrderForm.quantityLabel' })}
          validate={clearValidation(quantityRequiredMsg)}
        >
          <option disabled value="">
            {intl.formatMessage({ id: 'ProductOrderForm.selectQuantityOption' })}
          </option>
          {quantities.map(quantity => (
            <option key={quantity} value={quantity}>
              {intl.formatMessage({ id: 'ProductOrderForm.quantityOption' }, { quantity })}
            </option>
          ))}
        </FieldSelect>
      )}

      {hasNoStockLeft ? null : hasMultipleDeliveryMethods ? (
        <FieldSelect
          id={`${formId}.deliveryMethod`}
          className={css.deliveryField}
          name="deliveryMethod"
          disabled={!hasStock}
          label={intl.formatMessage({ id: 'ProductOrderForm.deliveryMethodLabel' })}
          validate={required(intl.formatMessage({ id: 'ProductOrderForm.deliveryMethodRequired' }))}
        >
          <option disabled value="">
            {intl.formatMessage({ id: 'ProductOrderForm.selectDeliveryMethodOption' })}
          </option>
          <option value={'pickup'}>
            {intl.formatMessage({ id: 'ProductOrderForm.pickupOption' })}
          </option>
          <option value={'shipping'}>
            {intl.formatMessage({ id: 'ProductOrderForm.shippingOption' })}
          </option>
        </FieldSelect>
      ) : (
        <div className={css.deliveryField}>
          <label>{intl.formatMessage({ id: 'ProductOrderForm.deliveryMethodLabel' })}</label>
          <p className={css.singleDeliveryMethodSelected}>
            {values.deliveryMethod === 'shipping'
              ? intl.formatMessage({ id: 'ProductOrderForm.shippingOption' })
              : intl.formatMessage({ id: 'ProductOrderForm.pickupOption' })}
          </p>
          <FieldTextInput
            id={`${formId}.deliveryMethod`}
            className={css.deliveryField}
            name="deliveryMethod"
            type="hidden"
          />
        </div>
      )}
      {breakdown}
      <div className={css.submitButton}>
        <PrimaryButton type="submit" inProgress={submitInProgress} disabled={submitDisabled}>
          {hasStock ? (
            <FormattedMessage id="ProductOrderForm.ctaButton" />
          ) : (
            <FormattedMessage id="ProductOrderForm.ctaButtonNoStock" />
          )}
        </PrimaryButton>
      </div>
      <p className={css.finePrint}>
        {hasStock ? (
          <FormattedMessage id="ProductOrderForm.finePrint" />
        ) : showContactUser ? (
          <FormattedMessage id="ProductOrderForm.finePrintNoStock" values={{ contactSellerLink }} />
        ) : null}
      </p>
    </Form>
  );
};

const ProductOrderForm = props => {
  const intl = useIntl();
  const { price, currentStock, pickupEnabled, shippingEnabled } = props;

  // Should not happen for listings that go through EditListingWizard.
  // However, this might happen for imported listings.
  if (!pickupEnabled && !shippingEnabled) {
    return (
      <p className={css.error}>
        <FormattedMessage id="ProductOrderForm.noDeliveryMethodSet" />
      </p>
    );
  }

  if (!price) {
    return (
      <p className={css.error}>
        <FormattedMessage id="ProductOrderForm.listingPriceMissing" />
      </p>
    );
  }
  if (price.currency !== config.currency) {
    return (
      <p className={css.error}>
        <FormattedMessage id="ProductOrderForm.listingCurrencyInvalid" />
      </p>
    );
  }
  const hasOneItemLeft = currentStock && currentStock === 1;
  const quantityMaybe = hasOneItemLeft ? { quantity: '1' } : {};
  const singleDeliveryMethodAvailableMaybe =
    shippingEnabled && !pickupEnabled
      ? { deliveryMethod: 'shipping' }
      : !shippingEnabled && pickupEnabled
      ? { deliveryMethod: 'pickup' }
      : {};
  const hasMultipleDeliveryMethods = pickupEnabled && shippingEnabled;
  const initialValues = { ...quantityMaybe, ...singleDeliveryMethodAvailableMaybe };

  return (
    <FinalForm
      initialValues={initialValues}
      hasMultipleDeliveryMethods={hasMultipleDeliveryMethods}
      {...props}
      intl={intl}
      render={renderForm}
    />
  );
};

ProductOrderForm.defaultProps = {
  rootClassName: null,
  className: null,
  price: null,
  currentStock: null,
  listingId: null,
  isOwnListing: false,
  lineItems: null,
  fetchLineItemsError: null,
};

ProductOrderForm.propTypes = {
  rootClassName: string,
  className: string,

  // form
  formId: string.isRequired,
  onSubmit: func.isRequired,

  // listing
  listingId: propTypes.uuid,
  price: propTypes.money,
  currentStock: number,
  isOwnListing: bool,

  // line items
  lineItems: propTypes.lineItems,
  onFetchTransactionLineItems: func.isRequired,
  fetchLineItemsInProgress: bool.isRequired,
  fetchLineItemsError: propTypes.error,

  // other
  onContactUser: func,
};

export default ProductOrderForm;
