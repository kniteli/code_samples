import {countries} from 'country-data';
import _ from 'lodash';

export const country_list = _(countries.all).keyBy('alpha2').value();
