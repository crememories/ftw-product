import React from 'react';
import { bool, func, shape, string } from 'prop-types';
import { compose } from 'redux';
import { Form as FinalForm} from 'react-final-form';
import arrayMutators from "final-form-arrays";

import classNames from 'classnames';

// Import configs and util modules
import config from '../../../../config';
import { intlShape, injectIntl, FormattedMessage } from '../../../../util/reactIntl';
import { propTypes } from '../../../../util/types';
import { isOldTotalMismatchStockError } from '../../../../util/errors';
import * as validators from '../../../../util/validators';
import { formatMoney } from '../../../../util/currency';
import { types as sdkTypes } from '../../../../util/sdkLoader';

// Import shared components
import { Button, Form, FieldCurrencyInput, FieldTextInput, FieldCheckbox } from '../../../../components';

// Import modules from this directory
import css from './EditListingPricingForm.module.css';
import EditListingPricingVariant from './EditListingPricingVariant';

const { Money } = sdkTypes;

export const EditListingPricingFormComponent = props => (
  <FinalForm
    mutators={{
      ...arrayMutators
    }}
    {...props}
    render={formRenderProps => {
      const {
        autoFocus,
        className,
        disabled,
        ready,
        handleSubmit,
        intl,
        invalid,
        pristine,
        saveActionMsg,
        updated,
        updateInProgress,
        fetchErrors,
        variantLabel,
        values,
      } = formRenderProps;

      const variants = {};
      const priceRequired = validators.required(
        intl.formatMessage({
          id: 'EditListingPricingForm.priceRequired',
        })
      );
      const minPrice = new Money(config.listingMinimumPriceSubUnits, config.currency);
      const minPriceRequired = validators.moneySubUnitAmountAtLeast(
        intl.formatMessage(
          {
            id: 'EditListingPricingForm.priceTooLow',
          },
          {
            minPrice: formatMoney(intl, minPrice),
          }
        ),
        config.listingMinimumPriceSubUnits
      );
      const priceValidators = config.listingMinimumPriceSubUnits
        ? validators.composeValidators(priceRequired, minPriceRequired)
        : priceRequired;

      const stockValidator = validators.numberAtLeast(
        intl.formatMessage({ id: 'EditListingPricingForm.stockIsRequired' }),
        0
      );

      const unlimitedEnabled = values.unlimitedStock?.includes("unlimited");
      if(unlimitedEnabled){
        values.stock = 9999;
      }
      const stockClasses = classNames(unlimitedEnabled ? css.disabled : null);
      const classes = classNames(css.root, className);
      const submitReady = (updated && pristine) || ready;
      const variantAdd = variantLabel;
      const submitInProgress = updateInProgress;
      const submitDisabled = invalid || disabled || submitInProgress;
      const { updateListingError, showListingsError, setStockError } = fetchErrors || {};

      const stockErrorMessage = isOldTotalMismatchStockError(setStockError)
        ? intl.formatMessage({ id: 'EditListingPricingForm.oldStockTotalWasOutOfSync' })
        : intl.formatMessage({ id: 'EditListingPricingForm.stockUpdateFailed' });

        const handleAddField = (e) => {
          formRenderProps.form.mutators.push("pricingVariant",Math.random());
        };

      return (
        <Form onSubmit={handleSubmit} className={classes}>
          {updateListingError ? (
            <p className={css.error}>
              <FormattedMessage id="EditListingPricingForm.updateFailed" />
            </p>
          ) : null}
          {showListingsError ? (
            <p className={css.error}>
              <FormattedMessage id="EditListingPricingForm.showListingFailed" />
            </p>
          ) : null}
          <FieldCurrencyInput
            id="price"
            name="price"
            className={css.input}
            autoFocus={autoFocus}
            label={intl.formatMessage({ id: 'EditListingPricingForm.pricePerProduct' })}
            placeholder={intl.formatMessage({ id: 'EditListingPricingForm.priceInputPlaceholder' })}
            currencyConfig={config.currencyConfig}
            validate={priceValidators}
          />

          <FieldCheckbox 
          className={css.unlimitedCheckbox}
          id="unlimitedStock"
          name="unlimitedStock"
          label={intl.formatMessage({ id: 'EditListingPricingForm.unlimitedStockLabel' })}
          value="unlimited"
          type="checkbox"
          />

          <div className={stockClasses}>
            <FieldTextInput
              className={css.input}
              id="stock"
              name="stock"
              label={intl.formatMessage({ id: 'EditListingPricingForm.stockLabel' })}
              placeholder={intl.formatMessage({ id: 'EditListingPricingForm.stockPlaceholder' })}
              type="number"
              min={0}
              validate={stockValidator}
            />
            {setStockError ? <p className={css.error}>{stockErrorMessage}</p> : null}
          </div>
            
          <EditListingPricingVariant
            variants={variants}
            intl={intl}
            priceValidators={priceValidators}
          > 
          </EditListingPricingVariant>
          <pre>{JSON.stringify(EditListingPricingVariant, null, 2)}</pre>

          <div className={css.actionButtons}>
          <Button
            className={css.submitButton}
            type="button"
            onClick={handleAddField}
          >
            {variantAdd}
          </Button>

          <Button
            className={css.submitButton}
            type="submit"
            inProgress={submitInProgress}
            disabled={submitDisabled}
            ready={submitReady}
          >
            {saveActionMsg}
          </Button>
          </div>

        </Form>
      );
    }}
  />
);

EditListingPricingFormComponent.defaultProps = { fetchErrors: null };

EditListingPricingFormComponent.propTypes = {
  intl: intlShape.isRequired,
  onSubmit: func.isRequired,
  saveActionMsg: string.isRequired,
  disabled: bool.isRequired,
  ready: bool.isRequired,
  updated: bool.isRequired,
  updateInProgress: bool.isRequired,
  fetchErrors: shape({
    showListingsError: propTypes.error,
    updateListingError: propTypes.error,
  }),
};

export default compose(injectIntl)(EditListingPricingFormComponent);
