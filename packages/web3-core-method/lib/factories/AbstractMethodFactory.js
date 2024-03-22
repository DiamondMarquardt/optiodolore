/*
    This file is part of web3.js.

    web3.js is free software: you can redistribute it and/or modify
    it under the terms of the GNU Lesser General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    web3.js is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU Lesser General Public License for more details.

    You should have received a copy of the GNU Lesser General Public License
    along with web3.js.  If not, see <http://www.gnu.org/licenses/>.
*/
/**
 * @file AbstractMethodFactory.js
 * @author Samuel Furter <samuel@ethereum.org>
 * @date 2018
 */

import SendRawTransactionMethod from '../../src/methods/transaction/SendRawTransactionMethod';
import GetTransactionCountMethod from '../../src/methods/account/GetTransactionCountMethod';
import ChainIdMethod from '../../src/methods/network/ChainIdMethod';

export default class AbstractMethodFactory {
    /**
     * @param {MethodModuleFactory} methodModuleFactory
     * @param {Utils} utils
     * @param {Object} formatters
     *
     * @constructor
     */
    constructor(methodModuleFactory, utils, formatters) {
        this.methodModuleFactory = methodModuleFactory;
        this.utils = utils;
        this.formatters = formatters;
        this._methods = null;
    }

    /**
     * Gets the methods object
     *
     * @property methods
     *
     * @returns {null|Object}
     */
    get methods() {
        if (this._methods) {
            return this._methods;
        }

        throw new Error('No methods defined for MethodFactory!');
    }

    /**
     * Sets the methods object
     *
     * @property methods
     *
     * @param {Object} value
     */
    set methods(value) {
        this._methods = value;
    }

    /**
     * Checks if the method exists
     *
     * @method hasMethodModel
     *
     * @param {String} name
     *
     * @returns {Boolean}
     */
    hasMethod(name) {
        return typeof this.methods[name] !== 'undefined';
    }

    /**
     * TODO: Find a cleaner way for the dependency resolution here.
     *
     * Returns an MethodModel
     *
     * @param {String} name
     *
     * @returns {AbstractMethod}
     */
    createMethod(name) {
        const method = this.methods[name];

        /* eslint-disable new-cap */
        switch (method.Type) {
            case 'CALL':
                return new method(this.utils, this.formatters);
            case 'SEND':
                if (method.name === 'SendTransactionMethod') {
                    const transactionConfirmationWorkflow = this.methodModuleFactory.createTransactionConfirmationWorkflow();

                    return new method(
                        this.utils,
                        this.formatters,
                        transactionConfirmationWorkflow,
                        new SendRawTransactionMethod(this.utils, this.formatters, transactionConfirmationWorkflow),
                        new ChainIdMethod(this.utils, this.formatters),
                        new GetTransactionCountMethod(this.utils, this.formatters)
                    );
                }

                return new method(
                    this.utils,
                    this.formatters,
                    this.methodModuleFactory.createTransactionConfirmationWorkflow()
                );
        }
        /* eslint-enable new-cap */
    }
}
