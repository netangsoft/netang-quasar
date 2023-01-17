import { useFieldProps } from 'quasar/src/composables/private/use-field.js'
import { useMaskProps } from 'quasar/src/components/input/use-mask.js'
import { useFormProps } from 'quasar/src/composables/private/use-form.js'

/**
 * input
 */
export default {
    ...useFieldProps,
    ...useMaskProps,
    ...useFormProps,
    shadowText: String,
    type: {
        type: String,
        default: 'text'
    },
    debounce: [ String, Number ],
    autogrow: Boolean,
    inputClass: [ Array, String, Object ],
    inputStyle: [ Array, String, Object ],
}
