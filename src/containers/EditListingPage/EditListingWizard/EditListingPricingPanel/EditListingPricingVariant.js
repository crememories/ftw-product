import React, { Component } from 'react';

import { FieldArray } from "react-final-form-arrays";

// Import configs and util modules
import config from '../../../../config';
import * as validators from '../../../../util/validators';

// Import shared components
import { Button, FieldTextInput, FieldCurrencyInput, IconTrash } from '../../../../components';

// Import modules from this directory
import css from './EditListingPricingForm.module.css';

const EditListingPricingVariant = props => {

    console.log(props);

    const stockValidator = validators.numberAtLeast(
        props.intl.formatMessage({ id: 'EditListingPricingForm.stockIsRequired' }),
        0
      );

      const removeInput = (fieldArrayProps,index) => {
        // fieldArrayProps.fields.remove(index);
        console.log(index);
        
        // This is the proper way to change state that depends on previous state.
        fieldArrayProps.fields.map((prevTextBox) => {
        console.log(prevTextBox);
        console.log(fieldArrayProps.fields);

          const mutatableTextBox = [...prevTextBox];
          mutatableTextBox.splice(mutatableTextBox.length-1, 1);
          return mutatableTextBox;
        })}

        // () => {fieldArrayProps.fields.remove(index)}
   
    return <FieldArray name="pricingVariant">
            {fieldArrayProps => 
              fieldArrayProps.fields.map((name, index) => (
                <div key={name}>
                  <hr/>
                  <h2>Pricing Variant {index+1}
                  <button
                    className={css.removeButton}
                    type='button'
                    onClick={() => removeInput(fieldArrayProps,index)}
                  >
                    <IconTrash rootClassName={css.IconTrash} />
                  </button>
                  </h2>
                  
                  <FieldTextInput 
                  id={"variantStok_"+index}
                  name={"variantStok_"+index}
                  className={css.input} 
                  label={props.intl.formatMessage({ id: 'EditListingPricingForm.stockLabelVariant' })}
                  placeholder={props.intl.formatMessage({ id: 'EditListingPricingForm.stockPlaceholderVariant' })}
                  type="number"
                  min={0}
                  validate={stockValidator}
                  />
                  <FieldCurrencyInput 
                  id={"variantPrice_"+index}
                  name={"variantPrice_"+index}
                  className={css.input} 
                  label={props.intl.formatMessage({ id: 'EditListingPricingForm.pricePerProductVariant' })}
                  placeholder={props.intl.formatMessage({ id: 'EditListingPricingForm.pricePerProductPlaceholderVariant' })}
                  currencyConfig={config.currencyConfig}
                  validate={props.priceValidators}
                  />
                  <FieldTextInput 
                  id={"variantLabel_"+index}
                  name={"variantLabel_"+index}
                  className={css.input} 
                  label={props.intl.formatMessage({ id: 'EditListingPricingForm.labelProductVariant' })}
                  placeholder={props.intl.formatMessage({ id: 'EditListingPricingForm.labelProductPlaceholderVariant' })}
                  type="text"
                  />
                  
                </div>
              ))
            }
          </FieldArray>
  };
  

export default EditListingPricingVariant;