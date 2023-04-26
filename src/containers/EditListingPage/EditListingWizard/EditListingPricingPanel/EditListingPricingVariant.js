import React, { Component } from 'react';

import { FieldArray } from "react-final-form-arrays";

// Import configs and util modules
import config from '../../../../config';

// Import shared components
import { FieldTextInput, FieldCurrencyInput, IconTrash } from '../../../../components';

// Import modules from this directory
import css from './EditListingPricingForm.module.css';

const EditListingPricingVariant = props => {

    const removeInput = (fieldArrayProps,index) => {
      // fieldArrayProps.fields.remove(index);
      
      // This is the proper way to change state that depends on previous state.
      fieldArrayProps.fields.map((prevTextBox) => {

        const mutatableTextBox = [...prevTextBox];
        mutatableTextBox.splice(mutatableTextBox.length-1, 1);

        fieldArrayProps.fields.remove(index)
        return mutatableTextBox;
      })
    }
   
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