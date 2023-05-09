import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

// Import configs and util modules
import config from '../../../../config';
import { FormattedMessage } from '../../../../util/reactIntl';
import { LISTING_STATE_DRAFT } from '../../../../util/types';
import { ensureOwnListing } from '../../../../util/data';
import { types as sdkTypes } from '../../../../util/sdkLoader';

// Import shared components
import { ListingLink } from '../../../../components';

// Import modules from this directory
import EditListingPricingForm from './EditListingPricingForm';
import css from './EditListingPricingPanel.module.css';

const { Money } = sdkTypes;

const EditListingPricingPanel = props => {
  const {
    className,
    rootClassName,
    listing,
    disabled,
    ready,
    onSubmit,
    onChange,
    submitButtonText,
    actionAddBtnText,
    panelUpdated,
    updateInProgress,
    errors,
  } = props;

  const classes = classNames(rootClassName || css.root, className);
  const currentListing = ensureOwnListing(listing);

  // The listing resource has a relationship: `currentStock`,
  // which you should include when making API calls.
  const currentStockRaw = currentListing.currentStock?.attributes?.quantity;
  const currentStock = typeof currentStockRaw != null ? currentStockRaw : 1;
  const { price } = currentListing.attributes;
  const variants = currentListing.attributes.publicData.variants;
  const initialUnlimitedStock = currentListing.attributes.publicData.stockUnlimited?[`unlimited`]:null;
  const pricingVariant = [];

  const variantKeys = variants ? Object.keys(variants) : null;

  if(variantKeys){
    variantKeys.forEach( key => {
      const variantLabel = variants[key].variantLabel;
      const variantPrice = new Money;
      variantPrice.amount = variants[key].variantPrice;
      variantPrice.currency = price.currency;
      pricingVariant[pricingVariant.length] = {variantPrice,variantLabel}
    });
  }

  const isPublished = currentListing.id && currentListing.attributes.state !== LISTING_STATE_DRAFT;
  const panelTitle = isPublished ? (
    <FormattedMessage
      id="EditListingPricingPanel.title"
      values={{ listingTitle: <ListingLink listing={listing} /> }}
    />
  ) : (
    <FormattedMessage id="EditListingPricingPanel.createListingTitle" />
  );

  const priceCurrencyValid = price instanceof Money ? price.currency === config.currency : true;

  const form = priceCurrencyValid ? (
    <EditListingPricingForm
      className={css.form}
      // initialValues={{ price, stock: currentStock, variants }}
      // initialValues={{ price, stock: currentStock, variants }}
      initialValues={{ price, stock: currentStock, unlimitedStock:initialUnlimitedStock, pricingVariant }}
      onSubmit={values => {

        const { price, stock, unlimitedStock } = values;
        const variantsValues = values.pricingVariant;
        const variantsUpdate = {};
        
        const valuesKeys = Object.keys(variantsValues);
        valuesKeys.forEach((element) => {
            const curVariant = variantsValues[element];
            if(curVariant.variantPrice && curVariant.variantPrice.amount){
              const variantPrice = curVariant.variantPrice.amount;
              const variantLabel = curVariant.variantLabel;
              variantsUpdate[element] = {variantPrice,variantLabel};
            }
        });
        
        // Update stock only if the value has changed.
        // NOTE: this is going to be used on a separate call to API
        // in EditListingPage.duck.js: sdk.stock.compareAndSet();
        const hasStockQuantityChanged = stock && currentStockRaw !== stock;
        // currentStockRaw is null or undefined, return null - otherwise use the value
        const oldTotal = currentStockRaw != null ? currentStockRaw : null;
        const stockUpdateMaybe = hasStockQuantityChanged
          ? {
              stockUpdate: {
                oldTotal,
                newTotal: stock,
              },
            }
          : {};

        const stockUnlimited = unlimitedStock?true:false;

        const updateValues = {
          price,
          ...stockUpdateMaybe,
          publicData: { variants:variantsUpdate, stockUnlimited },
        };
        onSubmit(updateValues);
      }}
      onChange={onChange}
      saveActionMsg={submitButtonText}
      variantLabel={actionAddBtnText}
      disabled={disabled}
      ready={ready}
      updated={panelUpdated}
      updateInProgress={updateInProgress}
      fetchErrors={errors}
    />
  ) : (
    <div className={css.priceCurrencyInvalid}>
      <FormattedMessage id="EditListingPricingPanel.listingPriceCurrencyInvalid" />
    </div>
  );

  return (
    <div className={classes}>
      <h1 className={css.title}>{panelTitle}</h1>
      {form}
    </div>
  );
};

const { func, object, string, bool } = PropTypes;

EditListingPricingPanel.defaultProps = {
  className: null,
  rootClassName: null,
  listing: null,
};

EditListingPricingPanel.propTypes = {
  className: string,
  rootClassName: string,

  // We cannot use propTypes.listing since the listing might be a draft.
  listing: object,

  disabled: bool.isRequired,
  ready: bool.isRequired,
  onSubmit: func.isRequired,
  onChange: func.isRequired,
  submitButtonText: string.isRequired,
  panelUpdated: bool.isRequired,
  updateInProgress: bool.isRequired,
  errors: object.isRequired,
};

export default EditListingPricingPanel;
