'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _ = require('lodash');

var merge = _.merge;
var transform = _.transform;
var reduce = _.reduce;
var isFunction = _.isFunction;
var isPlainObject = _.isPlainObject;
var isUndefined = _.isUndefined;

var React = require('react/addons');
var cx = require('classnames');
var formatters = require('./formatters');
var update = React.addons.update;

module.exports = React.createClass({
    displayName: 'Table',

    propTypes: {
        header: React.PropTypes.object,
        data: React.PropTypes.array,
        columns: React.PropTypes.array,
        children: React.PropTypes.object,
        row: React.PropTypes.object
    },

    getDefaultProps: function getDefaultProps() {
        return {
            header: {},
            data: [],
            columns: [],
            row: {}
        };
    },

    render: function render() {
        var header = this.props.header;
        var data = this.props.data;
        var columns = this.props.columns;
        var rowCfg = this.props.row;

        var props = update(this.props, {
            $merge: {
                header: undefined,
                data: undefined,
                columns: undefined,
                row: undefined
            }
        });

        return React.createElement(
            'table',
            props,
            React.createElement(
                'thead',
                null,
                React.createElement(
                    'tr',
                    null,
                    columns.map(function (column, i) {
                        var columnHeader = transform(header, function (result, v, k) {
                            result[k] = k.indexOf('on') === 0 ? v.bind(null, column) : v;
                        });

                        var columnContent = isFunction(column.header) ? column.header() : column.header;

                        return React.createElement(
                            'th',
                            _extends({
                                key: i + '-header',
                                className: cx(column.classes)
                            }, columnHeader),
                            columnContent
                        );
                    })
                )
            ),
            React.createElement(
                'tbody',
                null,
                data.map(function (row, i) {
                    var trAttrs = {
                        key: i + '-row'
                    };
                    if ('className' in rowCfg) {
                        trAttrs['className'] = rowCfg.className(row);
                    }
                    return React.createElement(
                        'tr',
                        trAttrs,
                        ' ',
                        columns.map(function (column, j) {
                            var property = column.property;
                            var value = row[property];
                            var cell = column.cell || [formatters.identity];
                            var content;

                            cell = isFunction(cell) ? [cell] : cell;

                            content = reduce([value].concat(cell), function (v, fn) {
                                if (v && React.isValidElement(v.value)) {
                                    return v;
                                }

                                if (isPlainObject(v)) {
                                    return merge(v, {
                                        value: fn(v.value, data, i, property)
                                    });
                                }

                                var val = fn(v, data, i, property);

                                if (val && !isUndefined(val.value)) {
                                    return val;
                                }

                                return {
                                    value: val
                                };
                            });

                            content = content || {};

                            return React.createElement(
                                'td',
                                _extends({ key: j + '-cell' }, content.props),
                                content.value
                            );
                        })
                    );
                })
            ),
            this.props.children
        );
    }
});
// formatter shortcut