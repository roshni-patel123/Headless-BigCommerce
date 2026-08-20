import { COUNTRIES, getDialCode, withDialCode } from '../../utils/countries';
import styles from './CountryFields.module.scss';

function CountryFields({
  countryCode = 'US',
  phone = '',
  onCountryChange,
  onPhoneChange,
  required = true,
  showPhone = true,
  idPrefix = 'country',
}) {
  function handleCountry(event) {
    const nextCode = event.target.value;
    onCountryChange?.(nextCode);
    if (showPhone) {
      onPhoneChange?.(withDialCode(phone, nextCode));
    }
  }

  const dial = getDialCode(countryCode);

  return (
    <div className={styles.root}>
      <label className={styles.field} htmlFor={`${idPrefix}-select`}>
        <span>Country</span>
        <select
          id={`${idPrefix}-select`}
          required={required}
          value={countryCode}
          onChange={handleCountry}
        >
          {COUNTRIES.map((country) => (
            <option key={country.code} value={country.code}>
              {country.name} ({country.code})
            </option>
          ))}
        </select>
      </label>

      {showPhone && (
        <label className={styles.field} htmlFor={`${idPrefix}-phone`}>
          <span>Phone</span>
          <input
            id={`${idPrefix}-phone`}
            type="tel"
            placeholder={dial ? `${dial} 98765 43210` : 'Phone number'}
            value={phone}
            onChange={(event) => onPhoneChange?.(event.target.value)}
          />
          {dial && (
            <small className={styles.hint}>
              Country calling code <strong>{dial}</strong> is applied automatically.
            </small>
          )}
        </label>
      )}
    </div>
  );
}

export default CountryFields;
